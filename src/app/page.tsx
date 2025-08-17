'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import FullCalendar from '@fullcalendar/react';
import type { EventContentArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import Link from 'next/link';
import Image from 'next/image';

// --- Helper Functions ---
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
interface Schedule {
  id: string;
  date: string; // ISO string
  schoolId: string;
  school: { name: string; abbreviation?: string | null; }; // Only need name for display
  ampm: string;
  startTime: string;
  endTime: string;
  purpose: string; // JSON stringified array
  otherReason?: string;
}

interface Material {
  id: string;
  filename: string;
  filePath: string;
  uploadedAt: string;
  uploader: string;
  category: string;
  thumbnailPath?: string;
}

// --- Component ---
export default function HomePage() {
  const { data: session } = useSession();
  const router = useRouter();
  
  // 관리자 여부 확인
  const isAdmin = session?.user?.role === 'admin';

  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [latestEduMaterials, setLatestEduMaterials] = useState<Material[]>([]);
  const [latestIndAccidents, setLatestIndAccidents] = useState<Material[]>([]);
  const [todaySchedules, setTodaySchedules] = useState<Schedule[]>([]);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Schedule | null>(null);
  const [monthlyPurposeSummary, setMonthlyPurposeSummary] = useState<Record<string, number>>({});

  const adminInfo = {
    profilePic: '/images/admin_profile.png',
    name: '강성훈',
    title: '산업안전팀 대리',
    phone: '010-8764-2428',
  };

  useEffect(() => {
    fetchSchedules();
    fetchLatestMaterials('교육자료', setLatestEduMaterials);
    fetchLatestMaterials('산업재해', setLatestIndAccidents);

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const filtered = schedules.filter(s => {
      const scheduleDate = new Date(s.date);
      scheduleDate.setHours(0, 0, 0, 0);
      return scheduleDate.getTime() === today.getTime();
    }).sort((a, b) => a.startTime.localeCompare(b.startTime));
    setTodaySchedules(filtered);

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const summary: Record<string, number> = {};

    schedules.forEach(s => {
      const scheduleDate = new Date(s.date);
      if (scheduleDate.getMonth() === currentMonth && scheduleDate.getFullYear() === currentYear) {
        try {
          const purposes = JSON.parse(s.purpose);
          purposes.forEach((p: string) => {
            summary[p] = (summary[p] || 0) + 1;
          });
        } catch (e) {
          console.error("Failed to parse purpose JSON:", s.purpose, e);
        }
      }
    });
    setMonthlyPurposeSummary(summary);

  }, [schedules]);

  const fetchSchedules = async () => {
    const res = await fetch('/api/schedules');
    const data = await res.json();
    setSchedules(data);
  };

  const fetchLatestMaterials = async (category: string, setter: React.Dispatch<React.SetStateAction<Material[]>>) => {
    try {
      const res = await fetch(`/api/materials?category=${category}&limit=5`);
      if (!res.ok) {
        throw new Error(`Failed to fetch materials for category: ${category}`);
      }
      const { data } = await res.json();
      if (Array.isArray(data)) {
        setter(data);
      } else {
        console.error('API did not return an array for materials', data);
        setter([]);
      }
    } catch (error) {
      console.error(error);
      setter([]);
    }
  };

  const handleEventClick = (clickInfo: { event: { id: string } }) => {
    const eventId = clickInfo.event.id;
    const clickedSchedule = schedules.find(s => s.id === eventId);
    if (clickedSchedule) {
      setSelectedEvent(clickedSchedule);
      setShowModal(true);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedEvent(null);
  };

  const calendarEvents = schedules.map(schedule => ({
    id: schedule.id,
    start: `${new Date(schedule.date).toISOString().split('T')[0]}T${schedule.startTime}`,
    end: `${new Date(schedule.date).toISOString().split('T')[0]}T${schedule.endTime}`,
    allDay: false,
    extendedProps: {
      schoolName: schedule.school.name,
      purposes: JSON.parse(schedule.purpose).join(', '),
      schoolAbbreviation: schedule.school.abbreviation, // Pass abbreviation
      ...schedule, // Pass full schedule object for modal
    }
  }));

  const upcomingSchedules = schedules
    .filter(s => new Date(s.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  // 관리자가 아닌 경우 공개 콘텐츠 표시
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-900 via-slate-900 to-blue-900">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative container mx-auto px-6 py-16">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                학교 안전보건
                <span className="block text-blue-300">관리 시스템</span>
              </h1>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                인천광역시 학교안전공제회에서 제공하는 안전보건 교육자료와 산업재해 정보를 확인하세요
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/educational-materials"
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105"
                >
                  교육자료 보기
                </Link>
                <Link
                  href="/industrial-accidents"
                  className="px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:scale-105"
                >
                  산업재해 정보
                </Link>
              </div>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
            <div className="absolute top-10 left-10 w-20 h-20 bg-blue-400/10 rounded-full blur-xl"></div>
            <div className="absolute top-32 right-20 w-32 h-32 bg-white/5 rounded-full blur-xl"></div>
            <div className="absolute bottom-20 left-1/3 w-24 h-24 bg-blue-300/10 rounded-full blur-xl"></div>
          </div>
        </div>

        {/* Content Section */}
        <div className="container mx-auto px-6 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {/* 교육자료 섹션 */}
            <div className="group">
              <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-4">
                    <span className="text-white text-xl font-bold">📚</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">최신 교육자료</h2>
                </div>
                
                {latestEduMaterials.length > 0 ? (
                  <div className="space-y-4">
                    {latestEduMaterials.map((material) => (
                      <div key={material.id} className="group/item p-4 rounded-xl bg-gradient-to-r from-blue-50 to-transparent hover:from-blue-100 hover:shadow-md transition-all duration-300">
                        <a 
                          href={material.filePath} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <h3 className="font-semibold text-gray-800 group-hover/item:text-blue-600 transition-colors mb-2">
                            {material.filename}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {new Date(material.uploadedAt).toLocaleDateString('ko-KR')}
                          </p>
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-4">📄</div>
                    <p>등록된 교육자료가 없습니다.</p>
                  </div>
                )}
                
                <div className="mt-8">
                  <Link 
                    href="/educational-materials" 
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 group"
                  >
                    전체 보기
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>

            {/* 산업재해 섹션 */}
            <div className="group">
              <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mr-4">
                    <span className="text-white text-xl font-bold">⚠️</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">산업재해 정보</h2>
                </div>
                
                {latestIndAccidents.length > 0 ? (
                  <div className="space-y-4">
                    {latestIndAccidents.map((material) => (
                      <div key={material.id} className="group/item p-4 rounded-xl bg-gradient-to-r from-red-50 to-transparent hover:from-red-100 hover:shadow-md transition-all duration-300">
                        <a 
                          href={material.filePath} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <h3 className="font-semibold text-gray-800 group-hover/item:text-red-600 transition-colors mb-2">
                            {material.filename}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {new Date(material.uploadedAt).toLocaleDateString('ko-KR')}
                          </p>
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-4">📋</div>
                    <p>등록된 산업재해 정보가 없습니다.</p>
                  </div>
                )}
                
                <div className="mt-8">
                  <Link 
                    href="/industrial-accidents" 
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-red-500/25 hover:shadow-red-500/40 group"
                  >
                    전체 보기
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* 안내 메시지 */}
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 rounded-2xl p-8 shadow-2xl">
            <div className="relative z-10">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                  <span className="text-white text-lg">🛡️</span>
                </div>
                <h3 className="text-2xl font-bold text-white">학교 안전보건 관리 시스템</h3>
              </div>
              <p className="text-blue-100 text-lg leading-relaxed">
                학교 안전보건과 관련된 최신 교육자료와 산업재해 정보를 제공합니다. 
                안전한 교육 환경 조성을 위해 필요한 자료를 다운로드하여 활용하시기 바랍니다.
              </p>
            </div>
            
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-300/10 rounded-full blur-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  // 관리자용 대시보드
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-800 to-slate-800 bg-clip-text text-transparent mb-2">
            학교안전보건관리
          </h1>
          <p className="text-gray-600 text-lg">관리자 대시보드</p>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/20 flex flex-col">
          <div className="flex flex-col items-center pb-4 border-b border-gray-200 mb-4">
            <Image src={adminInfo.profilePic} alt="Admin Profile" width={96} height={96} className="rounded-full object-cover mb-4 border-2 border-blue-500" />
            <h2 className="text-xl font-semibold text-gray-800">{adminInfo.name}</h2>
            <p className="text-gray-600">{adminInfo.title}</p>
            <p className="text-gray-600">{adminInfo.phone}</p>
          </div>

          <div className="flex flex-col">
            <div className="pb-4 border-b border-gray-200 mb-4">
              <h3 className="text-lg font-bold mb-2 text-blue-700 flex justify-between items-center">
                <span>오늘의 방문 일정</span>
                <span className="text-sm text-gray-600">{currentTime.toLocaleDateString()} {currentTime.toLocaleTimeString()}</span>
              </h3>
              {todaySchedules.length === 0 ? (
                <p className="text-gray-500 text-sm">오늘 예정된 일정이 없습니다.</p>
              ) : (
                <ul>
                  {todaySchedules.map(schedule => (
                    <li key={schedule.id} className="mb-1 text-sm text-gray-700">
                      <span className="font-medium">{schedule.startTime} ~ {schedule.endTime}</span> - {schedule.school.abbreviation || schedule.school.name} ({JSON.parse(schedule.purpose).join(', ')})
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <h3 className="text-lg font-bold mb-2 text-blue-700">{new Date().getMonth() + 1}월 등록 일정수</h3>
              {Object.keys(monthlyPurposeSummary).length === 0 ? (
                <p className="text-gray-500 text-sm">이번 달 등록된 일정이 없습니다.</p>
              ) : (
                <ul>
                  {Object.entries(monthlyPurposeSummary).map(([purpose, count]) => (
                    <li key={purpose} className="mb-1 text-sm text-gray-700">
                      <span className="font-medium">{purpose}</span> - {count}건
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/20">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
            events={calendarEvents}
            locale="ko"
            height="auto"
            weekends={false}
            slotMinTime="08:00:00"
            slotMaxTime="17:30:00"
            eventClick={handleEventClick}
            eventContent={renderEventContent}
          />
        </div>

        {showModal && selectedEvent && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-gray-200 p-6 rounded-lg shadow-xl w-96 border border-black">
              <h2 className="text-xl font-bold mb-4 text-blue-700">일정 상세</h2>
              <p className="mb-2"><strong>학교명:</strong> {selectedEvent.school.name}</p>
              <p className="mb-2"><strong>날짜:</strong> {new Date(selectedEvent.date).toLocaleDateString()}</p>
              <p className="mb-2"><strong>시간:</strong> {selectedEvent.startTime} ~ {selectedEvent.endTime} ({selectedEvent.ampm})</p>
              <p className="mb-2"><strong>방문 목적:</strong> {JSON.parse(selectedEvent.purpose).join(', ')}</p>
              {selectedEvent.otherReason && <p className="mb-4"><strong>기타 사유:</strong> {selectedEvent.otherReason}</p>}
              <button onClick={closeModal} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md w-full">닫기</button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-300">
          <h2 className="text-xl font-bold mb-4 text-blue-700">미완료 업무 (가장 가까운 5개)</h2>
          {upcomingSchedules.length === 0 ? (
            <p className="text-gray-500">예정된 일정이 없습니다.</p>
          ) : (
            <ul>
              {upcomingSchedules.map(schedule => (
                <li key={schedule.id} className="mb-2 pb-2 border-b border-gray-200 last:border-b-0">
                  <p className="font-medium text-gray-800">{new Date(schedule.date).toLocaleDateString()} - {schedule.school.abbreviation || schedule.school.name}</p>
                  <p className="text-sm text-gray-600">{JSON.parse(schedule.purpose).join(', ')} ({schedule.startTime} ~ {schedule.endTime})</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-300">
          <h2 className="text-xl font-bold mb-4 text-blue-700">최신 교육자료 (5개)</h2>
          {latestEduMaterials.length === 0 ? (
            <p className="text-gray-500">등록된 교육자료가 없습니다.</p>
          ) : (
            <ul>
              {latestEduMaterials.map(material => (
                <li key={material.id} className="mb-2 pb-2 border-b border-gray-200 last:border-b-0 flex items-center">
                  {material.thumbnailPath && <Image src={material.thumbnailPath} alt={material.filename} width={40} height={40} className="object-cover mr-3 rounded" />}
                  <div>
                    <Link href={material.filePath} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline">{material.filename}</Link>
                    <p className="text-sm text-gray-600">{new Date(material.uploadedAt).toLocaleDateString()}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-300">
          <h2 className="text-xl font-bold mb-4 text-blue-700">최신 산업재해 정보 (5개)</h2>
          {latestIndAccidents.length === 0 ? (
            <p className="text-gray-500">등록된 산업재해 정보가 없습니다.</p>
          ) : (
            <ul>
              {latestIndAccidents.map(material => (
                <li key={material.id} className="mb-2 pb-2 border-b border-gray-200 last:border-b-0 flex items-center">
                  {material.thumbnailPath && <Image src={material.thumbnailPath} alt={material.filename} width={40} height={40} className="object-cover mr-3 rounded" />}
                  <div>
                    <Link href={material.filePath} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline">{material.filename}</Link>
                    <p className="text-sm text-gray-600">{new Date(material.uploadedAt).toLocaleDateString()}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}