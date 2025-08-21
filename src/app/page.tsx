'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/simpleAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import HeroSplit from '@/components/HeroSplit';
import CopyrightFooter from '@/components/CopyrightFooter';
import { motion } from 'framer-motion';


// Initial Selection Screen Component
const InitialSelectionScreen = () => {
  const router = useRouter();
  
  const handleVisitorClick = () => {
    // 방문자용 페이지로 이동 (현재 페이지 콘텐츠 표시)
    window.location.hash = 'visitor-content';
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  };

  const handleManagerClick = () => {
    // 안전관리자 로그인 페이지로 이동
    router.push('/auth/signin');
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex flex-col overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-400 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-48 h-48 bg-emerald-400 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-purple-400 rounded-full blur-3xl animate-pulse delay-2000"></div>
        <div className="absolute bottom-40 right-1/4 w-36 h-36 bg-pink-400 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col px-4 sm:px-6 text-center py-safe" style={{
        height: 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
        minHeight: 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
        maxHeight: 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))'
      }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex-1 flex flex-col justify-center"
        >
          {/* Logo/Title */}
          <div className="flex-shrink-0 mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-4"
            >
              <div 
                className="mx-auto mb-4 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center border border-white/20"
                style={{
                  width: 'clamp(60px, 15vw, 96px)',
                  height: 'clamp(60px, 15vw, 96px)'
                }}
              >
                <span style={{ fontSize: 'clamp(24px, 6vw, 48px)' }}>🏫</span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="font-bold text-white mb-2 leading-tight"
              style={{ fontSize: 'clamp(24px, 6vw, 48px)' }}
            >
              학교안전보건 관리시스템
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-blue-200 mb-6"
              style={{ fontSize: 'clamp(14px, 3.5vw, 20px)' }}
            >
              인천광역시학교안전공제회
            </motion.p>
          </div>

          {/* Selection Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex-1 flex flex-col md:grid md:grid-cols-2 max-w-4xl mx-auto w-full gap-6 md:gap-8"
            style={{ 
              minHeight: '0'
            }}
          >
            {/* 학교 관계자 버튼 */}
            <motion.button
              onClick={handleVisitorClick}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl hover:bg-white/20 transition-all duration-500 hover:shadow-2xl hover:border-white/40 flex-1 flex items-center md:flex-col md:text-center md:justify-center p-6 md:p-10"
              style={{ 
                minHeight: 'clamp(120px, 20vh, 200px)'
              }}
            >
              {/* 모바일: 가로 레이아웃 */}
              <div className="flex items-center text-left w-full md:hidden">
                <div 
                  className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-3xl flex items-center justify-center mr-6 group-hover:scale-110 transition-transform duration-300 shadow-2xl flex-shrink-0"
                  style={{
                    width: 'clamp(60px, 12vw, 100px)',
                    height: 'clamp(60px, 12vw, 100px)'
                  }}
                >
                  <span className="text-white" style={{ fontSize: 'clamp(24px, 5vw, 40px)' }}>🏫</span>
                </div>
                <div className="flex-1">
                  <h2 
                    className="font-bold text-white mb-2 leading-tight"
                    style={{ fontSize: 'clamp(18px, 4vw, 28px)' }}
                  >
                    학교 관계자
                  </h2>
                  <p 
                    className="text-gray-300 leading-relaxed"
                    style={{ fontSize: 'clamp(12px, 2.5vw, 16px)' }}
                  >
                    학교안전보건 정보와<br />교육자료를 확인하실 수 있습니다
                  </p>
                </div>
              </div>

              {/* 데스크톱: 세로 레이아웃 */}
              <div className="hidden md:flex md:flex-col md:items-center md:text-center">
                <div className="w-32 h-32 bg-gradient-to-r from-green-400 to-emerald-500 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 shadow-2xl">
                  <span className="text-white text-6xl">🏫</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">학교 관계자</h2>
                <p className="text-gray-300 leading-relaxed text-lg">
                  학교안전보건 정보와<br />
                  교육자료를 확인하실 수 있습니다
                </p>
              </div>
              
              {/* Hover Effect */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-green-400/20 to-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </motion.button>

            {/* 공제회 관리자 버튼 */}
            <motion.button
              onClick={handleManagerClick}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl hover:bg-white/20 transition-all duration-500 hover:shadow-2xl hover:border-white/40 flex-1 flex items-center md:flex-col md:text-center md:justify-center p-6 md:p-10"
              style={{ 
                minHeight: 'clamp(120px, 20vh, 200px)'
              }}
            >
              {/* 모바일: 가로 레이아웃 */}
              <div className="flex items-center text-left w-full md:hidden">
                <div 
                  className="bg-gradient-to-r from-blue-400 to-blue-500 rounded-3xl flex items-center justify-center mr-6 group-hover:scale-110 transition-transform duration-300 shadow-2xl flex-shrink-0"
                  style={{
                    width: 'clamp(60px, 12vw, 100px)',
                    height: 'clamp(60px, 12vw, 100px)'
                  }}
                >
                  <span className="text-white" style={{ fontSize: 'clamp(24px, 5vw, 40px)' }}>⛑️</span>
                </div>
                <div className="flex-1">
                  <h2 
                    className="font-bold text-white mb-2 leading-tight"
                    style={{ fontSize: 'clamp(18px, 4vw, 28px)' }}
                  >
                    공제회 관리자
                  </h2>
                  <p 
                    className="text-gray-300 leading-relaxed"
                    style={{ fontSize: 'clamp(12px, 2.5vw, 16px)' }}
                  >
                    시스템 관리 및<br />안전업무를 수행하실 수 있습니다
                  </p>
                </div>
              </div>

              {/* 데스크톱: 세로 레이아웃 */}
              <div className="hidden md:flex md:flex-col md:items-center md:text-center">
                <div className="w-32 h-32 bg-gradient-to-r from-blue-400 to-blue-500 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 shadow-2xl">
                  <span className="text-white text-6xl">⛑️</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">공제회 관리자</h2>
                <p className="text-gray-300 leading-relaxed text-lg">
                  시스템 관리 및<br />
                  안전업무를 수행하실 수 있습니다
                </p>
              </div>
              
              {/* Hover Effect */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-400/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </motion.button>
          </motion.div>

          {/* Bottom Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="mt-12 text-gray-400 text-sm"
          >
            <p>목적에 맞는 서비스를 선택해 주세요</p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

// Personal Introduction Section Component
const PersonalIntroSection = () => {
  
  return (
    <section className="relative py-12 md:py-16 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 right-10 w-48 h-48 bg-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-64 h-64 bg-indigo-200/15 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">담당자 소개</h2>
          <p className="text-lg text-gray-600">학교 안전보건 전담 컨설턴트</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 md:gap-12 items-start">
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
                className="text-center lg:text-left"
              >
                <div className="relative inline-block">
                  <div className="relative w-48 h-64 md:w-56 md:h-72 rounded-3xl overflow-hidden shadow-2xl ring-4 ring-blue-500/20">
                    <Image
                      src="/images/admin_profile.png"
                      alt="강성훈 대리 프로필"
                      fill
                      sizes="(max-width: 768px) 192px, 224px"
                      priority
                      className="object-cover object-center rounded-3xl"
                    />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white"></div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                viewport={{ once: true }}
                className="lg:col-span-3 text-center lg:text-left"
              >
                <div className="mb-8">
                  <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">강성훈</h3>
                  <p className="text-xl md:text-2xl text-blue-600 font-semibold mb-6">인천광역시학교안전공제회 산업안전팀 대리</p>
                  
                  <div className="p-6 md:p-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border-l-4 border-blue-500 mb-8">
                    <p className="text-gray-800 text-lg md:text-xl leading-relaxed font-medium">
                      현업근로자와 교직원의 안전을 현장의 목소리와 표준 절차로 지키는 것이 저의 일입니다.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    <div className="flex items-center justify-center lg:justify-start space-x-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                      <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-white text-lg">📞</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">연락처</p>
                        <p className="text-gray-900 font-bold text-lg">010-8764-2428</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-center lg:justify-start space-x-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                      <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-white text-lg">✉️</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">이메일</p>
                        <p className="text-gray-900 font-bold text-lg">safe08@ssif.or.kr</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 rounded-xl border-l-4 border-yellow-400">
              <div className="text-sm text-gray-700 text-center">
                <p><strong>기본 응대:</strong> 평일 08:30–17:00</p>
                <p><strong>긴급 상황:</strong> 즉시 연락 바랍니다</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

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
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
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
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        viewport={{ once: true }}
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
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
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
      description: "특히 급식실, 시설관리 등 산업재해 발생 위험이 높은 현업업무 종사자를 대상으로 하는 집중 관리 프로그램을 운영합니다. 작업 환경 분석부터 안전 수칙 교육까지, 현장 맞춤형 솔루션으로 산업재해 'Zero'를 실현합니다.",
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
  // 3개 카테고리별 이미지 3장씩 총 9장 (실제 업로드된 이미지 사용)
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
      description: '장비 활용 안전점검',
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
    }, 2500); // 2.5초마다 변경

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
                <div className="relative w-full h-64 md:h-72 overflow-hidden rounded-lg">
                  <div 
                    className="flex transition-transform duration-500 ease-in-out h-full"
                    style={{ 
                      transform: `translateX(-${currentImageIndex[category.id as keyof typeof currentImageIndex] * 100}%)` 
                    }}
                  >
                    {category.images.map((image, imageIndex) => (
                      <div key={image.id} className="w-full h-full flex-shrink-0 relative">
                        <Image
                          src={image.src}
                          alt={image.alt}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 33vw"
                          priority={imageIndex === 0}
                          loading={imageIndex === 0 ? undefined : "lazy"}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            // 이미 fallback으로 변경되었다면 더 이상 변경하지 않음
                            if (target.src.includes('data:image') || target.dataset.fallbackUsed) {
                              return;
                            }
                            
                            // fallback 사용 표시
                            target.dataset.fallbackUsed = 'true';
                            
                            // 단순한 placeholder 이미지로 변경
                            target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360"%3E%3Crect width="100%25" height="100%25" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial" font-size="16" fill="%236b7280" text-anchor="middle" dy=".3em"%3E이미지 로딩 실패%3C/text%3E%3C/svg%3E';
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

// Quick Menu Section for Materials
const QuickMenuSection = () => (
  <section className="py-16 bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
    <div className="container mx-auto px-6">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">안전자료 바로가기</h2>
        <p className="text-xl text-gray-600">필요한 안전보건 자료를 쉽고 빠르게 찾아보세요</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <Link href="/educational-materials" className="group">
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-500 hover:scale-105">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-white text-3xl">📚</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">교육 자료</h3>
              <p className="text-gray-600 leading-relaxed">안전보건 교육에 필요한 다양한 자료와 매뉴얼을 확인하실 수 있습니다.</p>
            </div>
          </div>
        </Link>
        
        <Link href="/industrial-accidents" className="group">
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-500 hover:scale-105">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-white text-3xl">⚠️</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">중대재해 알리미</h3>
              <p className="text-gray-600 leading-relaxed">학교 현장에서 발생할 수 있는 중대재해 예방을 위한 사례와 정보를 제공합니다.</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  </section>
);

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

// --- Main Component ---
export default function HomePage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showSelection, setShowSelection] = useState(true);
  const [showVisitorContent, setShowVisitorContent] = useState(false);

  // 해시 변경 감지
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#visitor-content') {
        setShowSelection(false);
        setShowVisitorContent(true);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // URL 파라미터 체크 (visitor=true면 방문자 콘텐츠 표시)
  useEffect(() => {
    const visitor = searchParams.get('visitor');
    if (visitor === 'true') {
      setShowSelection(false);
      setShowVisitorContent(true);
    }
  }, [searchParams]);

  // 로그인된 사용자는 대시보드로 리다이렉트
  useEffect(() => {
    if (isAuthenticated && !loading) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, loading, router]);

  // 로딩 중이면 로딩 표시
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  // 방문자 콘텐츠 표시
  if (showVisitorContent) {
    return (
      <div className="min-h-screen">
        <HeroSplit />
        <HeroSection />
        <CoreValuesSection />
        <ConsultingAreasSection />
        <MainTasksSection />
        <ImageGallerySection />
        <TrustComplianceSection />
        <QuickMenuSection />
        <LegalNoticeSection />
      </div>
    );
  }

  // 초기 선택 화면 표시 (로그인되지 않은 경우만)
  if (showSelection && !isAuthenticated) {
    return <InitialSelectionScreen />;
  }

  // 기본 콘텐츠 (fallback)
  return (
    <div className="min-h-screen">
      <HeroSplit />
      <HeroSection />
      <CoreValuesSection />
      <ConsultingAreasSection />
      <MainTasksSection />
      <ImageGallerySection />
      <TrustComplianceSection />
      <QuickMenuSection />
      <LegalNoticeSection />
      <CopyrightFooter />
    </div>
  );
}