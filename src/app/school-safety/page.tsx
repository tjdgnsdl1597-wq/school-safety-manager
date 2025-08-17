'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import HeroSplit from '@/components/HeroSplit';

// Hero Section Component
const HeroSection = () => (
  <section className="relative min-h-[65vh] py-16 md:py-20 flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
  {/* Background Pattern */}
  <div className="absolute inset-0 opacity-10">
    <div className="absolute top-10 left-10 w-24 h-24 bg-blue-400 rounded-full blur-2xl"></div>
    <div className="absolute top-40 right-20 w-36 h-36 bg-emerald-400 rounded-full blur-2xl"></div>
    <div className="absolute bottom-20 left-1/3 w-28 h-28 bg-purple-400 rounded-full blur-2xl"></div>
  </div>

  {/* Content */}
  <div className="relative z-10 container mx-auto px-4 sm:px-6 text-center">
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="max-w-3xl md:max-w-4xl mx-auto scale-90 md:scale-95 lg:scale-100 origin-center"
    >
      <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-bold text-white mb-6 leading-[1.2] [text-wrap:balance] break-keep">
  체계적인 학교 안전보건 시스템 구축,
  <span className="block text-blue-300 mt-3">
    인천광역시학교안전공제회가 가장 든든한 파트너가 되겠습니다.
  </span>
</h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="text-base md:text-lg text-gray-300 mb-8 leading-relaxed"
      >
        <p className="font-semibold text-emerald-300 mb-3">
          법규 준수부터 재해 예방까지, 원스톱 학교 안전 솔루션
        </p>
        <p className="max-w-3xl mx-auto text-gray-300 text-base md:text-lg leading-relaxed break-keep whitespace-pre-line text-center">
  {`복잡한 중대재해처벌법과 산업안전보건법, 교육 현장의 수많은 업무와 병행하기에 어려움이 많으셨을 겁니다.
학생과 교직원의 안전을 책임져야 한다는 막중한 부담감, 이제 안전공제회 산업안전팀이 함께 나누겠습니다.`}
</p>
      </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-4xl mx-auto border border-white/20"
        >
          <p className="text-gray-200 leading-relaxed">
            저희는 안전한 학교를 위한 맞춤형 안전보건 관리체계 구축을 약속합니다. 
            매월 전문 담당자가 학교 현장을 직접 방문하여 법적 요구사항 이행 여부를 정밀하게 진단하고 
            실질적인 개선 방안을 제시합니다.
          </p>
          <p className="text-gray-200 leading-relaxed mt-4">
            이를 통해 관리감독자(학교장)에게는 명확한 의무 이행 로드맵을, 
            안전보건실무자(행정실장, 행정주무관, 영양교사 등)에게는 과도한 실무 부담의 감소를 목표합니다.
          </p>
        </motion.div>
      </motion.div>
    </div>
  </section>
);

// Core Values Section
const CoreValuesSection = () => {
  const values = [
    {
      icon: "🛡️",
      title: "전문성",
      description: "축적된 노하우와 전문 지식으로 안전한 교육환경을 조성합니다"
    },
    {
      icon: "🤝",
      title: "신뢰성",
      description: "투명하고 체계적인 관리로 학교와 함께 성장하는 파트너십을 구축합니다"
    },
    {
      icon: "⚡",
      title: "실효성",
      description: "현장 중심의 실질적인 솔루션으로 실제 개선 효과를 제공합니다"
    },
    {
      icon: "🎯",
      title: "맞춤성",
      description: "각 학교의 특성과 환경에 맞는 차별화된 안전관리 서비스를 제공합니다"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            우리의 핵심 가치
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            안전한 교육환경 조성을 위한 확고한 신념과 전문성
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-500 hover:scale-105"
            >
              <div className="text-6xl mb-6 text-center">{value.icon}</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">{value.title}</h3>
              <p className="text-gray-600 leading-relaxed text-center">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Consulting Areas Section
const ConsultingAreasSection = () => {
  const areas = [
    {
      title: "학교 중대재해 예방",
      description: "학교 내 모든 구성원의 생명과 안전을 지키는 것을 최우선 목표로 합니다. 잠재적 위험요소를 사전에 발굴하고, 중대재해로 이어질 수 있는 모든 가능성을 차단하는 포괄적인 안전 시스템을 구축합니다.",
      icon: "🏫",
      color: "from-red-500 to-red-600"
    },
    {
      title: "교직원 산업재해 예방",
      description: "특히 급식실, 시설관리, 과학실 등 산업재해 발생 위험이 높은 현업업무 종사자를 대상으로 하는 집중 관리 프로그램을 운영합니다. 작업 환경 분석부터 안전 수칙 교육까지, 현장 맞춤형 솔루션으로 산업재해 'Zero'를 실현합니다.",
      icon: "👷",
      color: "from-blue-500 to-blue-600"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            주요 컨설팅 범위
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            포괄적이고 체계적인 학교 안전관리 서비스
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {areas.map((area, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500 hover:scale-105">
                <div className={`w-20 h-20 bg-gradient-to-r ${area.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <span className="text-4xl">{area.icon}</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">{area.title}</h3>
                <p className="text-gray-600 leading-relaxed">{area.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Main Tasks Section
const MainTasksSection = () => {
  const tasks = [
    {
      number: "01",
      icon: "🔍",
      title: "정기적인 방문 컨설팅 및 현장 점검",
      summary: "전문 담당자가 현장을 직접 방문하여 체계적인 점검과 컨설팅을 제공합니다",
      details: [
        "맞춤형 위험요인 관리",
        "안전보건표지 점검",
        "관계 법령 준수 컨설팅"
      ]
    },
    {
      number: "02",
      icon: "⚖️",
      title: "빈틈없는 안전관리 유해·위험요인 발굴, 위험성평가",
      summary: "체계적인 위험성 평가를 통해 안전사고를 사전에 예방합니다",
      details: [
        "정기/수시 위험성평가",
        "실효성 있는 개선 대책"
      ]
    },
    {
      number: "03",
      icon: "📚",
      title: "교직원 및 현업근로자 맞춤형 안전보건교육 지원",
      summary: "현장 특성에 맞는 실질적인 안전보건교육을 제공합니다",
      details: [
        "법정 의무 교육",
        "현장 맞춤형 특별 교육",
        "MSDS 교육",
        "보호구 교육"
      ]
    },
    {
      number: "04",
      icon: "🏥",
      title: "체계적인 보건관리 및 재해 대응",
      summary: "종합적인 보건관리와 신속한 재해 대응 체계를 구축합니다",
      details: [
        "근골격계 유해요인 조사",
        "중대재해 대응",
        "법령 기반 수행"
      ]
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            주요 과업 내용
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            단계별 체계적 접근으로 완성하는 안전한 교육환경
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {tasks.map((task, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-500 hover:scale-105">
                <div className="flex items-start space-x-6 mb-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl group-hover:scale-110 transition-transform duration-300">
                      {task.number}
                    </div>
                  </div>
                  <div className="flex-grow">
                    <div className="text-4xl mb-4">{task.icon}</div>
                    <h3 className="text-xl font-bold text-gray-800 mb-3 leading-tight">{task.title}</h3>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-6 leading-relaxed">{task.summary}</p>
                
                <div className="space-y-2">
                  {task.details.map((detail, detailIndex) => (
                    <div key={detailIndex} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                      <span className="text-gray-700">{detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Image Gallery Section with 3 Categories and Slide Animation
const ImageGallerySection = () => {
  // 3개 카테고리별 이미지 3장씩 총 9장 (GitHub 업로드된 실제 이미지 사용)
  const galleryCategories = [
    {
      id: 'education',
      title: '현장교육',
      description: '안전보건 교육 및 훈련',
      images: [
        {
          id: 1,
          src: '/images/gallery/education-1.jpg',
          alt: '안전보건 교육 현장'
        },
        {
          id: 2,
          src: '/images/gallery/education-2.jpg',
          alt: 'PPE 착용 교육'
        },
        {
          id: 3,
          src: '/images/gallery/education-3.jpg',
          alt: '화재 대피 훈련'
        }
      ]
    },
    {
      id: 'inspection',
      title: '측정점검',
      description: '정기 안전 점검 및 측정',
      images: [
        {
          id: 4,
          src: '/images/gallery/inspection-1.jpg',
          alt: '시설 안전 점검'
        },
        {
          id: 5,
          src: '/images/gallery/inspection-2.jpg',
          alt: '환경 측정 활동'
        },
        {
          id: 6,
          src: '/images/gallery/inspection-3.jpg',
          alt: '위험요소 점검'
        }
      ]
    },
    {
      id: 'improvement',
      title: '조치개선',
      description: '위험요소 개선 및 조치',
      images: [
        {
          id: 7,
          src: '/images/gallery/improvement-1.jpg',
          alt: '안전시설 개선'
        },
        {
          id: 8,
          src: '/images/gallery/improvement-2.jpg',
          alt: '환경 개선 작업'
        },
        {
          id: 9,
          src: '/images/gallery/improvement-3.jpg',
          alt: '안전장비 설치'
        }
      ]
    }
  ];

  // 각 카테고리별 현재 이미지 인덱스 상태
  const [currentImageIndex, setCurrentImageIndex] = useState({
    education: 0,
    inspection: 0,
    improvement: 0
  });

  // 자동 슬라이드 효과
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex(prev => ({
        education: (prev.education + 1) % 3,
        inspection: (prev.inspection + 1) % 3,
        improvement: (prev.improvement + 1) % 3
      }));
    }, 2000); // 2초마다 변경

    return () => clearInterval(interval);
  }, []);

  // 수동 이미지 변경 함수
  const handleImageChange = (categoryId: string, direction: 'prev' | 'next') => {
    setCurrentImageIndex(prev => {
      const currentIndex = prev[categoryId as keyof typeof prev];
      const newIndex = direction === 'next' 
        ? (currentIndex + 1) % 3 
        : (currentIndex - 1 + 3) % 3;
      
      return {
        ...prev,
        [categoryId]: newIndex
      };
    });
  };

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            현장 활동 갤러리
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            실제 학교 현장에서의 안전관리 활동 모습들
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {galleryCategories.map((category, categoryIndex) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: categoryIndex * 0.2 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-500">
                {/* 카테고리 제목 */}
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-xl font-bold text-gray-800 text-center mb-2">
                    {category.title}
                  </h3>
                  <p className="text-sm text-gray-600 text-center">
                    {category.description}
                  </p>
                </div>

                {/* 이미지 슬라이더 */}
                <div className="relative aspect-video overflow-hidden">
                  <div 
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{ 
                      transform: `translateX(-${currentImageIndex[category.id as keyof typeof currentImageIndex] * 100}%)` 
                    }}
                  >
                    {category.images.map((image, imageIndex) => (
                      <div key={image.id} className="w-full flex-shrink-0 relative">
                        <Image
                          src={image.src}
                          alt={image.alt}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 33vw"
                          loading="lazy"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=640&h=360&fit=crop&crop=center&q=80&auto=format`;
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  {/* 네비게이션 버튼 */}
                  <div className="absolute bottom-4 left-4 flex space-x-2 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button 
                      onClick={() => handleImageChange(category.id, 'prev')}
                      className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                      aria-label="이전 이미지"
                    >
                      ←
                    </button>
                    <button 
                      onClick={() => handleImageChange(category.id, 'next')}
                      className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                      aria-label="다음 이미지"
                    >
                      →
                    </button>
                  </div>

                  {/* 이미지 인디케이터 */}
                  <div className="absolute bottom-4 right-4 flex space-x-1">
                    {[0, 1, 2].map((index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(prev => ({
                          ...prev,
                          [category.id]: index
                        }))}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          currentImageIndex[category.id as keyof typeof currentImageIndex] === index 
                            ? 'bg-blue-500' 
                            : 'bg-white/50'
                        }`}
                        aria-label={`${index + 1}번째 이미지로 이동`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-gray-500">
            실제 학교 현장에서의 안전관리 활동 모습들을 확인하실 수 있습니다.
          </p>
        </div>
      </div>
    </section>
  );
};

// Trust and Compliance Section
const TrustComplianceSection = () => {
  const regulations = [
    { name: "중대재해 처벌 등에 관한 법률", code: "중대재해처벌법" },
    { name: "기준에관한규칙, 시행령, 시행규칙", code: "산업안전보건법" },
    { name: "학교안전사고 예방 및 보상에 관한 법률", code: "학교안전법" }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            신뢰와 준법 기반
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            관련 법령과 기준을 철저히 준수하는 전문적인 서비스
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {regulations.map((regulation, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500 hover:scale-105">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-white font-bold text-2xl">✓</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">{regulation.code}</h3>
                  <p className="text-gray-600 leading-relaxed break-keep">{regulation.name}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Legal Notice Section
const LegalNoticeSection = () => (
  <section className="py-12 bg-gray-100">
    <div className="container mx-auto px-6">
      <div className="text-center">
        <p className="text-gray-600 text-sm max-w-4xl mx-auto leading-relaxed">
          본 페이지는 관련 법령 준수 지원을 위한 일반적 정보 제공 목적이며, 개별 사안에 따라 전문 자문이 필요할 수 있습니다.
        </p>
      </div>
    </div>
  </section>
);

// Main Page Component
export default function SchoolSafetyPage() {
  return (
    <div className="min-h-screen">
      <HeroSplit />
      <CoreValuesSection />
      <ConsultingAreasSection />
      <MainTasksSection />
      <ImageGallerySection />
      <TrustComplianceSection />
      <LegalNoticeSection />
    </div>
  );
}
