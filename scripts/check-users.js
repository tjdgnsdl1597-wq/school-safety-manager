const { PrismaClient } = require('../src/generated/prisma');

async function checkUsers() {
  const prisma = new PrismaClient();
  
  try {
    const users = await prisma.user.findMany();
    console.log('현재 데이터베이스의 모든 사용자:');
    users.forEach(user => {
      console.log(`- 아이디: ${user.username} | 이름: ${user.name} | 권한: ${user.role}`);
    });
    console.log(`총 ${users.length}명의 사용자가 있습니다.`);
  } catch (error) {
    console.error('사용자 조회 오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();