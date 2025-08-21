/*
 * KSH58 학교 안전관리시스템 - 공지 팝업 시스템 컴포넌트
 * Copyright (c) 2025 KSH58. All rights reserved.
 * 
 * 이 소스코드와 관련된 모든 지적재산권은 KSH58에게 있습니다.
 * 무단 복제, 배포, 수정을 금지합니다.
 */

'use client';

import React, { useState, useEffect } from 'react';

interface NotificationData {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'termination';
  title: string;
  message: string;
  showDate: string;
  expireDate?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  dismissible: boolean;
  actions?: {
    label: string;
    action: string;
    style: 'primary' | 'secondary' | 'danger';
  }[];
}

interface NotificationPopupProps {
  /** 사용자 ID */
  userId?: string;
  /** 자동 표시 여부 */
  autoShow?: boolean;
  /** 추가 클래스명 */
  className?: string;
}

// 기본 공지사항 템플릿
const DEFAULT_NOTIFICATIONS: NotificationData[] = [
  {
    id: 'service-nature-2025',
    type: 'warning',
    title: '🏛️ 서비스 운영 특성 안내',
    message: `본 서비스는 KSH58이 개인 비용으로 운영하는 무료 서비스입니다.
    
• 운영자: KSH58 (개인)
• 운영 비용: 전액 개인 부담
• 서비스 지속성: 운영비 부담에 따라 변동 가능
• 종료 예고: 최소 30일 전 공지 (긴급 시 제외)

중요한 데이터는 정기적으로 백업하시기 바랍니다.`,
    showDate: '2025-01-01',
    priority: 'high',
    dismissible: true,
    actions: [
      {
        label: '📥 데이터 백업하기',
        action: 'backup',
        style: 'primary'
      },
      {
        label: '📋 자세히 보기',
        action: 'terms',
        style: 'secondary'
      }
    ]
  },
  {
    id: 'copyright-notice-2025',
    type: 'info',
    title: '⚖️ 저작권 보호 안내',
    message: `본 시스템의 모든 소스코드, 디자인, 기능은 KSH58의 지적재산물입니다.

• 저작권자: KSH58
• 사용 제한: 상업적/비상업적 무단 사용 금지
• 보호 범위: 코드, 디자인, 알고리즘, 데이터베이스 구조
• 위반시: 저작권법에 따른 법적 조치 가능

서비스 이용 시 저작권을 존중해 주시기 바랍니다.`,
    showDate: '2025-01-01',
    priority: 'medium',
    dismissible: true,
    actions: [
      {
        label: '📜 이용약관 보기',
        action: 'terms',
        style: 'primary'
      }
    ]
  }
];

export default function NotificationPopup({ 
  userId, 
  autoShow = true, 
  className = '' 
}: NotificationPopupProps) {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [currentNotification, setCurrentNotification] = useState<NotificationData | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [dismissedNotifications, setDismissedNotifications] = useState<string[]>([]);

  // localStorage 키 생성
  const getDismissedKey = (userId?: string) => 
    `dismissed-notifications${userId ? `-${userId}` : ''}`;

  // 기각된 공지사항 불러오기
  useEffect(() => {
    try {
      const dismissedKey = getDismissedKey(userId);
      const dismissed = localStorage.getItem(dismissedKey);
      if (dismissed) {
        setDismissedNotifications(JSON.parse(dismissed));
      }
    } catch (error) {
      console.error('Dismissed notifications 로드 실패:', error);
    }
  }, [userId]);

  // 공지사항 필터링 및 표시
  useEffect(() => {
    if (!autoShow) return;

    const today = new Date().toISOString().split('T')[0];
    
    // 표시할 공지사항 필터링
    const validNotifications = DEFAULT_NOTIFICATIONS.filter(notification => {
      // 기각된 공지사항 제외
      if (dismissedNotifications.includes(notification.id)) {
        return false;
      }
      
      // 표시 날짜 체크
      if (notification.showDate > today) {
        return false;
      }
      
      // 만료 날짜 체크
      if (notification.expireDate && notification.expireDate < today) {
        return false;
      }
      
      return true;
    });

    // 우선순위 정렬
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    validNotifications.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);

    setNotifications(validNotifications);

    // 첫 번째 공지사항 표시
    if (validNotifications.length > 0) {
      setCurrentNotification(validNotifications[0]);
      setIsVisible(true);
    }
  }, [dismissedNotifications, autoShow, userId]);

  // 공지사항 닫기
  const handleDismiss = (notificationId: string, permanent = false) => {
    setIsVisible(false);
    
    if (permanent) {
      const newDismissed = [...dismissedNotifications, notificationId];
      setDismissedNotifications(newDismissed);
      
      try {
        const dismissedKey = getDismissedKey(userId);
        localStorage.setItem(dismissedKey, JSON.stringify(newDismissed));
      } catch (error) {
        console.error('Dismissed notifications 저장 실패:', error);
      }
    }
    
    // 다음 공지사항 표시
    const remaining = notifications.filter(n => 
      n.id !== notificationId && !dismissedNotifications.includes(n.id)
    );
    
    if (remaining.length > 0) {
      setTimeout(() => {
        setCurrentNotification(remaining[0]);
        setIsVisible(true);
      }, 500);
    } else {
      setCurrentNotification(null);
    }
  };

  // 액션 처리
  const handleAction = (action: string) => {
    switch (action) {
      case 'backup':
        // 데이터 백업 기능 실행
        const backupBtn = document.querySelector('[data-backup-button]') as HTMLButtonElement;
        if (backupBtn) {
          backupBtn.click();
        } else {
          alert('데이터 백업 기능을 찾을 수 없습니다. 대시보드에서 백업 버튼을 이용해주세요.');
        }
        break;
        
      case 'terms':
        window.open('/terms', '_blank');
        break;
        
      case 'privacy':
        window.open('/privacy', '_blank');
        break;
        
      default:
        console.warn('Unknown action:', action);
    }
  };

  // 공지사항 수동 표시
  const showNotification = (notification: NotificationData) => {
    setCurrentNotification(notification);
    setIsVisible(true);
  };

  // 모든 공지사항 다시 표시
  const resetDismissed = () => {
    setDismissedNotifications([]);
    try {
      const dismissedKey = getDismissedKey(userId);
      localStorage.removeItem(dismissedKey);
    } catch (error) {
      console.error('Dismissed notifications 초기화 실패:', error);
    }
  };

  // UI 렌더링
  if (!isVisible || !currentNotification) {
    return null;
  }

  const typeStyles = {
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-500',
      icon: '💡',
      titleColor: 'text-blue-800',
      messageColor: 'text-blue-700'
    },
    warning: {
      bg: 'bg-orange-50',
      border: 'border-orange-500',
      icon: '⚠️',
      titleColor: 'text-orange-800',
      messageColor: 'text-orange-700'
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-500',
      icon: '❌',
      titleColor: 'text-red-800',
      messageColor: 'text-red-700'
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-500',
      icon: '✅',
      titleColor: 'text-green-800',
      messageColor: 'text-green-700'
    },
    termination: {
      bg: 'bg-red-100',
      border: 'border-red-600',
      icon: '🚨',
      titleColor: 'text-red-900',
      messageColor: 'text-red-800'
    }
  };

  const style = typeStyles[currentNotification.type];

  return (
    <>
      {/* 오버레이 */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div 
          className={`
            w-full max-w-lg mx-auto rounded-xl shadow-2xl border-2
            ${style.bg} ${style.border}
            animate-in zoom-in-95 duration-300
            ${className}
          `}
        >
          {/* 헤더 */}
          <div className="flex items-start justify-between p-6 pb-4">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{style.icon}</span>
              <h2 className={`text-lg font-semibold ${style.titleColor}`}>
                {currentNotification.title}
              </h2>
            </div>
            {currentNotification.dismissible && (
              <button
                onClick={() => handleDismiss(currentNotification.id)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                title="닫기"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* 내용 */}
          <div className="px-6 pb-4">
            <div className={`text-sm leading-relaxed whitespace-pre-line ${style.messageColor}`}>
              {currentNotification.message}
            </div>
          </div>

          {/* 액션 버튼들 */}
          {currentNotification.actions && currentNotification.actions.length > 0 && (
            <div className="px-6 pb-4">
              <div className="flex flex-wrap gap-3">
                {currentNotification.actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleAction(action.action)}
                    className={`
                      px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                      ${action.style === 'primary' 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                        : action.style === 'danger'
                        ? 'bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg'
                        : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-sm hover:shadow-md'
                      }
                    `}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 하단 액션 */}
          <div className="flex items-center justify-between px-6 py-4 bg-white/50 rounded-b-xl border-t border-gray-200">
            <div className="text-xs text-gray-600">
              우선순위: {currentNotification.priority === 'critical' ? '🔴 긴급' :
                        currentNotification.priority === 'high' ? '🟡 높음' :
                        currentNotification.priority === 'medium' ? '🟢 보통' : '⚪ 낮음'}
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => handleDismiss(currentNotification.id)}
                className="text-xs text-gray-500 hover:text-gray-700 underline"
              >
                오늘만 숨기기
              </button>
              {currentNotification.dismissible && (
                <button
                  onClick={() => handleDismiss(currentNotification.id, true)}
                  className="text-xs text-gray-500 hover:text-gray-700 underline"
                >
                  다시 보지 않기
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 개발자 도구 (개발 모드에서만) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 z-[60]">
          <div className="bg-white rounded-lg shadow-lg border p-3 text-xs">
            <div className="font-medium mb-2">공지사항 개발자 도구</div>
            <div className="space-y-1">
              <button
                onClick={resetDismissed}
                className="block w-full text-left text-blue-600 hover:underline"
              >
                모든 공지사항 다시 표시
              </button>
              <div className="text-gray-500">
                기각된 공지: {dismissedNotifications.length}개
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// 서비스 종료 공지용 특별 컴포넌트
export function ServiceTerminationNotice({ 
  terminationDate, 
  reason, 
  backupDeadline 
}: {
  terminationDate: string;
  reason?: string;
  backupDeadline?: string;
}) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-red-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto bg-red-50 border-4 border-red-600 rounded-xl shadow-2xl">
        <div className="p-8 text-center">
          <div className="text-6xl mb-4">🚨</div>
          <h1 className="text-2xl font-bold text-red-900 mb-6">
            서비스 종료 공지
          </h1>
          
          <div className="bg-white rounded-lg p-6 mb-6 text-left">
            <div className="space-y-4 text-red-800">
              <p className="text-lg font-semibold">
                📅 종료 예정일: <span className="text-red-900">{terminationDate}</span>
              </p>
              
              {reason && (
                <p>
                  <strong>종료 사유:</strong> {reason}
                </p>
              )}
              
              {backupDeadline && (
                <p>
                  <strong>⏰ 데이터 백업 마감:</strong> {backupDeadline}
                </p>
              )}
              
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r">
                <p className="font-semibold text-yellow-800 mb-2">⚠️ 즉시 해야 할 일</p>
                <ul className="list-disc list-inside space-y-1 text-yellow-700">
                  <li>중요한 데이터를 즉시 백업하세요</li>
                  <li>백업 파일을 안전한 곳에 보관하세요</li>
                  <li>종료일 이후에는 모든 데이터가 삭제됩니다</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
              onClick={() => {
                const backupBtn = document.querySelector('[data-backup-button]') as HTMLButtonElement;
                backupBtn?.click();
              }}
            >
              📥 즉시 백업하기
            </button>
            
            <button
              onClick={() => setIsVisible(false)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
            >
              확인했습니다
            </button>
          </div>
          
          <p className="text-xs text-red-600 mt-6">
            문의사항: tjdgnsdl1597@naver.com
          </p>
        </div>
      </div>
    </div>
  );
}