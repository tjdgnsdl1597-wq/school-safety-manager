'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// SessionProvider를 동적으로 import (SSR 방지)
const DynamicSessionProvider = dynamic(
  () => import('next-auth/react').then(mod => mod.SessionProvider),
  {
    ssr: false,
    loading: () => <div>인증 시스템 로딩 중...</div>
  }
);

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 마운트되지 않은 경우 기본 래퍼만 반환
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <DynamicSessionProvider
      refetchInterval={0}
      refetchOnWindowFocus={false}
    >
      {children}
    </DynamicSessionProvider>
  );
}