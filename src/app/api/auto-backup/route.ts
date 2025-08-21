import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

// 1시간마다 자동 실행되는 백업 API
export async function POST(request: NextRequest) {
  try {
    console.log('🔄 자동 백업 시작:', new Date().toISOString());

    // 모든 사용자 데이터 수집
    const users = await prisma.user.findMany();
    const schools = await prisma.school.findMany();
    const schedules = await prisma.schedule.findMany();
    const travelTimes = await prisma.travelTime.findMany();
    const materials = await prisma.material.findMany({
      include: { attachments: true }
    });

    // 백업 데이터 구조
    const backupData = {
      timestamp: new Date().toISOString(),
      totalUsers: users.length,
      totalSchools: schools.length,
      totalSchedules: schedules.length,
      totalTravelTimes: travelTimes.length,
      totalMaterials: materials.length,
      data: {
        users: users.map(user => ({
          ...user,
          // 비밀번호는 이미 암호화되어 있지만 추가 보안
          password: '***ENCRYPTED***'
        })),
        schools,
        schedules,
        travelTimes,
        materials
      }
    };

    // GitHub에 백업 저장 (향후 구현)
    // 지금은 로컬 파일로 저장
    const fs = require('fs');
    const path = require('path');
    
    const backupDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    const filename = `user-data-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    const filepath = path.join(backupDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(backupData, null, 2));

    // 백업 이력 기록
    const historyFile = path.join(backupDir, 'backup-history.json');
    let history = [];
    
    if (fs.existsSync(historyFile)) {
      history = JSON.parse(fs.readFileSync(historyFile, 'utf8'));
    }
    
    history.push({
      timestamp: backupData.timestamp,
      filename,
      totalUsers: backupData.totalUsers,
      totalSchools: backupData.totalSchools,
      totalSchedules: backupData.totalSchedules,
      status: 'success'
    });
    
    // 최근 100개만 보관
    if (history.length > 100) {
      history = history.slice(-100);
    }
    
    fs.writeFileSync(historyFile, JSON.stringify(history, null, 2));

    console.log('✅ 자동 백업 완료:', {
      users: users.length,
      schools: schools.length,
      schedules: schedules.length,
      filename
    });

    return NextResponse.json({
      success: true,
      message: '자동 백업 완료',
      data: {
        timestamp: backupData.timestamp,
        totalUsers: backupData.totalUsers,
        totalSchools: backupData.totalSchools,
        totalSchedules: backupData.totalSchedules,
        filename
      }
    });

  } catch (error) {
    console.error('❌ 자동 백업 실패:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: '자동 백업 실패',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// GET 요청으로 백업 상태 확인
export async function GET(request: NextRequest) {
  try {
    const fs = require('fs');
    const path = require('path');
    
    const backupDir = path.join(process.cwd(), 'backups');
    const historyFile = path.join(backupDir, 'backup-history.json');
    
    if (!fs.existsSync(historyFile)) {
      return NextResponse.json({
        success: false,
        message: '백업 이력이 없습니다'
      });
    }
    
    const history = JSON.parse(fs.readFileSync(historyFile, 'utf8'));
    const lastBackup = history[history.length - 1];
    
    // 현재 사용자 수 확인
    const currentUsers = await prisma.user.count();
    const currentSchools = await prisma.school.count();
    const currentSchedules = await prisma.schedule.count();
    
    return NextResponse.json({
      success: true,
      lastBackup,
      currentStatus: {
        totalUsers: currentUsers,
        totalSchools: currentSchools,
        totalSchedules: currentSchedules,
        lastBackupTime: lastBackup?.timestamp || '없음'
      },
      backupHistory: history.slice(-10) // 최근 10개만
    });
    
  } catch (error) {
    console.error('백업 상태 확인 실패:', error);
    return NextResponse.json(
      { success: false, error: '백업 상태 확인 실패' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}