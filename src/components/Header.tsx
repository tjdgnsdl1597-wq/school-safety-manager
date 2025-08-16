'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { name: '대시보드', href: '/' },
  { name: '학교 관리', href: '/schools' },
  // { name: '일정 관리', href: '/schedules' }, // Add when page is created
  // { name: '자료 관리', href: '/materials' }, // Add when page is created
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-blue-800">
              세이프티 매니저
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-700 hover:bg-gray-200 hover:text-gray-900'
                  }`}>
                  {link.name}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </header>
  );
}
