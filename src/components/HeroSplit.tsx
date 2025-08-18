'use client';

import { useState, useEffect } from 'react';
import Image from "next/image";
import { motion } from 'framer-motion';

export default function HeroSplit() {
  const [currentImage, setCurrentImage] = useState(0);
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 업로드된 Hero 이미지 사용
  useEffect(() => {
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

  // 자동 슬라이드 효과 (5초마다)
  useEffect(() => {
    if (images.length > 1) {
      const interval = setInterval(() => {
        setCurrentImage((prev) => (prev + 1) % images.length);
      }, 5000);

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
    <section className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-hidden">
      {/* 배경 장식 요소들 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-20 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-32 left-20 w-96 h-96 bg-indigo-200/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-200/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* 기하학적 패턴 */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div className="absolute top-10 right-10 w-32 h-32 border-2 border-blue-400 rotate-12 animate-bounce"></div>
        <div className="absolute bottom-20 left-10 w-24 h-24 border-2 border-indigo-400 -rotate-6 animate-pulse"></div>
        <div className="absolute top-1/3 left-1/4 w-16 h-16 border-2 border-cyan-400 rotate-45 animate-spin" style={{animationDuration: '8s'}}></div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-12 min-h-screen py-16 md:py-20">
          
          {/* Left: Personal Introduction Card */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="order-2 lg:order-1 lg:col-span-6"
          >
            {/* 메인 소개 카드 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-500 hover:scale-[1.02]">
              {/* 프로필 헤더 */}
              <div className="flex items-center mb-8">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-xl">
                    강성훈
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                </div>
                <div className="ml-6">
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">강성훈</h1>
                  <p className="text-blue-600 font-semibold">인천광역시학교안전공제회 산업안전팀 대리</p>
                </div>
              </div>

              {/* 한 줄 요약 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border-l-4 border-blue-500"
              >
                <p className="text-gray-800 text-lg leading-relaxed font-medium">
                  현업근로자와 교직원의 안전을 현장의 목소리와 표준 절차로 지키는 것이 저의 일입니다.
                </p>
              </motion.div>

              {/* 주요 역할 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="mb-8"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <span className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white text-sm">🛡️</span>
                  </span>
                  주요 업무
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    '정기적인 현장 방문 및 안전점검 실시',
                    '맞춤형 산업안전보건 교육 기획·운영',
                    '위험요인 발굴 및 개선방안 컨설팅',
                    '산안법·중대재해처벌법 준수 지원',
                    '위험성평가 실시 및 관리체계 구축',
                    '사고예방 및 안전문화 정착 지원'
                  ].map((item, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                      className="flex items-center space-x-3 p-3 rounded-xl hover:bg-blue-50 transition-colors group"
                    >
                      <div className="w-2 h-2 bg-blue-500 rounded-full group-hover:scale-125 transition-transform"></div>
                      <span className="text-gray-700 text-sm font-medium">{item}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* 연락처 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0, duration: 0.6 }}
                className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-4">연락처</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm">📞</span>
                    </div>
                    <span className="text-gray-700 font-semibold">010-8764-2428</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm">✉️</span>
                    </div>
                    <span className="text-gray-700 font-semibold">safe08@ssif.or.kr</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-4 p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                    <p><strong>기본 응대:</strong> 평일 08:30–17:00</p>
                    <p><strong>긴급 상황:</strong> 즉시 연락 바랍니다</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right: Image Gallery */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="order-1 lg:order-2 lg:col-span-6"
          >
            {/* 현장 활동 갤러리 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-white/20">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">현장 활동</h3>
                <p className="text-gray-600">실제 학교 현장에서의 안전관리 활동</p>
              </div>

              <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden">
                {loading ? (
                  <div className="w-full h-full bg-gray-200 rounded-2xl flex items-center justify-center">
                    <div className="text-gray-500">이미지 로딩 중...</div>
                  </div>
                ) : (
                  <>
                    {/* 이미지들을 겹쳐서 배치하고 opacity로 전환 */}
                    {images.map((image, index) => (
                      <Image
                        key={image.id}
                        src={image.webformatURL || '/api/placeholder/720/520?text=안전점검'}
                        alt={`현장 안전 점검 장면 ${index + 1}`}
                        fill
                        sizes="(min-width:1024px) 720px, 100vw"
                        className={`object-cover transition-opacity duration-1000 ease-in-out ${
                          currentImage === index ? 'opacity-100' : 'opacity-0'
                        }`}
                        priority={index === 0}
                        loading={index === 0 ? "eager" : "lazy"}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          const fallbackImages = [
                            'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=720&h=520&q=80',
                            'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=720&h=520&q=80',
                            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=720&h=520&q=80'
                          ];
                          target.src = fallbackImages[index % 3];
                        }}
                      />
                    ))}
                    
                    {/* 이미지 슬라이드 네비게이션 */}
                    {images.length > 1 && (
                      <>
                        {/* 네비게이션 버튼 */}
                        <div className="absolute bottom-4 left-4 flex space-x-2 bg-black/20 backdrop-blur-sm rounded-xl p-2 opacity-0 hover:opacity-100 transition-opacity duration-300">
                          <button 
                            onClick={prevImage}
                            className="w-10 h-10 flex items-center justify-center bg-white/90 hover:bg-white rounded-lg transition-colors text-gray-800 font-bold"
                            aria-label="이전 이미지"
                          >
                            ←
                          </button>
                          <button 
                            onClick={nextImage}
                            className="w-10 h-10 flex items-center justify-center bg-white/90 hover:bg-white rounded-lg transition-colors text-gray-800 font-bold"
                            aria-label="다음 이미지"
                          >
                            →
                          </button>
                        </div>

                        {/* 이미지 인디케이터 */}
                        <div className="absolute bottom-4 right-4 flex space-x-2">
                          {images.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentImage(index)}
                              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                currentImage === index 
                                  ? 'bg-white shadow-lg scale-125' 
                                  : 'bg-white/50 hover:bg-white/75'
                              }`}
                              aria-label={`${index + 1}번째 이미지로 이동`}
                            />
                          ))}
                        </div>

                        {/* 진행 표시 바 */}
                        <div className="absolute top-4 left-4 right-4">
                          <div className="w-full bg-black/20 h-1 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-white/90 rounded-full transition-all duration-1000 ease-linear"
                              style={{ 
                                width: `${((currentImage + 1) / images.length) * 100}%` 
                              }}
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>

              {/* 이미지 설명 */}
              <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                <p className="text-sm text-gray-600 text-center">
                  정기 방문을 통한 현장 점검, 맞춤형 교육, 위험요인 개선 활동
                </p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}