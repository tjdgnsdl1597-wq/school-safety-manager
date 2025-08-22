'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/simpleAuth';
import { isSuperAdmin } from '@/lib/authUtils';

export default function FixFilesPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // 관리자만 접근 가능
  if (!user || !isSuperAdmin(user)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">접근 권한이 없습니다</h1>
          <p className="text-gray-600">관리자만 접근할 수 있는 페이지입니다.</p>
        </div>
      </div>
    );
  }

  const handleMakePublic = async () => {
    if (!confirm('기존 업로드된 모든 파일을 공개로 설정하시겠습니까?')) {
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/materials/make-public', {
        method: 'POST',
      });
      
      const data = await response.json();
      setResult(data);
      
      if (response.ok) {
        alert(`성공! ${data.success}개 파일이 공개로 설정되었습니다.`);
      } else {
        alert(`오류가 발생했습니다: ${data.error}`);
      }
    } catch (error) {
      console.error('API 호출 오류:', error);
      alert('API 호출 중 오류가 발생했습니다.');
      setResult({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center mr-3">
              <span className="text-white text-lg">🔧</span>
            </span>
            파일 공개 설정 수정
          </h1>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-yellow-400 text-xl">⚠️</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>주의:</strong> 이 기능은 기존에 업로드된 모든 파일들을 Google Cloud Storage에서 공개로 설정합니다.
                  파일 다운로드 &quot;Access Denied&quot; 오류를 해결하기 위한 일회성 작업입니다.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">현재 문제:</h3>
              <p className="text-gray-600 text-sm">
                기존 업로드된 파일들이 Google Cloud Storage에서 비공개로 설정되어 있어서 
                &quot;Access Denied&quot; 오류가 발생하고 있습니다.
              </p>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">해결 방법:</h3>
              <p className="text-gray-600 text-sm">
                아래 버튼을 클릭하면 모든 기존 파일들이 공개로 설정되어 정상적으로 다운로드할 수 있게 됩니다.
              </p>
            </div>

            <button
              onClick={handleMakePublic}
              disabled={loading}
              className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all duration-300 ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-lg hover:shadow-xl'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  처리 중...
                </span>
              ) : (
                '기존 파일들 공개로 설정하기'
              )}
            </button>

            {result && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">실행 결과:</h3>
                <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}