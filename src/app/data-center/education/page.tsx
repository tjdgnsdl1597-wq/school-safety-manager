'use client';

import MaterialManager from '../../../components/MaterialManager';

export default function DataCenterEducationPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <span className="text-3xl">📚</span>
          <h1 className="text-2xl font-bold text-gray-900">교육자료</h1>
        </div>
        <p className="text-gray-600">안전교육 PPT, 교육 동영상, 매뉴얼 등 다양한 교육자료를 다운로드하세요.</p>
      </div>
      
      <MaterialManager 
        category="교육자료" 
        title="교육자료 관리"
      />
    </div>
  );
}