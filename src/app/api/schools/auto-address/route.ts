import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

// 학교명으로 주소를 자동 검색하는 함수
async function searchSchoolAddress(schoolName: string) {
  try {
    const clientId = process.env.NAVER_CLIENT_ID;
    const clientSecret = process.env.NAVER_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
      console.warn('네이버 API 키가 설정되지 않음');
      return null;
    }

    // 네이버 검색 API로 학교 주소 검색
    const searchQuery = encodeURIComponent(`${schoolName} 주소`);
    const searchUrl = `https://openapi.naver.com/v1/search/local.json?query=${searchQuery}&display=1&start=1&sort=random`;
    
    const response = await fetch(searchUrl, {
      headers: {
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret
      }
    });
    
    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      const item = data.items[0];
      
      // HTML 태그 제거
      const cleanAddress = item.address.replace(/<[^>]*>/g, '');
      const cleanRoadAddress = item.roadAddress ? item.roadAddress.replace(/<[^>]*>/g, '') : '';
      
      // 도로명 주소가 있으면 우선, 없으면 지번 주소 사용
      const finalAddress = cleanRoadAddress || cleanAddress;
      
      console.log(`${schoolName} 주소 검색 결과: ${finalAddress}`);
      
      return {
        address: finalAddress,
        title: item.title.replace(/<[^>]*>/g, ''),
        category: item.category
      };
    }
    
    return null;
  } catch (error) {
    console.error('학교 주소 검색 오류:', error);
    return null;
  }
}

// 모든 학교에 대해 주소를 자동으로 검색하고 업데이트
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();
    
    // 사용자의 학교 중 주소가 없는 학교들 찾기
    const schoolsWithoutAddress = await prisma.school.findMany({
      where: {
        userId: userId,
        OR: [
          { address: null },
          { address: '' }
        ]
      }
    });

    const results = [];
    
    for (const school of schoolsWithoutAddress) {
      console.log(`${school.name} 주소 검색 중...`);
      
      const addressInfo = await searchSchoolAddress(school.name);
      
      if (addressInfo) {
        // 데이터베이스에 주소 업데이트
        const updatedSchool = await prisma.school.update({
          where: { id: school.id },
          data: { address: addressInfo.address }
        });
        
        results.push({
          schoolId: school.id,
          schoolName: school.name,
          address: addressInfo.address,
          success: true
        });
        
        console.log(`✅ ${school.name} 주소 업데이트 완료: ${addressInfo.address}`);
      } else {
        results.push({
          schoolId: school.id,
          schoolName: school.name,
          success: false,
          error: '주소를 찾을 수 없음'
        });
        
        console.log(`❌ ${school.name} 주소를 찾을 수 없음`);
      }
      
      // API 요청 간격 조절 (초당 10회 제한 준수)
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return NextResponse.json({
      success: true,
      message: `${results.length}개 학교 처리 완료`,
      results
    });
  } catch (error) {
    console.error('자동 주소 검색 실패:', error);
    return NextResponse.json(
      { error: 'Failed to auto-search addresses' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// 특정 학교의 주소만 검색
export async function PUT(request: NextRequest) {
  try {
    const { schoolId, schoolName } = await request.json();
    
    console.log(`단일 학교 주소 검색: ${schoolName}`);
    
    const addressInfo = await searchSchoolAddress(schoolName);
    
    if (addressInfo) {
      const updatedSchool = await prisma.school.update({
        where: { id: schoolId },
        data: { address: addressInfo.address }
      });
      
      return NextResponse.json({
        success: true,
        school: {
          id: updatedSchool.id,
          name: updatedSchool.name,
          address: updatedSchool.address
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        error: '해당 학교의 주소를 찾을 수 없습니다.'
      }, { status: 404 });
    }
  } catch (error) {
    console.error('단일 학교 주소 검색 실패:', error);
    return NextResponse.json(
      { error: 'Failed to search school address' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}