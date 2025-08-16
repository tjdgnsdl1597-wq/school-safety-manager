import { NextResponse } from 'next/server';
import { Prisma, PrismaClient } from '../../../generated/prisma';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const schools = await prisma.school.findMany({
      orderBy: {
        name: 'asc', // 가나다순 (오름차순) 정렬
      },
    });
    return NextResponse.json(schools);
  } catch (error) {
    console.error('Error fetching schools:', error);
    return NextResponse.json({ error: 'Failed to fetch schools' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, phoneNumber, contactPerson } = await request.json();
    console.log('Received school data for creation:', { name, phoneNumber, contactPerson });

    if (!name) {
      return NextResponse.json({ error: 'School name is required' }, { status: 400 });
    }
    const newSchool = await prisma.school.create({
      data: { name, phoneNumber, contactPerson },
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
    }
    return NextResponse.json({ error: 'Failed to create school' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, name, phoneNumber, contactPerson } = await request.json();
    console.log('Received school data for update:', { id, name, phoneNumber, contactPerson });

    if (!id || !name) {
      return NextResponse.json({ error: 'ID and school name are required' }, { status: 400 });
    }
    const updatedSchool = await prisma.school.update({
      where: { id },
      data: { name, phoneNumber, contactPerson },
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

    const transaction = await prisma.$transaction([
      prisma.schedule.deleteMany({ where: { schoolId: { in: ids } } }),
      prisma.school.deleteMany({ where: { id: { in: ids } } }),
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
