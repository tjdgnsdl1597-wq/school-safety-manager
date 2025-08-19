import { NextResponse } from 'next/server';
import { PrismaClient } from '../../../generated/prisma';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const schedules = await prisma.schedule.findMany({
      include: {
        school: true, // Include school details
      },
      orderBy: {
        date: 'asc',
      },
    });
    return NextResponse.json(schedules);
  } catch (error) {
    console.error('Error fetching schedules:', error);
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const { date, schoolId, ampm, startTime, endTime, purpose, otherReason, isHoliday, holidayReason } = await request.json();

    // 휴무일정인 경우와 일반 일정인 경우를 다르게 검증
    if (isHoliday) {
      if (!date || !ampm || !startTime || !endTime || !holidayReason) {
        return NextResponse.json({ error: 'Missing required fields for holiday schedule' }, { status: 400 });
      }
    } else {
      if (!date || !schoolId || !ampm || !startTime || !endTime || !purpose) {
        return NextResponse.json({ error: 'Missing required fields for regular schedule' }, { status: 400 });
      }
    }

    let finalSchoolId = schoolId;
    
    // 휴무일정인 경우 더미 학교 사용 또는 생성
    if (isHoliday) {
      // 더미 학교가 있는지 확인하고 없으면 생성
      let dummySchool = await prisma.school.findFirst({
        where: { name: '휴무일정' }
      });
      
      if (!dummySchool) {
        dummySchool = await prisma.school.create({
          data: {
            name: '휴무일정',
            phoneNumber: null,
            contactPerson: null,
          }
        });
      }
      
      finalSchoolId = dummySchool.id;
    }

    // Ensure purpose is stringified if it's an array
    const purposeString = Array.isArray(purpose) ? JSON.stringify(purpose) : purpose;

    const newSchedule = await prisma.schedule.create({
      data: {
        date: new Date(date),
        schoolId: finalSchoolId,
        ampm,
        startTime,
        endTime,
        purpose: purposeString || '[]',
        otherReason: otherReason || null,
        isHoliday: isHoliday || false,
        holidayReason: holidayReason || null,
      },
    });
    return NextResponse.json(newSchedule, { status: 201 });
  } catch (error) {
    console.error('Error creating schedule:', error);
    return NextResponse.json({ error: 'Failed to create schedule' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, date, schoolId, ampm, startTime, endTime, purpose, otherReason, isHoliday, holidayReason } = await request.json();

    // 휴무일정인 경우와 일반 일정인 경우를 다르게 검증
    if (isHoliday) {
      if (!id || !date || !ampm || !startTime || !endTime || !holidayReason) {
        return NextResponse.json({ error: 'Missing required fields for holiday schedule' }, { status: 400 });
      }
    } else {
      if (!id || !date || !schoolId || !ampm || !startTime || !endTime || !purpose) {
        return NextResponse.json({ error: 'Missing required fields for regular schedule' }, { status: 400 });
      }
    }

    let finalSchoolId = schoolId;
    
    // 휴무일정인 경우 더미 학교 사용 또는 생성
    if (isHoliday) {
      // 더미 학교가 있는지 확인하고 없으면 생성
      let dummySchool = await prisma.school.findFirst({
        where: { name: '휴무일정' }
      });
      
      if (!dummySchool) {
        dummySchool = await prisma.school.create({
          data: {
            name: '휴무일정',
            phoneNumber: null,
            contactPerson: null,
          }
        });
      }
      
      finalSchoolId = dummySchool.id;
    }

    // Ensure purpose is stringified if it's an array
    const purposeString = Array.isArray(purpose) ? JSON.stringify(purpose) : purpose;

    const updatedSchedule = await prisma.schedule.update({
      where: { id },
      data: {
        date: new Date(date),
        schoolId: finalSchoolId,
        ampm,
        startTime,
        endTime,
        purpose: purposeString || '[]',
        otherReason: otherReason || null,
        isHoliday: isHoliday || false,
        holidayReason: holidayReason || null,
      },
    });
    return NextResponse.json(updatedSchedule);
  } catch (error) {
    console.error('Error updating schedule:', error);
    return NextResponse.json({ error: 'Failed to update schedule' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    await prisma.schedule.delete({
      where: { id },
    });
    return NextResponse.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    return NextResponse.json({ error: 'Failed to delete schedule' }, { status: 500 });
  }
}