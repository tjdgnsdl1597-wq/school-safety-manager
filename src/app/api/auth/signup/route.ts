import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../../generated/prisma';
import { uploadFileToGCS } from '@/lib/gcs';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // FormData로 받기
    const formData = await request.formData();
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;
    const position = formData.get('position') as string;
    const phoneNumber = formData.get('phoneNumber') as string;
    const email = formData.get('email') as string;
    const department = formData.get('department') as string;
    const profilePhoto = formData.get('profilePhoto') as File | null;

    // 입력값 검증
    if (!username || !password || !name || !position || !phoneNumber || !email) {
      return NextResponse.json(
        { success: false, message: '필수 항목을 모두 입력해주세요.' },
        { status: 400 }
      );
    }

    // 아이디 중복 검사
    const existingUser = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: '이미 사용중인 아이디입니다.' },
        { status: 409 }
      );
    }

    // 프로필 사진 업로드 처리
    let profilePhotoUrl = null;
    if (profilePhoto && profilePhoto.size > 0) {
      try {
        profilePhotoUrl = await uploadFileToGCS(profilePhoto, 'profiles');
      } catch (uploadError) {
        console.error('프로필 사진 업로드 실패:', uploadError);
        // 사진 업로드 실패해도 가입은 진행
      }
    }

    // 새 사용자 생성 (승인 대기 상태)
    const newUser = await prisma.user.create({
      data: {
        username,
        password, // 나중에 암호화 예정
        name,
        position,
        phoneNumber,
        email,
        department: department || '산업안전팀',
        profilePhoto: profilePhotoUrl,
        role: 'user',
        isActive: false // 승인 전까지 비활성화
      }
    });

    return NextResponse.json({
      success: true,
      message: '가입 신청이 완료되었습니다. 관리자의 승인을 기다려주세요.',
      userId: newUser.id
    });

  } catch (error) {
    console.error('회원가입 에러:', error);
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}