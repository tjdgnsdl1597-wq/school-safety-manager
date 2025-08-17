'use client';

import { useState, useEffect } from 'react';
import Image from "next/image";

export default function HeroSplit() {
  const [currentImage, setCurrentImage] = useState(0);
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 업로드된 Hero 이미지 사용
  useEffect(() => {
    // Hero 이미지 배열 (사용자 업로드)
    const heroImages = [
      {
        id: 1,
        webformatURL: '/images/hero/hero-1.jpg',
        tags: '학교 안전 점검, safety inspection'
      },
      {
        id: 2,
        webformatURL: '/images/hero/hero-2.jpg',
        tags: '안전 교육 현장, safety education'
      },
      {
        id: 3,
        webformatURL: '/images/hero/hero-3.jpg',
        tags: '안전 관리 활동, safety management'
      }
    ];
    
    setImages(heroImages);
    setLoading(false);
  }, []);

  // 자동 슬라이드 효과 (3초마다)
  useEffect(() => {
    if (images.length > 1) {
      const interval = setInterval(() => {
        setCurrentImage((prev) => (prev + 1) % images.length);
      }, 3000); // 3초마다 변경

      return () => clearInterval(interval);
    }
  }, [images.length]);

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <section className="relative bg-white">
      {/* 블루프린트 배경 장식 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 right-10 w-32 h-32 border border-gray-200 opacity-20 rotate-12"></div>
        <div className="absolute bottom-20 left-10 w-24 h-24 border border-gray-300 opacity-15 -rotate-6"></div>
        <div className="absolute top-1/3 left-1/4 w-16 h-16 border border-gray-200 opacity-10 rotate-45"></div>
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-12 min-h-[70vh] py-16 md:py-20">
          
          {/* Left: Text */}
          <div className="
            relative z-10 order-2 lg:order-1 lg:col-span-6
            before:content-[''] before:absolute before:pointer-events-none before:select-none
            before:bg-[url('/images/issa-logo.png')] before:bg-no-repeat before:bg-contain
            before:opacity-10 before:aspect-square
            before:hidden md:before:block
            before:top-1/2 before:-translate-y-1/2 before:right-[-24px]
            before:w-[420px] md:before:w-[520px] xl:before:w-[600px]
          ">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight break-keep [text-wrap:balance] text-gray-900">
              체계적인 학교 안전보건 시스템 구축,
              <span className="block text-gray-900 mt-3">
                인천광역시학교안전공제회가 가장 든든한 파트너가 되겠습니다.
              </span>
            </h1>

            <p className="mt-6 text-sm md:text-base font-semibold text-blue-600">
              법규 준수부터 재해 예방까지, 원스톱 학교 안전 솔루션
            </p>

            <p className="mt-4 text-gray-600 text-base md:text-lg leading-relaxed break-keep whitespace-pre-line">
{`복잡한 중대재해처벌법과 산업안전보건법, 교육 현장의 수많은 업무와 병행하기에 어려움이 많으셨을 겁니다.
학생과 교직원의 안전을 책임져야 한다는 막중한 부담감, 이제 안전공제회 산업안전팀이 함께 나누겠습니다.`}
            </p>

          </div>

          {/* Right: Image */}
          <div className="order-1 lg:order-2 lg:col-span-6 relative">
            {/* 블루프린트 장식 (뒤쪽) */}
            <div className="pointer-events-none absolute -z-10 inset-0 -left-10">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white opacity-50"></div>
              <div className="absolute top-4 left-4 w-20 h-20 border-2 border-gray-300 opacity-20 rotate-12"></div>
              <div className="absolute bottom-8 right-8 w-24 h-24 border border-gray-200 opacity-15 -rotate-6"></div>
            </div>

            <div className="relative w-full h-[320px] md:h-[520px]">
              {loading ? (
                <div className="w-full h-full bg-gray-200 rounded-xl flex items-center justify-center">
                  <div className="text-gray-500">이미지 로딩 중...</div>
                </div>
              ) : (
                <>
                  <Image
                    src={images[currentImage]?.webformatURL || '/api/placeholder/720/520?text=안전점검'}
                    alt="현장 안전 점검 장면"
                    fill
                    sizes="(min-width:1024px) 720px, 100vw"
                    className="object-cover rounded-xl"
                    priority
                    onError={(e) => {
                      // 이미지 로드 실패시 Unsplash 폴백 이미지로 대체
                      const target = e.target as HTMLImageElement;
                      const fallbackImages = [
                        'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=720&h=520&q=80',
                        'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=720&h=520&q=80',
                        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=720&h=520&q=80'
                      ];
                      const imageIndex = currentImage % 3;
                      target.src = fallbackImages[imageIndex];
                    }}
                  />
                  
                  {/* 이미지 슬라이드 네비게이션 (이미지가 2개 이상일 때만 표시) */}
                  {images.length > 1 && (
                    <div className="absolute bottom-4 left-4 flex space-x-2 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
                      <button 
                        onClick={prevImage}
                        className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                        aria-label="이전 이미지"
                      >
                        ←
                      </button>
                      <button 
                        onClick={nextImage}
                        className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                        aria-label="다음 이미지"
                      >
                        →
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}