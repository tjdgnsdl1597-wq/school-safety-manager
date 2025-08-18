'use client';

interface ScheduleCalendarComponentProps {
  events: any[];
  onEventClick: (clickInfo: { event: { id: string } }) => void;
  onDateClick: (arg: any) => void;
}

export default function ScheduleCalendarComponent({ events, onEventClick, onDateClick }: ScheduleCalendarComponentProps) {
  return (
    <div className="h-96 flex items-center justify-center text-gray-500 bg-gray-100 rounded-lg">
      <div className="text-center">
        <div className="text-4xl mb-4">📅</div>
        <p>FullCalendar 임시 비활성화</p>
        <p className="text-sm">디버깅을 위해 캘린더를 일시적으로 제거했습니다</p>
      </div>
    </div>
  );
}