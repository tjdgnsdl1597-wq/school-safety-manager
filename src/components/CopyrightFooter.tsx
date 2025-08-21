/*
 * KSH58 학교 안전관리시스템 - 저작권 푸터 컴포넌트
 * Copyright (c) 2025 KSH58. All rights reserved.
 * 
 * 이 소스코드와 관련된 모든 지적재산권은 KSH58에게 있습니다.
 * 무단 복제, 배포, 수정을 금지합니다.
 */

'use client';

import React from 'react';
import Link from 'next/link';

interface CopyrightFooterProps {
  /** 추가 클래스명 */
  className?: string;
}

export default function CopyrightFooter({ 
  className = '' 
}: CopyrightFooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`mt-12 pt-4 border-t border-gray-100 ${className}`}>
      <div className="text-center space-y-1">
        {/* 간단한 저작권 표시 */}
        <div className="text-xs text-gray-400">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span>© {currentYear} KSH58. All rights reserved.</span>
            <span className="hidden sm:inline">•</span>
            <Link 
              href="/terms" 
              className="hover:text-gray-600 transition-colors underline-offset-2 hover:underline"
            >
              이용약관·개인정보처리방침
            </Link>
          </div>
        </div>
        
        {/* 서비스 특성 간단 안내 */}
        <div className="text-xs text-gray-400">
          개인 운영 무료 서비스 • 모든 지적재산권은 KSH58에게 있습니다
        </div>
      </div>
      
      {/* 모바일 여백 */}
      <div className="h-6"></div>
    </footer>
  );
}