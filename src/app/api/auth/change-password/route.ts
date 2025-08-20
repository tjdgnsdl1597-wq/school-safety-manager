import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { username, currentPassword, newPassword, confirmPassword } = await request.json();

    if (!username || !currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: '모든 필드를 입력해주세요.' },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: '새 비밀번호와 확인 비밀번호가 일치하지 않습니다.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 4) {
      return NextResponse.json(
        { error: '새 비밀번호는 최소 4자리 이상이어야 합니다.' },
        { status: 400 }
      );
    }

    // 현재 비밀번호 확인
    const user = await prisma.user.findFirst({
      where: {
        username: username,
        password: currentPassword,
        isActive: true, // 활성화된 계정만
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: '아이디 또는 현재 비밀번호가 올바르지 않습니다.' },
        { status: 404 }
      );
    }

    // 비밀번호 업데이트
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: newPassword,
      },
    });

    return NextResponse.json({
      success: true,
      message: '비밀번호가 성공적으로 변경되었습니다.',
    });

  } catch (error) {
    console.error('비밀번호 변경 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}