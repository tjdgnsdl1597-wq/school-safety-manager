'use client';

import dynamic from 'next/dynamic';

// 전체 홈 페이지를 동적으로 import (useSession 사용으로 인해)
const DynamicHomePage = dynamic(() => import('../components/HomePage'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg">대시보드 로딩 중...</p>
      </div>
    </div>
  )
});

export default function Page() {
  return <DynamicHomePage />;
}