'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/simpleAuth';
import { isSuperAdmin, getUserDisplayName } from '@/lib/authUtils';
import { useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 슈퍼관리자용 네비게이션 메뉴 (사용자 관리 + 교육자료 + 중대재해 알리미)
  const adminNavItems = [
    { name: '사용자 관리', href: '/admin/users' },
    { name: '교육 자료', href: '/educational-materials' },
    { name: '중대재해 알리미', href: '/industrial-accidents' },
  ];

  // 메뉴 텍스트를 표시하는 함수 (관리자만 2줄, 나머지는 1줄)
  const renderMenuText = (menuName: string) => {
    // 관리자가 아닌 경우 항상 1줄로 표시
    if (!isAdmin) {
      return menuName;
    }
    
    // 관리자인 경우만 2줄로 표시
    if (menuName === '대시보드') {
      return <span className="text-center leading-tight">대시<br />보드</span>;
    }
    if (menuName === '학교 정보') {
      return <span className="text-center leading-tight">학교<br />정보</span>;
    }
    if (menuName === '사용자 관리') {
      return <span className="text-center leading-tight">사용자<br />관리</span>;
    }
    if (menuName === '일정 관리') {
      return <span className="text-center leading-tight">일정<br />관리</span>;
    }
    if (menuName === '학교 안전보건') {
      return <span className="text-center leading-tight">학교<br />안전보건</span>;
    }
    if (menuName === '교육 자료') {
      return <span className="text-center leading-tight">교육<br />자료</span>;
    }
    if (menuName === '중대재해 알리미') {
      return <span className="text-center leading-tight">중대재해<br />알리미</span>;
    }
    return menuName;
  };

  // 일반 사용자용 네비게이션 메뉴 (대시보드, 학교정보, 일정관리, 교육자료, 중대재해)
  const userNavItems = [
    { name: '대시보드', href: '/dashboard' },
    { name: '학교 정보', href: '/schools' },
    { name: '일정 관리', href: '/schedules' },
    { name: '교육 자료', href: '/educational-materials' },
    { name: '중대재해 알리미', href: '/industrial-accidents' },
  ];

  // 방문자용 네비게이션 메뉴 (홈, 교육자료, 중대재해)
  const visitorNavItems = [
    { name: '홈', href: '/?visitor=true' },
    { name: '교육 자료', href: '/educational-materials' },
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
            {navItems.map((item) => (
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
            ))}
            
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
              onClick={() => setIsMenuOpen(!isMenuOpen)}
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
              {navItems.map((item) => (
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
              ))}
              
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
