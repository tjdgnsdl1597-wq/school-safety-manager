'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/simpleAuth';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface Material {
  id: string;
  title: string;
  content: string | null;
  attachments: {
    id: string;
    filename: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
    thumbnailPath: string | null;
    uploadOrder: number;
  }[];
  uploadedAt: string;
  uploader: string;
  category: string;
}

interface PhotoCardManagerProps {
  category: string;
  title: string;
}

export default function PhotoCardManager({ category, title }: PhotoCardManagerProps) {
  const { user, isAuthenticated } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [isDragOver, setIsDragOver] = useState(false);

  const fetchMaterials = useCallback(async () => {
    try {
      const response = await fetch(`/api/materials?category=${encodeURIComponent(category)}`);
      const data = await response.json();
      setMaterials(data.data || []);
    } catch (error) {
      console.error('Failed to fetch materials:', error);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  const handleFileSelect = (files: File[]) => {
    setSelectedFiles(files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    
    if (files.length > 0) {
      const shouldUpload = confirm(`${files.length}개의 이미지를 업로드 하시겠습니까?`);
      
      if (shouldUpload) {
        setUploading(true);
        
        for (const file of files) {
          const formData = new FormData();
          const title = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
          formData.append('title', title);
          formData.append('category', category);
          formData.append('content', '');
          formData.append('files', file);

          try {
            await fetch('/api/materials', {
              method: 'POST',
              body: formData,
            });
          } catch (error) {
            console.error('Upload error:', error);
          }
        }

        fetchMaterials();
        setUploading(false);
      }
    }
  };


  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      console.log('Attempting to delete material with ID:', id);
      const response = await fetch(`/api/materials/${id}`, {
        method: 'DELETE',
      });

      console.log('Delete response status:', response.status);
      
      if (response.ok) {
        console.log('Delete successful, refreshing materials...');
        await fetchMaterials();
        alert('삭제되었습니다.');
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Delete failed:', errorData);
        alert(`삭제에 실패했습니다: ${errorData.error || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };


  const getFileIcon = (mimeType: string) => {
    // 이미지 파일들
    if (mimeType.startsWith('image/') || 
        mimeType.includes('jpeg') || 
        mimeType.includes('jpg') || 
        mimeType.includes('png') || 
        mimeType.includes('gif') || 
        mimeType.includes('webp')) return '🖼️';
    
    // 문서 파일들
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📈';
    if (mimeType.includes('text')) return '📝';
    
    // 비디오 파일들
    if (mimeType.startsWith('video/')) return '🎥';
    
    // 오디오 파일들
    if (mimeType.startsWith('audio/')) return '🎵';
    
    return '📁';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8">
      <div className="container mx-auto px-6">
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">{title}</h1>
          <p className="text-xl text-gray-600">학교 현장 중대재해 예방 자료</p>
        </motion.div>

        {/* 방문자용 소개글 */}
        {!isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-orange-200 mb-12"
          >
            <div className="flex items-start mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                <span className="text-white text-xl">⚠️</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-3">중대재해 알리미 소개</h2>
                <div className="text-gray-700 leading-relaxed space-y-3">
                  <p>
                    본 자료는 <span className="font-semibold text-orange-600">고용노동부 중대재해 사이렌</span>에서 
                    학교 현장에서 발생할 수 있는 다양한 안전사고 사례를 선별하여 제공합니다.
                  </p>
                  <p>
                    학교 관계자와 교육 현장 종사자들이 중대재해를 미리 예방하고 안전한 교육 환경을 조성할 수 있도록 
                    실제 사례를 바탕으로 한 예방 자료를 지속적으로 업데이트하고 있습니다.
                  </p>
                  <p className="text-sm text-gray-600 mt-4 p-3 bg-gray-50 rounded-lg">
                    <span className="font-semibold">💡 활용 방법:</span> 각 자료를 클릭하여 상세 내용을 확인하고, 
                    해당 사례의 예방책과 안전 수칙을 숙지하여 현장에 적용해 주시기 바랍니다.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* 업로드 섹션 (관리자만) */}
        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-blue-200 mb-12"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mr-3">
                <span className="text-white text-lg">📸</span>
              </span>
              새 자료 업로드
            </h2>
            
            {/* 드래그 앤 드롭 영역 */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                isDragOver 
                  ? 'border-blue-400 bg-blue-50' 
                  : 'border-blue-300 bg-blue-50/50'
              }`}
            >
              <div className="text-6xl mb-4">{uploading ? '⏳' : isDragOver ? '📤' : '📁'}</div>
              <p className="text-gray-700 text-lg mb-2">
                {uploading ? '업로드 중...' : isDragOver ? '파일을 여기에 놓으세요' : '이미지를 드래그하여 업로드'}
              </p>
              <p className="text-gray-500 text-sm">
                파일을 드롭하면 자동으로 업로드됩니다
              </p>
            </div>
          </motion.div>
        )}

        {/* 포토카드 그리드 */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {materials.map((material, index) => (
              <motion.div
                key={material.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group relative"
              >
                <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                  {/* 4:5 비율 썸네일 */}
                  <div className="relative w-full" style={{ aspectRatio: '4/5' }}>
                    {material.attachments.length > 0 ? (
                      material.attachments[0].mimeType.startsWith('image/') && !imageErrors.has(material.attachments[0].id) ? (
                        <Image
                          src={material.attachments[0].filePath}
                          alt={material.title}
                          fill
                          className="object-cover"
                          unoptimized={true}
                          onError={() => {
                            setImageErrors(prev => new Set([...prev, material.attachments[0].id]));
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400 text-6xl">
                          {getFileIcon(material.attachments[0].mimeType)}
                        </div>
                      )
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400 text-6xl">
                        📁
                      </div>
                    )}

                    {/* 관리자 삭제 버튼 (호버시 표시) */}
                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(material.id)}
                        className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg"
                        title="삭제"
                      >
                        ×
                      </button>
                    )}
                  </div>

                  {/* 카드 정보 */}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-800 text-sm mb-2 line-clamp-2 leading-tight">
                      {material.title}
                    </h3>
                    
                    <div className="text-xs text-gray-500 flex items-center justify-between">
                      <span>{new Date(material.uploadedAt).toLocaleDateString('ko-KR', { 
                        year: 'numeric', 
                        month: '2-digit', 
                        day: '2-digit' 
                      }).replace(/\//g, '. ')}</span>
                      <span>조회 {Math.floor(Math.random() * 100) + 1}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {materials.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-4">📂</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              등록된 자료가 없습니다
            </h3>
            <p className="text-gray-500">
              {isAdmin ? '새로운 자료를 업로드해보세요.' : '곧 유용한 자료들이 업로드될 예정입니다.'}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}