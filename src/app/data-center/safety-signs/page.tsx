'use client';

import PhotoCardManager from '../../../components/PhotoCardManager';

export default function DataCenterSafetySignsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-2">
            <span className="text-3xl">🎯</span>
            <h1 className="text-2xl font-bold text-gray-900">안전보건표지 및 포스터</h1>
          </div>
          <p className="text-gray-600">위험표시, 금지표시, 지시표시 등 학교에서 활용할 안전표지와 포스터를 제공합니다.</p>
        </div>
        
        <PhotoCardManager 
          category="안전보건표지" 
          title="안전보건표지 및 포스터"
        />
      </div>
    </div>
  );
}