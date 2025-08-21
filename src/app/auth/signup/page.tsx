'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import TermsAgreement from '@/components/TermsAgreement';

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    position: '',
    phoneNumber: '',
    email: '',
    department: '산업안전팀' // 자동 선택
  });
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [termsValid, setTermsValid] = useState(false);
  const [agreements, setAgreements] = useState({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 입력값 검증
    if (!formData.username || !formData.password || !formData.name || !formData.position || !formData.phoneNumber || !formData.email) {
      setError('모든 필수 항목을 입력해주세요.');
      return;
    }

    // 약관 동의 검증
    if (!termsValid) {
      setError('모든 필수 약관에 동의해주세요.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (formData.password.length < 4) {
      setError('비밀번호는 4자 이상 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // FormData 사용해서 파일과 함께 전송
      const submitData = new FormData();
      submitData.append('username', formData.username);
      submitData.append('password', formData.password);
      submitData.append('name', formData.name);
      submitData.append('position', formData.position);
      submitData.append('phoneNumber', formData.phoneNumber);
      submitData.append('email', formData.email);
      submitData.append('department', formData.department);
      
      if (profilePhoto) {
        submitData.append('profilePhoto', profilePhoto);
      }

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        body: submitData // FormData 사용시 Content-Type 헤더 제거
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.message || '회원가입에 실패했습니다.');
      }
    } catch (error) {
      setError('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 파일 크기 체크 (5MB 제한)
      if (file.size > 5 * 1024 * 1024) {
        setError('프로필 사진은 5MB 이하로 업로드해주세요.');
        return;
      }
      
      // 파일 타입 체크
      if (!file.type.startsWith('image/')) {
        setError('이미지 파일만 업로드 가능합니다.');
        return;
      }
      
      setProfilePhoto(file);
      
      // 미리보기 생성
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      setError(''); // 에러 초기화
    }
  };

  // 가입 신청 완료 화면
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md border border-white/20 shadow-2xl">
          <div className="text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">가입 신청 완료</h1>
              <p className="text-white/80 mb-4">
                관리자의 승인을 기다리고 있습니다.
              </p>
              <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-4 mb-6">
                <p className="text-sm text-white/90">
                  📧 승인이 완료되면 별도 연락드리겠습니다.<br />
                  🕐 승인까지 1-2일 정도 소요될 수 있습니다.
                </p>
              </div>
            </div>
            <Link
              href="/auth/signin"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 block text-center"
            >
              로그인 페이지로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md border border-white/20 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">회원가입</h1>
          <p className="text-white/80">관리자 승인 후 서비스 이용 가능합니다</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-4">
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-white/90 mb-2">
              이름 *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-white/50"
              placeholder="실명을 입력하세요"
              required
            />
          </div>

          <div>
            <label htmlFor="position" className="block text-sm font-medium text-white/90 mb-2">
              직급 *
            </label>
            <input
              type="text"
              id="position"
              name="position"
              value={formData.position}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-white/50"
              placeholder="예: 주임, 과장, 차장 등"
              required
            />
          </div>

          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-white/90 mb-2">
              전화번호 *
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-white/50"
              placeholder="010-1234-5678"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">
              이메일 *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-white/50"
              placeholder="example@domain.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              프로필 사진 (선택)
            </label>
            <div className="flex items-center space-x-4">
              {photoPreview ? (
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white/20">
                  <img src={photoPreview} alt="프로필 미리보기" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center">
                  <span className="text-white/50 text-2xl">👤</span>
                </div>
              )}
              <div className="flex-1">
                <input
                  type="file"
                  id="profilePhoto"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                <label
                  htmlFor="profilePhoto"
                  className="cursor-pointer inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                >
                  사진 선택
                </label>
                <p className="text-xs text-white/60 mt-1">사진을 올리지 않으면 기본 아바타가 표시됩니다 (5MB 이하)</p>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="department" className="block text-sm font-medium text-white/90 mb-2">
              부서
            </label>
            <input
              type="text"
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-white/50 bg-gray-600/20"
              placeholder="산업안전팀"
              readOnly
            />
            <p className="text-xs text-white/60 mt-1">부서는 자동으로 산업안전팀으로 설정됩니다</p>
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-white/90 mb-2">
              아이디 *
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-white/50"
              placeholder="영문, 숫자 조합"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white/90 mb-2">
              비밀번호 *
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-white/50"
              placeholder="4자 이상 입력"
              required
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/90 mb-2">
              비밀번호 확인 *
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-white/50"
              placeholder="비밀번호를 다시 입력"
              required
            />
          </div>

          {/* 약관 동의 섹션 */}
          <div className="bg-white/5 border border-white/20 rounded-lg p-4">
            <TermsAgreement
              mode="signup"
              onAgreementChange={(isValid, agreementState) => {
                setTermsValid(isValid);
                setAgreements(agreementState);
              }}
              className="text-white"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
          >
            {isLoading ? '신청 중...' : '가입 신청'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/auth/signin"
            className="text-blue-300 hover:text-blue-200 text-sm transition-colors duration-200"
          >
            이미 계정이 있으신가요? 로그인
          </Link>
        </div>
      </div>
    </div>
  );
}