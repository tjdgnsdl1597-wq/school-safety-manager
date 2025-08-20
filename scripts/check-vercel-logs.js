// Vercel 배포 로그 및 데이터베이스 설정 확인
async function checkVercelInfo() {
  console.log('📋 Vercel 프로젝트 정보 확인');
  console.log('==========================================');
  
  console.log('🔍 확인해야 할 사항들:');
  console.log('');
  console.log('1. Vercel Dashboard → school-safety-manager 프로젝트');
  console.log('2. Settings → Environment Variables:');
  console.log('   - DATABASE_URL이 올바른 PostgreSQL URL인지 확인');
  console.log('   - POSTGRES_URL, POSTGRES_PRISMA_URL 등 설정 확인');
  console.log('');
  console.log('3. Storage → Postgres:');
  console.log('   - 데이터베이스가 생성되어 있는지 확인');
  console.log('   - 테이블들이 존재하는지 확인');
  console.log('');
  console.log('4. Deployments → 최근 배포 로그:');
  console.log('   - Build 과정에서 Prisma 마이그레이션 실행 여부');
  console.log('   - 데이터베이스 연결 오류가 있었는지 확인');
  console.log('');
  console.log('5. Functions → 최근 로그:');
  console.log('   - API 호출 시 데이터베이스 오류가 있었는지 확인');
  console.log('');
  
  console.log('🚨 가능한 원인들:');
  console.log('- Vercel Postgres 데이터베이스가 설정되지 않음');
  console.log('- 환경변수 DATABASE_URL이 잘못 설정됨');
  console.log('- 마이그레이션이 프로덕션에서 실행되지 않음');
  console.log('- 이전 배포에서 데이터베이스가 재설정됨');
}

checkVercelInfo();