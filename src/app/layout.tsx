import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from '../components/Navbar';
import Providers from '../components/Providers';
import AuthCheck from '../components/AuthCheck';
import ErrorBoundary from '../components/ErrorBoundary';
import DynamicTitle from '../components/DynamicTitle';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "학교안전보건 관리시스템",
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
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="학교안전관리" />
        <script dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js')
                  .then(function(registration) {
                    console.log('PWA: ServiceWorker registration successful');
                  })
                  .catch(function(err) {
                    console.log('PWA: ServiceWorker registration failed');
                  });
              });
            }
          `
        }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          <Providers>
            <AuthCheck>
              <DynamicTitle />
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
