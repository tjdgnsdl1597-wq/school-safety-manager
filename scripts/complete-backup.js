const { PrismaClient } = require('../src/generated/prisma');
const fs = require('fs');

async function completeBackup() {
  const prisma = new PrismaClient();
  
  try {
    // 모든 테이블의 데이터 백업 (사용자 포함)
    const users = await prisma.user.findMany();
    const schools = await prisma.school.findMany();
    const schedules = await prisma.schedule.findMany();
    const materials = await prisma.material.findMany({
      include: { attachments: true }
    });
    
    const completeBackup = {
      timestamp: new Date().toISOString(),
      users,
      schools,
      schedules,
      materials
    };
    
    console.log('완전한 백업 데이터:');
    console.log('- 사용자:', users.length + '명');
    users.forEach(user => {
      console.log(`  * ${user.username} (${user.name}) - ${user.role}`);
    });
    console.log('- 학교:', schools.length + '개');
    console.log('- 일정:', schedules.length + '개');
    console.log('- 교육자료:', materials.length + '개');
    
    // 파일로 저장
    fs.writeFileSync('./complete-backup.json', JSON.stringify(completeBackup, null, 2));
    console.log('✅ 완전한 데이터 백업 완료: complete-backup.json');
    
  } catch (error) {
    console.error('❌ 백업 중 오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

completeBackup();