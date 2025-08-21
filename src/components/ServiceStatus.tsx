/*
 * KSH58 학교 안전관리시스템 - 서비스 상태 표시 컴포넌트
 * Copyright (c) 2025 KSH58. All rights reserved.
 * 
 * 이 소스코드와 관련된 모든 지적재산권은 KSH58에게 있습니다.
 * 무단 복제, 배포, 수정을 금지합니다.
 */

'use client';

import React, { useState } from 'react';

interface ServiceStatusProps {
  /** 컴포넌트 표시 여부 */
  show?: boolean;
  /** 추가 클래스명 */
  className?: string;
}

export default function ServiceStatus({ show = true, className = '' }: ServiceStatusProps) {
  const [isMinimized, setIsMinimized] = useState(false);

  if (!show) return null;

  return (
    <div className={`mb-6 ${className}`}>
      <div className="bg-gradient-to-r from-blue-50 to-indigo-100 border border-blue-200 rounded-xl shadow-sm overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 bg-blue-600 text-white">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">서비스 상태</span>
            </div>
          </div>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-white/80 hover:text-white transition-colors p-1"
            title={isMinimized ? '펼치기' : '접기'}
          >
            <svg 
              className={`w-4 h-4 transform transition-transform ${isMinimized ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* 내용 */}
        {!isMinimized && (
          <div className="p-4 space-y-4">
            {/* 서비스 정보 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-3 rounded-lg border">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">🏛️</span>
                  <div>
                    <p className="text-xs text-gray-500">운영 형태</p>
                    <p className="font-semibold text-gray-800">개인 운영 무료 서비스</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg border">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">✅</span>
                  <div>
                    <p className="text-xs text-gray-500">현재 상태</p>
                    <p className="font-semibold text-green-600">정상 운영</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg border">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">🔄</span>
                  <div>
                    <p className="text-xs text-gray-500">마지막 업데이트</p>
                    <p className="font-semibold text-gray-800">2025.08.21</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 중요 공지 */}
            <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-orange-800">
                    ⚠️ 서비스 특성 안내
                  </h3>
                  <div className="mt-2 text-sm text-orange-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li><strong>개인 운영:</strong> KSH58이 개인 비용으로 운영하는 무료 서비스입니다.</li>
                      <li><strong>종료 가능성:</strong> 서버 운영비 부담으로 언제든 서비스가 종료될 수 있습니다.</li>
                      <li><strong>데이터 백업:</strong> 중요한 데이터는 정기적으로 백업하시기 바랍니다.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* 백업 권장 안내 */}
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <span className="text-2xl">💾</span>
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-medium text-blue-800 mb-2">
                    📋 데이터 백업 권장
                  </h3>
                  <p className="text-sm text-blue-700 mb-3">
                    서비스 종료에 대비하여 정기적인 데이터 백업을 권장합니다. 
                    아래 버튼을 통해 언제든 데이터를 다운로드할 수 있습니다.
                  </p>
                  <button 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    onClick={() => {
                      // 데이터 백업 기능 호출 (추후 구현)
                      alert('데이터 백업 기능을 준비 중입니다.');
                    }}
                  >
                    📥 내 데이터 백업하기
                  </button>
                </div>
              </div>
            </div>

            {/* 추가 정보 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-600">
              <div className="bg-white p-3 rounded border">
                <p className="font-medium text-gray-700 mb-1">👨‍💻 개발자</p>
                <p>KSH58</p>
              </div>
              <div className="bg-white p-3 rounded border">
                <p className="font-medium text-gray-700 mb-1">📧 연락처</p>
                <p>tjdgnsdl1597@naver.com</p>
              </div>
              <div className="bg-white p-3 rounded border">
                <p className="font-medium text-gray-700 mb-1">⚖️ 저작권</p>
                <p>© 2025 KSH58. All rights reserved.</p>
              </div>
              <div className="bg-white p-3 rounded border">
                <p className="font-medium text-gray-700 mb-1">🔗 관련 정보</p>
                <div className="space-x-2">
                  <a href="/terms" className="text-blue-600 hover:underline">이용약관</a>
                  <a href="/privacy" className="text-blue-600 hover:underline">개인정보처리방침</a>
                </div>
              </div>
            </div>

            {/* 서비스 종료 관련 안내 */}
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <span className="text-2xl">📢</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 mb-2">
                    🚨 서비스 종료 안내
                  </h3>
                  <div className="text-sm text-red-700 space-y-1">
                    <p>• 서비스 종료 시 최소 <strong>30일 전</strong> 공지합니다.</p>
                    <p>• 긴급 상황 시 사전 공지 없이 중단될 수 있습니다.</p>
                    <p>• 종료 시 모든 데이터는 영구 삭제되며 복구할 수 없습니다.</p>
                    <p>• <strong>정기 백업</strong>으로 데이터 손실을 방지하세요.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 최소화 상태일 때 간단 정보 */}
        {isMinimized && (
          <div className="p-3 bg-blue-50 border-t border-blue-200">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <span className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-700 font-medium">정상 운영</span>
                </span>
                <span className="text-gray-600">개인 운영 무료 서비스</span>
              </div>
              <span className="text-orange-600 font-medium">언제든 종료 가능</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}