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
          <div className="flex items-center justify-center text-xs">
            <Link 
              href="/terms" 
              className="hover:text-blue-600 transition-colors underline underline-offset-2"
            >
              이용약관·개인정보처리방침
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

          {/* 상세 저작권 명시 */}
          <div className={`
            mt-6 p-6 rounded-xl border-2
            ${isDark 
              ? 'bg-gray-800/50 border-gray-600' 
              : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200'
            }
          `}>
            <h3 className={`text-lg font-bold mb-4 text-center ${
              isDark ? 'text-yellow-300' : 'text-blue-800'
            }`}>
              🏢 지적재산권 및 저작권 보호
            </h3>
            
            <div className={`grid md:grid-cols-2 gap-4 text-sm ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              <div className="space-y-2">
                <h4 className={`font-semibold ${
                  isDark ? 'text-yellow-200' : 'text-blue-700'
                }`}>💼 보호 범위</h4>
                <ul className="space-y-1 text-xs">
                  <li>• 소스코드 및 알고리즘</li>
                  <li>• 디자인 및 UI/UX</li>
                  <li>• 데이터베이스 구조</li>
                  <li>• 비즈니스 로직</li>
                  <li>• 시스템 아키텍처</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className={`font-semibold ${
                  isDark ? 'text-red-300' : 'text-red-700'
                }`}>⚠️ 금지 행위</h4>
                <ul className="space-y-1 text-xs">
                  <li>• 전부 또는 일부 복제</li>
                  <li>• 무단 배포 및 수정</li>
                  <li>• 상업적 목적 사용</li>
                  <li>• 리버스 엔지니어링</li>
                  <li>• 디컴파일/디스어셈블리</li>
                </ul>
              </div>
            </div>
            
            <div className={`mt-4 pt-4 border-t text-center ${
              isDark ? 'border-gray-600 text-gray-400' : 'border-blue-200 text-gray-600'
            }`}>
              <p className="text-xs font-medium">
                ⚠️ 위반 시 저작권법에 따른 민·형사상 책임을 질 수 있습니다.
              </p>
              <p className="text-xs mt-1 opacity-75">
                저작권 문의: tjdgnsdl1597@naver.com
              </p>
            </div>
          </div>
        </div>

        {/* 모바일 최적화를 위한 추가 여백 */}
        <div className="h-6 sm:h-4"></div>
      </div>
    </footer>
  );
}