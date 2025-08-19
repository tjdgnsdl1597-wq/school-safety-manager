'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  username?: string;
  name: string;
  position?: string;
  phoneNumber?: string;
  email?: string;
  department?: string;
  profilePhoto?: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  
  // Debug logging removed for production

  useEffect(() => {
    // Mark component as mounted and check for saved user
    setMounted(true);
    
    const initializeAuth = () => {
      if (typeof window !== 'undefined') {
        const savedUser = localStorage.getItem('auth-user');
        if (savedUser) {
          try {
            const parsedUser = JSON.parse(savedUser);
            setUser(parsedUser);
          } catch (e) {
            console.error('Failed to parse saved user:', e);
            localStorage.removeItem('auth-user');
          }
        }
      }
      setLoading(false);
    };

    // 즉시 실행하거나 다음 틱에서 실행
    initializeAuth();
  }, []);

  // Prevent hydration mismatch by not rendering until mounted and auth initialized
  if (!mounted || loading) {
    return null; // 단순히 아무것도 렌더링하지 않음
  }

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // 새로운 API를 통해 로그인 시도
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (data.success && data.user) {
        // 로그인 성공 - 사용자 정보 저장
        setUser(data.user);
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth-user', JSON.stringify(data.user));
        }
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('로그인 중 오류 발생:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth-user');
      // 로그아웃 후 초기 선택 화면으로 이동
      window.location.href = '/';
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      logout,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}