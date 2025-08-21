import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`학교 주소 업데이트 요청: schoolId=${id}`);
    
    const body = await request.json();
    const { address } = body;
    
    console.log(`업데이트할 주소: ${address}`);

    if (!address || address.trim() === '') {
      console.error('빈 주소로 업데이트 시도');
      return NextResponse.json({ error: '주소를 입력해주세요.' }, { status: 400 });
    }

    // 학교 존재 여부 확인
    console.log(`학교 존재 여부 확인 중: ${id}`);
    const school = await prisma.school.findUnique({
      where: { id }
    });

    if (!school) {
      console.error(`학교를 찾을 수 없음: ${id}`);
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    console.log(`학교 정보 확인됨: ${school.name}`);

    // 학교 주소 업데이트
    console.log(`주소 업데이트 실행 중...`);
    const updatedSchool = await prisma.school.update({
      where: { id },
      data: { address: address.trim() }
    });

    console.log(`주소 업데이트 성공: ${updatedSchool.name} -> ${updatedSchool.address}`);

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
    
    // Prisma 에러 세부 정보 추가
    if (error instanceof Error) {
      console.error('오류 상세:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to update school address',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}