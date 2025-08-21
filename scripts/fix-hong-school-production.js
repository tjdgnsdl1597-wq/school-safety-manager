const { PrismaClient } = require('../src/generated/prisma');

// 홍길동 계정에 1개 학교를 연결하는 스크립트
async function fixHongSchoolProduction() {
  const productionUrl = "postgres://neondb_owner:npg_GzM8pDvLk4Kx@ep-super-cherry-a159b2gx-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";
  const prisma = new PrismaClient({
    datasourceUrl: productionUrl
  });
  
  try {
    console.log('🔧 홍길동 계정의 학교 연결 시작...');
    
    // 홍길동 사용자 찾기
    const hongUser = await prisma.user.findUnique({
      where: { username: 'tjdgns1597' }
    });
    
    if (!hongUser) {
      console.log('❌ tjdgns1597 계정을 찾을 수 없습니다.');
      return;
    }
    
    console.log(`✅ 홍길동 계정 찾음: ${hongUser.name} (${hongUser.id})`);
    
    // 홍길동의 현재 학교 수 확인
    const currentSchoolCount = await prisma.school.count({
      where: { userId: hongUser.id }
    });
    
    console.log(`현재 홍길동의 학교 수: ${currentSchoolCount}개`);
    
    if (currentSchoolCount >= 1) {
      console.log('✅ 홍길동은 이미 학교가 있습니다.');
      
      // 홍길동의 학교 목록 표시
      const hongSchools = await prisma.school.findMany({
        where: { userId: hongUser.id }
      });
      
      console.log('홍길동의 학교:');
      hongSchools.forEach((school, index) => {
        console.log(`  ${index + 1}. ${school.name}`);
      });
      
      return;
    }
    
    // 홍길동용 학교 생성 (마니산유치원)
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
    
    console.log('🆕 마니산유치원 → 홍길동에게 연결');
    
    // 최종 확인
    const finalSchoolCount = await prisma.school.count({
      where: { userId: hongUser.id }
    });
    
    console.log(`🎉 홍길동 최종 학교 수: ${finalSchoolCount}개`);
    
  } catch (error) {
    console.error('❌ 학교 연결 실패:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixHongSchoolProduction();