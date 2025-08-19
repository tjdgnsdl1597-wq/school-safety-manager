import { NextResponse } from 'next/server';
import { Prisma, PrismaClient } from '../../../generated/prisma';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    // 요청 헤더에서 사용자 정보 가져오기
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    
    let whereCondition = {};
    
    // 관리자가 아닌 경우 자신이 등록한 학교만 조회
    if (userRole !== 'super_admin' && userId) {
      whereCondition = { userId: userId };
    }
    
    const schools = await prisma.school.findMany({
      where: {
        ...whereCondition,
        NOT: { name: '휴무일정' } // 더미 휴무일정 학교는 목록에서 제외
      },
      orderBy: {
        name: 'asc', // 가나다순 (오름차순) 정렬
      },
    });
    return NextResponse.json(schools);
  } catch (error) {
    console.error('Error fetching schools:', error);
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const { name, phoneNumber, contactPerson, email } = await request.json();
    const userId = request.headers.get('x-user-id');
    
    console.log('Received school data for creation:', { name, phoneNumber, contactPerson, userId });

    if (!name) {
      return NextResponse.json({ error: 'School name is required' }, { status: 400 });
    }
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Test database connection and table existence
    try {
      await prisma.$queryRaw`SELECT 1`;
      // Check if School table exists
      await prisma.$queryRaw`SELECT COUNT(*) FROM "School" LIMIT 1`;
    } catch (dbError) {
      console.error('Database or table check failed:', dbError);
      return NextResponse.json({ 
        error: 'Database not ready. Tables may not exist.',
        details: dbError instanceof Error ? dbError.message : 'Unknown DB error',
        suggestion: 'Database migration may be needed'
      }, { status: 503 });
    }

    const newSchool = await prisma.school.create({
      data: { 
        name, 
        phoneNumber, 
        contactPerson,
        email,
        userId: userId
      },
    });
    console.log('School created successfully:', newSchool);
    return NextResponse.json(newSchool, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating school:', error);
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json({ error: `School with name "${error.meta?.target}" already exists.` }, { status: 409 });
      }
      if (error.code === 'P2021') {
        return NextResponse.json({ error: 'Database table does not exist. Migration may be needed.' }, { status: 503 });
      }
    }
    return NextResponse.json({ 
      error: 'Failed to create school. Database may not be ready.',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, name, phoneNumber, contactPerson, email } = await request.json();
    console.log('Received school data for update:', { id, name, phoneNumber, contactPerson });

    if (!id || !name) {
      return NextResponse.json({ error: 'ID and school name are required' }, { status: 400 });
    }
    const updatedSchool = await prisma.school.update({
      where: { id },
      data: { name, phoneNumber, contactPerson, email },
    });
    console.log('School updated successfully:', updatedSchool);
    return NextResponse.json(updatedSchool);
  } catch (error: unknown) {
    console.error('Error updating school:', error);
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') { // Record not found
        return NextResponse.json({ error: 'School not found for update.' }, { status: 404 });
      } else if (error.code === 'P2002') { // Unique constraint violation
        return NextResponse.json({ error: `School with name "${error.meta?.target}" already exists.` }, { status: 409 });
      }
    }
    return NextResponse.json({ error: 'Failed to update school' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { ids } = await request.json();
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'An array of school IDs is required' }, { status: 400 });
    }

    // 휴무일정 더미 학교 ID 확인
    const dummySchool = await prisma.school.findFirst({
      where: { name: '휴무일정' }
    });
    
    // 삭제할 ID 목록에서 더미 학교 ID 제외
    const filteredIds = dummySchool ? ids.filter(id => id !== dummySchool.id) : ids;
    
    if (filteredIds.length === 0) {
      return NextResponse.json({ error: '삭제할 수 있는 학교가 없습니다.' }, { status: 400 });
    }

    const transaction = await prisma.$transaction([
      prisma.schedule.deleteMany({ where: { schoolId: { in: filteredIds } } }),
      prisma.school.deleteMany({ where: { id: { in: filteredIds }, NOT: { name: '휴무일정' } } }),
    ]);

    return NextResponse.json({ message: `${transaction[1].count} schools and associated schedules deleted successfully.` });
  } catch (error) {
    console.error('Error deleting school:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json({ error: 'School not found to delete.' }, { status: 404 });
      }
    }
    return NextResponse.json({ error: 'Failed to delete school. It might be in use or another error occurred.' }, { status: 500 });
  }
}
