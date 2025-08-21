/*
 * KSH58 학교 안전관리시스템 - 이용약관 및 개인정보처리방침 페이지
 * Copyright (c) 2025 KSH58. All rights reserved.
 * 
 * 이 소스코드와 관련된 모든 지적재산권은 KSH58에게 있습니다.
 * 무단 복제, 배포, 수정을 금지합니다.
 */

import React from 'react';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* 헤더 */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">K</span>
              </div>
              <h1 className="text-xl font-bold text-gray-800">KSH58 학교 안전관리시스템</h1>
            </div>
            <Link 
              href="/" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
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
            <h1 className="text-4xl font-bold text-gray-800 mb-4">이용약관 및 개인정보처리방침</h1>
            <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full mb-6"></div>
            <p className="text-gray-600 text-lg">KSH58 학교 안전관리시스템 서비스 이용약관 및 개인정보처리방침</p>
            <div className="mt-4 p-4 bg-orange-50 border-l-4 border-orange-400 rounded-r-lg">
              <p className="text-orange-800 font-medium">
                ⚠️ 본 서비스는 개인이 무료로 제공하는 서비스로, 언제든지 종료될 수 있습니다.
              </p>
            </div>
          </div>

          {/* 약관 내용 */}
          <div className="space-y-8">
            
            {/* 제1조 목적 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-blue-200 pb-2">
                제1조 (목적)
              </h2>
              <div className="space-y-3 text-gray-700 leading-relaxed">
                <p>
                  이 약관은 <strong className="text-blue-600">KSH58</strong>이 개인적으로 개발·운영하는 
                  <strong> 학교 안전관리시스템</strong>(이하 &ldquo;서비스&rdquo;)의 이용과 관련하여 
                  서비스 제공자와 사용자 간의 권리와 의무, 책임사항을 규정함을 목적으로 합니다.
                </p>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-blue-800">
                    <strong>서비스 개요:</strong> 학교 안전보건 관리를 위한 일정 관리, 학교 정보 관리, 
                    이동시간 계산, 교육자료 공유 등의 기능을 제공하는 웹 기반 PWA 서비스
                  </p>
                </div>
              </div>
            </section>

            {/* 제2조 정의 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-blue-200 pb-2">
                제2조 (정의)
              </h2>
              <div className="space-y-3 text-gray-700">
                <div className="grid gap-3">
                  <div className="flex">
                    <span className="font-medium w-20 flex-shrink-0">1.</span>
                    <span><strong>&ldquo;서비스&rdquo;</strong>란 KSH58 학교 안전관리시스템을 의미합니다.</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium w-20 flex-shrink-0">2.</span>
                    <span><strong>&ldquo;운영자&rdquo;</strong>란 서비스를 개발·운영하는 개인 KSH58을 의미합니다.</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium w-20 flex-shrink-0">3.</span>
                    <span><strong>&ldquo;이용자&rdquo;</strong>란 본 약관에 따라 서비스를 이용하는 자를 의미합니다.</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium w-20 flex-shrink-0">4.</span>
                    <span><strong>&ldquo;계정&rdquo;</strong>이란 이용자의 식별과 서비스 이용을 위해 생성된 ID와 비밀번호를 의미합니다.</span>
                  </div>
                </div>
              </div>
            </section>

            {/* 제3조 서비스의 특성 및 제한 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-blue-200 pb-2">
                제3조 (서비스의 특성 및 제한)
              </h2>
              <div className="space-y-4 text-gray-700">
                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                  <h3 className="font-bold text-red-800 mb-2">⚠️ 중요: 개인 운영 서비스 특성</h3>
                  <ul className="space-y-2 text-red-700">
                    <li>• 본 서비스는 개인(KSH58)이 자비로 운영하는 무료 서비스입니다.</li>
                    <li>• 회사나 기관의 지원 없이 개인 비용으로 서버를 운영합니다.</li>
                    <li>• 서버 운영비 부담으로 인해 언제든지 서비스가 종료될 수 있습니다.</li>
                    <li>• 서비스 종료 시 최소 30일 전에 공지하되, 긴급상황 시 즉시 종료할 수 있습니다.</li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p>
                    운영자는 서비스의 안정적 운영을 위해 최선을 다하나, 
                    개인 운영의 한계상 24시간 무중단 서비스를 보장하지 않습니다.
                  </p>
                </div>
              </div>
            </section>

            {/* 제4조 저작권 및 지적재산권 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-blue-200 pb-2">
                제4조 (저작권 및 지적재산권)
              </h2>
              <div className="space-y-4 text-gray-700">
                <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-r-lg">
                  <h3 className="font-bold text-purple-800 mb-2">🔒 저작권 보호 조항</h3>
                  <ul className="space-y-2 text-purple-700">
                    <li>• 본 서비스의 소스코드, 디자인, 기능, 아이디어 등 모든 지적재산권은 KSH58에게 있습니다.</li>
                    <li>• 서비스의 전부 또는 일부를 무단으로 복제, 배포, 수정, 역분석하는 것을 엄격히 금지합니다.</li>
                    <li>• 서비스의 기능이나 디자인을 모방하여 유사한 서비스를 개발하는 것을 금지합니다.</li>
                    <li>• 위반 시 저작권법에 따른 민·형사상 책임을 질 수 있습니다.</li>
                  </ul>
                </div>
                <p>
                  이용자가 서비스에 업로드한 콘텐츠의 저작권은 이용자에게 있으나, 
                  서비스 운영을 위한 최소한의 권리는 운영자에게 부여됩니다.
                </p>
              </div>
            </section>

            {/* 제5조 서비스 이용 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-blue-200 pb-2">
                제5조 (서비스 이용)
              </h2>
              <div className="space-y-3 text-gray-700">
                <div className="grid gap-2">
                  <p><strong>1. 이용자격:</strong> 서비스 목적에 동의하는 개인 또는 기관</p>
                  <p><strong>2. 계정 생성:</strong> 실명과 정확한 정보로 계정을 생성해야 합니다.</p>
                  <p><strong>3. 비밀번호 관리:</strong> 계정의 보안은 이용자 책임입니다.</p>
                  <p><strong>4. 서비스 목적:</strong> 학교 안전보건 관리 목적으로만 이용해야 합니다.</p>
                </div>
              </div>
            </section>

            {/* 제6조 금지행위 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-blue-200 pb-2">
                제6조 (금지행위)
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>이용자는 다음 행위를 해서는 안 됩니다:</p>
                <div className="bg-red-50 p-4 rounded-lg">
                  <ul className="space-y-2 text-red-700">
                    <li>• 해킹, SQL 인젝션, XSS 등 서비스에 대한 공격 행위</li>
                    <li>• 소스코드 도용, 디자인 모방, 기능 복제 등 지적재산권 침해</li>
                    <li>• 과도한 API 호출이나 시스템 자원 남용</li>
                    <li>• 다른 이용자의 개인정보 무단 수집</li>
                    <li>• 서비스 목적과 무관한 용도로 사용</li>
                    <li>• 허위 정보 입력이나 타인 명의 도용</li>
                    <li>• 악성코드 유포나 스팸 활동</li>
                    <li>• 서비스의 정상적인 운영을 방해하는 행위</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 제7조 데이터 관리 및 백업 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-blue-200 pb-2">
                제7조 (데이터 관리 및 백업)
              </h2>
              <div className="space-y-4 text-gray-700">
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                  <h3 className="font-bold text-yellow-800 mb-2">💾 중요: 데이터 백업 책임</h3>
                  <ul className="space-y-2 text-yellow-700">
                    <li>• 이용자의 데이터 백업은 <strong>이용자 본인의 책임</strong>입니다.</li>
                    <li>• 서비스 종료 시 데이터는 영구 삭제되며 복구할 수 없습니다.</li>
                    <li>• 정기적인 데이터 다운로드를 권장합니다.</li>
                    <li>• 운영자는 최선을 다해 데이터를 보호하나, 완전한 안전을 보장하지 않습니다.</li>
                  </ul>
                </div>
                <p>
                  운영자는 서비스 안정성을 위해 정기적으로 백업을 수행하나, 
                  이는 서비스 복구 목적일 뿐 이용자에게 백업 서비스를 제공하는 것은 아닙니다.
                </p>
              </div>
            </section>

            {/* 제8조 서비스 중단 및 종료 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-blue-200 pb-2">
                제8조 (서비스 중단 및 종료)
              </h2>
              <div className="space-y-4 text-gray-700">
                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                  <h3 className="font-bold text-red-800 mb-2">⚠️ 서비스 종료 권리</h3>
                  <ul className="space-y-2 text-red-700">
                    <li>• 운영자는 언제든지 자유롭게 서비스를 종료할 권리가 있습니다.</li>
                    <li>• 일반적인 경우 30일 전 공지 후 종료합니다.</li>
                    <li>• 다음의 경우 즉시 종료할 수 있습니다:</li>
                    <li>&nbsp;&nbsp;- 서버 운영비 부담이 한계에 달한 경우</li>
                    <li>&nbsp;&nbsp;- 법적 문제나 분쟁 발생 시</li>
                    <li>&nbsp;&nbsp;- 기술적 문제로 서비스 운영이 불가능한 경우</li>
                    <li>&nbsp;&nbsp;- 운영자의 개인 사정으로 운영이 어려운 경우</li>
                  </ul>
                </div>
                <p>
                  임시 중단의 경우 가능한 한 사전 공지하되, 
                  긴급 상황에서는 사전 공지 없이 중단할 수 있습니다.
                </p>
              </div>
            </section>

            {/* 제9조 면책조항 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-blue-200 pb-2">
                제9조 (면책조항)
              </h2>
              <div className="space-y-4 text-gray-700">
                <div className="bg-gray-50 border-l-4 border-gray-400 p-4 rounded-r-lg">
                  <h3 className="font-bold text-gray-800 mb-2">🛡️ 운영자 면책 사항</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• 본 서비스는 <strong>무료로 제공</strong>되므로 서비스 중단이나 종료로 인한 손해에 대해 배상하지 않습니다.</li>
                    <li>• 데이터 손실, 업무 중단, 기회 손실 등에 대해 책임지지 않습니다.</li>
                    <li>• 해킹, 천재지변, 기술적 장애 등 불가항력적 사유로 인한 손해는 면책됩니다.</li>
                    <li>• 이용자의 부주의나 잘못된 사용으로 인한 문제는 책임지지 않습니다.</li>
                    <li>• 서비스를 통해 제공되는 정보의 정확성이나 완전성을 보장하지 않습니다.</li>
                  </ul>
                </div>
                <p className="text-center font-medium text-gray-600">
                  개인 운영 무료 서비스의 특성상 상업적 서비스 수준의 보장이나 책임을 질 수 없습니다.
                </p>
              </div>
            </section>

            {/* 제10조 개인정보보호 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-blue-200 pb-2">
                제10조 (개인정보보호)
              </h2>
              <div className="space-y-3 text-gray-700">
                <p>운영자는 「개인정보보호법」에 따라 이용자의 개인정보를 보호합니다.</p>
                <div className="bg-green-50 p-4 rounded-lg">
                  <ul className="space-y-1 text-green-700">
                    <li>• 개인정보 처리 방침은 별도로 정하여 공지합니다.</li>
                    <li>• 최소한의 개인정보만 수집하며, 목적 외 사용을 금지합니다.</li>
                    <li>• 개인정보 보안을 위해 최선을 다합니다.</li>
                    <li>• 서비스 종료 시 개인정보는 안전하게 파기됩니다.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 제11조 분쟁해결 및 준거법 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-blue-200 pb-2">
                제11조 (분쟁해결 및 준거법)
              </h2>
              <div className="space-y-3 text-gray-700">
                <div className="grid gap-2">
                  <p><strong>1. 준거법:</strong> 대한민국 법률을 적용합니다.</p>
                  <p><strong>2. 관할법원:</strong> 운영자 주소지 관할법원을 전속관할로 합니다.</p>
                  <p><strong>3. 분쟁해결:</strong> 상호 협의를 통해 해결하되, 협의가 되지 않을 경우 법원의 판단을 따릅니다.</p>
                  <p><strong>4. 연락처:</strong> 서비스 관련 문의는 하단의 연락처를 통해 접수합니다.</p>
                </div>
              </div>
            </section>

            {/* 제12조 약관의 변경 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-blue-200 pb-2">
                제12조 (약관의 변경)
              </h2>
              <div className="space-y-3 text-gray-700">
                <p>운영자는 필요에 따라 약관을 변경할 수 있습니다.</p>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <ul className="space-y-1 text-blue-700">
                    <li>• 중요한 변경사항은 서비스 내 공지사항을 통해 사전 공지합니다.</li>
                    <li>• 변경된 약관은 공지 후 7일이 경과한 시점부터 효력이 발생합니다.</li>
                    <li>• 변경에 동의하지 않는 이용자는 서비스 이용을 중단할 수 있습니다.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 제8조 개인정보 수집 및 처리 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-purple-200 pb-2">
                제8조 (개인정볰 수집 및 처리)
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-400">
                  <h3 className="text-lg font-semibold text-purple-800 mb-3">📝 개인정보처리방침</h3>
                  <p className="text-purple-700 mb-2">
                    KSH58 학교 안전관리시스템은 「개인정보보호법」 등 관련 법령에 따라 
                    이용자의 개인정보를 보호하는 데 최선을 다하고 있습니다.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-gray-800">📄 수집하는 개인정볰</h4>
                    <ul className="space-y-2">
                      <li className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        <span><strong>이름:</strong> 서비스 이용자 식별</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        <span><strong>이메일:</strong> 연락 및 인증</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        <span><strong>직책/부서:</strong> 서비스 제공 개인화</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        <span><strong>전화번호:</strong> 응급 연락</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        <span><strong>소속 학교 정보:</strong> 서비스 제공</span>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-gray-800">🎯 수집 및 이용 목적</h4>
                    <ul className="space-y-2">
                      <li className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span>시스템 이용 및 서비스 제공</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span>안전관리 서비스 제공</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span>사용자 인증 및 보안</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span>서비스 개선 및 최적화</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span>다중 사용자 데이터 분리 관리</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="text-lg font-semibold text-yellow-800 mb-2">📅 보관 기간</h4>
                    <ul className="space-y-1 text-yellow-700">
                      <li>• 회원 탈퇴 시까지 보관</li>
                      <li>• 법적 보존 의무 기간은 예외</li>
                      <li>• 서비스 종료 시 즉시 삭제</li>
                    </ul>
                  </div>

                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="text-lg font-semibold text-red-800 mb-2">🗑️ 삭제 방법</h4>
                    <ul className="space-y-1 text-red-700">
                      <li>• 계정 삭제 시 즉시 삭제</li>
                      <li>• 서비스 종료 시 전체 삭제</li>
                      <li>• 복구 불가능하므로 사전 백업 권장</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg mt-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">🔒 보안 조치</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-gray-700">
                    <div>
                      <h5 className="font-medium mb-2">기술적 보안조치</h5>
                      <ul className="text-sm space-y-1">
                        <li>• 비밀번호 암호화 저장</li>
                        <li>• 데이터베이스 암호화</li>
                        <li>• HTTPS 통신 암호화</li>
                        <li>• 접근 권한 관리</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">관리적 보안조치</h5>
                      <ul className="text-sm space-y-1">
                        <li>• 정기적 보안 점검</li>
                        <li>• 개인정보 접근 기록 관리</li>
                        <li>• 정기적 데이터 백업</li>
                        <li>• 개인 운영 보안 한계 인지</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-6 rounded-lg mt-6">
                  <h4 className="text-lg font-semibold text-blue-800 mb-3">📞 이용자 권리</h4>
                  <div className="text-blue-700 space-y-2">
                    <p><strong>개인정보 열람·수정·삭제 요구 권리:</strong></p>
                    <ul className="ml-4 space-y-1">
                      <li>• 언제든지 개인정보 처리 중단 요구 가능</li>
                      <li>• 이메일로 요구 시 신속한 처리</li>
                      <li>• 단, 개인 운영 서비스의 한계로 즉시 대응 어려울 수 있음</li>
                    </ul>
                    <div className="mt-4 p-3 bg-blue-100 rounded">
                      <p className="text-sm"><strong>연락처:</strong> tjdgnsdl1597@naver.com</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

          </div>

          {/* 약관 정보 */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-blue-800 mb-4">📋 약관 정보</h3>
              <div className="grid md:grid-cols-2 gap-4 text-blue-700">
                <div>
                  <p><strong>시행일:</strong> 2025년 1월 1일</p>
                  <p><strong>최종 수정:</strong> 2025년 8월 21일</p>
                </div>
                <div>
                  <p><strong>버전:</strong> v1.0</p>
                  <p><strong>언어:</strong> 한국어</p>
                </div>
              </div>
            </div>
          </div>

          {/* 연락처 정보 */}
          <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4">📞 연락처</h3>
            <div className="space-y-2 text-gray-700">
              <p><strong>서비스명:</strong> KSH58 학교 안전관리시스템</p>
              <p><strong>운영자:</strong> KSH58</p>
              <p><strong>이메일:</strong> tjdgnsdl1597@naver.com</p>
              <p><strong>운영 형태:</strong> 개인 운영 무료 서비스</p>
            </div>
          </div>

          {/* 하단 버튼 */}
          <div className="mt-12 text-center space-y-4">
            <div className="flex justify-center">
              <Link 
                href="/" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg transition-colors font-medium"
              >
                서비스 이용하기
              </Link>
            </div>
            <p className="text-sm text-gray-500">
              서비스를 이용하시면 본 이용약관 및 개인정보처리방침에 동의하는 것으로 간주됩니다.
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