'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/lib/simpleAuth';
import { isSuperAdmin } from '@/lib/authUtils';

export default function BottomNavigation() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [showDataCenterModal, setShowDataCenterModal] = useState(false);

  // 권한 체크
  const isAdmin = isSuperAdmin(user);
  const isLoggedIn = !!user;

  // 로그인하지 않은 사용자는 하단 네비게이션 숨김
  if (!isLoggedIn) {
    return null;
  }

  // 자료마당 서브메뉴
  const dataCenterItems = [
    { name: '교육자료', href: '/data-center/education', icon: '📚' },
    { name: '안전보건표지 및 포스터', href: '/data-center/safety-signs', icon: '🎯' },
    { name: '안전서류 양식', href: '/data-center/forms', icon: '📄' },
    { name: '교육청 배포물', href: '/data-center/notices', icon: '📢' },
  ];

  // 어드민용 네비게이션 아이템들
  const adminNavItems = [
    { 
      name: '사용자관리', 
      href: '/admin/users', 
      icon: '🔧',
      isActive: pathname === '/admin/users'
    },
    { 
      name: '이용약관', 
      href: '/terms', 
      icon: '📋',
      isActive: pathname === '/terms'
    },
    { 
      name: '이동시간', 
      href: '/travel-time', 
      icon: '🚗',
      isActive: pathname === '/travel-time'
    },
    { 
      name: '중대재해', 
      href: '/industrial-accidents', 
      icon: '🚨',
      isActive: pathname.startsWith('/industrial-accidents')
    },
    { 
      name: '자료마당', 
      href: '#', 
      icon: '📚',
      isActive: pathname.startsWith('/data-center'),
      isSpecial: true
    }
  ];

  // 일반 사용자용 네비게이션 아이템들
  const userNavItems = [
    { 
      name: '대시보드', 
      href: '/dashboard', 
      icon: '🏠',
      isActive: pathname === '/dashboard'
    },
    { 
      name: '학교정보', 
      href: '/schools', 
      icon: '🏫',
      isActive: pathname === '/schools'
    },
    { 
      name: '일정관리', 
      href: '/schedules', 
      icon: '📅',
      isActive: pathname === '/schedules'
    },
    { 
      name: '중대재해', 
      href: '/industrial-accidents', 
      icon: '🚨',
      isActive: pathname.startsWith('/industrial-accidents')
    },
    { 
      name: '자료마당', 
      href: '#', 
      icon: '📚',
      isActive: pathname.startsWith('/data-center'),
      isSpecial: true
    }
  ];

  // 권한에 따른 네비게이션 아이템 선택
  const navItems = isAdmin ? adminNavItems : userNavItems;

  // 자료마당 모달 닫기
  const closeModal = () => {
    setShowDataCenterModal(false);
  };

  return (
    <>
      {/* 하단 네비게이션 바 */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe z-40">
        <div className="flex py-1">
          {navItems.map((item, index) => (
            <React.Fragment key={item.name}>
              {/* 첫 번째가 아닌 경우 구분선 추가 */}
              {index > 0 && (
                <div className="w-px bg-gray-200 my-2"></div>
              )}
              
              <div className="flex-1">{(() => {
            if (item.isSpecial) {
              // 자료마당 특별 처리
              return (
                <button
                  onClick={() => setShowDataCenterModal(true)}
                  className={`w-full flex flex-col items-center py-2 px-1 min-w-0 transition-colors ${
                    item.isActive
                      ? 'text-blue-600'
                      : 'text-gray-600'
                  }`}
                >
                  <span className="text-xl mb-1">{item.icon}</span>
                  <span className="text-xs font-medium truncate">{item.name}</span>
                </button>
              );
            }

            return (
              <Link
                href={item.href}
                className={`w-full flex flex-col items-center py-2 px-1 min-w-0 transition-colors ${
                  item.isActive
                    ? 'text-blue-600'
                    : 'text-gray-600'
                }`}
              >
                <span className="text-xl mb-1">{item.icon}</span>
                <span className="text-xs font-medium truncate">{item.name}</span>
              </Link>
            );
          })()}</div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* 자료마당 슬라이드 업 모달 */}
      {showDataCenterModal && (
        <div 
          className="md:hidden fixed inset-0 z-50"
          onClick={closeModal}
        >
          {/* 배경 오버레이 */}
          <div className="absolute inset-0 bg-black/50"></div>
          
          {/* 모달 콘텐츠 */}
          <div 
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-xl pb-safe animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">자료마당</h3>
              <button
                onClick={closeModal}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 자료마당 카테고리 목록 */}
            <div className="p-4 space-y-3">
              {dataCenterItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeModal}
                  className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                    pathname === item.href
                      ? 'bg-blue-50 text-blue-600 border border-blue-200'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                </Link>
              ))}
            </div>

            {/* 하단 여백 */}
            <div className="h-4"></div>
          </div>
        </div>
      )}
    </>
  );
}