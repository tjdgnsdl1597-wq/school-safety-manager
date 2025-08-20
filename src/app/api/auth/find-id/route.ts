import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { name, phoneNumber } = await request.json();

    if (!name || !phoneNumber) {
      return NextResponse.json(
        { error: '이름과 전화번호를 모두 입력해주세요.' },
        { status: 400 }
      );
    }

    // 이름과 전화번호로 사용자 찾기
    const users = await prisma.user.findMany({
      where: {
        name: name,
        phoneNumber: phoneNumber,
        isActive: true, // 활성화된 계정만
      },
      select: {
        username: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (users.length === 0) {
      return NextResponse.json(
        { error: '입력하신 정보와 일치하는 계정을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 모든 아이디 반환
    const usernames = users.map(user => user.username);

    return NextResponse.json({
      success: true,
      usernames: usernames,
      message: `${usernames.length}개의 아이디를 찾았습니다.`,
    });

  } catch (error) {
    console.error('아이디 찾기 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}