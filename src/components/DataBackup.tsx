/*
 * KSH58 학교 안전관리시스템 - 데이터 백업 컴포넌트
 * Copyright (c) 2025 KSH58. All rights reserved.
 * 
 * 이 소스코드와 관련된 모든 지적재산권은 KSH58에게 있습니다.
 * 무단 복제, 배포, 수정을 금지합니다.
 */

'use client';

import React, { useState } from 'react';

interface DataBackupProps {
  /** 사용자 ID */
  userId?: string;
  /** 컴포넌트 표시 여부 */
  show?: boolean;
  /** 추가 클래스명 */
  className?: string;
  /** 백업 완료 콜백 */
  onBackupComplete?: (success: boolean) => void;
}

interface BackupData {
  exportDate: string;
  userId: string;
  userInfo: any;
  schools: any[];
  schedules: any[];
  memos: string[];
  preferences: any;
}

export default function DataBackup({ 
  userId, 
  show = true, 
  className = '',
  onBackupComplete
}: DataBackupProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [lastBackupDate, setLastBackupDate] = useState<string | null>(null);

  // 마지막 백업 시간 불러오기 (조건부 렌더링 이전에 실행)
  React.useEffect(() => {
    if (userId) {
      const lastBackup = localStorage.getItem(`lastBackup-${userId}`);
      setLastBackupDate(lastBackup);
    }
  }, [userId]);

  if (!show) return null;

  // 데이터 백업 실행
  const handleBackupData = async () => {
    if (!userId) {
      alert('로그인이 필요합니다.');
      return;
    }

    setIsExporting(true);

    try {
      // 사용자 데이터 수집
      const backupData: BackupData = {
        exportDate: new Date().toISOString(),
        userId: userId,
        userInfo: {
          // 현재 로그인한 사용자 정보 (localStorage에서)
          username: localStorage.getItem('username') || '',
          loginDate: localStorage.getItem('loginDate') || ''
        },
        schools: [],
        schedules: [],
        memos: [],
        preferences: {}
      };

      // 사용자별 학교 데이터 가져오기
      try {
        const schoolsResponse = await fetch('/api/schools');
        if (schoolsResponse.ok) {
          backupData.schools = await schoolsResponse.json();
        }
      } catch (error) {
        console.error('학교 데이터 백업 실패:', error);
      }

      // 사용자별 일정 데이터 가져오기
      try {
        const schedulesResponse = await fetch('/api/schedules');
        if (schedulesResponse.ok) {
          backupData.schedules = await schedulesResponse.json();
        }
      } catch (error) {
        console.error('일정 데이터 백업 실패:', error);
      }

      // localStorage에서 메모 데이터 가져오기
      try {
        const memoKey = `dashboard-memos-${userId}`;
        const memosData = localStorage.getItem(memoKey);
        if (memosData) {
          backupData.memos = JSON.parse(memosData);
        }
      } catch (error) {
        console.error('메모 데이터 백업 실패:', error);
      }

      // 사용자 설정 데이터 가져오기
      try {
        backupData.preferences = {
          theme: localStorage.getItem('theme') || 'light',
          language: localStorage.getItem('language') || 'ko',
          dashboardLayout: localStorage.getItem('dashboardLayout') || 'default'
        };
      } catch (error) {
        console.error('설정 데이터 백업 실패:', error);
      }

      // JSON 파일로 다운로드
      const dataStr = JSON.stringify(backupData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `KSH58_학교안전관리_데이터백업_${userId}_${new Date().toISOString().split('T')[0]}.json`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // 백업 완료 처리
      const now = new Date().toLocaleString('ko-KR');
      setLastBackupDate(now);
      
      // localStorage에 마지막 백업 시간 저장
      localStorage.setItem(`lastBackup-${userId}`, now);
      
      alert(`✅ 데이터 백업이 완료되었습니다!\n\n백업 파일: KSH58_학교안전관리_데이터백업_${userId}_${new Date().toISOString().split('T')[0]}.json\n\n⚠️ 중요: 백업 파일을 안전한 곳에 보관하세요.`);
      
      onBackupComplete?.(true);
      
    } catch (error) {
      console.error('데이터 백업 실패:', error);
      alert('❌ 데이터 백업 중 오류가 발생했습니다. 다시 시도해주세요.');
      onBackupComplete?.(false);
    } finally {
      setIsExporting(false);
    }
  };

  // 자동 백업 안내
  const handleAutoBackupInfo = () => {
    alert(`🔄 자동 백업 시스템\n\n• 1시간마다 서버에서 자동 백업 실행\n• 모든 사용자 데이터 안전하게 보관\n• 서비스 종료 시 30일 전 공지\n• 긴급 상황 시에도 최신 데이터 복구 가능\n\n💡 추가 안전을 위해 개인 백업도 권장합니다.`);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 데이터 백업 메인 섹션 */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <span className="text-3xl">💾</span>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              📥 데이터 백업
            </h3>
            <p className="text-blue-700 text-sm mb-4 leading-relaxed">
              개인 운영 서비스 특성상 언제든 종료될 수 있습니다. 
              중요한 데이터는 정기적으로 백업하여 안전하게 보관하세요.
            </p>

            {/* 백업 범위 안내 */}
            <div className="bg-white p-4 rounded-lg border mb-4">
              <h4 className="font-medium text-gray-800 mb-2">📋 백업 데이터 범위</h4>
              <ul className="text-sm text-gray-600 space-y-1 ml-4 list-disc">
                <li><strong>학교 정보:</strong> 등록한 모든 학교 데이터</li>
                <li><strong>일정 관리:</strong> 방문 일정, 목적, 시간 정보</li>
                <li><strong>개인 메모:</strong> 대시보드 메모 내용</li>
                <li><strong>사용자 설정:</strong> 개인화 설정 및 환경 설정</li>
              </ul>
            </div>

            {/* 백업 실행 버튼 */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleBackupData}
                disabled={isExporting || !userId}
                className={`
                  px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200
                  ${isExporting || !userId
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                  }
                `}
              >
                {isExporting ? (
                  <span className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>백업 진행 중...</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-2">
                    <span>📥</span>
                    <span>내 데이터 백업하기</span>
                  </span>
                )}
              </button>

              <button
                onClick={handleAutoBackupInfo}
                className="px-4 py-2 text-blue-600 hover:text-blue-800 text-sm font-medium underline transition-colors"
              >
                🔄 자동 백업 정보
              </button>
            </div>

            {/* 마지막 백업 시간 표시 */}
            {lastBackupDate && (
              <div className="mt-4 text-xs text-gray-600">
                <span className="flex items-center space-x-1">
                  <span>⏰</span>
                  <span>마지막 개인 백업: {lastBackupDate}</span>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 백업 파일 관리 안내 */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              📄 백업 파일 관리 안내
            </h3>
            <div className="mt-2 text-sm text-yellow-700 space-y-1">
              <p>• <strong>안전한 보관:</strong> 백업 파일을 클라우드 스토리지나 USB에 안전하게 보관하세요.</p>
              <p>• <strong>정기 백업:</strong> 중요한 데이터 변경 후에는 즉시 백업을 권장합니다.</p>
              <p>• <strong>파일 형식:</strong> JSON 형식으로 다른 시스템에서도 활용 가능합니다.</p>
              <p>• <strong>개인정보:</strong> 백업 파일에는 개인정보가 포함되어 있으니 신중히 관리하세요.</p>
            </div>
          </div>
        </div>
      </div>

      {/* 복구 안내 */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-medium text-green-800 mb-2">🔄 데이터 복구 방법</h4>
        <div className="text-sm text-green-700 space-y-1">
          <p>서비스 종료나 데이터 손실 시:</p>
          <ol className="list-decimal list-inside ml-4 space-y-1">
            <li>백업 파일을 관리자(tjdgnsdl1597@naver.com)에게 전송</li>
            <li>사용자 계정 정보와 함께 복구 요청</li>
            <li>새로운 서비스나 시스템으로 데이터 이전</li>
          </ol>
          <p className="text-xs text-green-600 mt-2">
            ※ 개인 운영 서비스 특성상 즉시 복구는 어려울 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}