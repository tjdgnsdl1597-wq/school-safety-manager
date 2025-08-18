'use client';

import { useAuth } from '@/lib/simpleAuth';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

// 공개 페이지 리스트 (상수로 분리)
const PUBLIC_PAGES = [
  '/',
  '/auth/signin',
  '/school-safety',
  '/educational-materials',
  '/industrial-accidents'
];

export default function AuthCheck({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // 공개 페이지인지 확인
  const isPublicPage = PUBLIC_PAGES.some(page => pathname.startsWith(page));
  
  useEffect(() => {
    if (!loading && !isPublicPage && !isAuthenticated) {
      router.push('/auth/signin');
    }
  }, [loading, isPublicPage, isAuthenticated, router, pathname]);

  if (isPublicPage) {
    return <>{children}</>;
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

  // 로그인한 경우 정상 표시
  return <>{children}</>;
}