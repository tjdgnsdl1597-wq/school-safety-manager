const { PrismaClient } = require('../src/generated/prisma');

async function restoreOriginalData() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔄 원래 데이터 복원 시작...');

    // 기존 학교와 일정 데이터 삭제
    await prisma.schedule.deleteMany();
    await prisma.school.deleteMany();
    console.log('✅ 기존 학교/일정 데이터 삭제 완료');

    // 사용자 확인
    const tjdgnsdl1597 = await prisma.user.findUnique({ where: { username: 'tjdgnsdl1597' } });
    const tjdgns1597 = await prisma.user.findUnique({ where: { username: 'tjdgns1597' } });

    if (!tjdgnsdl1597 || !tjdgns1597) {
      throw new Error('사용자를 찾을 수 없습니다');
    }

    // 강성훈 계정 (tjdgnsdl1597) - 32개 학교
    const schools32 = [
      { "name": "숭덕여자중학교", "phoneNumber": "032-650-5477", "contactPerson": "신진호 시설주무관", "address": "인천광역시 중구 숭의동" },
      { "name": "숭덕여자고등학교", "phoneNumber": "032-462-5296", "contactPerson": "신진호 시설주무관", "address": "인천광역시 중구 숭의동" },
      { "name": "인천예림학교", "phoneNumber": "032-502-0804 #2", "contactPerson": "김명숙 행정주무관", "address": "인천광역시 남동구 논현동" },
      { "name": "간석여자중학교", "phoneNumber": "032-629-7639(행정실), 032-428-6717(급식)", "contactPerson": "강성아 행정주무관", "address": "인천광역시 남동구 간석동" },
      { "name": "삼산유치원", "phoneNumber": "032-628-4374", "contactPerson": "김윤정 행정실장", "address": "인천광역시 부평구 삼산동" },
      { "name": "인천초은중학교", "phoneNumber": "032-569-5791 #2", "contactPerson": "정성규 행정주무관", "address": "인천광역시 남동구 구월동" },
      { "name": "인천루원중학교", "phoneNumber": "032-500-9505", "contactPerson": "이미선 행정주무관", "address": "인천광역시 남동구 논현동" },
      { "name": "인천가석초등학교", "phoneNumber": "032-628-5989", "contactPerson": "정연욱 행정주무관", "address": "인천광역시 부평구 가좌동" },
      { "name": "상정중학교", "phoneNumber": "032-628-4320", "contactPerson": "임채리 행정주무관", "address": "인천광역시 부평구 상정동" },
      { "name": "제물포중학교", "phoneNumber": "032-628-9814(행정실), 032-628-9817(급식실)", "contactPerson": "서훈석 행정주무관", "address": "인천광역시 중구 제물포" },
      { "name": "가좌중학교", "phoneNumber": "032-627-7026", "contactPerson": "강정아 행정주무관", "address": "인천광역시 서구 가좌3동 428-1" },
      { "name": "인천건지초등학교", "phoneNumber": "032-628-5855 #2", "contactPerson": "김정숙 행정주무관", "address": "인천광역시 부평구 부평동" },
      { "name": "가림고등학교", "phoneNumber": "032-584-1755 #6", "contactPerson": "김민주 행정주무관", "address": "인천광역시 서구 가림동" },
      { "name": "인천대정초등학교", "phoneNumber": "032-628-1378", "contactPerson": "황은정 행정주무관", "address": "인천광역시 부평구 대정동" },
      { "name": "재능대학교 송림캠퍼스부속유치원", "phoneNumber": "032-761-5000, 010-6419-6082", "contactPerson": "이경진 원감", "address": "인천광역시 중구 송림동" },
      { "name": "인천소방고등학교", "phoneNumber": "032-760-0107", "contactPerson": "이정건 시설주무관", "address": "인천광역시 중구 송림동" },
      { "name": "인성여자중학교", "phoneNumber": "032-629-3364", "contactPerson": "신장수 행정실장", "address": "인천광역시 남동구 구월동" },
      { "name": "인천신흥초등학교", "phoneNumber": "032-629-0440 #2", "contactPerson": "안종철 행정실장", "address": "인천광역시 남동구 만수동" },
      { "name": "인천송림초등학교", "phoneNumber": "032-764-2342 #2", "contactPerson": "이만연 행정주무관", "address": "인천광역시 중구 송림동" },
      { "name": "인천예일고등학교", "phoneNumber": "032-555-6307 #2", "contactPerson": "김혜림 행정주무관", "address": "인천광역시 서구 검암동" },
      { "name": "인천양촌중학교", "phoneNumber": "032-627-8183", "contactPerson": "김민경 행정주무관", "address": "인천광역시 서구 양촌동" },
      { "name": "임학중학교", "phoneNumber": "032-552-2122 #2", "contactPerson": "김선화 행정주무관", "address": "인천광역시 서구 임학동" },
      { "name": "인천안남초등학교", "phoneNumber": "032-542-7517 #2", "contactPerson": "이민아 행정주무관", "address": "인천광역시 서구 안남동" },
      { "name": "인천안남중학교", "phoneNumber": "032-549-4784 #2", "contactPerson": "강 욱 행정주무관", "address": "인천광역시 서구 안남동" },
      { "name": "계산공업고등학교", "phoneNumber": "032-552-2032 #2, 010-7733-5473(시설)", "contactPerson": "류진기 시설팀장", "address": "인천광역시 계양구 계산동" },
      { "name": "경인교육대학교부설초등학교", "phoneNumber": "032-627-9791, 010-5028-1396", "contactPerson": "변미복 행정주무관", "address": "인천광역시 서구 가정동" },
      { "name": "인천효성동초등학교", "phoneNumber": "032-547-0815 #2", "contactPerson": "김지숙 행정주무관", "address": "인천광역시 서구 효성동" },
      { "name": "명현중학교", "phoneNumber": "032-554-6832 #2", "contactPerson": "박경미 행정주무관", "address": "인천광역시 서구 명학동" },
      { "name": "인천미송유치원", "phoneNumber": "032-460-6950", "contactPerson": "박선미 행정실장", "address": "인천광역시 연수구 송도동" },
      { "name": "칼빈매니토바국제학교", "phoneNumber": "032-815-1004 #2#1#5, 010-3887-2948", "contactPerson": "조명열 시설관리과장", "address": "인천광역시 연수구 송도동" },
      { "name": "인주중학교", "phoneNumber": "032-123-4567", "contactPerson": "담당자", "address": "인천광역시 남동구 논현동 637" },
      { "name": "덕적초중고등학교(분기)", "phoneNumber": "032-832-9303#3", "contactPerson": "강성진 행정주무관", "address": "인천광역시 옹진군 덕적면" }
    ];

    console.log('📚 강성훈 계정에 32개 학교 추가 중...');
    for (const schoolData of schools32) {
      await prisma.school.create({
        data: {
          ...schoolData,
          email: 'school@example.com',
          userId: tjdgnsdl1597.id
        }
      });
    }

    // 홍길동 계정 (tjdgns1597) - 1개 학교
    console.log('🏫 홍길동 계정에 1개 학교 추가 중...');
    const hongSchool = await prisma.school.create({
      data: {
        name: "마니산유치원",
        phoneNumber: "032-123-4567",
        contactPerson: "담당자",
        email: "school@example.com",
        address: "인천광역시 강화군 화도면 마니산로 675",
        userId: tjdgns1597.id
      }
    });

    // 일정 복원 - 강성훈 계정용
    const kangSchool = await prisma.school.findFirst({ 
      where: { name: "가좌중학교", userId: tjdgnsdl1597.id } 
    });
    
    if (kangSchool) {
      await prisma.schedule.create({
        data: {
          date: new Date("2025-08-21T00:00:00.000Z"),
          schoolId: kangSchool.id,
          userId: tjdgnsdl1597.id,
          ampm: "PM",
          startTime: "13:00",
          endTime: "14:00",
          purpose: '["월점검"]',
          isHoliday: false
        }
      });
      console.log('📅 강성훈 계정 일정 추가 완료');
    }

    // 일정 복원 - 홍길동 계정용
    await prisma.schedule.create({
      data: {
        date: new Date("2025-08-21T00:00:00.000Z"),
        schoolId: hongSchool.id,
        userId: tjdgns1597.id,
        ampm: "AM",
        startTime: "08:00",
        endTime: "09:00",
        purpose: '["월점검"]',
        isHoliday: false
      }
    });
    console.log('📅 홍길동 계정 일정 추가 완료');

    // 결과 출력
    const kangSchools = await prisma.school.count({ where: { userId: tjdgnsdl1597.id } });
    const hongSchools = await prisma.school.count({ where: { userId: tjdgns1597.id } });
    const kangSchedules = await prisma.schedule.count({ where: { userId: tjdgnsdl1597.id } });
    const hongSchedules = await prisma.schedule.count({ where: { userId: tjdgns1597.id } });

    console.log('✅ 원래 데이터 복원 완료!');
    console.log(`📊 강성훈(tjdgnsdl1597): 학교 ${kangSchools}개, 일정 ${kangSchedules}개`);
    console.log(`📊 홍길동(tjdgns1597): 학교 ${hongSchools}개, 일정 ${hongSchedules}개`);

  } catch (error) {
    console.error('❌ 데이터 복원 중 오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

restoreOriginalData();