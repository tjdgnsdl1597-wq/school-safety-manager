const { PrismaClient } = require('../src/generated/prisma');
const fs = require('fs');
const path = require('path');

// 배포 시 자동으로 사용자 데이터를 복원하는 스크립트
async function autoRestoreOnDeploy() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🚀 배포 시 자동 데이터 복원 시작...');

    // 현재 사용자 수 확인
    const currentUsers = await prisma.user.count();
    console.log(`현재 사용자 수: ${currentUsers}명`);

    // 사용자가 없으면 백업에서 복원
    if (currentUsers === 0) {
      console.log('⚠️ 사용자가 없습니다. 백업에서 복원합니다...');
      
      // 백업 파일 경로
      const backupFile = path.join(process.cwd(), 'complete-backup.json');
      
      if (!fs.existsSync(backupFile)) {
        console.log('❌ 백업 파일이 없습니다.');
        return;
      }

      const backupData = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
      
      console.log('📊 복원할 데이터:');
      console.log(`- 사용자: ${backupData.users?.length || 0}명`);
      console.log(`- 학교: ${backupData.schools?.length || 0}개`);
      console.log(`- 일정: ${backupData.schedules?.length || 0}개`);

      // 사용자 복원
      if (backupData.users && backupData.users.length > 0) {
        console.log('👥 사용자 계정 복원 중...');
        for (const userData of backupData.users) {
          await prisma.user.create({
            data: userData
          });
          console.log(`✅ ${userData.username} (${userData.name}) 복원`);
        }
      }

      // 학교 복원
      if (backupData.schools && backupData.schools.length > 0) {
        console.log('🏫 학교 데이터 복원 중...');
        for (const schoolData of backupData.schools) {
          await prisma.school.create({
            data: schoolData
          });
        }
        console.log(`✅ ${backupData.schools.length}개 학교 복원 완료`);
      }

      // 일정 복원
      if (backupData.schedules && backupData.schedules.length > 0) {
        console.log('📅 일정 데이터 복원 중...');
        for (const scheduleData of backupData.schedules) {
          await prisma.schedule.create({
            data: {
              ...scheduleData,
              date: new Date(scheduleData.date)
            }
          });
        }
        console.log(`✅ ${backupData.schedules.length}개 일정 복원 완료`);
      }

      console.log('🎉 자동 데이터 복원 완료!');
      
    } else {
      console.log('✅ 기존 사용자가 있습니다. 복원하지 않습니다.');
    }

    // 최종 상태 확인
    const finalUsers = await prisma.user.count();
    const finalSchools = await prisma.school.count();
    const finalSchedules = await prisma.schedule.count();
    
    console.log('📊 최종 데이터 상태:');
    console.log(`- 사용자: ${finalUsers}명`);
    console.log(`- 학교: ${finalSchools}개`);
    console.log(`- 일정: ${finalSchedules}개`);

  } catch (error) {
    console.error('❌ 자동 복원 실패:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 배포 시에만 실행 (Vercel 환경에서)
if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
  autoRestoreOnDeploy();
} else {
  console.log('🏠 로컬 환경에서는 자동 복원을 건너뜁니다.');
}