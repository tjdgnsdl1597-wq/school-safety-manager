import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // 데이터베이스 연결 테스트
    await prisma.$connect();
    
    // 각 테이블의 데이터 수 확인
    const [userCount, schoolCount, scheduleCount, materialCount] = await Promise.all([
      prisma.user.count(),
      prisma.school.count(), 
      prisma.schedule.count(),
      prisma.material.count()
    ]);
    
    // 최근 활동 확인
    const recentActivity = await prisma.user.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true }
    });
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        counts: {
          users: userCount,
          schools: schoolCount,
          schedules: scheduleCount,
          materials: materialCount,
          total: userCount + schoolCount + scheduleCount + materialCount
        },
        lastActivity: recentActivity?.createdAt || null
      }
    });
    
  } catch (error) {
    console.error('Database health check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      database: {
        connected: false
      }
    }, { status: 500 });
    
  } finally {
    await prisma.$disconnect();
  }
}