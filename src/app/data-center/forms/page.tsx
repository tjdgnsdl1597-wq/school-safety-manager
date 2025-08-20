'use client';

import MaterialManager from '../../../components/MaterialManager';

export default function DataCenterFormsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <span className="text-3xl">📄</span>
          <h1 className="text-2xl font-bold text-gray-900">안전서류 양식</h1>
        </div>
        <p className="text-gray-600">위험성평가표, 점검체크리스트, 신고서 양식 등 안전업무에 필요한 서류를 다운로드하세요.</p>
      </div>
      
      <MaterialManager 
        category="안전서류양식" 
        title="안전서류 양식 관리"
      />
    </div>
  );
}