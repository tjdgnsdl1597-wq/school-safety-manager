// Vercel 프로덕션 환경 데이터베이스 확인용 API 호출
async function checkProductionDatabase() {
  try {
    console.log('🔍 프로덕션 데이터베이스 상태 확인 중...');
    
    // 프로덕션 API 호출로 데이터베이스 상태 확인
    const apiUrl = 'https://school-safety-manager.vercel.app/api/debug/users';
    
    const response = await fetch(apiUrl);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ 프로덕션 API 응답 성공');
      console.log('📊 프로덕션 데이터 상태:', data);
    } else {
      console.log('❌ 프로덕션 API 오류:', response.status, response.statusText);
      const errorText = await response.text();
      console.log('오류 내용:', errorText);
    }
    
  } catch (error) {
    console.error('❌ 프로덕션 확인 오류:', error.message);
  }
}

checkProductionDatabase();