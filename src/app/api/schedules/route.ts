import { NextResponse } from 'next/server';
import { PrismaClient } from '../../../generated/prisma';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // 데이터베이스 연결 확인
    try {
      await prisma.$connect();
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      // 데이터베이스 연결 실패 시 빈 배열 반환
      return NextResponse.json([]);
    }

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
    } catch (queryError) {
      console.error('Database query failed:', queryError);
      // 쿼리 실패 시 빈 배열 반환
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error('Error fetching schedules:', error);
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const { date, schoolId, ampm, startTime, endTime, purpose, otherReason } = await request.json();

    if (!date || !schoolId || !ampm || !startTime || !endTime || !purpose) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Ensure purpose is stringified if it's an array
    const purposeString = Array.isArray(purpose) ? JSON.stringify(purpose) : purpose;

    const newSchedule = await prisma.schedule.create({
      data: {
      date: new Date(date),
        schoolId,
        ampm,
        startTime,
        endTime,
        purpose: purposeString,
        otherReason,
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
    const { id, date, schoolId, ampm, startTime, endTime, purpose, otherReason } = await request.json();

    if (!id || !date || !schoolId || !ampm || !startTime || !endTime || !purpose) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Ensure purpose is stringified if it's an array
    const purposeString = Array.isArray(purpose) ? JSON.stringify(purpose) : purpose;

    const updatedSchedule = await prisma.schedule.update({
      where: { id },
      data: {
        date: new Date(date),
        schoolId,
        ampm,
        startTime,
        endTime,
        purpose: purposeString,
        otherReason,
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