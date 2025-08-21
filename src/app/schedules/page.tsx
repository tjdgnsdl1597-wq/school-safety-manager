'use client';

import { useState, useEffect, FormEvent, useMemo } from 'react';
import { useAuth } from '@/lib/simpleAuth';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import CopyrightFooter from '@/components/CopyrightFooter';
import type { DateClickArg } from '@fullcalendar/interaction';
import { getAllHolidays } from '@/lib/holidays';

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
  abbreviation?: string | null; // Added abbreviation
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

const ALL_PURPOSES = ['월점검', '위험성평가', '근골조사', '산업재해', '교육', '기타'];

// --- Component ---
export default function SchedulesPage() {
  const { user } = useAuth();
  const router = useRouter();
  

  // --- State ---
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedPurposes, setSelectedPurposes] = useState<string[]>([]);
  const [ampm, setAmpm] = useState('AM');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [isHoliday, setIsHoliday] = useState(false);
  const [holidayReason, setHolidayReason] = useState('');

  const timeOptions = useMemo(() => generateTimeOptions(), []);

  const filteredTimeOptions = useMemo(() => {
    // 오전/오후에 따라 시간 필터링
    if (ampm === 'AM') {
      // 오전: 08:00 ~ 11:30
      return timeOptions.filter(time => {
        const hour = parseInt(time.split(':')[0]);
        return hour >= 8 && hour < 12;
      });
    } else {
      // 오후: 12:00 ~ 17:30
      return timeOptions.filter(time => {
        const hour = parseInt(time.split(':')[0]);
        return hour >= 12 && hour <= 17;
      });
    }
  }, [timeOptions, ampm]);
  
  // 종료시간 옵션 (오전/오후에 따라 다름)
  const endTimeOptions = useMemo(() => {
    if (ampm === 'AM') {
      // 오전 선택 시: 10:00 ~ 17:30
      return timeOptions.filter(time => {
        const hour = parseInt(time.split(':')[0]);
        return hour >= 10 && hour <= 17;
      });
    } else {
      // 오후 선택 시: 12:00 ~ 17:30
      return timeOptions.filter(time => {
        const hour = parseInt(time.split(':')[0]);
        return hour >= 12 && hour <= 17;
      });
    }
  }, [timeOptions, ampm]);

  // --- Effects ---
  useEffect(() => {
    fetchSchedules();
    fetchSchools();
  }, []);

  useEffect(() => {
    if (editingSchedule) {
      try {
        setSelectedPurposes(JSON.parse(editingSchedule.purpose));
        setAmpm(editingSchedule.ampm);
        setStartTime(editingSchedule.startTime);
        setEndTime(editingSchedule.endTime);
        setIsHoliday(editingSchedule.isHoliday || false);
        setHolidayReason(editingSchedule.holidayReason || '');
      } catch {
        setSelectedPurposes([]);
      }
    } else {
      handleCancelEdit();
    }
  }, [editingSchedule]);

  // --- Data Fetching ---
  const fetchSchedules = async () => {
    setIsLoading(true);
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      if (user) {
        headers['x-user-id'] = user.id;
        headers['x-user-role'] = user.role;
      }
      
      const res = await fetch(`/api/schedules?t=${Date.now()}`, { 
        headers,
        cache: 'no-store'
      });
      if (!res.ok) throw new Error('Failed to fetch schedules');
      const data = await res.json();
      setSchedules(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSchools = async () => {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      if (user) {
        headers['x-user-id'] = user.id;
        headers['x-user-role'] = user.role;
      }
      
      const res = await fetch(`/api/schools?t=${Date.now()}`, { 
        headers,
        cache: 'no-store'
      });
      if (!res.ok) throw new Error('Failed to fetch schools');
      const data = await res.json();
      setSchools(data);
    } catch (err) {
      console.error("Failed to fetch schools:", err);
    }
  };

  // --- Event Handlers ---
  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    let scheduleData;
    
    if (isHoliday) {
      // 휴무일정인 경우 - schoolId와 purpose는 필요없음
      scheduleData = {
        id: editingSchedule?.id,
        schoolId: schools[0]?.id || '', // 임시로 첫 번째 학교 ID 사용 (API에서는 무시됨)
        date: formData.get('date') as string,
        ampm,
        startTime,
        endTime,
        purpose: '[]', // 빈 배열
        otherReason: '',
        isHoliday,
        holidayReason,
      };
    } else {
      // 일반 일정인 경우
      const currentPurposes = formData.getAll('purpose') as string[];
      
      // 각각의 사유를 수집하여 하나의 문자열로 합침
      const reasons = [];
      if (currentPurposes.includes('교육')) {
        const educationReason = formData.get('educationReason') as string;
        if (educationReason?.trim()) {
          reasons.push(`교육: ${educationReason.trim()}`);
        }
      }
      if (currentPurposes.includes('산업재해')) {
        const accidentDate = formData.get('accidentDate') as string;
        if (accidentDate?.trim()) {
          reasons.push(`산재발생일: ${accidentDate.trim()}`);
        }
      }
      if (currentPurposes.includes('기타')) {
        const otherReasonValue = formData.get('otherReason') as string;
        if (otherReasonValue?.trim()) {
          reasons.push(`기타: ${otherReasonValue.trim()}`);
        }
      }
      
      const otherReason = reasons.join(' / ');
      
      scheduleData = {
        id: editingSchedule?.id,
        schoolId: formData.get('schoolId') as string,
        date: formData.get('date') as string,
        ampm,
        startTime,
        endTime,
        purpose: JSON.stringify(currentPurposes),
        otherReason: otherReason,
        isHoliday,
        holidayReason: '',
      };
    }

    const url = '/api/schedules';
    const method = editingSchedule ? 'PUT' : 'POST';

    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      if (user) {
        headers['x-user-id'] = user.id;
        headers['x-user-role'] = user.role;
      }
      
      console.log('Frontend - Sending schedule data:', JSON.stringify(scheduleData, null, 2));
      console.log('Frontend - Request details:', { url, method, headers: Object.keys(headers) });
      
      const res = await fetch(url, { method, headers, body: JSON.stringify(scheduleData) });
      
      console.log('Frontend - Response status:', res.status);
      const responseData = await res.json();
      console.log('Frontend - Response data:', responseData);
      
      if (!res.ok) {
        const errorMsg = responseData.error || 'Failed to save schedule';
        const details = responseData.details ? ` (Details: ${responseData.details})` : '';
        const code = responseData.code ? ` [Code: ${responseData.code}]` : '';
        throw new Error(errorMsg + details + code);
      }
      
      fetchSchedules();
      handleCancelEdit();
    } catch (err) {
      console.error('Frontend - Save error:', err);
      alert('저장 실패: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const handleAmpmChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newAmpm = e.target.value;
    setAmpm(newAmpm);
    if (newAmpm === 'AM') {
      setStartTime('09:00');
      setEndTime('10:00');
    } else {
      setStartTime('13:00');
      setEndTime('14:00');
    }
  };

  const handleStartTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStartTime = e.target.value;
    setStartTime(newStartTime);

    const startIndex = filteredTimeOptions.indexOf(newStartTime);
    if (startIndex !== -1) {
      const endIndex = Math.min(startIndex + 2, filteredTimeOptions.length - 1);
      setEndTime(filteredTimeOptions[endIndex]);
    }
  };

  const handleDateClick = (arg: DateClickArg) => {
    setSelectedDate(arg.dateStr);
    handleCancelEdit();
  };

  const handleEventClick = (clickInfo: { event: { id: string } }) => {
    const eventId = clickInfo.event.id;
    
    // 국가공휴일은 편집하지 않음
    if (eventId.startsWith('holiday-')) {
      alert('국가공휴일은 편집할 수 없습니다.');
      return;
    }
    
    const schedule = schedules.find(s => s.id === eventId);
    if (schedule) {
      setEditingSchedule(schedule);
      setSelectedDate(new Date(schedule.date).toISOString().split('T')[0]);
    }
  };
  
  const handleDelete = async (id: string) => {
    if (!confirm('정말로 이 일정을 삭제하시겠습니까?')) return;
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      if (user) {
        headers['x-user-id'] = user.id;
        headers['x-user-role'] = user.role;
      }
      
      const res = await fetch('/api/schedules', { method: 'DELETE', headers, body: JSON.stringify({ id }) });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to delete schedule');
      fetchSchedules();
      handleCancelEdit();
    } catch (err) {
      alert('삭제 실패: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const handleCancelEdit = () => {
    setEditingSchedule(null);
    const form = document.getElementById('schedule-form') as HTMLFormElement;
    if (form) form.reset();
    setAmpm('AM');
    setStartTime('09:00');
    setEndTime('10:00');
    setSelectedPurposes([]);
    setIsHoliday(false);
    setHolidayReason('');
  }

  const handlePurposeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setSelectedPurposes(prev => checked ? [...prev, value] : prev.filter(p => p !== value));
  };

  // 일정 이벤트들
  const scheduleEvents = schedules.map(schedule => {
    let title;
    if (schedule.isHoliday) {
      // 휴무일정인 경우: 휴무 사유만 표시
      title = `🏖️ ${schedule.holidayReason || '휴무'}`;
    } else {
      // 일반 일정인 경우: 학교명과 목적 표시
      const schoolDisplayName = schedule.school.abbreviation || schedule.school.name;
      title = `[${schoolDisplayName}] ${JSON.parse(schedule.purpose).join(', ')}`;
    }

    return {
      id: schedule.id,
      title: title,
      start: `${new Date(schedule.date).toISOString().split('T')[0]}T${schedule.startTime}`,
      end: `${new Date(schedule.date).toISOString().split('T')[0]}T${schedule.endTime}`,
      allDay: false,
      className: schedule.isHoliday ? 'fc-holiday-event' : 'fc-custom-event',
      extendedProps: {
        schoolName: schedule.school?.name || '',
        purposes: schedule.isHoliday ? schedule.holidayReason || '휴무' : JSON.parse(schedule.purpose).join(', '),
        startTime: schedule.startTime,
        schoolAbbreviation: schedule.school?.abbreviation || '', // Pass abbreviation
        isHoliday: schedule.isHoliday,
      }
    };
  });

  // 국가공휴일 이벤트들 (2025년)
  const holidayEvents = getAllHolidays().map((holiday) => {
    return {
      id: `holiday-${holiday.date}`,
      title: holiday.name, // 공휴일 이름만 표시 (이모지 제거)
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
  const calendarEvents = [...scheduleEvents, ...holidayEvents];

  // --- Render ---
  if (isLoading) return <div className="text-center p-8">로딩 중...</div>;
  if (error) return <div className="text-center p-8 text-red-500">오류: {error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto p-4 max-w-7xl">
        <div className="flex items-center space-x-3 mb-8">
          <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
            <span className="text-2xl text-white">📅</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            일정 관리
          </h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm p-4 sm:p-6 rounded-xl shadow-xl border border-white/20">
                <DynamicScheduleCalendar
                    key={`calendar-${schedules.length}-${JSON.stringify(calendarEvents).slice(0, 100)}`}
                    events={calendarEvents}
                    onEventClick={handleEventClick}
                    onDateClick={handleDateClick}
                />
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-white/20">
                <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center space-x-2">
                  <span>{editingSchedule ? '✏️' : '📝'}</span>
                  <span>{editingSchedule ? '일정 수정' : '새 일정 추가'}</span>
                </h2>
                <form id="schedule-form" onSubmit={handleFormSubmit}>
                    <div className="space-y-4">
                        <div>
                            <div className="p-3 bg-yellow-50 border-2 border-yellow-300 rounded-lg mb-4">
                                <label className="flex items-center space-x-3 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={isHoliday} 
                                        onChange={e => setIsHoliday(e.target.checked)}
                                        className="w-5 h-5 text-yellow-500 border-yellow-300 rounded focus:ring-yellow-500 focus:ring-2"
                                    />
                                    <span className="text-yellow-800 text-base font-bold flex items-center space-x-2">
                                        <span>🏖️</span>
                                        <span>휴무일정</span>
                                    </span>
                                </label>
                            </div>
                        </div>
                        {!isHoliday && (
                            <div>
                                <label htmlFor="schoolId" className="block text-gray-700 text-sm font-bold mb-2">학교</label>
                                <select name="schoolId" id="schoolId" key={editingSchedule?.id} defaultValue={editingSchedule?.schoolId || ''} className="shadow border rounded w-full py-2 px-3" required>
                                    <option value="" disabled>학교를 선택하세요</option>
                                    {schools.map(school => <option key={school.id} value={school.id}>{school.name}</option>)}
                                </select>
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="date" className="block text-gray-700 text-sm font-bold mb-2">날짜</label>
                                <input type="date" name="date" id="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3" required />
                            </div>
                            <div>
                                <label htmlFor="ampm" className="block text-gray-700 text-sm font-bold mb-2">오전/오후</label>
                                <select name="ampm" id="ampm" value={ampm} onChange={handleAmpmChange} className="shadow border rounded w-full py-2 px-3" required>
                                    <option value="AM">오전</option>
                                    <option value="PM">오후</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="startTime" className="block text-gray-700 text-sm font-bold mb-2">시작 시간</label>
                                <select name="startTime" id="startTime" value={startTime} onChange={handleStartTimeChange} className="shadow appearance-none border rounded w-full py-2 px-3" required>
                                    {filteredTimeOptions.map(time => <option key={time} value={time}>{time}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="endTime" className="block text-gray-700 text-sm font-bold mb-2">종료 시간</label>
                                <select name="endTime" id="endTime" value={endTime} onChange={e => setEndTime(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3" required>
                                    {endTimeOptions.map(time => <option key={time} value={time}>{time}</option>)}
                                </select>
                            </div>
                        </div>
                        {!isHoliday && (
                            <>
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">방문 목적</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {ALL_PURPOSES.map(p => (
                                        <label key={p} className="flex items-center">
                                            <input type="checkbox" name="purpose" value={p} checked={selectedPurposes.includes(p)} onChange={handlePurposeChange} className="mr-2" />
                                            {p}
                                        </label>
                                        ))}
                                    </div>
                                </div>
                                {selectedPurposes.includes('교육') && (
                                    <div>
                                        <label htmlFor="educationReason" className="block text-gray-700 text-sm font-bold mb-2">교육 내용을 적어주세요</label>
                                        <input 
                                            type="text" 
                                            name="educationReason" 
                                            id="educationReason" 
                                            key={`edu-${editingSchedule?.id}`} 
                                            defaultValue={(() => {
                                                if (!editingSchedule?.otherReason) return '';
                                                const match = editingSchedule.otherReason.match(/교육:\s*([^/]+)/);
                                                return match ? match[1].trim() : '';
                                            })()} 
                                            className="shadow appearance-none border rounded w-full py-2 px-3 mb-4" 
                                            autoComplete="off" 
                                        />
                                    </div>
                                )}
                                {selectedPurposes.includes('산업재해') && (
                                    <div>
                                        <label htmlFor="accidentDate" className="block text-gray-700 text-sm font-bold mb-2">산재 발생일을 선택해주세요</label>
                                        <input 
                                            type="date" 
                                            name="accidentDate" 
                                            id="accidentDate" 
                                            key={`acc-${editingSchedule?.id}`} 
                                            defaultValue={(() => {
                                                if (!editingSchedule?.otherReason) return '';
                                                const match = editingSchedule.otherReason.match(/산재발생일:\s*([^/]+)/);
                                                if (match) {
                                                    const dateStr = match[1].trim();
                                                    // 기존 데이터가 날짜 형식이 아닌 경우 빈 값 반환
                                                    try {
                                                        // YYYY-MM-DD 형식인지 확인
                                                        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
                                                            return dateStr;
                                                        }
                                                        // 다른 형식이면 빈 값 반환
                                                        return '';
                                                    } catch {
                                                        return '';
                                                    }
                                                }
                                                return '';
                                            })()} 
                                            className="shadow appearance-none border rounded w-full py-2 px-3 mb-4" 
                                            autoComplete="off" 
                                        />
                                    </div>
                                )}
                                {selectedPurposes.includes('기타') && (
                                    <div>
                                        <label htmlFor="otherReason" className="block text-gray-700 text-sm font-bold mb-2">기타 사유를 적어주세요</label>
                                        <input 
                                            type="text" 
                                            name="otherReason" 
                                            id="otherReason" 
                                            key={`other-${editingSchedule?.id}`} 
                                            defaultValue={(() => {
                                                if (!editingSchedule?.otherReason) return '';
                                                const match = editingSchedule.otherReason.match(/기타:\s*([^/]+)/);
                                                return match ? match[1].trim() : '';
                                            })()} 
                                            className="shadow appearance-none border rounded w-full py-2 px-3 mb-4" 
                                            autoComplete="off" 
                                        />
                                    </div>
                                )}
                            </>
                        )}
                        {isHoliday && (
                            <div>
                                <label htmlFor="holidayReason" className="block text-gray-700 text-sm font-bold mb-2">휴무 사유</label>
                                <input 
                                    type="text" 
                                    id="holidayReason" 
                                    value={holidayReason} 
                                    onChange={e => setHolidayReason(e.target.value)}
                                    className="shadow appearance-none border rounded w-full py-2 px-3" 
                                    placeholder="휴무 사유를 입력하세요" 
                                    autoComplete="off" 
                                    required
                                />
                            </div>
                        )}
                    </div>
                    <div className="flex flex-wrap items-center justify-between mt-6 gap-2">
                        {editingSchedule && (
                          <button 
                            type="button" 
                            onClick={() => handleDelete(editingSchedule.id)} 
                            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg text-sm"
                          >
                            🗑️ 삭제
                          </button>
                        )}
                        <div className="flex gap-2 ml-auto">
                          <button 
                            type="button" 
                            onClick={handleCancelEdit} 
                            className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg text-sm"
                          >
                            ✕ 취소
                          </button>
                          <button 
                            type="submit" 
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl text-sm"
                          >
                            {editingSchedule ? '✏️ 수정' : '💾 저장'}
                          </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
      </div>
      
      {/* 저작권 푸터 */}
      <CopyrightFooter className="mt-8" />
    </div>
  );
}