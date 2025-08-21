import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { address } = await request.json();

    // 학교 존재 여부 확인
    const school = await prisma.school.findUnique({
      where: { id }
    });

    if (!school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    // 학교 주소 업데이트
    const updatedSchool = await prisma.school.update({
      where: { id },
      data: { address }
    });

    return NextResponse.json({
      success: true,
      school: {
        id: updatedSchool.id,
        name: updatedSchool.name,
        address: updatedSchool.address
      }
    });
  } catch (error) {
    console.error('학교 주소 업데이트 실패:', error);
    return NextResponse.json(
      { error: 'Failed to update school address' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}