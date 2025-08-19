'use client';

import React, { useState, useEffect } from 'react';
import type { EventContentArg } from '@fullcalendar/core';
import type { DateClickArg } from '@fullcalendar/interaction';

// Dynamic import FullCalendar to prevent SSR issues

// Safe helper function for event rendering
function safeRenderEventContent(eventInfo: EventContentArg) {
  try {
    const { schoolName, purposes, startTime, schoolAbbreviation, isHoliday } = eventInfo.event.extendedProps || {};
    
    if (!startTime) return <div className="text-sm">일정</div>;
    
    const [hour, minute] = startTime.split(':').map(Number);
    const ampm = hour < 12 ? '오전' : '오후';
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    const timeString = `${ampm} ${displayHour}` + (minute > 0 ? `:${String(minute).padStart(2, '0')}` : '') + '시';
    
    if (isHoliday) {
      // 휴무일정인 경우: 2줄 표시 (검은색 글씨)
      return (
        <div className="fc-event-custom-view text-xs sm:text-sm leading-tight p-1">
          <div className="font-semibold text-black text-xs sm:text-sm">{timeString}</div>
          <div className="text-black truncate text-xs sm:text-sm">🏖️ {purposes || '휴무'}</div>
        </div>
      );
    } else {
      // 일반 일정인 경우: 2줄 표시 (시간 + 학교명,방문목적)
      const schoolDisplayName = schoolAbbreviation || schoolName || '학교';
      const purposeText = purposes || '일정';
      const combinedText = `${schoolDisplayName}, ${purposeText}`;
      
      return (
        <div className="fc-event-custom-view text-xs sm:text-sm leading-tight p-1">
          <div className="font-semibold text-white text-xs sm:text-sm">{timeString}</div>
          <div className="text-white/90 truncate text-xs sm:text-sm">{combinedText}</div>
        </div>
      );
    }
  } catch (error) {
    console.warn('Error rendering event content:', error);
    return <div className="text-sm">일정</div>;
  }
}

interface ScheduleCalendarComponentProps {
  events: any[];
  onEventClick: (clickInfo: { event: { id: string } }) => void;
  onDateClick: (arg: DateClickArg) => void;
}

export default function ScheduleCalendarComponent({ events, onEventClick, onDateClick }: ScheduleCalendarComponentProps) {
  const [FullCalendar, setFullCalendar] = useState<React.ComponentType<any> | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Dynamically import FullCalendar only on client side
    if (typeof window !== 'undefined') {
      Promise.all([
        import('@fullcalendar/react'),
        import('@fullcalendar/daygrid'),
        import('@fullcalendar/timegrid'),
        import('@fullcalendar/interaction')
      ]).then(([FullCalendarModule, dayGridPlugin, timeGridPlugin, interactionPlugin]) => {
        const FullCalendarComponent = FullCalendarModule.default;
        
        // Create a wrapped component with plugins
        const WrappedFullCalendar = (props: any) => (
          <FullCalendarComponent 
            {...props}
            plugins={[dayGridPlugin.default, timeGridPlugin.default, interactionPlugin.default]}
          />
        );
        
        setFullCalendar(() => WrappedFullCalendar);
        setMounted(true);
      }).catch((error) => {
        console.error('Failed to load FullCalendar:', error);
        setMounted(true);
      });
    }
  }, []);

  // Show loading state until mounted
  if (!mounted) {
    return (
      <div className="h-96 flex items-center justify-center text-gray-500 bg-gray-100 rounded-lg animate-pulse">
        <div className="text-center">
          <div className="text-4xl mb-4">📅</div>
          <p>캘린더 로딩 중...</p>
        </div>
      </div>
    );
  }

  // Show error state if FullCalendar failed to load
  if (!FullCalendar) {
    return (
      <div className="h-96 flex items-center justify-center text-gray-500 bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <p>캘린더를 불러올 수 없습니다</p>
          <p className="text-sm mt-2">페이지를 새로고침해주세요</p>
        </div>
      </div>
    );
  }

  // Safe event validation
  const safeEvents = Array.isArray(events) ? events.filter(event => 
    event && typeof event === 'object' && event.id
  ) : [];

  return (
    <FullCalendar 
      initialView="dayGridMonth" 
      headerToolbar={{ 
        left: 'prev', 
        center: 'title', 
        right: 'next dayGridMonth,timeGridWeek'
      }}
      titleFormat={{ year: 'numeric', month: 'long' }}
      events={safeEvents} 
      locale="ko" 
      height="auto" 
      weekends={false} 
      dateClick={onDateClick}
      buttonText={{
        today: '오늘',
        month: '월',
        week: '주'
      }}
      dayMaxEventRows={3}
      moreLinkClick="popover"
      eventClassNames="fc-custom-event" 
      eventClick={onEventClick} 
      slotMinTime="08:00:00" 
      slotMaxTime="17:30:00"
      eventContent={safeRenderEventContent}
    />
  );
}