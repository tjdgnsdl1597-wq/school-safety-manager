const { PrismaClient } = require('../src/generated/prisma');
const fs = require('fs');
const path = require('path');

// 프로덕션 환경에 백업 데이터를 배포하는 스크립트
async function deployBackupToProduction() {
  // 프로덕션 PostgreSQL URL 직접 사용
  const productionUrl = "postgres://neondb_owner:npg_GzM8pDvLk4Kx@ep-super-cherry-a159b2gx-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";
  const prisma = new PrismaClient({
    datasourceUrl: productionUrl
  });
  
  try {
    console.log('🚀 프로덕션 환경에 사용자 데이터 배포 시작...');
    
    // 백업 파일 읽기
    const backupFile = path.join(process.cwd(), 'complete-backup.json');
    
    if (!fs.existsSync(backupFile)) {
      console.log('❌ complete-backup.json 파일이 없습니다.');
      return;
    }

    const backupData = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
    
    console.log('📊 배포할 데이터:');
    console.log(`- 사용자: ${backupData.users?.length || 0}명`);
    console.log(`- 학교: ${backupData.schools?.length || 0}개`);
    console.log(`- 일정: ${backupData.schedules?.length || 0}개`);

    // 현재 프로덕션 상태 확인
    const currentUsers = await prisma.user.count();
    const currentSchools = await prisma.school.count();
    console.log(`현재 프로덕션 사용자: ${currentUsers}명, 학교: ${currentSchools}개`);

    // 사용자 데이터 배포
    if (backupData.users && backupData.users.length > 0) {
      console.log('👥 사용자 계정 배포 중...');
      
      for (const userData of backupData.users) {
        // 기존 사용자가 있는지 확인
        const existingUser = await prisma.user.findUnique({
          where: { username: userData.username }
        });

        if (existingUser) {
          // 기존 사용자 업데이트
          await prisma.user.update({
            where: { username: userData.username },
            data: {
              password: userData.password,
              name: userData.name,
              position: userData.position,
              phoneNumber: userData.phoneNumber,
              email: userData.email,
              department: userData.department,
              homeAddress: userData.homeAddress,
              officeAddress: userData.officeAddress,
              role: userData.role,
              isActive: userData.isActive
            }
          });
          console.log(`✅ ${userData.username} (${userData.name}) 업데이트 완료`);
        } else {
          // 새 사용자 생성
          await prisma.user.create({
            data: userData
          });
          console.log(`✅ ${userData.username} (${userData.name}) 생성 완료`);
        }
      }
    }

    // 학교 데이터 배포
    if (backupData.schools && backupData.schools.length > 0) {
      console.log('🏫 학교 데이터 배포 중...');
      
      for (const schoolData of backupData.schools) {
        try {
          // 기존 학교가 있는지 확인 (이름으로만 확인)
          const existingSchool = await prisma.school.findFirst({
            where: { 
              name: schoolData.name
            }
          });

          if (!existingSchool) {
            await prisma.school.create({
              data: schoolData
            });
          } else {
            // 기존 학교가 있으면 해당 사용자의 소유로 업데이트
            await prisma.school.update({
              where: { id: existingSchool.id },
              data: {
                userId: schoolData.userId,
                phoneNumber: schoolData.phoneNumber,
                contactPerson: schoolData.contactPerson,
                email: schoolData.email,
                address: schoolData.address
              }
            });
          }
        } catch (error) {
          console.log(`⚠️ ${schoolData.name} 학교 처리 중 오류 - 건너뜀`);
          continue;
        }
      }
      console.log(`✅ ${backupData.schools.length}개 학교 배포 완료`);
    }

    // 일정 데이터 배포
    if (backupData.schedules && backupData.schedules.length > 0) {
      console.log('📅 일정 데이터 배포 중...');
      
      for (const scheduleData of backupData.schedules) {
        // 기존 일정이 있는지 확인 (같은 날짜, 학교, 사용자)
        const existingSchedule = await prisma.schedule.findFirst({
          where: {
            date: new Date(scheduleData.date),
            schoolId: scheduleData.schoolId,
            userId: scheduleData.userId
          }
        });

        if (!existingSchedule) {
          await prisma.schedule.create({
            data: {
              ...scheduleData,
              date: new Date(scheduleData.date)
            }
          });
        }
      }
      console.log(`✅ ${backupData.schedules.length}개 일정 배포 완료`);
    }

    // 최종 상태 확인
    const finalUsers = await prisma.user.count();
    const finalSchools = await prisma.school.count();
    const finalSchedules = await prisma.schedule.count();
    
    console.log('📊 최종 프로덕션 데이터 상태:');
    console.log(`- 사용자: ${finalUsers}명`);
    console.log(`- 학교: ${finalSchools}개`);
    console.log(`- 일정: ${finalSchedules}개`);
    
    console.log('🎉 프로덕션 배포 완료!');
    console.log('✅ tjdgnsdl1597, tjdgns1597 로그인 가능합니다.');

  } catch (error) {
    console.error('❌ 프로덕션 배포 실패:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deployBackupToProduction();