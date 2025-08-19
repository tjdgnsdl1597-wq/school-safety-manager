import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../../generated/prisma';

const prisma = new PrismaClient();

// 사용자 목록 조회 (관리자 전용)
export async function GET(request: NextRequest) {
  try {
    // TODO: 실제 구현에서는 JWT 토큰으로 관리자 권한 확인 필요
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'pending' 또는 'active'
    
    const whereCondition: any = {};
    
    if (status === 'pending') {
      whereCondition.isActive = false;
    } else if (status === 'active') {
      whereCondition.isActive = true;
    }
    
    const users = await prisma.user.findMany({
      where: whereCondition,
      select: {
        id: true,
        username: true,
        name: true,
        position: true,
        phoneNumber: true,
        email: true,
        department: true,
        profilePhoto: true,
        role: true,
        isActive: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      users
    });

  } catch (error) {
    console.error('사용자 목록 조회 에러:', error);
    return NextResponse.json(
      { success: false, message: '사용자 목록을 불러올 수 없습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// 사용자 승인/거부 (관리자 전용)
export async function PATCH(request: NextRequest) {
  try {
    const { userId, action } = await request.json(); // action: 'approve' or 'reject'
    
    if (!userId || !action) {
      return NextResponse.json(
        { success: false, message: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    if (action === 'approve') {
      // 사용자 승인
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { isActive: true }
      });

      return NextResponse.json({
        success: true,
        message: `${updatedUser.name}님의 계정이 승인되었습니다.`,
        user: updatedUser
      });
    } else if (action === 'reject') {
      // 사용자 거부 (삭제)
      const deletedUser = await prisma.user.delete({
        where: { id: userId }
      });

      return NextResponse.json({
        success: true,
        message: `${deletedUser.name}님의 가입 신청이 거부되었습니다.`,
      });
    } else {
      return NextResponse.json(
        { success: false, message: '잘못된 액션입니다.' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('사용자 승인/거부 에러:', error);
    return NextResponse.json(
      { success: false, message: '처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// 사용자 삭제 (관리자 전용)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: '사용자 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 사용자 정보 조회 (삭제 전 확인)
    const userToDelete = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, role: true }
    });

    if (!userToDelete) {
      return NextResponse.json(
        { success: false, message: '해당 사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 슈퍼관리자는 삭제할 수 없음
    if (userToDelete.role === 'super_admin') {
      return NextResponse.json(
        { success: false, message: '관리자 계정은 삭제할 수 없습니다.' },
        { status: 403 }
      );
    }

    // 사용자 삭제 (CASCADE 관계로 관련 데이터도 함께 삭제됨)
    await prisma.user.delete({
      where: { id: userId }
    });

    return NextResponse.json({
      success: true,
      message: `${userToDelete.name}님의 계정이 삭제되었습니다.`,
    });

  } catch (error) {
    console.error('사용자 삭제 에러:', error);
    return NextResponse.json(
      { success: false, message: '사용자 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}