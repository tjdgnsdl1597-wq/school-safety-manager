'use client';

import { useState, useEffect, FormEvent, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import type { EventContentArg } from '@fullcalendar/core';

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

function renderEventContent(eventInfo: EventContentArg) {
  const { schoolName, purposes, startTime, schoolAbbreviation } = eventInfo.event.extendedProps;

  const [hour, minute] = startTime.split(':').map(Number);
  const ampm = hour < 12 ? '오전' : '오후';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  const timeString = `${ampm} ${displayHour}` + (minute > 0 ? `:${String(minute).padStart(2, '0')}` : '') + '시';
  
  const schoolDisplayName = schoolAbbreviation || schoolName;
  const detailsString = `[${schoolDisplayName}] - ${purposes}`;

  return (
    <div className="fc-event-custom-view">
      <div className="fc-event-time">{timeString}</div>
      <div className="fc-event-details">{detailsString}</div>
    </div>
  );
}

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
  const { data: session } = useSession();
  const router = useRouter();
  
  // 관리자가 아닌 경우 교육자료 페이지로 리다이렉트
  useEffect(() => {
    if (session && session.user?.role !== 'admin') {
      router.push('/educational-materials');
    }
  }, [session, router]);

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
    if (ampm === 'AM') {
      return timeOptions.filter(t => t < '12:00');
    }
    return timeOptions.filter(t => t >= '12:00');
  }, [ampm, timeOptions]);

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
    <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold text-blue-800 mb-6">일정 관리</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                <FullCalendar 
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]} 
                    initialView="dayGridMonth" 
                    headerToolbar={{left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek'}} 
                    events={calendarEvents} 
                    locale="ko" 
                    height="auto" 
                    weekends={false} 
                    dateClick={handleDateClick} 
                    eventClick={handleEventClick} 
                    slotMinTime="08:00:00" 
                    slotMaxTime="17:30:00"
                    eventContent={renderEventContent}
                />
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-4">{editingSchedule ? '일정 수정' : '새 일정 추가'}</h2>
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
                                    {filteredTimeOptions.map(time => <option key={time} value={time}>{time}</option>)}
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
                    <div className="flex items-center justify-end mt-6">
                        {editingSchedule && <button type="button" onClick={() => handleDelete(editingSchedule.id)} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded mr-auto">삭제</button>}
                        <button type="button" onClick={handleCancelEdit} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded mr-2">취소</button>
                        <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">{editingSchedule ? '수정하기' : '저장하기'}</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
  );
}