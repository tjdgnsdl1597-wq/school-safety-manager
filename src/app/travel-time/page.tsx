'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/simpleAuth';
import { useRouter } from 'next/navigation';
import CopyrightFooter from '@/components/CopyrightFooter';

interface TravelTimeData {
  fromOfficeToFirst?: string;
  fromHomeToFirst?: string;
  betweenSchools?: { from: string; to: string; duration: string; distance: string }[];
}

interface School {
  id: string;
  name: string;
  address?: string;
}

interface Schedule {
  id: string;
  date: string;
  school: School;
  startTime: string;
  endTime: string;
  ampm: string;
}

export default function TravelTimePage() {
  const { user, isAuthenticated, refreshUser } = useAuth();
  const router = useRouter();
  const [homeAddress, setHomeAddress] = useState('');
  const [officeAddress, setOfficeAddress] = useState('');
  const [schools, setSchools] = useState<School[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [travelData, setTravelData] = useState<TravelTimeData>({});
  const [loading, setLoading] = useState(false);
  const [editingAddresses, setEditingAddresses] = useState(false);

  // 인증 확인
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/signin');
    }
  }, [isAuthenticated, router]);

  // 사용자 주소 정보 로드
  useEffect(() => {
    if (user) {
      setHomeAddress(user.homeAddress || '');
      setOfficeAddress(user.officeAddress || '인천광역시 남동구 구월남로 232번길 31');
    }
  }, [user]);

  // 주소 업데이트 후 상태 반영
  const updateLocalAddresses = (newHomeAddress: string, newOfficeAddress: string) => {
    setHomeAddress(newHomeAddress);
    setOfficeAddress(newOfficeAddress);
  };

  // 로그인한 사용자의 학교 목록 로드
  useEffect(() => {
    const fetchSchools = async () => {
      if (!user) return;
      
      try {
        const response = await fetch('/api/schools', {
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': user.id,
            'x-user-role': user.role
          }
        });
        if (response.ok) {
          const schoolsData = await response.json();
          setSchools(schoolsData);
        }
      } catch (error) {
        console.error('학교 데이터 로드 실패:', error);
      }
    };

    if (isAuthenticated && user) {
      fetchSchools();
    }
  }, [isAuthenticated, user]);

  // 학교 주소 업데이트
  const updateSchoolAddress = async (schoolId: string, address: string) => {
    try {
      const response = await fetch(`/api/schools/${schoolId}/address`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address })
      });

      if (response.ok) {
        const data = await response.json();
        // 로컬 상태 업데이트
        setSchools(prev => prev.map(school => 
          school.id === schoolId ? { ...school, address } : school
        ));
        alert(`✅ ${data.school.name} 주소가 성공적으로 저장되었습니다.`);
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`❌ 학교 주소 업데이트에 실패했습니다: ${errorData.details || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('학교 주소 업데이트 실패:', error);
      alert('학교 주소 업데이트 중 오류가 발생했습니다.');
    }
  };


  // 선택된 날짜의 일정 로드
  useEffect(() => {
    const fetchSchedules = async () => {
      if (!selectedDate || !user) return;
      
      try {
        const response = await fetch(`/api/schedules?date=${selectedDate}`, {
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': user.id,
            'x-user-role': user.role
          }
        });
        if (response.ok) {
          const schedulesData = await response.json();
          // 시간순으로 정렬
          const sortedSchedules = schedulesData.sort((a: Schedule, b: Schedule) => {
            const timeA = `${a.ampm} ${a.startTime}`;
            const timeB = `${b.ampm} ${b.startTime}`;
            return timeA.localeCompare(timeB);
          });
          setSchedules(sortedSchedules);
        }
      } catch (error) {
        console.error('일정 데이터 로드 실패:', error);
      }
    };

    if (isAuthenticated && selectedDate && user) {
      fetchSchedules();
    }
  }, [isAuthenticated, selectedDate, user]);

  // 주소 업데이트
  const updateAddresses = async () => {
    if (!user) return;

    const fixedOfficeAddress = '인천광역시 남동구 구월남로 232번길 31';
    
    setLoading(true);
    try {
      const response = await fetch('/api/user/addresses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          homeAddress,
          officeAddress: fixedOfficeAddress,
          userId: user.id
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert('주소가 성공적으로 업데이트되었습니다.');
        // 사용자 정보 새로고침
        await refreshUser();
        // 로컬 상태도 즉시 업데이트
        updateLocalAddresses(homeAddress, fixedOfficeAddress);
      } else {
        alert('주소 업데이트에 실패했습니다.');
      }
    } catch (error) {
      console.error('주소 업데이트 실패:', error);
      alert('주소 업데이트 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 이동시간 계산
  const calculateTravelTime = async () => {
    if (schedules.length === 0) {
      alert('선택된 날짜에 일정이 없습니다.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/travel-time/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          homeAddress,
          officeAddress,
          schedules: schedules.map(s => ({
            schoolId: s.school.id,
            schoolName: s.school.name,
            schoolAddress: s.school.address
          }))
        })
      });

      if (response.ok) {
        const travelTimeData = await response.json();
        console.log('이동시간 계산 결과:', travelTimeData);
        
        // 오류가 있는 경우 알림 표시
        if (travelTimeData.hasErrors && travelTimeData.errors) {
          const errorMessage = `일부 이동시간 계산에 실패했습니다:\n${travelTimeData.errors.join('\n')}`;
          alert(errorMessage);
        }
        
        setTravelData(travelTimeData);
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.details 
          ? `이동시간 계산에 실패했습니다:\n${errorData.details}`
          : '이동시간 계산에 실패했습니다.';
        alert(errorMessage);
      }
    } catch (error) {
      console.error('이동시간 계산 실패:', error);
      alert('네트워크 오류로 이동시간 계산에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return <div>로그인 확인 중...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            🚗 이동시간 관리
          </h1>

          {/* 주소 설정 섹션 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">📍 주소 설정</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  집 주소
                </label>
                <input
                  type="text"
                  value={homeAddress}
                  onChange={(e) => setHomeAddress(e.target.value)}
                  placeholder="예: 인천광역시 남동구 ..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  회사 주소 <span className="text-xs text-green-600">(고정값)</span>
                </label>
                <input
                  type="text"
                  value="인천광역시 남동구 구월남로 232번길 31"
                  readOnly
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-700 cursor-not-allowed"
                />
                <div className="mt-1 text-xs text-gray-500">
                  회사 주소는 고정되어 있습니다.
                </div>
              </div>
            </div>
            <button
              onClick={updateAddresses}
              disabled={loading || !homeAddress.trim()}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-xl transition-colors disabled:opacity-50"
            >
              {loading ? '저장 중...' : '집 주소 저장'}
            </button>
          </div>

          {/* 저장된 주소 표시 섹션 */}
          {(homeAddress || officeAddress) && (
            <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-xl">
              <h2 className="text-xl font-semibold text-green-800 mb-4">📍 저장된 주소 정보</h2>
              <div className="space-y-3">
                {homeAddress && (
                  <div className="flex items-start">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mr-3">
                      🏠 집
                    </span>
                    <span className="text-gray-700 flex-1">{homeAddress}</span>
                  </div>
                )}
                {officeAddress && (
                  <div className="flex items-start">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 mr-3">
                      🏢 회사
                    </span>
                    <span className="text-gray-700 flex-1">{officeAddress}</span>
                  </div>
                )}
              </div>
              <div className="mt-4 flex justify-between items-center">
                <div className="text-sm text-green-600">
                  ✅ 주소가 저장되었습니다. 대시보드에서 자동으로 이동시간이 계산됩니다.
                </div>
                <button
                  onClick={() => setEditingAddresses(true)}
                  className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-lg transition-colors"
                >
                  ✏️ 편집
                </button>
              </div>
            </div>
          )}

          {/* 등록된 학교 목록 및 주소 설정 섹션 */}
          <div className="mb-8">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-700">🏫 등록된 학교 목록 및 주소 설정</h2>
            </div>
            
            {schools.length > 0 ? (
              <div className="space-y-4">
                {schools.map((school) => (
                  <div key={school.id} className="bg-gray-50 p-4 rounded-xl border">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          학교명
                        </label>
                        <div className="text-lg font-semibold text-gray-800">{school.name}</div>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          학교 주소
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={school.address || ''}
                            onChange={(e) => {
                              // 임시로 로컬 상태 업데이트
                              setSchools(prev => prev.map(s => 
                                s.id === school.id ? { ...s, address: e.target.value } : s
                              ));
                            }}
                            placeholder="학교 주소를 직접 입력해주세요"
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <button
                            onClick={() => updateSchoolAddress(school.id, school.address || '')}
                            disabled={loading || !school.address?.trim()}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {loading ? '저장 중...' : '저장'}
                          </button>
                        </div>
                        {!school.address && (
                          <p className="text-xs text-gray-500 mt-1">
                            💡 수동입력 부탁드립니다
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-center py-8 bg-gray-50 rounded-xl">
                등록된 학교가 없습니다. 먼저 학교 정보 페이지에서 학교를 등록해주세요.
              </div>
            )}
          </div>

          {/* 날짜 선택 섹션 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">📅 날짜 선택</h2>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* 일정 표시 섹션 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">🗓️ 해당 날짜 일정</h2>
            {schedules.length > 0 ? (
              <div className="space-y-3">
                {schedules.map((schedule, index) => (
                  <div key={schedule.id} className="bg-gray-50 p-4 rounded-xl border">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium text-gray-800">
                          {index + 1}. {schedule.school.name}
                        </span>
                        <div className="text-sm text-gray-600">
                          {schedule.ampm} {schedule.startTime} - {schedule.endTime}
                        </div>
                        {schedule.school.address && (
                          <div className="text-xs text-gray-500 mt-1">
                            📍 {schedule.school.address}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-center py-8">
                선택된 날짜에 일정이 없습니다.
              </div>
            )}
          </div>

          {/* 이동시간 계산 버튼 */}
          {schedules.length > 0 && (
            <div className="mb-8 text-center">
              <button
                onClick={calculateTravelTime}
                disabled={loading || !homeAddress || !officeAddress}
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '계산 중...' : '🚗 이동시간 계산'}
              </button>
              {(!homeAddress || !officeAddress) && (
                <p className="text-sm text-red-500 mt-2">
                  이동시간 계산을 위해 집과 회사 주소를 모두 입력해주세요.
                </p>
              )}
            </div>
          )}

          {/* 이동시간 결과 표시 */}
          {Object.keys(travelData).length > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-xl border border-blue-200">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">⏱️ 이동시간 계산 결과</h2>
              
              <div className="space-y-4">
                {travelData.fromOfficeToFirst && (
                  <div className="bg-white p-4 rounded-lg shadow">
                    <div className="font-medium text-gray-800">🏢 회사 → 첫 번째 학교</div>
                    <div className="text-blue-600 font-bold text-lg">{travelData.fromOfficeToFirst}</div>
                  </div>
                )}
                
                {travelData.fromHomeToFirst && (
                  <div className="bg-white p-4 rounded-lg shadow">
                    <div className="font-medium text-gray-800">🏠 집 → 첫 번째 학교</div>
                    <div className="text-blue-600 font-bold text-lg">{travelData.fromHomeToFirst}</div>
                  </div>
                )}
                
                {travelData.betweenSchools && travelData.betweenSchools.length > 0 && (
                  <div>
                    <div className="font-medium text-gray-800 mb-2">🏫 학교 간 이동시간</div>
                    {travelData.betweenSchools.map((route, index) => (
                      <div key={index} className="bg-white p-4 rounded-lg shadow mb-2">
                        <div className="font-medium">{route.from} → {route.to}</div>
                        <div className="text-green-600 font-bold">{route.duration}</div>
                        <div className="text-sm text-gray-500">{route.distance}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* 저작권 푸터 */}
      <CopyrightFooter className="mt-8" />
    </div>
  );
}