'use client';

import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';

export default function AuthCheck({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  // 로그인이 필요하지 않은 페이지들 (일반 방문자 접근 가능)
  const publicPages = useMemo(() => [
    '/',
    '/auth/signin',
    '/educational-materials',
    '/industrial-accidents'
  ], []);

  useEffect(() => {
    if (status === 'loading') return; // 로딩 중에는 아무것도 하지 않음

    // 공개 페이지는 로그인 체크 없이 접근 허용
    if (publicPages.includes(pathname)) {
      return;
    }

    // 관리자 페이지 접근 시
    if (!session) {
      // 로그인하지 않은 경우 → 로그인 페이지로
      router.push('/auth/signin');
    }
  }, [session, status, pathname, router, publicPages]);

  // 로딩 중
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 로그인 페이지는 그대로 표시
  if (publicPages.includes(pathname)) {
    return <>{children}</>;
  }

  // 로그인하지 않은 경우
  if (!session) {
    return null; // 리다이렉트 중이므로 아무것도 표시하지 않음
  }

  // 로그인한 경우 정상 표시
  return <>{children}</>;
}