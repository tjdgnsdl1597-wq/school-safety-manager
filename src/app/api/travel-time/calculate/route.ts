import { NextRequest, NextResponse } from 'next/server';

interface SchoolData {
  schoolId: string;
  schoolName: string;
  schoolAddress?: string;
}

// 주소를 좌표로 변환하는 함수 (네이버 Geocoding API)
async function getCoordinates(address: string, clientId: string, clientSecret: string) {
  try {
    const url = `https://naveropenapi.apigw.ntruss.com/map-geocode/v2/geocode?query=${encodeURIComponent(address)}`;
    
    console.log(`Geocoding API 호출: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'X-NCP-APIGW-API-KEY-ID': clientId,
        'X-NCP-APIGW-API-KEY': clientSecret
      }
    });
    
    console.log(`Geocoding API 응답 상태: ${response.status}`);
    
    const data = await response.json();
    console.log(`Geocoding API 응답:`, JSON.stringify(data, null, 2));
    
    if (data.status === 'OK' && data.addresses && data.addresses.length > 0) {
      const address_data = data.addresses[0];
      const coords = {
        longitude: parseFloat(address_data.x),
        latitude: parseFloat(address_data.y)
      };
      console.log(`좌표 변환 성공: ${address} -> ${coords.longitude}, ${coords.latitude}`);
      return coords;
    } else {
      throw new Error(`Geocoding failed: ${JSON.stringify(data)}`);
    }
  } catch (error) {
    console.error(`Geocoding error for address '${address}':`, error);
    return null;
  }
}

// 네이버 Direction5 API를 사용한 이동시간 계산
async function calculateDistance(origin: string, destination: string) {
  try {
    // 네이버 클라우드 플랫폼 API 키들
    const clientId = process.env.NAVER_CLIENT_ID;
    const clientSecret = process.env.NAVER_CLIENT_SECRET;
    
    console.log(`네이버 API 키 확인: clientId=${clientId ? '설정됨' : '미설정'}, clientSecret=${clientSecret ? '설정됨' : '미설정'}`);
    
    if (!clientId || !clientSecret) {
      // API 키가 없는 경우 오류 반환
      console.error('네이버 API 키가 설정되지 않음');
      throw new Error('네이버 API 설정이 되지 않았습니다. 관리자에게 문의하세요.');
    }

    // 출발지와 도착지의 좌표 가져오기
    console.log(`좌표 변환 중: 출발지=${origin}, 도착지=${destination}`);
    
    const originCoords = await getCoordinates(origin, clientId, clientSecret);
    const destCoords = await getCoordinates(destination, clientId, clientSecret);
    
    if (!originCoords || !destCoords) {
      throw new Error('Failed to get coordinates');
    }

    console.log(`좌표 변환 완료: 출발지=${originCoords.longitude},${originCoords.latitude}, 도착지=${destCoords.longitude},${destCoords.latitude}`);

    // 네이버 Direction5 API로 경로 계산
    const directionUrl = `https://naveropenapi.apigw.ntruss.com/map-direction/v1/driving?start=${originCoords.longitude},${originCoords.latitude}&goal=${destCoords.longitude},${destCoords.latitude}&option=trafast`;
    
    console.log(`Direction API 호출: ${directionUrl}`);
    
    const directionResponse = await fetch(directionUrl, {
      headers: {
        'X-NCP-APIGW-API-KEY-ID': clientId,
        'X-NCP-APIGW-API-KEY': clientSecret
      }
    });
    
    console.log(`Direction API 응답 상태: ${directionResponse.status}`);
    
    const directionData = await directionResponse.json();
    console.log(`Direction API 응답:`, JSON.stringify(directionData, null, 2));
    
    if (directionData.code === 0 && directionData.route && directionData.route.trafast && directionData.route.trafast.length > 0) {
      const route = directionData.route.trafast[0];
      const summary = route.summary;
      
      // 시간을 분 단위로 변환
      const durationMinutes = Math.round(summary.duration / 1000 / 60);
      // 거리를 km 단위로 변환
      const distanceKm = (summary.distance / 1000).toFixed(1);
      
      console.log(`네이버 API 결과: ${durationMinutes}분, ${distanceKm}km`);
      
      return {
        duration: `${durationMinutes}분`,
        distance: `${distanceKm}km`
      };
    } else {
      throw new Error('Direction calculation failed: ' + JSON.stringify(directionData));
    }
  } catch (error) {
    console.error('네이버 API 이동시간 계산 오류:', error);
    
    // 오류 발생 시 명확한 오류 반환 (모의 데이터 제거)
    throw new Error(`이동시간 계산 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
  }
}

// 더 현실적인 모의 데이터 생성 함수
function generateRealisticMockData(origin: string, destination: string) {
  // 주소 기반으로 대략적인 거리 추정
  const isIncheonArea = (addr: string) => addr.includes('인천');
  const isSeoulArea = (addr: string) => addr.includes('서울');
  const isGyeonggiArea = (addr: string) => addr.includes('경기') || addr.includes('수원') || addr.includes('성남');
  
  let baseDistance = 15; // 기본 거리 (km)
  let baseTime = 25;     // 기본 시간 (분)
  
  // 지역별 거리 조정
  if (isIncheonArea(origin) && isIncheonArea(destination)) {
    baseDistance = 8 + Math.random() * 12; // 8-20km
    baseTime = 15 + Math.random() * 20;    // 15-35분
  } else if (isSeoulArea(origin) && isSeoulArea(destination)) {
    baseDistance = 5 + Math.random() * 15; // 5-20km  
    baseTime = 20 + Math.random() * 25;    // 20-45분
  } else if (isGyeonggiArea(origin) && isGyeonggiArea(destination)) {
    baseDistance = 10 + Math.random() * 25; // 10-35km
    baseTime = 18 + Math.random() * 30;     // 18-48분
  } else {
    // 서로 다른 지역간 이동
    baseDistance = 20 + Math.random() * 40; // 20-60km
    baseTime = 35 + Math.random() * 45;     // 35-80분
  }
  
  // 교통 상황 반영 (시간대별)
  const currentHour = new Date().getHours();
  if ((currentHour >= 7 && currentHour <= 9) || (currentHour >= 17 && currentHour <= 19)) {
    // 출퇴근 시간 - 시간 증가
    baseTime *= 1.3;
  } else if (currentHour >= 22 || currentHour <= 6) {
    // 심야/새벽 시간 - 시간 감소
    baseTime *= 0.8;
  }
  
  return {
    duration: `${Math.round(baseTime)}분`,
    distance: `${baseDistance.toFixed(1)}km`
  };
}

export async function POST(request: NextRequest) {
  try {
    const { homeAddress, officeAddress, schedules } = await request.json();
    
    console.log(`이동시간 계산 요청: 집=${homeAddress}, 회사=${officeAddress}, 일정수=${schedules?.length || 0}`);
    
    if (!homeAddress || !officeAddress || !schedules || schedules.length === 0) {
      return NextResponse.json(
        { error: '필수 데이터가 누락되었습니다. (집주소, 회사주소, 일정 정보 필요)' },
        { status: 400 }
      );
    }

    const result: any = {};
    const errors: string[] = [];
    
    try {
      // 첫 번째 학교 정보
      const firstSchool = schedules[0];
      const firstSchoolAddress = firstSchool.schoolAddress || `${firstSchool.schoolName} 학교`;
      
      console.log(`첫 번째 학교: ${firstSchool.schoolName}, 주소: ${firstSchoolAddress}`);
      
      // 1. 회사 → 첫 번째 학교
      try {
        const officeToFirst = await calculateDistance(officeAddress, firstSchoolAddress);
        result.fromOfficeToFirst = officeToFirst.duration;
        console.log(`회사→첫번째학교: ${officeToFirst.duration}`);
      } catch (error) {
        const errorMsg = `회사→첫번째학교 계산 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`;
        errors.push(errorMsg);
        console.error(errorMsg);
      }
      
      // 2. 집 → 첫 번째 학교
      try {
        const homeToFirst = await calculateDistance(homeAddress, firstSchoolAddress);
        result.fromHomeToFirst = homeToFirst.duration;
        console.log(`집→첫번째학교: ${homeToFirst.duration}`);
      } catch (error) {
        const errorMsg = `집→첫번째학교 계산 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`;
        errors.push(errorMsg);
        console.error(errorMsg);
      }
      
      // 3. 학교 간 이동시간 (2개 이상의 일정이 있는 경우)
      if (schedules.length > 1) {
        result.betweenSchools = [];
        
        for (let i = 0; i < schedules.length - 1; i++) {
          const currentSchool = schedules[i];
          const nextSchool = schedules[i + 1];
          
          const currentAddress = currentSchool.schoolAddress || `${currentSchool.schoolName} 학교`;
          const nextAddress = nextSchool.schoolAddress || `${nextSchool.schoolName} 학교`;
          
          try {
            const schoolToSchool = await calculateDistance(currentAddress, nextAddress);
            
            result.betweenSchools.push({
              from: currentSchool.schoolName,
              to: nextSchool.schoolName,
              duration: schoolToSchool.duration,
              distance: schoolToSchool.distance
            });
            console.log(`${currentSchool.schoolName}→${nextSchool.schoolName}: ${schoolToSchool.duration}`);
          } catch (error) {
            const errorMsg = `${currentSchool.schoolName}→${nextSchool.schoolName} 계산 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`;
            errors.push(errorMsg);
            console.error(errorMsg);
          }
        }
      }
      
      // 오류가 있으면 오류 정보도 함께 반환
      if (errors.length > 0) {
        result.errors = errors;
        result.hasErrors = true;
      }
      
      return NextResponse.json(result);
      
    } catch (error) {
      throw error; // 상위 catch로 전달
    }
    
  } catch (error) {
    console.error('Travel time calculation failed:', error);
    return NextResponse.json(
      { 
        error: '이동시간 계산 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
}