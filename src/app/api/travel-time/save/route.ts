import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { userId, scheduleId, travelTimeData } = await request.json();
    
    if (!userId || !scheduleId || !travelTimeData) {
      return NextResponse.json(
        { error: 'Required data missing' },
        { status: 400 }
      );
    }

    // 기존 이동시간 데이터가 있는지 확인
    const existingTravelTime = await prisma.travelTime.findUnique({
      where: { scheduleId }
    });

    let travelTime;
    if (existingTravelTime) {
      // 업데이트
      travelTime = await prisma.travelTime.update({
        where: { scheduleId },
        data: {
          fromOfficeTime: travelTimeData.fromOfficeToFirst,
          fromHomeTime: travelTimeData.fromHomeToFirst,
          duration: travelTimeData.fromOfficeToFirst || travelTimeData.fromHomeToFirst,
          origin: travelTimeData.fromOfficeToFirst ? '회사' : '집',
          calculatedAt: new Date(),
          updatedAt: new Date()
        }
      });
    } else {
      // 새로 생성
      travelTime = await prisma.travelTime.create({
        data: {
          userId,
          scheduleId,
          fromOfficeTime: travelTimeData.fromOfficeToFirst,
          fromHomeTime: travelTimeData.fromHomeToFirst,
          duration: travelTimeData.fromOfficeToFirst || travelTimeData.fromHomeToFirst,
          origin: travelTimeData.fromOfficeToFirst ? '회사' : '집',
          calculatedAt: new Date(),
          updatedAt: new Date()
        }
      });
    }

    return NextResponse.json({ success: true, travelTime });
  } catch (error) {
    console.error('이동시간 저장 실패:', error);
    return NextResponse.json(
      { error: 'Failed to save travel time' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}