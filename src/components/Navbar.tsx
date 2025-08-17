'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 관리자용 네비게이션 메뉴
  const adminNavItems = [
    { name: '대시보드', href: '/' },
    { name: '학교 정보', href: '/schools' },
    { name: '일정 관리', href: '/schedules' },
    { name: '교육 자료', href: '/educational-materials' },
    { name: '산업 재해', href: '/industrial-accidents' },
  ];

  // 고객용 네비게이션 메뉴 (교육자료, 산업재해만)
  const customerNavItems = [
    { name: '교육 자료', href: '/educational-materials' },
    { name: '산업 재해', href: '/industrial-accidents' },
  ];

  // 로그인하지 않은 사용자는 고객 메뉴 표시
  const isAdmin = (session?.user as any)?.role === 'admin';
  const navItems = isAdmin ? adminNavItems : customerNavItems;

  return (
    <nav className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          {/* 로고 - 모바일에서 축약 */}
          <Link 
            href="/" 
            className="text-white font-bold hover:text-blue-300 transition-colors duration-300 flex items-center space-x-2"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">안</span>
            </div>
            <span className="hidden sm:inline text-lg lg:text-xl">인천광역시 학교안전공제회</span>
            <span className="sm:hidden text-base">학교안전공제회</span>
          </Link>
          
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
                {item.name}
              </Link>
            ))}
            
            <div className="ml-4 lg:ml-6 flex items-center space-x-2 lg:space-x-3">
              {session ? (
                <>
                  <div className="hidden lg:flex items-center space-x-2 px-3 py-1 bg-white/10 rounded-full">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-gray-300 text-sm">
                      {isAdmin ? '관리자' : '고객'}
                    </span>
                  </div>
                  <button
                    onClick={() => signOut({ callbackUrl: '/auth/signin' })}
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
                  관리자 로그인
                </Link>
              )}
            </div>
          </div>

          {/* 모바일 햄버거 메뉴 */}
          <div className="md:hidden flex items-center space-x-2">
            {session && (
              <div className="flex items-center space-x-1 px-2 py-1 bg-white/10 rounded-full">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-gray-300 text-xs">
                  {isAdmin ? '관리자' : '고객'}
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
                  {item.name}
                </Link>
              ))}
              
              <div className="border-t border-white/10 pt-4 mt-4">
                {session ? (
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      signOut({ callbackUrl: '/auth/signin' });
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
                    관리자 로그인
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
