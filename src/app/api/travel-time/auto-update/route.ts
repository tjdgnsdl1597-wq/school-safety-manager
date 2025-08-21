import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

// 자동 이동시간 업데이트 API
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // 사용자 정보 조회 (집, 회사 주소)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        homeAddress: true,
        officeAddress: true
      }
    });

    if (!user?.homeAddress || !user?.officeAddress) {
      return NextResponse.json(
        { error: 'User home and office addresses are required' },
        { status: 400 }
      );
    }

    // 오늘의 일정 조회 (휴무일정 제외)
    const today = new Date().toISOString().split('T')[0];
    const todaySchedules = await prisma.schedule.findMany({
      where: {
        userId: userId,
        date: {
          gte: new Date(today),
          lt: new Date(new Date(today).getTime() + 24 * 60 * 60 * 1000)
        },
        isHoliday: false
      },
      include: {
        school: true
      },
      orderBy: {
        startTime: 'asc'
      }
    });

    if (todaySchedules.length === 0) {
      return NextResponse.json({ 
        message: 'No schedules found for today',
        updated: 0 
      });
    }

    // 이동시간 계산 API 호출
    const travelTimeResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/travel-time/calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        homeAddress: user.homeAddress,
        officeAddress: user.officeAddress,
        schedules: todaySchedules.map(schedule => ({
          schoolId: schedule.schoolId,
          schoolName: schedule.school.name,
          schoolAddress: schedule.school.address
        }))
      })
    });

    if (!travelTimeResponse.ok) {
      throw new Error('Failed to calculate travel times');
    }

    const travelTimeData = await travelTimeResponse.json();
    console.log('자동 이동시간 계산 결과:', travelTimeData);

    let updatedCount = 0;

    // 첫 번째 학교에 대한 이동시간 저장 (회사/집 둘 다 저장)
    if (todaySchedules.length > 0) {
      const firstSchedule = todaySchedules[0];
      
      // 이미 존재하는 이동시간 데이터 확인
      const existingTravelTime = await prisma.travelTime.findUnique({
        where: { scheduleId: firstSchedule.id }
      });

      if (existingTravelTime) {
        // 업데이트 - 회사/집 둘 다 저장
        await prisma.travelTime.update({
          where: { scheduleId: firstSchedule.id },
          data: {
            fromOfficeTime: travelTimeData.fromOfficeToFirst,
            fromHomeTime: travelTimeData.fromHomeToFirst,
            // 기본 duration은 회사에서 출발하는 시간으로 설정
            duration: travelTimeData.fromOfficeToFirst || travelTimeData.fromHomeToFirst,
            origin: '첫번째학교', // 첫 번째 학교 표시용
            calculatedAt: new Date(),
            updatedAt: new Date()
          }
        });
      } else {
        // 새로 생성 - 회사/집 둘 다 저장
        await prisma.travelTime.create({
          data: {
            userId,
            scheduleId: firstSchedule.id,
            fromOfficeTime: travelTimeData.fromOfficeToFirst,
            fromHomeTime: travelTimeData.fromHomeToFirst,
            // 기본 duration은 회사에서 출발하는 시간으로 설정
            duration: travelTimeData.fromOfficeToFirst || travelTimeData.fromHomeToFirst,
            origin: '첫번째학교', // 첫 번째 학교 표시용
            calculatedAt: new Date(),
            updatedAt: new Date()
          }
        });
      }
      updatedCount++;
    }

    // 학교 간 이동시간 저장 (2개 이상의 일정이 있는 경우)
    if (travelTimeData.betweenSchools && todaySchedules.length > 1) {
      for (let i = 0; i < travelTimeData.betweenSchools.length; i++) {
        const schoolToSchoolData = travelTimeData.betweenSchools[i];
        const nextSchedule = todaySchedules[i + 1];

        if (nextSchedule) {
          const existingTravelTime = await prisma.travelTime.findUnique({
            where: { scheduleId: nextSchedule.id }
          });

          if (existingTravelTime) {
            // 업데이트
            await prisma.travelTime.update({
              where: { scheduleId: nextSchedule.id },
              data: {
                toPreviousTime: schoolToSchoolData.duration,
                duration: schoolToSchoolData.duration,
                origin: schoolToSchoolData.from,
                calculatedAt: new Date(),
                updatedAt: new Date()
              }
            });
          } else {
            // 새로 생성
            await prisma.travelTime.create({
              data: {
                userId,
                scheduleId: nextSchedule.id,
                toPreviousTime: schoolToSchoolData.duration,
                duration: schoolToSchoolData.duration,
                origin: schoolToSchoolData.from,
                calculatedAt: new Date(),
                updatedAt: new Date()
              }
            });
          }
          updatedCount++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `${updatedCount}개 일정의 이동시간 업데이트 완료`,
      updated: updatedCount,
      travelTimeData
    });

  } catch (error) {
    console.error('자동 이동시간 업데이트 실패:', error);
    return NextResponse.json(
      { error: 'Failed to auto-update travel times' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}