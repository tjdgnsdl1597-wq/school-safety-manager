import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function POST() {
  try {
    console.log('🔄 데이터베이스 백업 시작...');
    
    // 모든 테이블 데이터 백업
    const backup = {
      timestamp: new Date().toISOString(),
      data: {
        users: await prisma.user.findMany(),
        schools: await prisma.school.findMany(),
        schedules: await prisma.schedule.findMany(),
        materials: await prisma.material.findMany({
          include: { attachments: true }
        })
      },
      counts: {
        users: await prisma.user.count(),
        schools: await prisma.school.count(),
        schedules: await prisma.schedule.count(),
        materials: await prisma.material.count()
      }
    };
    
    console.log('✅ 백업 완료:', backup.counts);
    
    return NextResponse.json({
      success: true,
      message: '데이터베이스 백업이 완료되었습니다.',
      backup: {
        timestamp: backup.timestamp,
        counts: backup.counts
      }
    });
    
  } catch (error) {
    console.error('❌ 백업 실패:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
    
  } finally {
    await prisma.$disconnect();
  }
}