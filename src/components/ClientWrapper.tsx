'use client';

import dynamic from 'next/dynamic';

// NextAuth를 사용하는 컴포넌트들을 동적으로 import
const DynamicAuthCheck = dynamic(() => import('./AuthCheck'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
    </div>
  )
});

const DynamicNavbar = dynamic(() => import('./Navbar'), {
  ssr: false,
  loading: () => (
    <div className="h-16 bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 animate-pulse"></div>
  )
});

export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DynamicAuthCheck>
      <DynamicNavbar />
      <main className="pt-4">
        {children}
      </main>
    </DynamicAuthCheck>
  );
}