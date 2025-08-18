'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/simpleAuth';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';

// Dynamically import ScheduleCalendarComponent to prevent SSR issues
const ScheduleCalendarComponent = dynamic(() => import('../components/ScheduleCalendarComponent'), {
  ssr: false,
  loading: () => (
    <div className="h-96 flex items-center justify-center text-gray-500 bg-gray-100 rounded-lg animate-pulse">
      <div className="text-center">
        <div className="text-4xl mb-4">📅</div>
        <p>캘린더 로딩 중...</p>
      </div>
    </div>
  )
});

// --- Helper Functions ---
function safeParsePurpose(purpose: string): string[] {
  try {
    if (!purpose) return [];
    const parsed = JSON.parse(purpose);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('Failed to parse purpose JSON:', purpose);
    return [];
  }
}

function safeUrl(url: string | null | undefined): string {
  if (!url || typeof url !== 'string') {
    return '#';
  }
  try {
    // Check if it's a valid URL or path
    if (url.startsWith('http') || url.startsWith('/')) {
      return url;
    }
    return '#';
  } catch (e) {
    console.warn('Invalid URL:', url);
    return '#';
  }
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
  const { user } = useAuth();
  
  // 관리자 여부 확인
  const isAdmin = user?.role === 'admin';

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
        const purposes = safeParsePurpose(s.purpose);
        purposes.forEach((p: string) => {
          summary[p] = (summary[p] || 0) + 1;
        });
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
    try {
      const eventId = clickInfo.event.id;
      const clickedSchedule = schedules.find(s => s.id === eventId);
      if (clickedSchedule) {
        setSelectedEvent(clickedSchedule);
        setShowModal(true);
      }
    } catch (error) {
      console.warn('Error handling event click:', error);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedEvent(null);
  };

  const safeCreateCalendarEvents = (schedules: Schedule[]) => {
    try {
      return schedules
        .filter(schedule => schedule && schedule.id && schedule.date && schedule.startTime && schedule.endTime)
        .map(schedule => ({
          id: schedule.id,
          start: `${new Date(schedule.date).toISOString().split('T')[0]}T${schedule.startTime}`,
          end: `${new Date(schedule.date).toISOString().split('T')[0]}T${schedule.endTime}`,
          allDay: false,
          extendedProps: {
            schoolName: schedule.school?.name || '알 수 없는 학교',
            purposes: safeParsePurpose(schedule.purpose).join(', '),
            schoolAbbreviation: schedule.school?.abbreviation,
            ...schedule,
          }
        }));
    } catch (error) {
      console.warn('Error creating calendar events:', error);
      return [];
    }
  };

  const calendarEvents = safeCreateCalendarEvents(schedules);

  const upcomingSchedules = schedules
    .filter(s => new Date(s.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  // 관리자가 아닌 경우 학교안전보건 콘텐츠 표시
  if (!isAdmin) {
    // 학교안전보건 페이지 내용을 직접 렌더링
    const SchoolSafetyContent = () => {
      
      // Personal Introduction Section Component
      const PersonalIntroSection = () => (
        <section className="relative py-12 md:py-16 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-10 right-10 w-48 h-48 bg-blue-200/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-10 left-10 w-64 h-64 bg-indigo-200/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>

          <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">담당자 소개</h2>
              <p className="text-lg text-gray-600">학교 안전보건 전담 컨설턴트</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-6xl mx-auto"
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-500">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 md:gap-12 items-start">
                  
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="text-center lg:text-left"
                  >
                    <div className="relative inline-block">
                      <div className="w-48 h-64 md:w-56 md:h-72 rounded-3xl overflow-hidden shadow-2xl ring-4 ring-blue-500/20">
                        <Image
                          src="/images/admin_profile.png"
                          alt="강성훈 대리 프로필"
                          fill
                          className="object-cover object-center rounded-3xl"
                        />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white animate-pulse"></div>
                    </div>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="lg:col-span-3 text-center lg:text-left"
                  >
                    <div className="mb-8">
                      <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">강성훈</h3>
                      <p className="text-xl md:text-2xl text-blue-600 font-semibold mb-6">인천광역시학교안전공제회 산업안전팀 대리</p>
                      
                      <div className="p-6 md:p-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border-l-4 border-blue-500 mb-8">
                        <p className="text-gray-800 text-lg md:text-xl leading-relaxed font-medium">
                          현업근로자와 교직원의 안전을 현장의 목소리와 표준 절차로 지키는 것이 저의 일입니다.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                        <div className="flex items-center justify-center lg:justify-start space-x-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                          <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center shadow-lg">
                            <span className="text-white text-lg">📞</span>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">연락처</p>
                            <p className="text-gray-900 font-bold text-lg">010-8764-2428</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-center lg:justify-start space-x-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                            <span className="text-white text-lg">✉️</span>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">이메일</p>
                            <p className="text-gray-900 font-bold text-lg">safe08@ssif.or.kr</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                <div className="mt-6 p-4 bg-yellow-50 rounded-xl border-l-4 border-yellow-400">
                  <div className="text-sm text-gray-700 text-center">
                    <p><strong>기본 응대:</strong> 평일 08:30–17:00</p>
                    <p><strong>긴급 상황:</strong> 즉시 연락 바랍니다</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      );

      // Quick Menu Section for Materials
      const QuickMenuSection = () => (
        <section className="py-16 bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">안전자료 바로가기</h2>
              <p className="text-xl text-gray-600">필요한 안전보건 자료를 쉽고 빠르게 찾아보세요</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Link href="/educational-materials" className="group">
                <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-500 hover:scale-105">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                      <span className="text-white text-3xl">📚</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">교육 자료</h3>
                    <p className="text-gray-600 leading-relaxed">안전보건 교육에 필요한 다양한 자료와 매뉴얼을 확인하실 수 있습니다.</p>
                  </div>
                </div>
              </Link>
              
              <Link href="/industrial-accidents" className="group">
                <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-500 hover:scale-105">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                      <span className="text-white text-3xl">⚠️</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">중대재해 알리미</h3>
                    <p className="text-gray-600 leading-relaxed">학교 현장에서 발생할 수 있는 중대재해 예방을 위한 사례와 정보를 제공합니다.</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>
      );

      return (
        <div className="min-h-screen">
          <PersonalIntroSection />
          <QuickMenuSection />
        </div>
      );
    };

    return <SchoolSafetyContent />;
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
                      <span className="font-medium">{schedule.startTime} ~ {schedule.endTime}</span> - {schedule.school.abbreviation || schedule.school.name} ({safeParsePurpose(schedule.purpose).join(', ')})
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

        <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm p-4 sm:p-8 rounded-2xl shadow-xl border border-white/20">
          <ScheduleCalendarComponent 
            events={calendarEvents}
            onEventClick={handleEventClick}
            onDateClick={() => {}} // Empty handler for main page
          />
        </div>

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
                  <p className="text-sm text-gray-600">{safeParsePurpose(schedule.purpose).join(', ')} ({schedule.startTime} ~ {schedule.endTime})</p>
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
                    <Link href={safeUrl(material.filePath)} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline">{material.filename}</Link>
                    <p className="text-sm text-gray-600">{new Date(material.uploadedAt).toLocaleDateString()}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-300">
          <h2 className="text-xl font-bold mb-4 text-blue-700">최신 중대재해 정보 (5개)</h2>
          {latestIndAccidents.length === 0 ? (
            <p className="text-gray-500">등록된 중대재해 정보가 없습니다.</p>
          ) : (
            <ul>
              {latestIndAccidents.map(material => (
                <li key={material.id} className="mb-2 pb-2 border-b border-gray-200 last:border-b-0 flex items-center">
                  {material.thumbnailPath && <Image src={material.thumbnailPath} alt={material.filename} width={40} height={40} className="object-cover mr-3 rounded" />}
                  <div>
                    <Link href={safeUrl(material.filePath)} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline">{material.filename}</Link>
                    <p className="text-sm text-gray-600">{new Date(material.uploadedAt).toLocaleDateString()}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Schedule Detail Modal */}
      {showModal && selectedEvent && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96 border border-gray-200 max-w-[90vw]">
            <h2 className="text-xl font-bold mb-4 text-blue-700">일정 상세</h2>
            <p className="mb-2"><strong>학교명:</strong> {selectedEvent.school?.name || '알 수 없는 학교'}</p>
            <p className="mb-2"><strong>날짜:</strong> {new Date(selectedEvent.date).toLocaleDateString()}</p>
            <p className="mb-2"><strong>시간:</strong> {selectedEvent.startTime} ~ {selectedEvent.endTime} ({selectedEvent.ampm})</p>
            <p className="mb-2"><strong>방문 목적:</strong> {safeParsePurpose(selectedEvent.purpose).join(', ')}</p>
            {selectedEvent.otherReason && <p className="mb-4"><strong>기타 사유:</strong> {selectedEvent.otherReason}</p>}
            <button 
              onClick={closeModal} 
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md w-full transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}