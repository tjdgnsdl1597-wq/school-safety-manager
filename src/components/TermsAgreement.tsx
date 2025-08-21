/*
 * KSH58 학교 안전관리시스템 - 약관 동의 컴포넌트
 * Copyright (c) 2025 KSH58. All rights reserved.
 * 
 * 이 소스코드와 관련된 모든 지적재산권은 KSH58에게 있습니다.
 * 무단 복제, 배포, 수정을 금지합니다.
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface TermsAgreementProps {
  /** 약관 동의 상태 변경 콜백 */
  onAgreementChange: (isValid: boolean, agreements: AgreementState) => void;
  /** 회원가입용인지 로그인용인지 구분 */
  mode: 'signup' | 'login';
  /** 추가 클래스명 */
  className?: string;
}

interface AgreementState {
  termsAndPrivacy: boolean;
  serviceNotice: boolean;
}

export default function TermsAgreement({ 
  onAgreementChange, 
  mode,
  className = '' 
}: TermsAgreementProps) {
  const [agreements, setAgreements] = useState<AgreementState>({
    termsAndPrivacy: false,
    serviceNotice: false
  });

  const [showDetails, setShowDetails] = useState(false);

  // 전체 동의 체크박스 상태
  const isAllAgreed = agreements.termsAndPrivacy && agreements.serviceNotice;
  const isValid = mode === 'login' || isAllAgreed;

  // 약관 동의 상태 변경 시 부모 컴포넌트에 알림
  useEffect(() => {
    onAgreementChange(isValid, agreements);
  }, [agreements, isValid, onAgreementChange]);

  // 개별 약관 동의 상태 변경
  const handleAgreementChange = (key: keyof AgreementState, value: boolean) => {
    setAgreements(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // 전체 동의 토글
  const handleAllAgreement = (checked: boolean) => {
    setAgreements({
      termsAndPrivacy: checked,
      serviceNotice: checked
    });
  };

  // 회원가입용 UI
  if (mode === 'signup') {
    return (
      <div className={`space-y-4 ${className}`}>
        {/* 서비스 특성 경고 */}
        <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-orange-800">
                ⚠️ 개인 운영 서비스 특성 안내
              </h3>
              <div className="mt-2 text-sm text-orange-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>본 서비스는 개인(KSH58)이 무료로 운영하는 서비스입니다.</li>
                  <li>서버 운영비 부담으로 언제든 서비스가 종료될 수 있습니다.</li>
                  <li>중요한 데이터는 정기적으로 백업하시기 바랍니다.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* 전체 동의 체크박스 */}
        <div className="border rounded-lg p-4 bg-blue-50">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isAllAgreed}
              onChange={(e) => handleAllAgreement(e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 focus:ring-2"
            />
            <span className="ml-3 text-lg font-semibold text-blue-800">
              전체 약관에 동의합니다
            </span>
          </label>
        </div>

        {/* 개별 약관 동의 */}
        <div className="space-y-3">
          {/* 이용약관 및 개인정보처리방침 동의 */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <label className="flex items-center cursor-pointer flex-1">
              <input
                type="checkbox"
                checked={agreements.termsAndPrivacy}
                onChange={(e) => handleAgreementChange('termsAndPrivacy', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="ml-3 text-gray-700">
                <span className="text-red-500 font-bold">[필수]</span> 이용약관 및 개인정보처리방침에 동의합니다
              </span>
            </label>
            <Link
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-sm underline ml-2 flex-shrink-0"
            >
              내용보기
            </Link>
          </div>

          {/* 서비스 특성 고지 동의 */}
          <div className="p-3 border rounded-lg bg-yellow-50">
            <label className="flex items-start cursor-pointer">
              <input
                type="checkbox"
                checked={agreements.serviceNotice}
                onChange={(e) => handleAgreementChange('serviceNotice', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 mt-1 flex-shrink-0"
              />
              <div className="ml-3 text-gray-700">
                <span className="text-red-500 font-bold">[필수]</span> 
                <span className="font-medium"> 서비스 특성 고지에 동의합니다</span>
                <div className="text-xs text-gray-600 mt-1 leading-relaxed">
                  개인 운영 서비스로 언제든 종료될 수 있으며, 데이터 백업은 본인 책임임을 인지하고 동의합니다.
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* 동의 상태 확인 */}
        {!isValid && (
          <div className="text-center p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm font-medium">
              ⚠️ 모든 필수 약관에 동의해주세요
            </p>
          </div>
        )}

        {/* 상세 정보 토글 */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            {showDetails ? '상세 정보 숨기기' : '서비스 상세 정보 보기'}
          </button>
        </div>

        {/* 상세 정보 */}
        {showDetails && (
          <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600 space-y-2">
            <h4 className="font-medium text-gray-800">📋 서비스 상세 정보</h4>
            <ul className="space-y-1 ml-4 list-disc">
              <li>서비스명: KSH58 학교 안전관리시스템</li>
              <li>운영자: KSH58 (개인)</li>
              <li>서비스 형태: 웹 기반 PWA (무료 제공)</li>
              <li>주요 기능: 학교 정보 관리, 일정 관리, 이동시간 계산, 교육자료 공유</li>
              <li>운영 비용: 개인 부담 (회사 지원 없음)</li>
              <li>서비스 지속성: 운영비 부담에 따라 변동 가능</li>
            </ul>
          </div>
        )}
      </div>
    );
  }

  // 로그인용 UI (간단한 안내만)
  return (
    <div className={`${className}`}>
      <div className="text-center p-4 bg-gray-50 rounded-lg border">
        <p className="text-sm text-gray-600">
          회원가입 시 <Link href="/terms" className="text-blue-600 hover:underline">이용약관 및 개인정보처리방침</Link>에 
          동의한 것으로 간주됩니다.
        </p>
        <p className="text-xs text-orange-600 mt-2">
          ⚠️ 개인 운영 무료 서비스로 언제든 종료될 수 있습니다.
        </p>
      </div>
    </div>
  );
}