'use client';

import FullCalendar from '@fullcalendar/react';
import type { EventContentArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

// Helper function
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

interface CalendarComponentProps {
  events: any[];
  onEventClick: (clickInfo: { event: { id: string } }) => void;
}

export default function CalendarComponent({ events, onEventClick }: CalendarComponentProps) {
  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      initialView="dayGridMonth"
      headerToolbar={{ 
        left: 'title', 
        center: 'prev,next', 
        right: 'today dayGridMonth,timeGridWeek'
      }}
      titleFormat={{ year: 'numeric', month: 'long' }}
      events={events}
      locale="ko"
      height="auto"
      weekends={false}
      slotMinTime="08:00:00"
      slotMaxTime="17:30:00"
      eventClick={onEventClick}
      eventContent={renderEventContent}
      buttonText={{
        today: '오늘',
        month: '월',
        week: '주',
        day: '일'
      }}
      dayMaxEventRows={3}
      moreLinkClick="popover"
      eventClassNames="fc-custom-event"
    />
  );
}