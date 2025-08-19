import { NextResponse } from 'next/server';
import { PrismaClient } from '../../../generated/prisma';

const prisma = new PrismaClient();

export async function POST() {
  return setupAdminAccount();
}

export async function GET() {
  return setupAdminAccount();
}

async function setupAdminAccount() {
  try {
    // 기존 admin 계정이 있는지 확인
    const existingAdmin = await prisma.user.findUnique({
      where: { username: 'admin' }
    });

    if (existingAdmin) {
      // 기존 계정이 있으면 활성화하고 role을 super_admin으로 설정
      const updatedAdmin = await prisma.user.update({
        where: { username: 'admin' },
        data: {
          isActive: true,
          role: 'super_admin',
          password: 'rkddkwl12.'
        }
      });

      return NextResponse.json({
        success: true,
        message: '기존 admin 계정이 활성화되었습니다.',
        user: {
          id: updatedAdmin.id,
          username: updatedAdmin.username,
          name: updatedAdmin.name,
          role: updatedAdmin.role
        }
      });
    }

    // 새로운 admin 계정 생성
    const newAdmin = await prisma.user.create({
      data: {
        username: 'admin',
        password: 'rkddkwl12.',
        name: '시스템 관리자',
        position: '관리자',
        department: '산업안전팀',
        role: 'super_admin',
        isActive: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'admin 계정이 생성되었습니다.',
      user: {
        id: newAdmin.id,
        username: newAdmin.username,
        name: newAdmin.name,
        role: newAdmin.role
      }
    });

  } catch (error) {
    console.error('Admin 계정 설정 오류:', error);
    return NextResponse.json(
      { success: false, message: '관리자 계정 설정 중 오류가 발생했습니다.', error: String(error) },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}