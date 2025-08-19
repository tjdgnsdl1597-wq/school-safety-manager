'use client';

import { useState, useEffect } from 'react';
import { isSuperAdmin } from '@/lib/authUtils';

interface PendingUser {
  id: string;
  username: string;
  name: string;
  position: string;
  phoneNumber: string;
  department: string;
  reason?: string;
  createdAt: string;
}

interface AdminApprovalPopupProps {
  user: any; // 현재 로그인한 사용자
}

export default function AdminApprovalPopup({ user }: AdminApprovalPopupProps) {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastCheckedCount, setLastCheckedCount] = useState(0);
  
  const isAdmin = isSuperAdmin(user);

  // 승인 대기 중인 사용자 목록 조회
  const fetchPendingUsers = async (showNotification = false) => {
    try {
      const response = await fetch('/api/admin/users?status=pending');
      const data = await response.json();
      
      if (data.success) {
        const currentCount = data.users.length;
        
        // 새로운 가입 신청이 있는 경우 (이전 개수보다 많아진 경우)
        if (showNotification && currentCount > lastCheckedCount && currentCount > 0) {
          setShowPopup(true);
          // 브라우저 알림도 표시 (권한이 있는 경우)
          if (Notification.permission === 'granted') {
            new Notification('새로운 가입 신청! 🎉', {
              body: `${currentCount}명의 사용자가 승인을 기다리고 있습니다.`,
              icon: '/favicon.ico'
            });
          }
        }
        
        setPendingUsers(data.users);
        setLastCheckedCount(currentCount);
        
        // 처음 로드시에도 대기자가 있으면 팝업 표시
        if (!showNotification && currentCount > 0) {
          setShowPopup(true);
        }
      }
    } catch (error) {
      console.error('승인 대기 사용자 조회 실패:', error);
    }
  };

  // 사용자 승인
  const approveUser = async (userId: string, userName: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          action: 'approve'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`${userName}님의 계정이 승인되었습니다! 🎉`);
        // 목록에서 해당 사용자 제거
        setPendingUsers(prev => prev.filter(u => u.id !== userId));
      } else {
        alert(`승인 처리에 실패했습니다: ${data.message}`);
      }
    } catch (error) {
      alert('승인 처리 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 사용자 거부
  const rejectUser = async (userId: string, userName: string) => {
    if (!confirm(`${userName}님의 가입 신청을 정말 거부하시겠습니까?`)) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          action: 'reject'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`${userName}님의 가입 신청이 거부되었습니다.`);
        // 목록에서 해당 사용자 제거
        setPendingUsers(prev => prev.filter(u => u.id !== userId));
      } else {
        alert(`거부 처리에 실패했습니다: ${data.message}`);
      }
    } catch (error) {
      alert('거부 처리 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 브라우저 알림 권한 요청
  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  // 컴포넌트 마운트 시 승인 대기 사용자 확인
  useEffect(() => {
    if (!isAdmin) return;
    
    // 알림 권한 요청
    requestNotificationPermission();
    
    // 처음 로드 시 확인 (알림 없이)
    fetchPendingUsers(false);
    
    // 30초마다 자동으로 확인 (새로운 가입신청 감지를 위해 더 자주 체크)
    const interval = setInterval(() => fetchPendingUsers(true), 30 * 1000);
    
    return () => clearInterval(interval);
  }, [isAdmin]);

  // 승인 대기 사용자가 없으면 팝업 닫기
  useEffect(() => {
    if (pendingUsers.length === 0) {
      setShowPopup(false);
    }
  }, [pendingUsers]);
  
  // 관리자가 아니면 렌더링하지 않음
  if (!isAdmin) {
    return null;
  }

  if (!showPopup || pendingUsers.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                <span className="text-white text-sm font-bold">{pendingUsers.length}</span>
              </div>
              <h2 className="text-xl font-bold text-gray-800">
                🚨 새로운 가입 신청 알림! 🎉
              </h2>
            </div>
            <button
              onClick={() => setShowPopup(false)}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {/* 승인 대기 사용자 목록 */}
          <div className="space-y-4">
            {pendingUsers.map((pendingUser) => (
              <div key={pendingUser.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {pendingUser.name} {pendingUser.position}
                    </h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><span className="font-medium">아이디:</span> {pendingUser.username}</p>
                      <p><span className="font-medium">부서:</span> {pendingUser.department}</p>
                      <p><span className="font-medium">전화번호:</span> {pendingUser.phoneNumber}</p>
                      <p><span className="font-medium">신청일:</span> {new Date(pendingUser.createdAt).toLocaleDateString('ko-KR')}</p>
                      {pendingUser.reason && (
                        <p><span className="font-medium">신청 사유:</span> {pendingUser.reason}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => approveUser(pendingUser.id, pendingUser.name)}
                      disabled={isLoading}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                    >
                      ✅ 승인
                    </button>
                    <button
                      onClick={() => rejectUser(pendingUser.id, pendingUser.name)}
                      disabled={isLoading}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                    >
                      ❌ 거부
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 하단 버튼 */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setShowPopup(false)}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium rounded-lg transition-colors"
            >
              나중에 처리하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}