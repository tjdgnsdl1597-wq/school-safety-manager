'use client';

import { useState, useEffect, FormEvent, useMemo } from 'react';
import { useAuth } from '@/lib/simpleAuth';
import { useRouter } from 'next/navigation';
import { isSuperAdmin } from '@/lib/authUtils';
import dynamic from 'next/dynamic';
import CopyrightFooter from '@/components/CopyrightFooter';
import type { DateClickArg } from '@fullcalendar/interaction';
import { getHoliday, getAllHolidays } from '@/lib/holidays';

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
  travelTime?: {
    id: string;
    duration: string | null;
    origin: string | null;
    fromOfficeTime: string | null;
    fromHomeTime: string | null;
    toPreviousTime: string | null;
  } | null;
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
  
  // 일정 상세 모달 state
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

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
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      if (user) {
        headers['x-user-id'] = user.id;
        headers['x-user-role'] = user.role;
      }
      
      const response = await fetch(`/api/schedules?t=${Date.now()}`, { 
        headers,
        cache: 'no-store',
        next: { revalidate: 0 }
      });
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
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      if (user) {
        headers['x-user-id'] = user.id;
        headers['x-user-role'] = user.role;
      }
      
      const response = await fetch(`/api/schools?t=${Date.now()}`, { 
        headers,
        cache: 'no-store',
        next: { revalidate: 0 }
      });
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

  // 10분마다 자동 이동시간 업데이트
  useEffect(() => {
    const autoUpdateTravelTime = async () => {
      if (!user?.id || !user?.homeAddress || !user?.officeAddress) {
        return;
      }

      try {
        console.log('자동 이동시간 업데이트 시작...');
        const response = await fetch('/api/travel-time/auto-update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: user.id })
        });

        if (response.ok) {
          const result = await response.json();
          console.log('이동시간 자동 업데이트 완료:', result);
          
          // 스케줄 데이터 다시 로드해서 최신 이동시간 반영
          if (result.updated > 0) {
            fetchSchedules();
          }
        }
      } catch (error) {
        console.error('자동 이동시간 업데이트 실패:', error);
      }
    };

    // 초기 실행
    if (isAuthenticated && user?.homeAddress && user?.officeAddress) {
      autoUpdateTravelTime();
    }

    // 10분(600,000ms)마다 실행
    const interval = setInterval(autoUpdateTravelTime, 10 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [isAuthenticated, user?.id, user?.homeAddress, user?.officeAddress]);

  // --- Event Handlers ---
  const handleDateClick = (arg: DateClickArg) => {
    setSelectedDate(arg.dateStr);
    // 날짜 클릭시 해당 날짜로 스크롤하거나 하이라이트 처리
    console.log('선택된 날짜:', arg.dateStr);
  };

  const handleEventClick = (clickInfo: { event: { id: string } }) => {
    const scheduleId = clickInfo.event.id;
    const schedule = schedules.find(s => s.id === scheduleId);
    if (schedule) {
      setSelectedSchedule(schedule);
      setShowScheduleModal(true);
    }
  };

  // --- Calendar Events ---
  const calendarEvents = useMemo(() => {
    // 일정 이벤트들
    const scheduleEvents = schedules.map((schedule) => {
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
        className: schedule.isHoliday ? 'fc-holiday-event' : 'fc-custom-event',
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

    // 국가공휴일 이벤트들 (2025년)
    const holidayEvents = getAllHolidays().map((holiday) => {
      return {
        id: `holiday-${holiday.date}`,
        title: `🎉 ${holiday.name}`,
        start: holiday.date,
        allDay: true,
        backgroundColor: '#ec4899', // 분홍색
        textColor: '#ffffff',
        className: 'fc-national-holiday',
        extendedProps: {
          isNationalHoliday: true,
          holidayType: holiday.type,
          holidayName: holiday.name
        }
      };
    });

    // 일정 이벤트와 공휴일 이벤트를 합침
    return [...scheduleEvents, ...holidayEvents];
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
    }).map(schedule => {
      // otherReason에서 산재발생일 추출
      let accidentDate = schedule.date; // 기본값은 방문일
      if (schedule.otherReason) {
        const match = schedule.otherReason.match(/산재발생일:\s*([^/]+)/);
        if (match) {
          const dateStr = match[1].trim();
          // YYYY-MM-DD 형식인지 확인하고 유효한 날짜로 변환
          if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            try {
              const parsedDate = new Date(dateStr);
              if (!isNaN(parsedDate.getTime())) {
                accidentDate = dateStr;
              }
            } catch (e) {
              // 파싱 실패시 기본값 유지
            }
          }
        }
      }
      return { ...schedule, accidentDate };
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
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-8 py-2 sm:py-4">
        <div className="flex flex-col lg:grid lg:grid-cols-7 gap-4 lg:gap-8">
          
          {/* 좌측: 정보 패널 (2/7로 적당한 크기) */}
          <div className="lg:col-span-2 space-y-3 lg:space-y-4">
            
            {/* 담당자 정보 - 모바일에서 첫번째 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 order-1">
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
                <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-3" style={{ fontSize: '13px' }}>
                  <div>
                    <div className="text-gray-600 font-bold">[부서/직급]</div>
                    <div className="text-gray-900">{user?.department || '산업안전팀'} {user?.position || '대리'}</div>
                  </div>
                  <div>
                    <div className="text-gray-600 font-bold">[연락처]</div>
                    <div className="text-gray-900">{user?.phoneNumber || '010-8764-2428'}</div>
                  </div>
                  <div>
                    <div className="text-gray-600 font-bold">[담당자명]</div>
                    <div className="text-gray-900">{user?.name || '강성훈'}</div>
                  </div>
                  <div>
                    <div className="text-gray-600 font-bold">[이메일]</div>
                    <div className="text-gray-900">{user?.email || 'safe08@ssif.or.kr'}</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 오늘의 일정 - 현재시간 포함 - 모바일에서 두번째 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 order-2">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">오늘의 일정</h3>
                <div className="text-sm font-bold text-gray-700">
                  {currentTime}
                </div>
              </div>
              {todaySchedules.length > 0 ? (
                (() => {
                  // 시간별로 정렬
                  const sortedSchedules = [...todaySchedules].sort((a, b) => 
                    a.startTime.localeCompare(b.startTime)
                  );
                  
                  return (
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {sortedSchedules.map((schedule, index) => (
                        <div key={schedule.id} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex justify-between items-start mb-2">
                            <div className="text-xs font-medium text-blue-900">
                              {schedule.startTime} - {schedule.endTime}
                            </div>
                            <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              #{index + 1}
                            </div>
                          </div>
                          <div className="text-xs text-blue-700 mb-1">
                            {schedule.isHoliday ? (
                              <span>🏖️ {schedule.holidayReason}</span>
                            ) : (
                              <span className="font-medium">{schedule.school.name}</span>
                            )}
                          </div>
                          {!schedule.isHoliday && (
                            <div className="text-xs text-blue-600 mb-2">
                              {JSON.parse(schedule.purpose || '[]').join(', ')}
                            </div>
                          )}
                          {!schedule.isHoliday && schedule.travelTime && (
                            <div className="text-xs bg-green-50 border border-green-200 rounded p-2">
                              {/* 첫 번째 학교인 경우 회사/집 두 옵션 표시 */}
                              {index === 0 ? (
                                <div className="space-y-1">
                                  <div className="text-xs font-medium text-green-700 mb-1">🚗 이동시간:</div>
                                  {schedule.travelTime.fromOfficeTime && (
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="text-purple-600">🏢 회사에서</span>
                                      <span className="font-medium">{schedule.travelTime.fromOfficeTime}</span>
                                    </div>
                                  )}
                                  {schedule.travelTime.fromHomeTime && (
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="text-blue-600">🏠 집에서</span>
                                      <span className="font-medium">{schedule.travelTime.fromHomeTime}</span>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                /* 두 번째 이후 학교는 이전 학교에서의 이동시간 */
                                schedule.travelTime.toPreviousTime && (
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-orange-600">🚗 이전 학교에서</span>
                                    <span className="font-medium">{schedule.travelTime.toPreviousTime}</span>
                                  </div>
                                )
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })()
              ) : (
                <p className="text-gray-500 text-center py-4">오늘 일정이 없습니다</p>
              )}
            </div>

            {/* 이번 달 통계 - 3열, 완료된 학교 녹색으로 위에 - 모바일에서 네번째 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 order-4">
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
                    .sort(([a], [b]) => {
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

            {/* 최근 산업재해 발생 학교 - 2열, 날짜-학교명 - 모바일에서 다섯번째 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 order-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <span className="text-red-500">⚠️</span>
                <span>산업재해 발생학교</span>
              </h3>
              {recentAccidentSchedules.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {recentAccidentSchedules.slice(0, 10).map((schedule: any) => (
                    <div key={schedule.id} className="p-2 bg-red-50 rounded-lg border border-red-200">
                      <div className="text-xs text-red-700 font-medium">
                        {schedule.school.abbreviation || schedule.school.name}
                      </div>
                      <div className="text-xs text-red-900 mt-1">
                        발생일: {new Date(schedule.accidentDate).toLocaleDateString('ko-KR').replace(/\./g, '.').replace(/\s/g, '')}
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
            
            {/* 캘린더 - 세로 높이 증가 - 모바일에서 세번째 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 order-3">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">일정 캘린더</h2>
                {selectedDate && (
                  <p className="text-sm text-gray-500 mt-1">선택된 날짜: {selectedDate}</p>
                )}
              </div>
              
              <div className="p-2 sm:p-4" style={{ minHeight: '400px' }}>
                <DynamicScheduleCalendar 
                  events={calendarEvents}
                  onEventClick={handleEventClick}
                  onDateClick={handleDateClick}
                />
              </div>
            </div>

            {/* 메모장 - 한 줄 입력 + 목록 - 모바일에서 여섯번째 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 order-6">
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
      
      {/* 일정 상세 정보 모달 */}
      {showScheduleModal && selectedSchedule && (
        <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg p-4 w-full max-w-sm mx-auto shadow-2xl border-2 border-blue-200">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-semibold text-gray-900">일정 상세</h3>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="text-gray-500 hover:text-gray-700 text-lg"
              >
                ✖️
              </button>
            </div>
            
            <div className="space-y-2">
              {/* 1행: 날짜와 시간 */}
              <div>
                <p className="text-base font-medium text-gray-900">
                  {new Date(selectedSchedule.date).toLocaleDateString('ko-KR')} {selectedSchedule.startTime} - {selectedSchedule.endTime}
                </p>
              </div>
              
              {/* 2행: 학교명과 목적 */}
              <div>
                <p className="text-base font-medium text-gray-900">
                  {selectedSchedule.isHoliday ? (
                    `🏖️ ${selectedSchedule.holidayReason || '휴무'}`
                  ) : (
                    `${selectedSchedule.school.name} - ${JSON.parse(selectedSchedule.purpose || '[]').join(', ')}`
                  )}
                </p>
              </div>
              
              {/* 3행: 세부 사유 (일반 일정인 경우에만) */}
              {!selectedSchedule.isHoliday && selectedSchedule.otherReason && (
                <div>
                  <div className="text-base text-gray-700 space-y-1">
                    {selectedSchedule.otherReason.split(' / ').map((reason, index) => (
                      <div key={index}>
                        <span className="inline-block bg-blue-50 text-blue-700 px-2 py-1 rounded text-sm font-medium">
                          {reason}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="px-3 py-1.5 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 저작권 푸터 */}
      <CopyrightFooter className="mt-8" />
    </div>
  );
}