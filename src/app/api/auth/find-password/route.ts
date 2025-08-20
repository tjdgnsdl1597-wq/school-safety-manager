import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { username, name, phoneNumber } = await request.json();

    if (!username || !name || !phoneNumber) {
      return NextResponse.json(
        { error: '아이디, 이름, 전화번호를 모두 입력해주세요.' },
        { status: 400 }
      );
    }

    // 아이디, 이름, 전화번호로 사용자 찾기
    const user = await prisma.user.findFirst({
      where: {
        username: username,
        name: name,
        phoneNumber: phoneNumber,
        isActive: true, // 활성화된 계정만
      },
      select: {
        password: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: '입력하신 정보와 일치하는 계정을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      password: user.password,
      message: '비밀번호를 찾았습니다.',
    });

  } catch (error) {
    console.error('비밀번호 찾기 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}