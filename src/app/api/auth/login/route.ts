import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../../generated/prisma';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // 입력값 검증
    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: '아이디와 비밀번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 환경변수의 기본 관리자 계정 확인 (admin/rkddkwl12.)
    if (username === 'admin' && password === 'rkddkwl12.') {
      return NextResponse.json({
        success: true,
        message: '로그인 성공',
        user: {
          id: 'admin-default',
          username: 'admin',
          name: '시스템 관리자',
          position: '관리자',
          phoneNumber: null,
          email: null,
          department: '산업안전팀',
          profilePhoto: null,
          role: 'super_admin'
        }
      });
    }

    // 데이터베이스에서 사용자 찾기
    const user = await prisma.user.findUnique({
      where: { 
        username: username,
        isActive: true  // 활성화된 사용자만
      }
    });

    // 사용자가 없거나 비밀번호가 틀린 경우
    if (!user || user.password !== password) {
      return NextResponse.json(
        { success: false, message: '아이디 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      );
    }

    // 로그인 성공 - 사용자 정보 반환 (비밀번호 제외)
    const userInfo = {
      id: user.id,
      username: user.username,
      name: user.name,
      position: user.position,
      phoneNumber: user.phoneNumber,
      email: user.email,
      department: user.department,
      profilePhoto: user.profilePhoto,
      role: user.role
    };

    return NextResponse.json({
      success: true,
      message: '로그인 성공',
      user: userInfo
    });

  } catch (error) {
    console.error('로그인 에러:', error);
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}