import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

// 백업에서 데이터 복원 API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { filename, confirmRestore } = body;

    if (!confirmRestore) {
      return NextResponse.json(
        { error: '복원을 확인해주세요. confirmRestore: true가 필요합니다.' },
        { status: 400 }
      );
    }

    console.log('🔄 백업 복원 시작:', filename || 'latest');

    const fs = require('fs');
    const path = require('path');
    
    const backupDir = path.join(process.cwd(), 'backups');
    
    let backupFile: string;
    
    if (filename) {
      // 특정 파일 복원
      backupFile = path.join(backupDir, filename);
    } else {
      // 최신 백업 파일 찾기
      const files = fs.readdirSync(backupDir)
        .filter((file: string) => file.startsWith('user-data-backup-') && file.endsWith('.json'))
        .sort()
        .reverse();
      
      if (files.length === 0) {
        return NextResponse.json(
          { error: '백업 파일을 찾을 수 없습니다.' },
          { status: 404 }
        );
      }
      
      backupFile = path.join(backupDir, files[0]);
    }

    if (!fs.existsSync(backupFile)) {
      return NextResponse.json(
        { error: `백업 파일을 찾을 수 없습니다: ${filename}` },
        { status: 404 }
      );
    }

    // 백업 데이터 읽기
    const backupData = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
    
    console.log('📊 복원할 데이터:', {
      users: backupData.totalUsers,
      schools: backupData.totalSchools,
      schedules: backupData.totalSchedules,
      timestamp: backupData.timestamp
    });

    // 기존 데이터 삭제 (주의!)
    console.log('⚠️ 기존 데이터 삭제 중...');
    await prisma.travelTime.deleteMany();
    await prisma.schedule.deleteMany();
    await prisma.school.deleteMany();
    // 사용자는 마지막에 (외래키 관계 때문에)
    await prisma.user.deleteMany();

    // 백업 데이터 복원
    console.log('📥 사용자 데이터 복원 중...');
    for (const userData of backupData.data.users) {
      const { password, ...userWithoutPassword } = userData;
      await prisma.user.create({
        data: {
          ...userWithoutPassword,
          // 원본 암호화된 비밀번호 복원 (향후 개선 필요)
          password: password === '***ENCRYPTED***' ? 'temp_password_needs_reset' : password
        }
      });
    }

    console.log('🏫 학교 데이터 복원 중...');
    for (const schoolData of backupData.data.schools) {
      await prisma.school.create({
        data: schoolData
      });
    }

    console.log('📅 일정 데이터 복원 중...');
    for (const scheduleData of backupData.data.schedules) {
      await prisma.schedule.create({
        data: {
          ...scheduleData,
          date: new Date(scheduleData.date)
        }
      });
    }

    console.log('🚗 이동시간 데이터 복원 중...');
    for (const travelData of backupData.data.travelTimes) {
      await prisma.travelTime.create({
        data: {
          ...travelData,
          calculatedAt: new Date(travelData.calculatedAt),
          updatedAt: new Date(travelData.updatedAt)
        }
      });
    }

    // 복원 완료 확인
    const restoredUsers = await prisma.user.count();
    const restoredSchools = await prisma.school.count();
    const restoredSchedules = await prisma.schedule.count();

    console.log('✅ 백업 복원 완료:', {
      users: restoredUsers,
      schools: restoredSchools,
      schedules: restoredSchedules
    });

    return NextResponse.json({
      success: true,
      message: '백업 복원 완료',
      restored: {
        users: restoredUsers,
        schools: restoredSchools,
        schedules: restoredSchedules,
        travelTimes: await prisma.travelTime.count()
      },
      backupTimestamp: backupData.timestamp
    });

  } catch (error) {
    console.error('❌ 백업 복원 실패:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: '백업 복원 실패',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}