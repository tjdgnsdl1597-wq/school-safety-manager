import { NextResponse } from 'next/server';
import { PrismaClient } from '../../../generated/prisma';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    // 요청 헤더에서 사용자 정보 가져오기
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    
    let whereCondition = {};
    
    // 관리자가 아닌 경우 자신이 등록한 일정만 조회
    if (userRole !== 'super_admin' && userId) {
      whereCondition = { userId: userId };
    }
    
    const schedules = await prisma.schedule.findMany({
      where: whereCondition,
      include: {
        school: true, // Include school details
        travelTime: {
          select: {
            id: true,
            duration: true,
            origin: true,
            fromOfficeTime: true,
            fromHomeTime: true,
            toPreviousTime: true,
          }
        }
      },
      orderBy: {
        date: 'asc',
      },
    });
    const response = NextResponse.json(schedules);
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  } catch (error) {
    console.error('Error fetching schedules:', error);
    const response = NextResponse.json([]);
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  }
}

export async function POST(request: Request) {
  try {
    const requestBody = await request.json();
    console.log('POST /api/schedules - Request body:', JSON.stringify(requestBody, null, 2));
    
    const { date, schoolId, ampm, startTime, endTime, purpose, otherReason, isHoliday, holidayReason, accidentDate } = requestBody;
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    
    console.log('POST /api/schedules - Headers:', { userId, userRole });
    console.log('POST /api/schedules - Parsed data:', {
      date, schoolId, ampm, startTime, endTime, purpose, otherReason, isHoliday, holidayReason, accidentDate
    });
    
    if (!userId) {
      console.error('POST /api/schedules - Error: User ID is missing');
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // 휴무일정인 경우와 일반 일정인 경우를 다르게 검증
    if (isHoliday) {
      console.log('POST /api/schedules - Holiday schedule validation');
      if (!date || !ampm || !startTime || !endTime || !holidayReason) {
        console.error('POST /api/schedules - Holiday validation failed:', { date, ampm, startTime, endTime, holidayReason });
        return NextResponse.json({ error: 'Missing required fields for holiday schedule' }, { status: 400 });
      }
    } else {
      console.log('POST /api/schedules - Regular schedule validation');
      if (!date || !schoolId || !ampm || !startTime || !endTime || !purpose) {
        console.error('POST /api/schedules - Regular validation failed:', { date, schoolId, ampm, startTime, endTime, purpose });
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
            userId: userId
          }
        });
      }
      
      finalSchoolId = dummySchool.id;
    }

    // Ensure purpose is stringified if it's an array
    const purposeString = Array.isArray(purpose) ? JSON.stringify(purpose) : purpose;
    console.log('POST /api/schedules - Purpose processing:', { 
      originalPurpose: purpose, 
      purposeString, 
      finalSchoolId 
    });

    const scheduleData = {
      date: new Date(date),
      schoolId: finalSchoolId,
      userId: userId,
      ampm,
      startTime,
      endTime,
      purpose: purposeString || '[]',
      otherReason: otherReason || null,
      isHoliday: isHoliday || false,
      holidayReason: holidayReason || null,
    };
    
    console.log('POST /api/schedules - Creating schedule with data:', JSON.stringify(scheduleData, null, 2));

    const newSchedule = await prisma.schedule.create({
      data: scheduleData,
    });
    
    console.log('POST /api/schedules - Schedule created successfully:', newSchedule.id);
    return NextResponse.json(newSchedule, { status: 201 });
  } catch (error) {
    console.error('POST /api/schedules - Error creating schedule:', error);
    console.error('POST /api/schedules - Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    // 더 상세한 에러 정보 반환
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorDetails = error instanceof Error && 'code' in error ? (error as any).code : 'No code';
    
    console.error('POST /api/schedules - Error details:', { errorMessage, errorDetails });
    
    return NextResponse.json({ 
      error: 'Failed to create schedule',
      details: errorMessage,
      code: errorDetails
    }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, date, schoolId, ampm, startTime, endTime, purpose, otherReason, isHoliday, holidayReason, accidentDate } = await request.json();
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

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
            userId: userId
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