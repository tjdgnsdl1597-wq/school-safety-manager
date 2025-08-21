import { NextRequest, NextResponse } from 'next/server';

// 수동 백업 트리거 (auto-backup API를 호출)
export async function POST(request: NextRequest) {
  try {
    console.log('🔄 수동 백업 요청 받음');
    
    // auto-backup API 호출
    const backupResponse = await fetch(`${process.env.VERCEL_URL || 'http://localhost:3000'}/api/auto-backup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    const result = await backupResponse.json();
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: '수동 백업 완료',
        ...result.data
      });
    } else {
      throw new Error(result.error || '백업 실패');
    }
    
  } catch (error) {
    console.error('❌ 수동 백업 실패:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: '수동 백업 실패',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}