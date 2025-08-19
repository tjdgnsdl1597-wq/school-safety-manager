'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/simpleAuth';

export default function DynamicTitle() {
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      let title = '';
      
      if (user?.role === 'super_admin') {
        // 관리자: 어드민 관리 시스템
        title = '어드민 관리 시스템';
      } else if (isAuthenticated) {
        // 로그인자: 학교안전보건 관리시스템
        title = '학교안전보건 관리시스템';
      } else {
        // 미로그인(방문자): 정보마당
        title = '학교안전 정보마당';
      }
      
      document.title = title;
    }
  }, [isAuthenticated, user]);

  return null;
}