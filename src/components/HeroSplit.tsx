'use client';

import { useState, useEffect } from 'react';
import Image from "next/image";

export default function HeroSplit() {
  const [currentImage, setCurrentImage] = useState(0);
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Pixabay에서 안전 점검 관련 이미지 가져오기
  useEffect(() => {
    const fetchSafetyImages = async () => {
      try {
        const queries = [
          'construction safety hard hat',
          'school safety inspection',
          'PPE protective equipment',
          'laboratory safety',
          'site inspection safety'
        ];
        
        const imagePromises = queries.map(query => 
          fetch(`/api/pixabay?query=${encodeURIComponent(query)}&per_page=2&page=1`)
            .then(res => res.json())
            .then(data => data.hits[0]) // 첫 번째 이미지만 사용
            .catch(() => null)
        );

        const fetchedImages = await Promise.all(imagePromises);
        const validImages = fetchedImages.filter(img => img !== null);
        
        // 폴백 이미지 추가 (API 실패시)
        if (validImages.length === 0) {
          setImages([
            {
              id: 1,
              webformatURL: '/api/placeholder/720/520?text=안전점검',
              tags: '안전 점검, safety inspection'
            }
          ]);
        } else {
          setImages(validImages);
        }
      } catch (error) {
        console.error('Failed to fetch safety images:', error);
        // 폴백 이미지
        setImages([
          {
            id: 1,
            webformatURL: '/api/placeholder/720/520?text=안전점검',
            tags: '안전 점검, safety inspection'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchSafetyImages();
  }, []);

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
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-10 min-h-[70vh] py-16 md:py-20">
          
          {/* Left: Text */}
          <div className="order-2 lg:order-1 lg:col-span-5">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight break-keep [text-wrap:balance] text-gray-900">
              체계적인 학교 안전보건 시스템 구축,
              <span className="block text-gray-900 mt-2">
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
          <div className="order-1 lg:order-2 lg:col-span-7 relative">
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

            {/* 이미지 하단 정보 */}
            <div className="mt-3 text-xs text-gray-500 text-center">
              이미지 출처: Pixabay (상업적 이용 가능)
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}