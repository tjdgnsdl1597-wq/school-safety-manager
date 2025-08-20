// Vercel 데이터베이스 상태 확인 스크립트
const { PrismaClient } = require('../src/generated/prisma');

async function checkDatabaseStatus() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 데이터베이스 연결 테스트 중...');
    
    // 연결 테스트
    await prisma.$connect();
    console.log('✅ 데이터베이스 연결 성공');
    
    // 테이블 존재 확인
    console.log('\n📋 테이블 상태 확인:');
    
    // 사용자 테이블 확인
    const userCount = await prisma.user.count();
    console.log(`👥 User 테이블: ${userCount}개 레코드`);
    
    // 학교 테이블 확인
    const schoolCount = await prisma.school.count();
    console.log(`🏫 School 테이블: ${schoolCount}개 레코드`);
    
    // 일정 테이블 확인
    const scheduleCount = await prisma.schedule.count();
    console.log(`📅 Schedule 테이블: ${scheduleCount}개 레코드`);
    
    // 교육자료 테이블 확인
    const materialCount = await prisma.material.count();
    console.log(`📚 Material 테이블: ${materialCount}개 레코드`);
    
    // 최근 사용자 몇 명 확인
    if (userCount > 0) {
      console.log('\n👤 최근 사용자 정보:');
      const recentUsers = await prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          username: true,
          name: true,
          createdAt: true,
          isActive: true
        }
      });
      
      recentUsers.forEach(user => {
        console.log(`  - ${user.username} (${user.name}) - ${user.createdAt.toISOString()} - ${user.isActive ? '활성' : '비활성'}`);
      });
    }
    
    console.log('\n🔍 데이터베이스 진단 완료');
    
  } catch (error) {
    console.error('❌ 데이터베이스 오류:', error.message);
    console.error('상세 오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseStatus();