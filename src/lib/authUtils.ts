// 권한 관련 유틸리티 함수들

export interface User {
  id: string;
  username?: string;
  name: string;
  position?: string;
  phoneNumber?: string;
  department?: string;
  role: string;
}

/**
 * 사용자 표시명 생성 (이름 + 직급)
 */
export function getUserDisplayName(user: User | null): string {
  if (!user) return '비로그인 사용자';
  
  if (user.role === 'super_admin') {
    return '관리자'; // 관리자는 그대로
  }
  
  // 일반 사용자는 "이름 직급" 형태로 표시
  if (user.position) {
    return `${user.name} ${user.position}`;
  }
  
  return user.name; // 직급이 없으면 이름만
}

/**
 * 슈퍼관리자인지 확인
 */
export function isSuperAdmin(user: User | null): boolean {
  return user?.role === 'super_admin';
}

/**
 * 일반 사용자인지 확인
 */
export function isRegularUser(user: User | null): boolean {
  return user?.role === 'user';
}

/**
 * 로그인된 사용자인지 확인
 */
export function isAuthenticated(user: User | null): boolean {
  return user !== null;
}

/**
 * 데이터 접근 권한 확인
 * @param user 현재 사용자
 * @param resourceUserId 리소스를 소유한 사용자 ID
 * @returns 접근 가능하면 true, 불가능하면 false
 */
export function canAccessResource(user: User | null, resourceUserId: string): boolean {
  if (!user) return false;
  
  // 슈퍼관리자는 모든 데이터 접근 가능
  if (isSuperAdmin(user)) return true;
  
  // 일반 사용자는 본인 데이터만 접근 가능
  return user.id === resourceUserId;
}

/**
 * 사용자 관리 권한 확인 (계정 생성/삭제 등)
 */
export function canManageUsers(user: User | null): boolean {
  return isSuperAdmin(user);
}

/**
 * 권한 수준에 따른 메뉴 접근성 확인
 */
export function getAccessibleMenus(user: User | null) {
  if (!user) {
    return {
      dashboard: false,
      schools: false,
      schedules: false,
      educationalMaterials: true,  // 공개 페이지
      industrialAccidents: true,   // 공개 페이지
      userManagement: false
    };
  }

  if (isSuperAdmin(user)) {
    return {
      dashboard: true,
      schools: true,
      schedules: true,
      educationalMaterials: true,
      industrialAccidents: true,
      userManagement: true
    };
  }

  // 일반 사용자
  return {
    dashboard: true,
    schools: true,
    schedules: true,
    educationalMaterials: true,
    industrialAccidents: true,
    userManagement: false
  };
}