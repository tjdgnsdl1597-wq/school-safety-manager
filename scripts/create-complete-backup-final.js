const { PrismaClient } = require('../src/generated/prisma');
const fs = require('fs');
const path = require('path');

// 완전 백업 생성 (이동시간 포함)
async function createCompleteBackupFinal() {
  const productionUrl = "postgres://neondb_owner:npg_GzM8pDvLk4Kx@ep-super-cherry-a159b2gx-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";
  const prisma = new PrismaClient({
    datasourceUrl: productionUrl
  });
  
  try {
    console.log('🎯 최종 완전 백업 생성 중...');
    
    // 모든 데이터 수집
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'asc' }
    });
    
    const schools = await prisma.school.findMany({
      orderBy: { name: 'asc' },
      include: { user: { select: { username: true, name: true } } }
    });
    
    const schedules = await prisma.schedule.findMany({
      orderBy: { date: 'asc' },
      include: { 
        user: { select: { username: true, name: true } },
        school: { select: { name: true } }
      }
    });
    
    const travelTimes = await prisma.travelTime.findMany({
      orderBy: { calculatedAt: 'asc' },
      include: { 
        user: { select: { username: true, name: true } },
        schedule: { 
          select: { 
            date: true, 
            school: { select: { name: true } }
          } 
        }
      }
    });
    
    const materials = await prisma.material.findMany({
      orderBy: { createdAt: 'asc' },
      include: { attachments: true }
    });

    // 사용자별 통계
    console.log('\n📊 사용자별 데이터 분석:');
    for (const user of users) {
      const userSchools = schools.filter(s => s.userId === user.id);
      const userSchedules = schedules.filter(s => s.userId === user.id);
      const userTravelTimes = travelTimes.filter(t => t.userId === user.id);
      
      console.log(`\n👤 ${user.name} (${user.username}):`);
      console.log(`   - 학교: ${userSchools.length}개`);
      console.log(`   - 일정: ${userSchedules.length}개`);
      console.log(`   - 이동시간: ${userTravelTimes.length}개`);
      
      if (userSchools.length > 0) {
        console.log(`   - 주요 학교: ${userSchools.slice(0, 3).map(s => s.name).join(', ')}${userSchools.length > 3 ? ` 외 ${userSchools.length - 3}개` : ''}`);
      }
    }
    
    // 백업 데이터 구조
    const backupData = {
      timestamp: new Date().toISOString(),
      description: "사용자별 개인정보 완전 분리된 최종 백업 (이동시간 포함)",
      statistics: {
        totalUsers: users.length,
        totalSchools: schools.length,
        totalSchedules: schedules.length,
        totalTravelTimes: travelTimes.length,
        totalMaterials: materials.length,
        userBreakdown: users.map(user => ({
          username: user.username,
          name: user.name,
          schoolCount: schools.filter(s => s.userId === user.id).length,
          scheduleCount: schedules.filter(s => s.userId === user.id).length,
          travelTimeCount: travelTimes.filter(t => t.userId === user.id).length
        }))
      },
      users,
      schools: schools.map(({ user, ...school }) => school), // user 정보 제거
      schedules: schedules.map(({ user, school, ...schedule }) => schedule), // 관계 정보 제거
      travelTimes: travelTimes.map(({ user, schedule, ...travelTime }) => travelTime), // 관계 정보 제거
      materials
    };
    
    // 파일 저장
    const backupFile = path.join(process.cwd(), 'complete-backup-final.json');
    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
    
    console.log('\n🎉 최종 완전 백업 완료!');
    console.log(`📁 파일: complete-backup-final.json`);
    console.log('📋 포함된 데이터:');
    console.log(`   ✅ 사용자: ${users.length}명`);
    console.log(`   ✅ 학교: ${schools.length}개 (사용자별 분리됨)`);
    console.log(`   ✅ 일정: ${schedules.length}개 (사용자별 분리됨)`);
    console.log(`   ✅ 이동시간: ${travelTimes.length}개 (사용자별 분리됨)`);
    console.log(`   ✅ 교육자료: ${materials.length}개`);
    
  } catch (error) {
    console.error('❌ 완전 백업 실패:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createCompleteBackupFinal();