'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/simpleAuth';
import { useRouter } from 'next/navigation';
import { isSuperAdmin, getUserDisplayName } from '@/lib/authUtils';

interface User {
  id: string;
  username: string;
  name: string;
  position?: string;
  phoneNumber?: string;
  email?: string;
  department?: string;
  profilePhoto?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export default function UserManagementPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'pending'>('active');

  // 관리자가 아닌 경우 리다이렉트
  useEffect(() => {
    if (user && !isSuperAdmin(user)) {
      router.push('/');
    }
  }, [user, router]);

  // 사용자 목록 조회
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // 승인된 사용자 목록
      const activeResponse = await fetch('/api/admin/users?status=active');
      const activeData = await activeResponse.json();
      
      // 승인 대기 사용자 목록
      const pendingResponse = await fetch('/api/admin/users?status=pending');
      const pendingData = await pendingResponse.json();

      if (activeData.success) {
        setUsers(activeData.users || []);
      }
      if (pendingData.success) {
        setPendingUsers(pendingData.users || []);
      }
    } catch (error) {
      console.error('사용자 목록 조회 실패:', error);
      alert('사용자 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 사용자 삭제
  const deleteUser = async (userId: string, userName: string) => {
    if (!confirm(`${userName}님의 계정을 정말 삭제하시겠습니까?\n\n⚠️ 삭제된 계정은 복구할 수 없으며, 해당 사용자의 모든 데이터(학교 정보, 일정 등)도 함께 삭제됩니다.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users?userId=${userId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        alert(data.message);
        // 목록에서 제거
        setUsers(prev => prev.filter(u => u.id !== userId));
      } else {
        alert(`삭제 실패: ${data.message}`);
      }
    } catch (error) {
      console.error('사용자 삭제 실패:', error);
      alert('사용자 삭제 중 오류가 발생했습니다.');
    }
  };

  // 사용자 승인
  const approveUser = async (userId: string, userName: string) => {
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
        alert(data.message);
        fetchUsers(); // 목록 새로고침
      } else {
        alert(`승인 실패: ${data.message}`);
      }
    } catch (error) {
      alert('승인 처리 중 오류가 발생했습니다.');
    }
  };

  // 가입 신청 거부
  const rejectUser = async (userId: string, userName: string) => {
    if (!confirm(`${userName}님의 가입 신청을 정말 거부하시겠습니까?`)) {
      return;
    }

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
        alert(data.message);
        setPendingUsers(prev => prev.filter(u => u.id !== userId));
      } else {
        alert(`거부 처리 실패: ${data.message}`);
      }
    } catch (error) {
      alert('거부 처리 중 오류가 발생했습니다.');
    }
  };

  useEffect(() => {
    if (user && isSuperAdmin(user)) {
      fetchUsers();
    }
  }, [user]);

  if (!user || !isSuperAdmin(user)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">접근 권한이 없습니다.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">사용자 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">사용자 관리</h1>
          <p className="text-gray-600">시스템에 등록된 사용자들을 관리합니다.</p>
        </div>

        {/* 탭 메뉴 */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('active')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'active'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                승인된 사용자 ({users.length})
              </button>
              <button
                onClick={() => setActiveTab('pending')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'pending'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                승인 대기 ({pendingUsers.length})
                {pendingUsers.length > 0 && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {pendingUsers.length}
                  </span>
                )}
              </button>
            </nav>
          </div>
        </div>

        {/* 승인된 사용자 목록 */}
        {activeTab === 'active' && (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">승인된 사용자 목록</h2>
            </div>
            {users.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                승인된 사용자가 없습니다.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        사용자 정보
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        연락처
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        부서
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        가입일
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        관리
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {getUserDisplayName(user)}
                            </div>
                            <div className="text-sm text-gray-500">
                              @{user.username}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.phoneNumber || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.department || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {user.role !== 'super_admin' ? (
                            <button
                              onClick={() => deleteUser(user.id, user.name)}
                              className="text-red-600 hover:text-red-900"
                            >
                              삭제
                            </button>
                          ) : (
                            <span className="text-gray-400">관리자</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 승인 대기 사용자 목록 */}
        {activeTab === 'pending' && (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">승인 대기 중인 사용자</h2>
            </div>
            {pendingUsers.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                승인 대기 중인 사용자가 없습니다.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        사용자 정보
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        연락처
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        부서
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        신청일
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        관리
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pendingUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {getUserDisplayName(user)}
                            </div>
                            <div className="text-sm text-gray-500">
                              @{user.username}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.phoneNumber || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.department || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => approveUser(user.id, user.name)}
                              className="text-green-600 hover:text-green-900"
                            >
                              승인
                            </button>
                            <button
                              onClick={() => rejectUser(user.id, user.name)}
                              className="text-red-600 hover:text-red-900"
                            >
                              거부
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}