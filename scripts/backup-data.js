const { PrismaClient } = require('../src/generated/prisma');

async function backupData() {
  const prisma = new PrismaClient();
  
  try {
    // 모든 테이블의 데이터 백업
    const schools = await prisma.school.findMany();
    const schedules = await prisma.schedule.findMany();
    const materials = await prisma.material.findMany({
      include: { attachments: true }
    });
    
    const backup = {
      timestamp: new Date().toISOString(),
      schools,
      schedules,
      materials
    };
    
    console.log('백업 데이터:', JSON.stringify(backup, null, 2));
    
    // 파일로 저장
    const fs = require('fs');
    fs.writeFileSync('./data-backup.json', JSON.stringify(backup, null, 2));
    console.log('✅ 데이터 백업 완료: data-backup.json');
    
  } catch (error) {
    console.error('❌ 백업 중 오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

backupData();