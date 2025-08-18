'use client';

import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// 공개 페이지 리스트 (상수로 분리)
const PUBLIC_PAGES = [
  '/',
  '/auth/signin',
  '/school-safety',
  '/educational-materials',
  '/industrial-accidents'
];

export default function AuthCheck({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || status === 'loading') return;

    // 공개 페이지인지 확인
    const isPublicPage = PUBLIC_PAGES.some(page => pathname.startsWith(page));
    
    if (isPublicPage) {
      return;
    }

    // 관리자 페이지이고 로그인하지 않은 경우
    if (!session) {
      router.push('/auth/signin');
    }
  }, [mounted, session, status, pathname, router]);

  // 마운트되지 않았거나 로딩 중
  if (!mounted || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 공개 페이지인지 확인
  const isPublicPage = PUBLIC_PAGES.some(page => pathname.startsWith(page));
  
  if (isPublicPage) {
    return <>{children}</>;
  }

  // 로그인하지 않은 경우
  if (!session) {
    return null;
  }

  // 로그인한 경우 정상 표시
  return <>{children}</>;
}