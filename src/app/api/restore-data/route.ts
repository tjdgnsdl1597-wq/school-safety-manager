import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

// 백업 데이터 복원 API
export async function POST(request: NextRequest) {
  try {
    const backupData = await request.json();
    
    console.log('데이터 복원 시작...');

    // 먼저 사용자 생성 (tjdgnsdl1597)
    const user = await prisma.user.upsert({
      where: { username: 'tjdgnsdl1597' },
      update: {
        password: 'dlwjdrma12.',
        name: '강성훈',
        position: '대리',
        phoneNumber: '010-8764-2428',
        email: 'safe08@ssif.or.kr',
        department: '산업안전팀',
        role: 'user',
        isActive: true,
        homeAddress: '서울시구로구 고척로52길 21',
        officeAddress: '인천광역시 남동구 구월남로 232번길 31'
      },
      create: {
        id: 'de1e05a7-dabb-4429-b98b-63038d9d926f',
        username: 'tjdgnsdl1597',
        password: 'dlwjdrma12.',
        name: '강성훈',
        position: '대리',
        phoneNumber: '010-8764-2428',
        email: 'safe08@ssif.or.kr',
        department: '산업안전팀',
        role: 'user',
        isActive: true,
        homeAddress: '서울시구로구 고척로52길 21',
        officeAddress: '인천광역시 남동구 구월남로 232번길 31'
      }
    });

    console.log('✅ 사용자 생성/업데이트 완료:', user.username);

    // 학교 데이터 복원
    if (backupData.schools && backupData.schools.length > 0) {
      for (const school of backupData.schools) {
        await prisma.school.upsert({
          where: { id: school.id },
          update: {
            name: school.name,
            phoneNumber: school.phoneNumber,
            contactPerson: school.contactPerson,
            email: school.email,
            address: school.address,
            userId: user.id
          },
          create: {
            id: school.id,
            name: school.name,
            phoneNumber: school.phoneNumber,
            contactPerson: school.contactPerson,
            email: school.email,
            address: school.address,
            userId: user.id
          }
        });
      }
      console.log(`✅ 학교 ${backupData.schools.length}개 복원 완료`);
    }

    // 일정 데이터 복원
    if (backupData.schedules && backupData.schedules.length > 0) {
      for (const schedule of backupData.schedules) {
        await prisma.schedule.upsert({
          where: { id: schedule.id },
          update: {
            date: new Date(schedule.date),
            schoolId: schedule.schoolId,
            userId: user.id,
            ampm: schedule.ampm,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            purpose: schedule.purpose,
            otherReason: schedule.otherReason,
            isHoliday: schedule.isHoliday || false,
            holidayReason: schedule.holidayReason
          },
          create: {
            id: schedule.id,
            date: new Date(schedule.date),
            schoolId: schedule.schoolId,
            userId: user.id,
            ampm: schedule.ampm,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            purpose: schedule.purpose,
            otherReason: schedule.otherReason,
            isHoliday: schedule.isHoliday || false,
            holidayReason: schedule.holidayReason
          }
        });
      }
      console.log(`✅ 일정 ${backupData.schedules.length}개 복원 완료`);
    }

    return NextResponse.json({
      success: true,
      message: '데이터 복원 완료',
      restored: {
        user: 1,
        schools: backupData.schools?.length || 0,
        schedules: backupData.schedules?.length || 0
      }
    });

  } catch (error) {
    console.error('데이터 복원 실패:', error);
    return NextResponse.json(
      { error: 'Failed to restore data', details: error },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}