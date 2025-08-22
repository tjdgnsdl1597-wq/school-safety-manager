'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/simpleAuth';
import { isSuperAdmin, getUserDisplayName } from '@/lib/authUtils';
import { useState, useRef, useEffect } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDataCenterOpen, setIsDataCenterOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 드롭다운 외부 클릭 감지 (데스크톱만)
  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDataCenterOpen(false);
      }
    }

    // 터치 디바이스가 아닐 때만 마우스 이벤트 처리
    if (!isTouchDevice()) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  // 터치 디바이스 감지
  const isTouchDevice = () => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  };

  // 드롭다운 토글 핸들러 (모바일/데스크톱 통합)
  const handleDataCenterToggle = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDataCenterOpen(prev => !prev);
  };

  // 터치 전용 핸들러 (이벤트 중복 방지)
  const handleTouchToggle = (e: React.TouchEvent) => {
    // 터치 디바이스에서만 동작하고, onClick과 중복 실행 방지
    if (isTouchDevice()) {
      e.preventDefault();
      e.stopPropagation();
      setIsDataCenterOpen(prev => !prev);
    }
  };

  // 자료마당 서브메뉴
  const dataCenterItems = [
    { name: '📚 교육자료', href: '/data-center/education', icon: '📚' },
    { name: '🎯 안전보건표지 및 포스터', href: '/data-center/safety-signs', icon: '🎯' },
    { name: '📄 안전서류 양식', href: '/data-center/forms', icon: '📄' },
    { name: '📢 교육청 배포물', href: '/data-center/notices', icon: '📢' },
  ];

  // 슈퍼관리자용 네비게이션 메뉴 (사용자 관리 + 이용약관 + 이동시간 + 자료마당 + 중대재해 알리미) - 대시보드 제거
  const adminNavItems = [
    { name: '사용자 관리', href: '/admin/users' },
    { name: '이용약관', href: '/terms' },
    { name: '이동시간', href: '/travel-time' },
    { name: '자료마당', href: '/data-center/education', isDropdown: true },
    { name: '중대재해 알리미', href: '/industrial-accidents' },
  ];

  // 메뉴 텍스트를 표시하는 함수 (로그인한 사용자는 2줄 표시)
  const renderMenuText = (menuName: string) => {
    // 로그인하지 않은 경우 항상 1줄로 표시
    if (!isLoggedIn) {
      return menuName;
    }
    
    // 로그인한 사용자인 경우 2줄로 표시
    if (menuName === '대시보드') {
      return <span className="text-center leading-tight">대시<br />보드</span>;
    }
    if (menuName === '학교 정보') {
      return <span className="text-center leading-tight">학교<br />정보</span>;
    }
    if (menuName === '사용자 관리') {
      return <span className="text-center leading-tight">사용자<br />관리</span>;
    }
    if (menuName === '이용약관') {
      return <span className="text-center leading-tight">이용<br />약관</span>;
    }
    if (menuName === '일정 관리') {
      return <span className="text-center leading-tight">일정<br />관리</span>;
    }
    if (menuName === '학교 안전보건') {
      return <span className="text-center leading-tight">학교<br />안전보건</span>;
    }
    if (menuName === '자료마당') {
      return <span className="text-center leading-tight">자료<br />마당</span>;
    }
    if (menuName === '중대재해 알리미') {
      return <span className="text-center leading-tight">중대재해<br />알리미</span>;
    }
    if (menuName === '이동시간') {
      return <span className="text-center leading-tight">이동시간<br />(개발중)</span>;
    }
    return menuName;
  };

  // 일반 사용자용 네비게이션 메뉴 (대시보드, 학교정보, 일정관리, 자료마당, 중대재해) - 이동시간 제거
  const userNavItems = [
    { name: '대시보드', href: '/dashboard' },
    { name: '학교 정보', href: '/schools' },
    { name: '일정 관리', href: '/schedules' },
    { name: '자료마당', href: '/data-center/education', isDropdown: true },
    { name: '중대재해 알리미', href: '/industrial-accidents' },
  ];

  // 방문자용 네비게이션 메뉴 (홈, 자료마당, 중대재해)
  const visitorNavItems = [
    { name: '홈', href: '/?visitor=true' },
    { name: '자료마당', href: '/data-center/education', isDropdown: true },
    { name: '중대재해 알리미', href: '/industrial-accidents' },
  ];

  // 권한 체크 및 메뉴 설정
  const isAdmin = isSuperAdmin(user);
  const isLoggedIn = !!user;
  
  let navItems;
  if (isAdmin) {
    navItems = adminNavItems; // 관리자: 모든 메뉴 + 사용자 관리
  } else if (isLoggedIn) {
    navItems = userNavItems; // 로그인한 일반 사용자: 대시보드, 학교정보, 일정관리, 교육자료, 중대재해
  } else {
    navItems = visitorNavItems; // 방문자: 교육자료, 중대재해만
  }

  return (
    <nav className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          {/* 타이틀 */}
          {isLoggedIn ? (
            <Link 
              href="/" 
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity duration-300"
            >
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
                {isAdmin ? '관리자 시스템' : '관리 시스템'}
              </h1>
            </Link>
          ) : (
            <div className="flex items-center space-x-2">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
                안전공제회 산업안전 정보마당
              </h1>
            </div>
          )}
          
          {/* 데스크톱 메뉴 */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              if (item.isDropdown && item.name === '자료마당') {
                const isDataCenterActive = pathname.startsWith('/data-center');
                return (
                  <div key={item.name} className="relative" ref={dropdownRef}>
                    <button
                      onClick={isTouchDevice() ? undefined : handleDataCenterToggle}
                      onTouchEnd={isTouchDevice() ? handleDataCenterToggle : undefined}
                      aria-expanded={isDataCenterOpen}
                      aria-haspopup="true"
                      aria-label="자료마당 메뉴 열기/닫기"
                      className={`px-3 lg:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center space-x-1 ${
                        isDataCenterActive
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' 
                          : 'text-gray-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <span>{renderMenuText(item.name)}</span>
                      <svg 
                        className={`w-4 h-4 transition-transform duration-200 ${isDataCenterOpen ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* 드롭다운 메뉴 - 애니메이션 효과 개선 */}
                    {isDataCenterOpen && (
                      <div className="absolute top-full left-0 mt-2 w-64 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-xl shadow-black/10 overflow-hidden z-50 animate-in slide-in-from-top-2 duration-200">
                        {dataCenterItems.map((subItem) => (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            onClick={() => setIsDataCenterOpen(false)}
                            className={`block px-4 py-3 text-sm font-medium transition-all duration-200 ${
                              pathname === subItem.href
                                ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-500'
                                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <span className="text-lg">{subItem.icon}</span>
                              <span>{subItem.name.replace(subItem.icon + ' ', '')}</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3 lg:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    pathname === item.href 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' 
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {renderMenuText(item.name)}
                </Link>
              );
            })}
            
            <div className="ml-4 lg:ml-6 flex items-center space-x-2 lg:space-x-3">
              {user ? (
                <>
                  <div className="hidden lg:flex items-center space-x-2 px-3 py-1 bg-white/10 rounded-full">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-gray-300 text-sm">
                      {getUserDisplayName(user) || '고객'}
                    </span>
                  </div>
                  <button
                    onClick={logout}
                    className="px-3 lg:px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-sm font-medium rounded-lg transition-all duration-300 shadow-lg shadow-red-500/25 hover:shadow-red-500/40"
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <Link
                  href="/auth/signin"
                  className="px-3 lg:px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-sm font-medium rounded-lg transition-all duration-300 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
                >
                  로그인
                </Link>
              )}
            </div>
          </div>

          {/* 모바일 햄버거 메뉴 */}
          <div className="md:hidden flex items-center space-x-2">
            {user && (
              <div className="flex items-center space-x-1 px-2 py-1 bg-white/10 rounded-full">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-gray-300 text-xs">
                  {getUserDisplayName(user) || '고객'}
                </span>
              </div>
            )}
            <button
              onClick={() => {
                setIsMenuOpen(!isMenuOpen);
                // 햄버거 메뉴를 닫을 때 드롭다운도 함께 닫기
                if (isMenuOpen) {
                  setIsDataCenterOpen(false);
                }
              }}
              className="text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* 모바일 드롭다운 메뉴 */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-white/10 mt-2 pt-4 pb-4">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => {
                if (item.isDropdown && item.name === '자료마당') {
                  const isDataCenterActive = pathname.startsWith('/data-center');
                  return (
                    <div key={item.name}>
                      {/* 자료마당 메인 버튼 - 심플 버전 */}
                      <button
                        onClick={() => setIsDataCenterOpen(true)}
                        className={`w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${
                          isDataCenterActive
                            ? 'bg-blue-600 text-white' 
                            : 'text-gray-300 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <span>{renderMenuText(item.name)}</span>
                        <span className={`transform transition-transform ${isDataCenterOpen ? 'rotate-180' : ''}`}>
                          ▼
                        </span>
                      </button>

                      {/* 드롭다운 메뉴 - 완전 새로운 심플 버전 */}
                      {isDataCenterOpen && (
                        <div className="mt-2 ml-4 space-y-1">
                          {dataCenterItems.map((subItem) => (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              className={`flex items-center space-x-2 px-4 py-2 rounded text-sm ${
                                pathname === subItem.href
                                  ? 'bg-blue-500 text-white'
                                  : 'text-gray-400 hover:text-white hover:bg-white/10'
                              }`}
                            >
                              <span>{subItem.icon}</span>
                              <span>{subItem.name.replace(subItem.icon + ' ', '')}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                      pathname === item.href 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' 
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {renderMenuText(item.name)}
                  </Link>
                );
              })}
              
              <div className="border-t border-white/10 pt-4 mt-4">
                {user ? (
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      logout();
                    }}
                    className="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-sm font-medium rounded-lg transition-all duration-300 shadow-lg shadow-red-500/25 hover:shadow-red-500/40"
                  >
                    로그아웃
                  </button>
                ) : (
                  <Link
                    href="/auth/signin"
                    onClick={() => setIsMenuOpen(false)}
                    className="block w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-sm font-medium rounded-lg transition-all duration-300 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 text-center"
                  >
                    로그인
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
