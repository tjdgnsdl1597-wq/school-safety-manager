import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function PUT(request: NextRequest) {
  try {
    const { homeAddress, officeAddress, userId } = await request.json();
    
    console.log('주소 업데이트 요청:', { homeAddress, officeAddress, userId });
    
    // userId가 제공되지 않은 경우 tjdgnsdl1597 사용자를 기본으로 사용
    let targetUserId = userId;
    
    if (!targetUserId) {
      console.log('userId가 없어서 기본 사용자 찾는 중...');
      const defaultUser = await prisma.user.findUnique({
        where: { username: 'tjdgnsdl1597' }
      });
      
      console.log('기본 사용자 조회 결과:', defaultUser);
      
      if (!defaultUser) {
        console.log('기본 사용자를 찾을 수 없음');
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      
      targetUserId = defaultUser.id;
    }
    
    console.log('대상 사용자 ID:', targetUserId);

    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: {
        homeAddress,
        officeAddress
      }
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        homeAddress: updatedUser.homeAddress,
        officeAddress: updatedUser.officeAddress
      }
    });
  } catch (error) {
    console.error('주소 업데이트 실패:', error);
    return NextResponse.json(
      { error: 'Failed to update addresses' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}