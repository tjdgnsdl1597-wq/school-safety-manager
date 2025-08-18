'use client';

import { AuthProvider } from '@/lib/simpleAuth';

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}