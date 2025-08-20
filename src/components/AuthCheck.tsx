'use client';

import { useAuth } from '@/lib/simpleAuth';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import AdminApprovalPopup from './AdminApprovalPopup';
import { isSuperAdmin } from '@/lib/authUtils';

// 공개 페이지 리스트 (로그인 없이 접근 가능)
const PUBLIC_PAGES = [
  '/',
  '/auth/signin',
  '/auth/signup',
  '/school-safety',
  '/educational-materials',
  '/industrial-accidents',
  '/data-center/education',
  '/data-center/safety-signs',
  '/data-center/forms',
  '/data-center/notices'
];

// 로그인 필요 페이지 (일반 사용자도 접근 가능)
const USER_PAGES = [
  '/dashboard',
  '/schools',
  '/schedules'
];

export default function AuthCheck({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // 페이지 타입 확인
  const isPublicPage = PUBLIC_PAGES.some(page => pathname.startsWith(page));
  const isUserPage = USER_PAGES.some(page => pathname.startsWith(page));
  
  useEffect(() => {
    // 로그인이 필요한 페이지인데 로그인하지 않은 경우
    if (!loading && !isPublicPage && !isAuthenticated) {
      router.push('/auth/signin');
    }
  }, [loading, isPublicPage, isAuthenticated, router, pathname]);

  // 공개 페이지는 누구나 접근 가능
  if (isPublicPage) {
    return <>{children}</>;
  }

  // 로그인이 필요한 페이지인데 로그인하지 않은 경우
  if (isUserPage && !isAuthenticated) {
    return null; // useEffect에서 리다이렉트됨
  }

  // 관리자 전용 페이지 체크
  if (pathname.startsWith('/admin') && user && !isSuperAdmin(user)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">접근 권한이 없습니다</h1>
          <p className="text-gray-600">관리자만 접근할 수 있는 페이지입니다.</p>
        </div>
      </div>
    );
  }

  // 로딩 중
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 로그인하지 않은 경우
  if (!isAuthenticated) {
    return null;
  }

  // 로그인한 경우 정상 표시 + 슈퍼관리자만 승인 팝업
  return (
    <>
      {children}
      {isSuperAdmin(user) && <AdminApprovalPopup user={user} />}
    </>
  );
}