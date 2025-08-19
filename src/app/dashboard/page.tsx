'use client';

import { useState, useEffect, FormEvent, useMemo } from 'react';
import { useAuth } from '@/lib/simpleAuth';
import { useRouter } from 'next/navigation';
import { isSuperAdmin } from '@/lib/authUtils';
import dynamic from 'next/dynamic';
import type { DateClickArg } from '@fullcalendar/interaction';

// 동적으로 import된 캘린더 컴포넌트
const DynamicScheduleCalendar = dynamic(() => import('../../components/ScheduleCalendarComponent'), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">캘린더 로딩 중...</div>
});

// --- Helper Functions ---
const generateTimeOptions = () => {
  const options = [];
  for (let h = 8; h <= 17; h++) {
    for (let m = 0; m < 60; m += 30) {
      if (h === 17 && m > 30) continue;
      const hour = String(h).padStart(2, '0');
      const minute = String(m).padStart(2, '0');
      options.push(`${hour}:${minute}`);
    }
  }
  return options;
};

// --- Interfaces ---
interface School {
  id: string;
  name: string;
  abbreviation?: string | null;
}

interface Schedule {
  id: string;
  date: string;
  schoolId: string;
  school: School;
  ampm: string;
  startTime: string;
  endTime: string;
  purpose: string;
  otherReason?: string | null;
  isHoliday?: boolean;
  holidayReason?: string | null;
}

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const isAdmin = isSuperAdmin(user);

  // --- State ---
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [schedulesLoading, setSchedulesLoading] = useState(true);
  const [schoolsLoading, setSchoolsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>('');
  
  // 메모 관련 state
  const [memos, setMemos] = useState<string>('');
  const [isMemoSaving, setIsMemoSaving] = useState(false);
  const [savedMemos, setSavedMemos] = useState<{ id: string; content: string; createdAt: string }[]>([]);
  const [editingMemoId, setEditingMemoId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<string>('');
  
  // 현재 시간 state
  const [currentTime, setCurrentTime] = useState('');

  // 인증되지 않은 사용자 리다이렉트
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  // --- Data Fetching ---
  const fetchSchedules = async () => {
    try {
      setSchedulesLoading(true);
      const response = await fetch('/api/schedules');
      const data = await response.json();
      setSchedules(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('스케줄 로딩 실패:', error);
      setSchedules([]);
    } finally {
      setSchedulesLoading(false);
    }
  };

  const fetchSchools = async () => {
    try {
      setSchoolsLoading(true);
      const response = await fetch('/api/schools');
      const data = await response.json();
      setSchools(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('학교 정보 로딩 실패:', error);
      setSchools([]);
    } finally {
      setSchoolsLoading(false);
    }
  };

  // 메모 저장
  const saveMemos = async () => {
    if (!memos.trim() || !user?.id) return;
    
    setIsMemoSaving(true);
    try {
      const newMemo = {
        id: Date.now().toString(),
        content: memos.trim(),
        createdAt: new Date().toLocaleString('ko-KR')
      };
      
      const updatedMemos = [...savedMemos, newMemo];
      setSavedMemos(updatedMemos);
      
      // 사용자별 메모 저장 키
      const memoKey = `dashboard-memos-${user.id}`;
      if (typeof window !== 'undefined') {
        localStorage.setItem(memoKey, JSON.stringify(updatedMemos));
      }
      
      setMemos(''); // 입력창 초기화
    } catch (error) {
      console.error('메모 저장 실패:', error);
    } finally {
      setIsMemoSaving(false);
    }
  };

  // 메모 삭제
  const deleteMemo = (memoId: string) => {
    if (!user?.id) return;
    
    const updatedMemos = savedMemos.filter(memo => memo.id !== memoId);
    setSavedMemos(updatedMemos);
    
    const memoKey = `dashboard-memos-${user.id}`;
    if (typeof window !== 'undefined') {
      localStorage.setItem(memoKey, JSON.stringify(updatedMemos));
    }
  };

  // 메모 수정 시작
  const startEditMemo = (memo: { id: string; content: string }) => {
    setEditingMemoId(memo.id);
    setEditingContent(memo.content);
  };

  // 메모 수정 완료
  const saveEditMemo = () => {
    if (!editingContent.trim() || !user?.id) return;
    
    const updatedMemos = savedMemos.map(memo => 
      memo.id === editingMemoId 
        ? { ...memo, content: editingContent.trim() }
        : memo
    );
    setSavedMemos(updatedMemos);
    
    const memoKey = `dashboard-memos-${user.id}`;
    if (typeof window !== 'undefined') {
      localStorage.setItem(memoKey, JSON.stringify(updatedMemos));
    }
    
    setEditingMemoId(null);
    setEditingContent('');
  };

  // 메모 수정 취소
  const cancelEditMemo = () => {
    setEditingMemoId(null);
    setEditingContent('');
  };

  // 컴포넌트 마운트시 데이터 로드
  useEffect(() => {
    if (isAuthenticated) {
      fetchSchedules();
      fetchSchools();
    }
  }, [isAuthenticated]);

  // 사용자 로그인 후 메모 자동 불러오기
  useEffect(() => {
    if (isAuthenticated && user?.id && typeof window !== 'undefined') {
      const memoKey = `dashboard-memos-${user.id}`;
      const savedMemosList = localStorage.getItem(memoKey);
      if (savedMemosList) {
        try {
          const parsedMemos = JSON.parse(savedMemosList);
          setSavedMemos(Array.isArray(parsedMemos) ? parsedMemos : []);
        } catch (error) {
          console.error('메모 자동 불러오기 실패:', error);
          setSavedMemos([]);
        }
      } else {
        setSavedMemos([]);
      }
    }
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    // API 호출이 모두 완료되면 로딩 상태 해제
    if (!schedulesLoading && !schoolsLoading) {
      setLoading(false);
    }
  }, [schedulesLoading, schoolsLoading]);

  // 현재 시간 업데이트 (년월일 시분초)
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleString('ko-KR', { 
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit',
        hour12: false 
      }));
    };
    
    updateTime(); // 초기 시간 설정
    const interval = setInterval(updateTime, 1000); // 1초마다 업데이트
    
    return () => clearInterval(interval);
  }, []);

  // --- Event Handlers ---
  const handleDateClick = (arg: DateClickArg) => {
    setSelectedDate(arg.dateStr);
    // 날짜 클릭시 해당 날짜로 스크롤하거나 하이라이트 처리
    console.log('선택된 날짜:', arg.dateStr);
  };

  const handleEventClick = (clickInfo: { event: { id: string } }) => {
    const scheduleId = clickInfo.event.id;
    console.log('클릭된 스케줄 ID:', scheduleId);
    // 필요시 상세 정보 표시 로직 추가
  };

  // --- Calendar Events ---
  const calendarEvents = useMemo(() => {
    return schedules.map((schedule) => {
      const eventDate = new Date(schedule.date);
      const [startHour, startMinute] = schedule.startTime.split(':').map(Number);
      const [endHour, endMinute] = schedule.endTime.split(':').map(Number);
      
      const startTime = new Date(eventDate);
      startTime.setHours(startHour, startMinute);
      
      const endTime = new Date(eventDate);
      endTime.setHours(endHour, endMinute);

      let title: string;
      let backgroundColor: string;
      let textColor: string;

      if (schedule.isHoliday) {
        title = `🏖️ ${schedule.holidayReason || '휴무'}`;
        backgroundColor = '#fbbf24';
        textColor = '#000000';
      } else {
        const purposes = JSON.parse(schedule.purpose || '[]');
        const purposeText = purposes.join(', ');
        
        // 휴가일정인지 확인
        if (purposes.includes('휴가') || purposes.includes('휴가일정')) {
          title = `${schedule.school.abbreviation || schedule.school.name} - ${purposeText}`;
          backgroundColor = '#fbbf24'; // 노란색 배경
          textColor = '#000000'; // 검은 텍스트
        } else {
          title = `${schedule.school.abbreviation || schedule.school.name} - ${purposeText}`;
          backgroundColor = '#3b82f6';
          textColor = '#ffffff';
        }
      }

      return {
        id: schedule.id,
        title,
        start: startTime.toISOString(),
        end: endTime.toISOString(),
        backgroundColor,
        textColor,
        extendedProps: {
          schoolName: schedule.school.name,
          schoolAbbreviation: schedule.school.abbreviation,
          purposes: schedule.isHoliday ? schedule.holidayReason : JSON.parse(schedule.purpose || '[]').join(', '),
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          ampm: schedule.ampm,
          isHoliday: schedule.isHoliday,
          otherReason: schedule.otherReason
        }
      };
    });
  }, [schedules]);

  // 오늘의 일정 계산
  const todaySchedules = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return schedules.filter(schedule => schedule.date.startsWith(today));
  }, [schedules]);

  // 이번 달 통계 계산
  const monthlyStats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const monthlySchedules = schedules.filter(schedule => {
      const scheduleDate = new Date(schedule.date);
      return scheduleDate.getMonth() === currentMonth && 
             scheduleDate.getFullYear() === currentYear &&
             !schedule.isHoliday; // 휴무일정 제외
    });

    const stats: { [key: string]: { total: number; completed: number; completedSchools: Schedule[]; upcomingSchools: Schedule[] } } = {};
    
    monthlySchedules.forEach(schedule => {
      const purposes = JSON.parse(schedule.purpose || '[]');
      purposes.forEach((purpose: string) => {
        if (!stats[purpose]) {
          stats[purpose] = { total: 0, completed: 0, completedSchools: [], upcomingSchools: [] };
        }
        stats[purpose].total++;
        
        const scheduleDate = new Date(schedule.date);
        if (purpose === '산업재해') {
          // 산업재해는 항상 "발생"으로 처리
          stats[purpose].completed++;
          stats[purpose].completedSchools.push(schedule);
        } else if (scheduleDate < now) {
          stats[purpose].completed++;
          stats[purpose].completedSchools.push(schedule);
        } else {
          stats[purpose].upcomingSchools.push(schedule);
        }
      });
    });

    return stats;
  }, [schedules]);

  // 최근 산업재해 관련 일정 계산
  const recentAccidentSchedules = useMemo(() => {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
    
    return schedules.filter(schedule => {
      if (schedule.isHoliday) return false;
      const purposes = JSON.parse(schedule.purpose || '[]');
      const scheduleDate = new Date(schedule.date);
      return purposes.includes('산업재해') && scheduleDate >= sixMonthsAgo;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);
  }, [schedules]);

  if (!isAuthenticated || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">대시보드 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-8">
          
          {/* 좌측: 정보 패널 (2/7로 적당한 크기) */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* 담당자 정보 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">담당자 정보</h3>
              <div className="flex items-start space-x-4">
                {/* 프로필 사진 */}
                <div className="w-20 h-20 flex-shrink-0">
                  {user?.profilePhoto ? (
                    <img 
                      src={user.profilePhoto} 
                      alt="프로필 사진"
                      className="w-full h-full rounded-full object-cover border-2 border-blue-200"
                    />
                  ) : (
                    <div className="w-full h-full bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-xl">
                        {user?.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* 정보 2열 배치 */}
                <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-2" style={{ fontSize: '12.5px' }}>
                  <div>
                    <span className="text-gray-500">부서/직급:</span>
                    <span className="ml-1 text-gray-900">{user?.department || '산업안전팀'} {user?.position || '대리'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">연락처:</span>
                    <span className="ml-1 text-gray-900">{user?.phoneNumber || '010-8764-2428'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">담당자명:</span>
                    <span className="ml-1 text-gray-900">{user?.name || '강성훈'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">e-mail:</span>
                    <span className="ml-1 text-gray-900">{user?.email || 'safe08@ssif.or.kr'}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 오늘의 일정 - 현재시간 포함 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">오늘의 일정</h3>
                <div className="text-xs text-gray-500">
                  {currentTime}
                </div>
              </div>
              {todaySchedules.length > 0 ? (
                <div className="space-y-3">
                  {todaySchedules.map((schedule) => (
                    <div key={schedule.id} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-sm font-medium text-blue-900">
                        {schedule.startTime} - {schedule.endTime}
                      </div>
                      <div className="text-sm text-blue-700 mt-1">
                        {schedule.isHoliday ? (
                          <span>🏖️ {schedule.holidayReason}</span>
                        ) : (
                          <span>{schedule.school.name}</span>
                        )}
                      </div>
                      {!schedule.isHoliday && (
                        <div className="text-xs text-blue-600 mt-1">
                          {JSON.parse(schedule.purpose || '[]').join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">오늘 일정이 없습니다</p>
              )}
            </div>

            {/* 이번 달 통계 - 3열, 완료된 학교 녹색으로 위에 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">이번 달 통계</h3>
              {Object.keys(monthlyStats).length > 0 ? (
                <div className="space-y-4">
                  {/* 월점검 통계 - 간단한 버전 */}
                  {Object.entries(monthlyStats)
                    .filter(([purpose]) => purpose === '월점검')
                    .map(([purpose, stats]) => (
                      <div key={purpose} className="border border-gray-300 rounded-lg overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3">
                          <div className="flex justify-between items-center">
                            <div className="text-sm font-semibold text-gray-900">{purpose}</div>
                            <div className="text-xs text-gray-600">
                              {stats.total > 0 && purpose === '산업재해' 
                                ? `발생: ${stats.completed} / 총: ${stats.total}`
                                : `완료: ${stats.completed} / 예정: ${stats.total - stats.completed} / 총: ${stats.total}`
                              }
                            </div>
                          </div>
                          <div className="mt-2 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  
                  {/* 다른 통계들 - 상세한 버전 */}
                  {Object.entries(monthlyStats)
                    .filter(([purpose]) => purpose !== '월점검')
                    .sort(([a, b]) => {
                      const order = ['위험성평가', '근골조사', '교육', '산업재해'];
                      const aIndex = order.indexOf(a);
                      const bIndex = order.indexOf(b);
                      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
                      if (aIndex !== -1) return -1;
                      if (bIndex !== -1) return 1;
                      return a.localeCompare(b, 'ko');
                    })
                    .map(([purpose, stats]) => (
                    <div key={purpose} className="border border-gray-300 rounded-lg overflow-hidden">
                      {/* 헤더 */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                          <div className="text-sm font-semibold text-gray-900">{purpose}</div>
                          <div className="text-xs text-gray-600">
                            {purpose === '산업재해' 
                              ? `발생: ${stats.completed} / 총: ${stats.total}`
                              : `완료: ${stats.completed} / 예정: ${stats.total - stats.completed} / 총: ${stats.total}`
                            }
                          </div>
                        </div>
                        <div className="mt-2 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      {/* 완료된 학교들 - 3열, 녹색, 위에 배치 */}
                      {stats.completedSchools.length > 0 && (
                        <div className="p-3 bg-green-50 border-b border-gray-200">
                          <div className="text-xs font-medium text-green-800 mb-2">
                            ✅ {purpose === '산업재해' ? '발생' : '완료'} ({stats.completedSchools.length})
                          </div>
                          <div className="grid grid-cols-3 gap-1">
                            {stats.completedSchools
                              .sort((a, b) => a.school.name.localeCompare(b.school.name, 'ko'))
                              .slice(0, 9)
                              .map((schedule, idx) => (
                              <div key={schedule.id} className="text-xs text-green-700 px-1 py-1 bg-green-100 rounded text-center">
                                {schedule.school.abbreviation || schedule.school.name}
                              </div>
                            ))}
                            {stats.completedSchools.length > 9 && (
                              <div className="text-xs text-green-600 px-1 py-1 text-center italic">
                                +{stats.completedSchools.length - 9}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* 예정된 학교들 - 3열, 보라색, 아래 배치 */}
                      {stats.upcomingSchools.length > 0 && (
                        <div className="p-3 bg-purple-50">
                          <div className="text-xs font-medium text-purple-800 mb-2">📅 예정 ({stats.upcomingSchools.length})</div>
                          <div className="grid grid-cols-3 gap-1">
                            {stats.upcomingSchools
                              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                              .slice(0, 9)
                              .map((schedule, idx) => (
                              <div key={schedule.id} className="text-xs text-purple-700 px-1 py-1 bg-purple-100 rounded text-center">
                                {schedule.school.abbreviation || schedule.school.name}
                              </div>
                            ))}
                            {stats.upcomingSchools.length > 9 && (
                              <div className="text-xs text-purple-600 px-1 py-1 text-center italic">
                                +{stats.upcomingSchools.length - 9}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">통계 데이터가 없습니다</p>
              )}
            </div>

            {/* 최근 산업재해 발생 학교 - 2열, 날짜-학교명 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <span className="text-red-500">⚠️</span>
                <span>산업재해 발생학교</span>
              </h3>
              {recentAccidentSchedules.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {recentAccidentSchedules.slice(0, 10).map((schedule) => (
                    <div key={schedule.id} className="p-2 bg-red-50 rounded-lg border border-red-200">
                      <div className="text-xs text-red-700 font-medium">
                        {new Date(schedule.date).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-red-900 mt-1">
                        {schedule.school.abbreviation || schedule.school.name}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4 text-sm">최근 산업재해 방문 기록이 없습니다</p>
              )}
            </div>
          </div>

          {/* 우측: 캘린더 + 메모장 (5/7) */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* 캘린더 - 세로 높이 증가 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">일정 캘린더</h2>
                {selectedDate && (
                  <p className="text-sm text-gray-500 mt-1">선택된 날짜: {selectedDate}</p>
                )}
              </div>
              
              <div className="p-4" style={{ minHeight: '600px' }}>
                <DynamicScheduleCalendar 
                  events={calendarEvents}
                  onEventClick={handleEventClick}
                  onDateClick={handleDateClick}
                />
              </div>
            </div>

            {/* 메모장 - 한 줄 입력 + 목록 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">메모장</h3>
              
              {/* 메모 입력 */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={memos}
                  onChange={(e) => setMemos(e.target.value)}
                  placeholder="메모를 입력하세요..."
                  className="flex-1 h-10 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && saveMemos()}
                />
                <button
                  onClick={saveMemos}
                  disabled={isMemoSaving || !memos.trim()}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {isMemoSaving ? '저장 중...' : '저장'}
                </button>
              </div>

              {/* 저장된 메모 목록 */}
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {savedMemos.length > 0 ? (
                  savedMemos.map((memo) => (
                    <div key={memo.id} className="p-3 bg-gray-50 rounded-lg border">
                      {editingMemoId === memo.id ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={editingContent}
                            onChange={(e) => setEditingContent(e.target.value)}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                            onKeyPress={(e) => e.key === 'Enter' && saveEditMemo()}
                          />
                          <button
                            onClick={saveEditMemo}
                            className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                          >
                            완료
                          </button>
                          <button
                            onClick={cancelEditMemo}
                            className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
                          >
                            취소
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="text-sm text-gray-900">{memo.content}</div>
                            <div className="text-xs text-gray-500 mt-1">{memo.createdAt}</div>
                          </div>
                          <div className="flex gap-1 ml-2">
                            <button
                              onClick={() => startEditMemo(memo)}
                              className="px-2 py-1 text-blue-600 text-xs hover:bg-blue-50 rounded"
                              title="수정"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => deleteMemo(memo.id)}
                              className="px-2 py-1 text-red-600 text-xs hover:bg-red-50 rounded"
                              title="삭제"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4 text-sm">저장된 메모가 없습니다</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}