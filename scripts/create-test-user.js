const { PrismaClient } = require('../src/generated/prisma');

async function createTestUser() {
  const prisma = new PrismaClient();
  
  try {
    // 기존 사용자가 있는지 확인
    const existingUser = await prisma.user.findUnique({
      where: { username: 'tjdgnsdl1597' }
    });

    if (existingUser) {
      console.log('✅ tjdgnsdl1597 계정이 이미 존재합니다.');
      console.log('로그인 정보:');
      console.log('- 아이디: tjdgnsdl1597');
      console.log('- 비밀번호: dlwjdrma12.');
      return;
    }

    // 새로운 일반 사용자 생성
    const testUser = await prisma.user.create({
      data: {
        username: 'tjdgnsdl1597',
        password: 'dlwjdrma12.',
        name: '강성훈',
        position: '대리',
        phoneNumber: '010-8764-2428',
        email: 'safe08@ssif.or.kr',
        department: '산업안전팀',
        role: 'user', // 일반 사용자로 설정
        isActive: true,
        homeAddress: '인천광역시 남동구 논현동',
        officeAddress: '인천광역시 연수구 컨벤시아대로 69'
      }
    });

    console.log('✅ 일반 사용자 계정이 성공적으로 생성되었습니다!');
    console.log('로그인 정보:');
    console.log('- 아이디: tjdgnsdl1597');
    console.log('- 비밀번호: dlwjdrma12.');
    console.log('- 이름:', testUser.name);
    console.log('- 직급:', testUser.position);
    console.log('- 권한: 일반 사용자');

    // 테스트용 학교 몇 개도 추가
    const schools = [
      { name: '가좌중학교', address: '인천광역시 서구 가좌3동 428-1' },
      { name: '인주중학교', address: '인천광역시 남동구 논현동 637' },
      { name: '마니산유치원', address: '인천광역시 강화군 화도면 마니산로 675' }
    ];

    for (const schoolData of schools) {
      const existingSchool = await prisma.school.findUnique({
        where: { name: schoolData.name }
      });

      if (!existingSchool) {
        await prisma.school.create({
          data: {
            ...schoolData,
            phoneNumber: '032-123-4567',
            contactPerson: '담당자',
            email: 'school@example.com',
            userId: testUser.id
          }
        });
        console.log(`📚 ${schoolData.name} 추가됨`);
      }
    }

  } catch (error) {
    console.error('❌ 계정 생성 중 오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();