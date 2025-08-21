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
  /** 다크 모드 여부 */
  isDark?: boolean;
  /** 배경 표시 여부 */
  showBackground?: boolean;
  /** 추가 클래스명 */
  className?: string;
}

export default function CopyrightFooter({ 
  isDark = false, 
  showBackground = true, 
  className = '' 
}: CopyrightFooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer 
      className={`
        py-6 mt-8
        ${showBackground ? (isDark ? 'bg-gray-900' : 'bg-gray-50') : ''}
        ${isDark ? 'text-gray-300' : 'text-gray-600'}
        ${className}
      `}
    >
      <div className="container mx-auto px-4">
        {/* 메인 저작권 정보 */}
        <div className="text-center space-y-3">
          {/* 저작권 표시 */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-xs sm:text-sm">
            <span className="font-medium">
              © {currentYear} <strong className="text-blue-600">KSH58</strong>. All rights reserved.
            </span>
            <span className="hidden sm:block">•</span>
            <span>KSH58 학교 안전관리시스템</span>
          </div>

          {/* 약관 링크 */}
          <div className="flex items-center justify-center gap-4 text-xs">
            <Link 
              href="/terms" 
              className="hover:text-blue-600 transition-colors underline underline-offset-2"
            >
              이용약관
            </Link>
            <span>•</span>
            <Link 
              href="/privacy" 
              className="hover:text-blue-600 transition-colors underline underline-offset-2"
            >
              개인정보처리방침
            </Link>
          </div>

          {/* 서비스 특성 안내 */}
          <div 
            className={`
              text-xs px-4 py-2 rounded-lg inline-block max-w-md mx-auto
              ${isDark ? 'bg-yellow-900/30 text-yellow-300' : 'bg-yellow-50 text-yellow-700'}
            `}
          >
            ⚠️ 개인 운영 무료 서비스로 언제든 종료될 수 있습니다
          </div>

          {/* 추가 법적 고지 */}
          <div className="text-xs opacity-75 max-w-2xl mx-auto leading-relaxed">
            <p className="mb-1">
              본 서비스의 소스코드, 디자인, 기능 등 모든 지적재산권은 KSH58에게 있습니다.
            </p>
            <p>
              무단 복제, 배포, 수정 시 저작권법에 의해 처벌받을 수 있습니다.
            </p>
          </div>
        </div>

        {/* 모바일 최적화를 위한 추가 여백 */}
        <div className="h-4 sm:h-2"></div>
      </div>
    </footer>
  );
}