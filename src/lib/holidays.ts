/**
 * 2025년 대한민국 국가공휴일 데이터
 * 분홍색으로 캘린더에 자동 표시
 */

export interface Holiday {
  date: string; // YYYY-MM-DD 형식
  name: string;
  type: 'national' | 'substitute'; // 국가공휴일 | 대체공휴일
}

export const holidays2025: Holiday[] = [
  // 1월
  { date: '2025-01-01', name: '신정', type: 'national' },
  { date: '2025-01-28', name: '설연휴', type: 'national' },
  { date: '2025-01-29', name: '설날', type: 'national' },
  { date: '2025-01-30', name: '설연휴', type: 'national' },

  // 3월
  { date: '2025-03-01', name: '3.1절', type: 'national' },
  { date: '2025-03-03', name: '삼일절 대체공휴일', type: 'substitute' },

  // 5월
  { date: '2025-05-05', name: '어린이날', type: 'national' },
  { date: '2025-05-05', name: '부처님오신날', type: 'national' }, // 같은 날
  { date: '2025-05-06', name: '어린이날·부처님오신날 대체공휴일', type: 'substitute' },

  // 6월
  { date: '2025-06-06', name: '현충일', type: 'national' },

  // 8월
  { date: '2025-08-15', name: '광복절', type: 'national' },

  // 10월
  { date: '2025-10-03', name: '개천절', type: 'national' },
  { date: '2025-10-05', name: '추석연휴', type: 'national' },
  { date: '2025-10-06', name: '추석', type: 'national' },
  { date: '2025-10-07', name: '추석연휴', type: 'national' },
  { date: '2025-10-08', name: '추석연휴 대체공휴일', type: 'substitute' },
  { date: '2025-10-09', name: '한글날', type: 'national' },

  // 12월
  { date: '2025-12-25', name: '성탄절', type: 'national' }
];

/**
 * 특정 날짜가 공휴일인지 확인
 * @param dateString YYYY-MM-DD 형식의 날짜
 * @returns Holiday 객체 또는 null
 */
export function getHoliday(dateString: string): Holiday | null {
  return holidays2025.find(holiday => holiday.date === dateString) || null;
}

/**
 * 특정 날짜가 공휴일인지 여부만 확인
 * @param dateString YYYY-MM-DD 형식의 날짜
 * @returns boolean
 */
export function isHoliday(dateString: string): boolean {
  return holidays2025.some(holiday => holiday.date === dateString);
}

/**
 * 모든 공휴일 목록 반환
 * @returns Holiday[]
 */
export function getAllHolidays(): Holiday[] {
  return [...holidays2025];
}

/**
 * 특정 월의 공휴일 목록 반환
 * @param year 연도
 * @param month 월 (1-12)
 * @returns Holiday[]
 */
export function getHolidaysByMonth(year: number, month: number): Holiday[] {
  const targetMonth = month.toString().padStart(2, '0');
  return holidays2025.filter(holiday => {
    const [holidayYear, holidayMonth] = holiday.date.split('-');
    return holidayYear === year.toString() && holidayMonth === targetMonth;
  });
}