'use client';

import { useState, useEffect, FormEvent, useMemo } from 'react';
import { useAuth } from '@/lib/simpleAuth';
import { useRouter } from 'next/navigation';
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
}

const ALL_PURPOSES = ['월점검', '위험성평가', '근골조사', '산업재해', '교육', '기타'];

// --- Component ---
export default function SchedulesPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  // 관리자가 아닌 경우 교육자료 페이지로 리다이렉트
  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/educational-materials');
    }
  }, [user, router]);

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

  const timeOptions = useMemo(() => generateTimeOptions(), []);

  const filteredTimeOptions = useMemo(() => {
    // 오전/오후 관계없이 모든 시간을 표시 (08:00 ~ 17:30)
    return timeOptions;
  }, [timeOptions]);

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
      const res = await fetch('/api/schedules');
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
      const res = await fetch('/api/schools');
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
    const currentPurposes = formData.getAll('purpose') as string[];
    let otherReason = formData.get('otherReason') as string;

    if (!currentPurposes.includes('교육') && !currentPurposes.includes('기타')) {
      otherReason = '';
    }
    
    const scheduleData = {
      id: editingSchedule?.id,
      schoolId: formData.get('schoolId') as string,
      date: formData.get('date') as string,
      ampm,
      startTime,
      endTime,
      purpose: JSON.stringify(currentPurposes),
      otherReason: otherReason,
    };

    const url = '/api/schedules';
    const method = editingSchedule ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(scheduleData) });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to save schedule');
      fetchSchedules();
      handleCancelEdit();
    } catch (err) {
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
    const schedule = schedules.find(s => s.id === clickInfo.event.id);
    if (schedule) {
      setEditingSchedule(schedule);
      setSelectedDate(new Date(schedule.date).toISOString().split('T')[0]);
    }
  };
  
  const handleDelete = async (id: string) => {
    if (!confirm('정말로 이 일정을 삭제하시겠습니까?')) return;
    try {
      const res = await fetch('/api/schedules', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
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
  }

  const handlePurposeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setSelectedPurposes(prev => checked ? [...prev, value] : prev.filter(p => p !== value));
  };

  const calendarEvents = schedules.map(schedule => ({
    id: schedule.id,
    start: `${new Date(schedule.date).toISOString().split('T')[0]}T${schedule.startTime}`,
    end: `${new Date(schedule.date).toISOString().split('T')[0]}T${schedule.endTime}`,
    allDay: false,
    extendedProps: {
      schoolName: schedule.school.name,
      purposes: JSON.parse(schedule.purpose).join(', '),
      startTime: schedule.startTime,
      schoolAbbreviation: schedule.school.abbreviation, // Pass abbreviation
    }
  }));

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
                            <label htmlFor="schoolId" className="block text-gray-700 text-sm font-bold mb-2">학교</label>
                            <select name="schoolId" id="schoolId" key={editingSchedule?.id} defaultValue={editingSchedule?.schoolId || ''} className="shadow border rounded w-full py-2 px-3" required>
                                <option value="" disabled>학교를 선택하세요</option>
                                {schools.map(school => <option key={school.id} value={school.id}>{school.name}</option>)}
                            </select>
                        </div>
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
                                    {timeOptions.filter(time => time >= '10:00' && time <= '17:00').map(time => <option key={time} value={time}>{time}</option>)}
                                </select>
                            </div>
                        </div>
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
                        {(selectedPurposes.includes('교육') || selectedPurposes.includes('기타')) && (
                            <div>
                                <label htmlFor="otherReason" className="block text-gray-700 text-sm font-bold mb-2">교육 내용 / 기타 사유</label>
                                <input type="text" name="otherReason" id="otherReason" key={editingSchedule?.id} defaultValue={editingSchedule?.otherReason || ''} className="shadow appearance-none border rounded w-full py-2 px-3" autoComplete="off" />
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col sm:flex-row items-center justify-between mt-8 space-y-3 sm:space-y-0">
                        {editingSchedule && (
                          <button 
                            type="button" 
                            onClick={() => handleDelete(editingSchedule.id)} 
                            className="w-full sm:w-auto bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                          >
                            🗑️ 삭제
                          </button>
                        )}
                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                          <button 
                            type="button" 
                            onClick={handleCancelEdit} 
                            className="w-full sm:w-auto bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                          >
                            ✕ 취소
                          </button>
                          <button 
                            type="submit" 
                            className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                          >
                            {editingSchedule ? '✏️ 수정하기' : '💾 저장하기'}
                          </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
      </div>
    </div>
  );
}