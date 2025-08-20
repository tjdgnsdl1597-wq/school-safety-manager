'use client';

import MaterialManager from '../../../components/MaterialManager';

export default function DataCenterNoticesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <span className="text-3xl">📢</span>
          <h1 className="text-2xl font-bold text-gray-900">교육청 배포물</h1>
        </div>
        <p className="text-gray-600">교육청 공문, 안전보건 지침서, 정책자료 등 최신 배포물을 확인하세요.</p>
      </div>
      
      <MaterialManager 
        category="교육청배포물" 
        title="교육청 배포물 관리"
      />
    </div>
  );
}