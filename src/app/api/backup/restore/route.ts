import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { backupData } = await request.json();
    
    if (!backupData || !backupData.data) {
      return NextResponse.json({
        success: false,
        error: '백업 데이터가 필요합니다.'
      }, { status: 400 });
    }
    
    console.log('🔄 데이터베이스 복원 시작...');
    
    // 트랜잭션으로 안전하게 복원
    await prisma.$transaction(async (tx) => {
      // 기존 데이터 확인 (혹시 있다면 보존)
      const existingCounts = {
        users: await tx.user.count(),
        schools: await tx.school.count(),
        schedules: await tx.schedule.count(),
        materials: await tx.material.count()
      };
      
      console.log('📊 기존 데이터:', existingCounts);
      
      // 백업 데이터가 있다면 복원
      if (backupData.data.users?.length > 0) {
        for (const user of backupData.data.users) {
          await tx.user.upsert({
            where: { id: user.id },
            update: user,
            create: user
          });
        }
      }
      
      if (backupData.data.schools?.length > 0) {
        for (const school of backupData.data.schools) {
          await tx.school.upsert({
            where: { id: school.id },
            update: school,
            create: school
          });
        }
      }
      
      if (backupData.data.schedules?.length > 0) {
        for (const schedule of backupData.data.schedules) {
          await tx.schedule.upsert({
            where: { id: schedule.id },
            update: schedule,
            create: schedule
          });
        }
      }
      
      if (backupData.data.materials?.length > 0) {
        for (const material of backupData.data.materials) {
          const { attachments, ...materialData } = material;
          
          await tx.material.upsert({
            where: { id: material.id },
            update: materialData,
            create: materialData
          });
          
          // 첨부파일도 복원
          if (attachments?.length > 0) {
            for (const attachment of attachments) {
              await tx.materialAttachment.upsert({
                where: { id: attachment.id },
                update: attachment,
                create: attachment
              });
            }
          }
        }
      }
    });
    
    console.log('✅ 데이터베이스 복원 완료');
    
    return NextResponse.json({
      success: true,
      message: '데이터베이스 복원이 완료되었습니다.'
    });
    
  } catch (error) {
    console.error('❌ 복원 실패:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
    
  } finally {
    await prisma.$disconnect();
  }
}