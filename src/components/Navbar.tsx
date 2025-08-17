'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  // 관리자용 네비게이션 메뉴
  const adminNavItems = [
    { name: '대시보드', href: '/' },
    { name: '학교 정보 관리', href: '/schools' },
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
  const isAdmin = session?.user?.role === 'admin';
  const navItems = isAdmin ? adminNavItems : customerNavItems;

  return (
    <nav className="bg-blue-600 p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-white text-xl font-bold">
          인천광역시 학교안전공제회
        </Link>
        <div className="flex items-center space-x-4">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`text-white hover:text-blue-200 transition-colors duration-200 ${
                pathname === item.href ? 'font-bold border-b-2 border-white' : ''
              }`}
            >
              {item.name}
            </Link>
          ))}
          <div className="flex items-center space-x-4 ml-4">
            {session ? (
              <>
                <span className="text-white text-sm">
                  {isAdmin ? '관리자' : '고객'}님
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors duration-200"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <Link
                href="/auth/signin"
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-colors duration-200"
              >
                관리자 로그인
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
