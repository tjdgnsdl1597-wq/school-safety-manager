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

// 히어로 섹션 컴포넌트
const HeroSection = ({ title }: { title: string }) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  useEffect(() => {
    // 이미지 로드 테스트 - TypeScript 호환성 개선
    if (typeof window !== 'undefined') {
      const testImage = document.createElement('img');
      testImage.onload = () => {
        setImageError(false);
      };
      testImage.onerror = () => {
        setImageError(true);
      };
      testImage.src = '/images/hero.jpg';
    }
  }, []);

  return (
    <section 
      className={`
        relative w-full overflow-hidden
        ${imageError ? 'bg-slate-900' : ''}
      `}
      style={{
        height: 'clamp(220px, 24vw, 360px)',
        backgroundImage: imageError 
          ? 'linear-gradient(180deg, rgba(8,12,28,.65) 0%, rgba(8,12,28,.35) 55%, rgba(8,12,28,.85) 100%)'
          : 'linear-gradient(180deg, rgba(8,12,28,.65) 0%, rgba(8,12,28,.35) 55%, rgba(8,12,28,.85) 100%), url(/images/hero.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
      role="banner"
      aria-label="중대재해 알리미 메인 배너"
    >
      {/* 이미지 로드 테스트용 숨겨진 img 태그 */}
      <img 
        src="/images/hero.jpg" 
        alt="학교 안전 현장" 
        style={{ display: 'none' }} 
        onError={handleImageError}
      />
      
      {/* 이미지 오류 시 대체 텍스트 */}
      {imageError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white/40 text-sm">이미지를 불러올 수 없습니다</span>
        </div>
      )}

      {/* 히어로 컨텐츠 */}
      <div className="relative z-10 h-full flex items-end">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 md:pb-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* 섹션 라벨 */}
            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium text-white mb-3 border border-white/20">
              <span className="mr-2">⚠️</span>
              안전 정보
            </div>
            
            {/* 메인 제목 */}
            <h1 
              className="text-white font-bold mb-2 leading-tight"
              style={{ 
                fontSize: 'clamp(28px, 5vw, 48px)',
                textShadow: '2px 2px 8px rgba(0, 0, 0, 0.7)'
              }}
            >
              {title}
            </h1>
            
            {/* 서브 텍스트 */}
            <p 
              className="text-white/90 font-normal leading-relaxed"
              style={{ 
                fontSize: 'clamp(14px, 2.5vw, 18px)',
                textShadow: '1px 1px 4px rgba(0, 0, 0, 0.6)'
              }}
            >
              학교 현장 중대재해 예방 자료
            </p>
          </motion.div>
        </div>
      </div>

    </section>
  );
};

export default function PhotoCardManager({ category, title }: PhotoCardManagerProps) {
  const { user, isAuthenticated } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [isDragOver, setIsDragOver] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 15;

  const fetchMaterials = useCallback(async (page: number = currentPage) => {
    try {
      const response = await fetch(`/api/materials?category=${encodeURIComponent(category)}&page=${page}&limit=${itemsPerPage}`);
      const data = await response.json();
      setMaterials(data.data || []);
      setTotalCount(data.totalCount || 0);
    } catch (error) {
      console.error('Failed to fetch materials:', error);
    } finally {
      setLoading(false);
    }
  }, [category, currentPage, itemsPerPage]);

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

        setCurrentPage(1);
        fetchMaterials(1);
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
        await fetchMaterials(currentPage);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* 히어로 섹션 */}
      <HeroSection title={title} />
      
      <div className="container mx-auto px-6 py-8">
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
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

        {/* 페이지네이션 */}
        {!loading && totalCount > itemsPerPage && (
          <div className="flex justify-center items-center mt-12 space-x-2">
            {/* 이전 페이지 버튼 */}
            <button
              onClick={() => {
                const prevPage = currentPage - 1;
                setCurrentPage(prevPage);
                fetchMaterials(prevPage);
              }}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                currentPage === 1
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600 shadow-md hover:shadow-lg'
              }`}
            >
              ← 이전
            </button>

            {/* 페이지 번호들 */}
            {(() => {
              const totalPages = Math.ceil(totalCount / itemsPerPage);
              const pages = [];
              
              // 현재 페이지 주변의 페이지들만 표시
              const startPage = Math.max(1, currentPage - 2);
              const endPage = Math.min(totalPages, currentPage + 2);

              for (let i = startPage; i <= endPage; i++) {
                pages.push(
                  <button
                    key={i}
                    onClick={() => {
                      setCurrentPage(i);
                      fetchMaterials(i);
                    }}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      currentPage === i
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-white text-blue-600 border border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    {i}
                  </button>
                );
              }
              
              return pages;
            })()}

            {/* 다음 페이지 버튼 */}
            <button
              onClick={() => {
                const nextPage = currentPage + 1;
                setCurrentPage(nextPage);
                fetchMaterials(nextPage);
              }}
              disabled={currentPage >= Math.ceil(totalCount / itemsPerPage)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                currentPage >= Math.ceil(totalCount / itemsPerPage)
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600 shadow-md hover:shadow-lg'
              }`}
            >
              다음 →
            </button>
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