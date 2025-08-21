const { PrismaClient } = require('../src/generated/prisma');

// 유효하지 않은 학교 데이터 정리 스크립트
async function cleanupInvalidSchool() {
  const productionUrl = "postgres://neondb_owner:npg_GzM8pDvLk4Kx@ep-super-cherry-a159b2gx-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";
  const prisma = new PrismaClient({
    datasourceUrl: productionUrl
  });
  
  try {
    console.log('🗑️ 유효하지 않은 학교 데이터 정리 시작...');
    
    // "asdasdasdasd" 학교 찾기
    const invalidSchool = await prisma.school.findFirst({
      where: { name: "asdasdasdasd" },
      include: {
        user: true,
        schedules: true
      }
    });
    
    if (invalidSchool) {
      console.log(`찾은 유효하지 않은 학교: ${invalidSchool.name}`);
      console.log(`소유자: ${invalidSchool.user.name} (${invalidSchool.user.username})`);
      console.log(`관련 일정: ${invalidSchool.schedules.length}개`);
      
      // 관련된 일정들의 이동시간 데이터 먼저 삭제
      for (const schedule of invalidSchool.schedules) {
        const travelTime = await prisma.travelTime.findUnique({
          where: { scheduleId: schedule.id }
        });
        
        if (travelTime) {
          await prisma.travelTime.delete({
            where: { scheduleId: schedule.id }
          });
          console.log(`✅ 일정 ${schedule.id}의 이동시간 데이터 삭제`);
        }
      }
      
      // 관련된 일정들 삭제
      if (invalidSchool.schedules.length > 0) {
        await prisma.schedule.deleteMany({
          where: { schoolId: invalidSchool.id }
        });
        console.log(`✅ ${invalidSchool.schedules.length}개 일정 삭제`);
      }
      
      // 학교 삭제
      await prisma.school.delete({
        where: { id: invalidSchool.id }
      });
      console.log(`✅ "${invalidSchool.name}" 학교 삭제 완료`);
      
    } else {
      console.log('❌ "asdasdasdasd" 학교를 찾을 수 없습니다.');
    }
    
    // 홍길동의 남은 학교 확인
    const hongUser = await prisma.user.findUnique({
      where: { username: 'tjdgns1597' },
      include: { schools: true }
    });
    
    if (hongUser) {
      console.log(`\n📊 홍길동(${hongUser.username}) 현재 학교:)`);
      if (hongUser.schools.length > 0) {
        hongUser.schools.forEach((school, index) => {
          console.log(`  ${index + 1}. ${school.name}`);
        });
      } else {
        console.log('  학교가 없습니다.');
        
        // 홍길동에게 마니산유치원 추가
        await prisma.school.create({
          data: {
            name: "마니산유치원",
            phoneNumber: "032-123-4567",
            contactPerson: "홍길동",
            email: "test@ssif.or.kr",
            address: "인천광역시 강화군",
            userId: hongUser.id
          }
        });
        console.log('✅ 홍길동에게 "마니산유치원" 학교 추가');
      }
    }
    
    console.log('\n🎉 데이터 정리 완료!');
    
  } catch (error) {
    console.error('❌ 데이터 정리 실패:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupInvalidSchool();