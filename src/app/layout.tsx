import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from '../components/Navbar';
import Providers from '../components/Providers';
import AuthCheck from '../components/AuthCheck';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/lib/auth';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "학교 안전보건 관리 시스템", // Updated title
  description: "학교 안전보건 관리를 위한 시스템입니다.", // Updated description
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers session={session}>
          <AuthCheck>
            <Navbar />
            <main className="pt-4">
              {children}
            </main>
          </AuthCheck>
        </Providers>
      </body>
    </html>
  );
}
