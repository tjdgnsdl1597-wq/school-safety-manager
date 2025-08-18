import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from '../components/Navbar';
import Providers from '../components/Providers';
import AuthCheck from '../components/AuthCheck';
import ErrorBoundary from '../components/ErrorBoundary';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "학교 안전보건 관리 시스템",
  description: "학교 안전보건 관리를 위한 시스템입니다.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          <Providers>
            <AuthCheck>
              <Navbar />
              <main className="pt-4">
                {children}
              </main>
            </AuthCheck>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
