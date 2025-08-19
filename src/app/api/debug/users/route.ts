import { NextResponse } from 'next/server';
import { PrismaClient } from '../../../../generated/prisma';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const activeUsers = allUsers.filter(user => user.isActive);
    const pendingUsers = allUsers.filter(user => !user.isActive);

    return NextResponse.json({
      success: true,
      data: {
        totalUsers: allUsers.length,
        activeUsers: activeUsers.length,
        pendingUsers: pendingUsers.length,
        allUsers: allUsers,
        activeUsersList: activeUsers,
        pendingUsersList: pendingUsers
      }
    });

  } catch (error) {
    console.error('디버그 에러:', error);
    return NextResponse.json(
      { success: false, message: 'Debug API 오류', error: String(error) },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}