
const { PrismaClient } = require('./src/generated/prisma');
const prisma = new PrismaClient();

const schools = [
  { "name": "숭덕여자중학교", "phoneNumber": "032-650-5477", "contactPerson": "신진호 시설주무관" },
  { "name": "숭덕여자고등학교", "phoneNumber": "032-462-5296", "contactPerson": "신진호 시설주무관" },
  { "name": "인천예림학교", "phoneNumber": "032-502-0804 #2", "contactPerson": "김명숙 행정주무관" },
  { "name": "간석여자중학교", "phoneNumber": "032-629-7639(행정실), 032-428-6717(급식)", "contactPerson": "강성아 행정주무관" },
  { "name": "삼산유치원", "phoneNumber": "032-628-4374", "contactPerson": "김윤정 행정실장" },
  { "name": "인천초은중학교", "phoneNumber": "032-569-5791 #2", "contactPerson": "정성규 행정주무관" },
  { "name": "인천루원중학교", "phoneNumber": "032-500-9505", "contactPerson": "이미선 행정주무관" },
  { "name": "인천가석초등학교", "phoneNumber": "032-628-5989", "contactPerson": "정연욱 행정주무관" },
  { "name": "상정중학교", "phoneNumber": "032-628-4320", "contactPerson": "임채리 행정주무관" },
  { "name": "제물포중학교", "phoneNumber": "032-628-9814(행정실), 032-628-9817(급식실)", "contactPerson": "서훈석 행정주무관" },
  { "name": "가좌중학교", "phoneNumber": "032-627-7026", "contactPerson": "강정아 행정주무관" },
  { "name": "인천건지초등학교", "phoneNumber": "032-628-5855 #2", "contactPerson": "김정숙 행정주무관" },
  { "name": "가림고등학교", "phoneNumber": "032-584-1755 #6", "contactPerson": "김민주 행정주무관" },
  { "name": "인천대정초등학교", "phoneNumber": "032-628-1378", "contactPerson": "황은정 행정주무관" },
  { "name": "재능대학교 송림캠퍼스부속유치원", "phoneNumber": "032-761-5000, 010-6419-6082", "contactPerson": "이경진 원감" },
  { "name": "인천소방고등학교", "phoneNumber": "032-760-0107", "contactPerson": "이정건 시설주무관" },
  { "name": "인성여자중학교", "phoneNumber": "032-629-3364", "contactPerson": "신장수 행정실장" },
  { "name": "인천신흥초등학교", "phoneNumber": "032-629-0440 #2", "contactPerson": "안종철 행정실장" },
  { "name": "인천송림초등학교", "phoneNumber": "032-764-2342 #2", "contactPerson": "이만연 행정주무관" },
  { "name": "인천예일고등학교", "phoneNumber": "032-555-6307 #2", "contactPerson": "김혜림 행정주무관" },
  { "name": "인천양촌중학교", "phoneNumber": "032-627-8183", "contactPerson": "김민경 행정주무관" },
  { "name": "임학중학교", "phoneNumber": "032-552-2122 #2", "contactPerson": "김선화 행정주무관" },
  { "name": "인천안남초등학교", "phoneNumber": "032-542-7517 #2", "contactPerson": "이민아 행정주무관" },
  { "name": "인천안남중학교", "phoneNumber": "032-549-4784 #2", "contactPerson": "강 욱 행정주무관" },
  { "name": "계산공업고등학교", "phoneNumber": "032-552-2032 #2, 010-7733-5473(시설)", "contactPerson": "류진기 시설팀장" },
  { "name": "경인교육대학교부설초등학교", "phoneNumber": "032-627-9791, 010-5028-1396", "contactPerson": "변미복 행정주무관" },
  { "name": "인천효성동초등학교", "phoneNumber": "032-547-0815 #2", "contactPerson": "김지숙 행정주무관" },
  { "name": "명현중학교", "phoneNumber": "032-554-6832 #2", "contactPerson": "박경미 행정주무관" },
  { "name": "인천미송유치원", "phoneNumber": "032-460-6950", "contactPerson": "박선미 행정실장" },
  { "name": "칼빈매니토바국제학교", "phoneNumber": "032-815-1004 #2#1#5, 010-3887-2948", "contactPerson": "조명열 시설관리과장" },
  { "name": "영흥초등학교(분기)", "phoneNumber": "032-627-9820", "contactPerson": "행정실장" },
  { "name": "덕적초중고등학교(분기)", "phoneNumber": "032-832-9303#3", "contactPerson": "강성진 행정주무관" }
];

async function main() {
  console.log('Start seeding ...');
  for (const school of schools) {
    try {
      const newSchool = await prisma.school.create({
        data: school,
      });
      console.log(`Created school with id: ${newSchool.id}`);
    } catch (error) {
      // Check if the error is because the school already exists
      if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
        console.log(`School with name "${school.name}" already exists. Skipping.`);
      } else {
        console.error(`Error creating school "${school.name}":`, error);
      }
    }
  }
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
