import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../../generated/prisma';
import Papa from 'papaparse';

const prisma = new PrismaClient();

// CSV 일괄 업로드
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = request.headers.get('x-user-id');

    if (!file) {
      return NextResponse.json({ error: 'CSV 파일이 필요합니다.' }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID가 필요합니다.' }, { status: 400 });
    }

    // 파일 타입 검증
    if (!file.name.toLowerCase().endsWith('.csv')) {
      return NextResponse.json({ error: 'CSV 파일만 업로드 가능합니다.' }, { status: 400 });
    }

    // 파일 내용 읽기
    const fileContent = await file.text();
    console.log('CSV 파일 내용 전체:', fileContent);
    
    // 줄 단위로 분석
    const lines = fileContent.split('\n');
    console.log('총 줄 수:', lines.length);
    lines.forEach((line, index) => {
      console.log(`${index + 1}행: "${line}" (길이: ${line.length})`);
    });

    // CSV 파싱 - 더 관대한 설정으로 변경
    const parseResult = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: 'greedy', // 빈 행 자동 건너뛰기로 다시 변경
      delimiter: '', // 자동 감지
      transformHeader: (header) => {
        // 한글 헤더를 영문으로 매핑
        const headerMap: { [key: string]: string } = {
          '학교명': 'name',
          '담당자': 'contactPerson', 
          '전화번호': 'phoneNumber',
          '이메일': 'email',
          'name': 'name',
          'contactPerson': 'contactPerson',
          'phoneNumber': 'phoneNumber', 
          'email': 'email'
        };
        return headerMap[header.trim()] || header;
      }
    });

    if (parseResult.errors.length > 0) {
      console.log('CSV 파싱 오류:', parseResult.errors);
      const errorMessages = parseResult.errors.map(err => 
        `${err.row ? `${err.row + 2}행` : '파싱'} 오류: ${err.message || err.type || '알 수 없는 오류'}`
      );
      return NextResponse.json({ 
        error: 'CSV 파싱 오류', 
        details: errorMessages 
      }, { status: 400 });
    }

    const schools = parseResult.data as Array<{
      name?: string;
      contactPerson?: string;
      phoneNumber?: string;
      email?: string;
    }>;

    console.log('파싱된 데이터:', schools.length, '행');
    console.log('첫 3행 데이터:', schools.slice(0, 3));

    // 데이터 검증 및 정제
    const validSchools: any[] = [];
    const errors: string[] = [];

    console.log('파싱된 데이터:', schools);

    for (let i = 0; i < schools.length; i++) {
      const school = schools[i];
      const rowNumber = i + 2; // 헤더 행 고려

      console.log(`${rowNumber}행 처리:`, school);

      // 학교명이 없는 경우만 오류로 처리 (빈 행은 skipEmptyLines: 'greedy'로 이미 제거됨)
      if (!school.name || school.name.trim() === '') {
        console.log(`${rowNumber}행: 학교명 없음 - 건너뜀`);
        continue; // 오류로 처리하지 않고 건너뛰기
      }

      validSchools.push({
        name: school.name.trim(),
        contactPerson: school.contactPerson?.trim() || null,
        phoneNumber: school.phoneNumber?.trim() || null,
        email: school.email?.trim() || null,
        userId
      });
    }

    console.log('유효한 학교 데이터:', validSchools);

    if (errors.length > 0) {
      return NextResponse.json({ 
        error: '데이터 검증 실패', 
        details: errors 
      }, { status: 400 });
    }

    if (validSchools.length === 0) {
      return NextResponse.json({ 
        error: '등록할 학교 정보가 없습니다.' 
      }, { status: 400 });
    }

    // 데이터베이스에 일괄 삽입
    const results = [];
    const duplicateErrors = [];

    for (const school of validSchools) {
      try {
        const newSchool = await prisma.school.create({
          data: school
        });
        results.push(newSchool);
      } catch (error: any) {
        if (error.code === 'P2002') { // Unique constraint violation
          duplicateErrors.push(`'${school.name}' 학교는 이미 존재합니다.`);
        } else {
          throw error;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `${results.length}개 학교가 성공적으로 등록되었습니다.`,
      registered: results.length,
      total: validSchools.length,
      duplicateErrors: duplicateErrors.length > 0 ? duplicateErrors : undefined
    });

  } catch (error) {
    console.error('학교 일괄 등록 오류:', error);
    return NextResponse.json({ 
      error: '서버 오류가 발생했습니다.' 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}