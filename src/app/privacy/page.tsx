/*
 * KSH58 학교 안전관리시스템 - 개인정보처리방침 페이지
 * Copyright (c) 2025 KSH58. All rights reserved.
 * 
 * 이 소스코드와 관련된 모든 지적재산권은 KSH58에게 있습니다.
 * 무단 복제, 배포, 수정을 금지합니다.
 */

import React from 'react';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50">
      {/* 헤더 */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">K</span>
              </div>
              <h1 className="text-xl font-bold text-gray-800">KSH58 학교 안전관리시스템</h1>
            </div>
            <Link 
              href="/" 
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              메인으로
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
          
          {/* 페이지 제목 */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">개인정보처리방침</h1>
            <div className="w-24 h-1 bg-green-600 mx-auto rounded-full mb-6"></div>
            <p className="text-gray-600 text-lg">KSH58 학교 안전관리시스템 개인정보처리방침</p>
            <div className="mt-4 p-4 bg-green-50 border-l-4 border-green-400 rounded-r-lg">
              <p className="text-green-800 font-medium">
                🔒 개인정보보호법에 따라 이용자의 개인정보를 안전하게 보호합니다.
              </p>
            </div>
          </div>

          {/* 방침 내용 */}
          <div className="space-y-8">
            
            {/* 제1조 개인정보 수집·이용 목적 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-green-200 pb-2">
                제1조 (개인정보 수집·이용 목적)
              </h2>
              <div className="space-y-3 text-gray-700 leading-relaxed">
                <p>
                  KSH58 학교 안전관리시스템은 다음의 목적을 위하여 개인정보를 수집·이용합니다.
                </p>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-bold text-green-800 mb-2">📋 수집·이용 목적</h3>
                  <ul className="space-y-1 text-green-700">
                    <li>• 학교 안전보건 관리 서비스 제공</li>
                    <li>• 회원 가입 및 본인 확인</li>
                    <li>• 일정 관리 및 업무 효율성 지원</li>
                    <li>• 서비스 개선 및 사용자 지원</li>
                    <li>• 중요 공지사항 전달</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 제2조 개인정보 수집 항목 및 방법 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-green-200 pb-2">
                제2조 (개인정보 수집 항목 및 방법)
              </h2>
              <div className="space-y-4 text-gray-700">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-bold text-blue-800 mb-2">📝 필수 수집 항목</h3>
                  <ul className="space-y-1 text-blue-700">
                    <li>• 아이디(사용자명)</li>
                    <li>• 비밀번호(암호화 저장)</li>
                    <li>• 실명</li>
                    <li>• 직급/직책</li>
                    <li>• 연락처(전화번호)</li>
                    <li>• 이메일 주소</li>
                    <li>• 소속 부서</li>
                  </ul>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-bold text-purple-800 mb-2">📝 선택 수집 항목</h3>
                  <ul className="space-y-1 text-purple-700">
                    <li>• 프로필 사진</li>
                    <li>• 집 주소(이동시간 계산용)</li>
                    <li>• 회사 주소(이동시간 계산용)</li>
                    <li>• 기타 업무 관련 정보</li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-bold text-gray-800 mb-2">🔄 수집 방법</h3>
                  <p className="text-gray-700">
                    회원가입 시 직접 입력, 서비스 이용 과정에서 사용자가 직접 입력
                  </p>
                </div>
              </div>
            </section>

            {/* 제3조 개인정보 보유·이용 기간 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-green-200 pb-2">
                제3조 (개인정보 보유·이용 기간)
              </h2>
              <div className="space-y-4 text-gray-700">
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                  <h3 className="font-bold text-yellow-800 mb-2">⏰ 보유 기간</h3>
                  <ul className="space-y-2 text-yellow-700">
                    <li>• <strong>회원 탈퇴 시:</strong> 즉시 삭제</li>
                    <li>• <strong>서비스 종료 시:</strong> 30일 후 완전 삭제</li>
                    <li>• <strong>휴면 계정:</strong> 1년 미접속 시 별도 저장 후 삭제</li>
                    <li>• <strong>법정 보관 의무:</strong> 관련 법령에 따른 의무 보관 기간 준수</li>
                  </ul>
                </div>
                <p>
                  개인정보 수집 및 이용목적이 달성된 후에는 지체 없이 파기합니다.
                </p>
              </div>
            </section>

            {/* 제4조 개인정보 제3자 제공 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-green-200 pb-2">
                제4조 (개인정보 제3자 제공)
              </h2>
              <div className="space-y-3 text-gray-700">
                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                  <h3 className="font-bold text-red-800 mb-2">🚫 제3자 제공 금지 원칙</h3>
                  <ul className="space-y-1 text-red-700">
                    <li>• 원칙적으로 개인정보를 제3자에게 제공하지 않습니다.</li>
                    <li>• 사용자 동의 없이 외부에 제공하지 않습니다.</li>
                    <li>• 법령에 의해 요구되는 경우에만 예외적으로 제공합니다.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 제5조 개인정보 안전성 확보조치 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-green-200 pb-2">
                제5조 (개인정보 안전성 확보조치)
              </h2>
              <div className="space-y-4 text-gray-700">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-bold text-blue-800 mb-2">🔐 기술적 보호조치</h3>
                  <ul className="space-y-1 text-blue-700">
                    <li>• 비밀번호 암호화(해시 처리)</li>
                    <li>• HTTPS 보안 연결</li>
                    <li>• 데이터베이스 접근 제한</li>
                    <li>• 정기적인 보안 업데이트</li>
                  </ul>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-bold text-purple-800 mb-2">🔒 관리적 보호조치</h3>
                  <ul className="space-y-1 text-purple-700">
                    <li>• 개인정보 접근 권한 최소화</li>
                    <li>• 정기적인 개인정보보호교육(개인 운영으로 자체 학습)</li>
                    <li>• 개인정보 처리 현황 점검</li>
                    <li>• 사고 발생 시 즉시 대응체계</li>
                  </ul>
                </div>
                <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
                  <p className="text-orange-800">
                    <strong>⚠️ 주의:</strong> 개인 운영 서비스의 특성상 대기업 수준의 보안 시설을 갖추지는 못하나, 
                    최선의 노력으로 개인정보를 보호합니다.
                  </p>
                </div>
              </div>
            </section>

            {/* 제6조 이용자의 권리와 행사방법 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-green-200 pb-2">
                제6조 (이용자의 권리와 행사방법)
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>이용자는 언제든지 다음의 권리를 행사할 수 있습니다:</p>
                <div className="bg-green-50 p-4 rounded-lg">
                  <ul className="space-y-2 text-green-700">
                    <li>• <strong>열람권:</strong> 자신의 개인정보 처리 현황을 확인할 권리</li>
                    <li>• <strong>정정·삭제권:</strong> 잘못된 정보의 수정이나 삭제를 요구할 권리</li>
                    <li>• <strong>처리정지권:</strong> 개인정보 처리를 중단하도록 요구할 권리</li>
                    <li>• <strong>손해배상청구권:</strong> 개인정보 침해로 인한 피해 구제를 요구할 권리</li>
                  </ul>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-bold text-blue-800 mb-2">📞 권리 행사 방법</h3>
                  <p className="text-blue-700">
                    하단의 연락처로 요청하시면 지체 없이 조치하겠습니다.
                  </p>
                </div>
              </div>
            </section>

            {/* 제7조 개인정보보호 담당자 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-green-200 pb-2">
                제7조 (개인정보보호 담당자)
              </h2>
              <div className="space-y-3 text-gray-700">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-bold text-gray-800 mb-2">👤 개인정보보호 담당자</h3>
                  <div className="space-y-1 text-gray-700">
                    <p><strong>담당자:</strong> KSH58 (개발자 겸 운영자)</p>
                    <p><strong>이메일:</strong> [이메일주소]</p>
                    <p><strong>처리 시간:</strong> 평일 업무 시간 내 (개인 운영으로 즉시 대응 어려울 수 있음)</p>
                  </div>
                </div>
              </div>
            </section>

            {/* 제8조 개인정보 처리방침 변경 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-green-200 pb-2">
                제8조 (개인정보 처리방침 변경)
              </h2>
              <div className="space-y-3 text-gray-700">
                <p>본 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.</p>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <ul className="space-y-1 text-blue-700">
                    <li>• 중요한 변경사항은 30일 전 사전 공지</li>
                    <li>• 경미한 변경사항은 7일 전 공지</li>
                    <li>• 변경된 방침은 공지 후 해당 일자부터 시행</li>
                  </ul>
                </div>
              </div>
            </section>

          </div>

          {/* 방침 정보 */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-green-800 mb-4">📋 방침 정보</h3>
              <div className="grid md:grid-cols-2 gap-4 text-green-700">
                <div>
                  <p><strong>시행일:</strong> 2025년 1월 1일</p>
                  <p><strong>최종 수정:</strong> 2025년 8월 21일</p>
                </div>
                <div>
                  <p><strong>버전:</strong> v1.0</p>
                  <p><strong>적용 법령:</strong> 개인정보보호법</p>
                </div>
              </div>
            </div>
          </div>

          {/* 연락처 정보 */}
          <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4">📞 개인정보보호 관련 문의</h3>
            <div className="space-y-2 text-gray-700">
              <p><strong>서비스명:</strong> KSH58 학교 안전관리시스템</p>
              <p><strong>개인정보보호 담당자:</strong> KSH58</p>
              <p><strong>이메일:</strong> [이메일주소]</p>
              <p><strong>처리 시간:</strong> 평일 09:00-18:00 (개인 운영으로 지연 가능)</p>
            </div>
          </div>

          {/* 하단 버튼 */}
          <div className="mt-12 text-center space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/terms" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg transition-colors font-medium"
              >
                이용약관 보기
              </Link>
              <Link 
                href="/" 
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg transition-colors font-medium"
              >
                서비스 이용하기
              </Link>
            </div>
            <p className="text-sm text-gray-500">
              개인정보 관련 문의사항은 위의 연락처로 언제든지 문의해주세요.
            </p>
          </div>
        </div>
      </div>

      {/* 저작권 푸터 */}
      <footer className="bg-gray-800 text-white py-6 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">© 2025 KSH58. All rights reserved.</p>
          <p className="text-xs text-gray-400 mt-2">
            개인 운영 무료 서비스로 언제든 종료될 수 있습니다.
          </p>
        </div>
      </footer>
    </div>
  );
}