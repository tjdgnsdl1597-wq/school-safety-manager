const { PrismaClient } = require('../src/generated/prisma');

// 강성훈 계정에 32개 학교를 연결하는 스크립트
async function fixKangSchoolsProduction() {
  const productionUrl = "postgres://neondb_owner:npg_GzM8pDvLk4Kx@ep-super-cherry-a159b2gx-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";
  const prisma = new PrismaClient({
    datasourceUrl: productionUrl
  });
  
  try {
    console.log('🔧 강성훈 계정의 학교 연결 시작...');
    
    // 강성훈 사용자 찾기
    const kangUser = await prisma.user.findUnique({
      where: { username: 'tjdgnsdl1597' }
    });
    
    if (!kangUser) {
      console.log('❌ tjdgnsdl1597 계정을 찾을 수 없습니다.');
      return;
    }
    
    console.log(`✅ 강성훈 계정 찾음: ${kangUser.name} (${kangUser.id})`);
    
    // 32개 학교 목록
    const schoolNames = [
      "숭덕여자중학교",
      "숭덕여자고등학교", 
      "인천예림학교",
      "간석여자중학교",
      "삼산유치원",
      "인천초은중학교",
      "인천루원중학교",
      "인천가석초등학교",
      "상정중학교",
      "제물포중학교",
      "가좌중학교",
      "인천건지초등학교",
      "가림고등학교",
      "인천대정초등학교",
      "재능대학교 송림캠퍼스부속유치원",
      "인천소방고등학교",
      "인성여자중학교",
      "인천신흥초등학교",
      "인천송림초등학교",
      "인천예일고등학교",
      "인천양촌중학교",
      "임학중학교",
      "인천안남초등학교",
      "인천안남중학교",
      "계산공업고등학교",
      "경인교육대학교부설초등학교",
      "인천효성동초등학교",
      "명현중학교",
      "인천미송유치원",
      "칼빈매니토바국제학교",
      "영흥초등학교(분기)",
      "덕적초중고등학교(분기)"
    ];
    
    let updatedCount = 0;
    let createdCount = 0;
    
    for (const schoolName of schoolNames) {
      // 기존 학교 찾기
      const existingSchool = await prisma.school.findFirst({
        where: { name: schoolName }
      });
      
      if (existingSchool) {
        // 강성훈에게 소유권 이전
        await prisma.school.update({
          where: { id: existingSchool.id },
          data: { userId: kangUser.id }
        });
        console.log(`🔗 ${schoolName} → 강성훈에게 연결`);
        updatedCount++;
      } else {
        // 새 학교 생성
        await prisma.school.create({
          data: {
            name: schoolName,
            phoneNumber: "032-XXX-XXXX",
            contactPerson: "담당자",
            email: "school@example.com",
            address: "인천광역시",
            userId: kangUser.id
          }
        });
        console.log(`🆕 ${schoolName} → 새로 생성하여 강성훈에게 연결`);
        createdCount++;
      }
    }
    
    // 강성훈의 현재 학교 수 확인
    const kangSchools = await prisma.school.count({
      where: { userId: kangUser.id }
    });
    
    console.log('\n📊 작업 완료:');
    console.log(`- 기존 학교 연결: ${updatedCount}개`);
    console.log(`- 새 학교 생성: ${createdCount}개`);
    console.log(`- 강성훈 총 학교 수: ${kangSchools}개`);
    
    if (kangSchools >= 32) {
      console.log('🎉 강성훈 계정에 32개 학교 연결 완료!');
    }
    
  } catch (error) {
    console.error('❌ 학교 연결 실패:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixKangSchoolsProduction();