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
  const [uploadTitle, setUploadTitle] = useState('');
  const [selectedMaterials, setSelectedMaterials] = useState<Set<string>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
    
    // 첫 번째 파일명을 제목으로 자동 설정 (확장자 제거)
    if (files.length > 0 && !uploadTitle.trim()) {
      const firstFileName = files[0].name;
      const nameWithoutExtension = firstFileName.substring(0, firstFileName.lastIndexOf('.')) || firstFileName;
      setUploadTitle(nameWithoutExtension);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFiles.length || !uploadTitle.trim()) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('title', uploadTitle);
    formData.append('category', category);
    formData.append('content', ''); // 포토카드는 내용 불필요

    selectedFiles.forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await fetch('/api/materials', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setUploadTitle('');
        setSelectedFiles([]);
        fetchMaterials();
        // 파일 입력 초기화
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
          fileInput.files = null;
        }
      } else {
        const error = await response.json();
        alert(error.error || '업로드에 실패했습니다.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('업로드 중 오류가 발생했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/materials/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchMaterials();
      } else {
        alert('삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const handleSelectMaterial = (id: string) => {
    const newSelected = new Set(selectedMaterials);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedMaterials(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedMaterials.size === materials.length) {
      setSelectedMaterials(new Set());
    } else {
      setSelectedMaterials(new Set(materials.map(m => m.id)));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedMaterials.size === 0) return;
    
    const count = selectedMaterials.size;
    if (!confirm(`선택한 ${count}개의 자료를 삭제하시겠습니까?`)) return;

    const deletePromises = Array.from(selectedMaterials).map(id =>
      fetch(`/api/materials/${id}`, { method: 'DELETE' })
    );

    try {
      await Promise.all(deletePromises);
      setSelectedMaterials(new Set());
      setIsSelectMode(false);
      fetchMaterials();
      alert(`${count}개의 자료가 삭제되었습니다.`);
    } catch (error) {
      console.error('Bulk delete error:', error);
      alert('일부 자료 삭제에 실패했습니다.');
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-orange-50 py-8">
      <div className="container mx-auto px-6">
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{title}</h1>
          <p className="text-xl text-gray-600">산업재해 사례 및 예방 자료</p>
        </motion.div>

        {/* 관리자 컨트롤 섹션 */}
        {isAdmin && materials.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8"
          >
            <div className="flex flex-wrap gap-4 justify-center">
              {!isSelectMode ? (
                <button
                  onClick={() => setIsSelectMode(true)}
                  className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg"
                >
                  📋 자료 선택하여 삭제
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSelectAll}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-300 shadow-md"
                  >
                    {selectedMaterials.size === materials.length ? '전체 해제' : '전체 선택'}
                  </button>
                  <button
                    onClick={handleDeleteSelected}
                    disabled={selectedMaterials.size === 0}
                    className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-lg transition-all duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    🗑️ 선택 삭제 ({selectedMaterials.size})
                  </button>
                  <button
                    onClick={() => {
                      setIsSelectMode(false);
                      setSelectedMaterials(new Set());
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold rounded-lg transition-all duration-300 shadow-md"
                  >
                    취소
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}

        {/* 업로드 섹션 (관리자만) */}
        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 mb-12"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center mr-3">
                <span className="text-white text-lg">📸</span>
              </span>
              새 자료 업로드
            </h2>
            
            <form onSubmit={handleUpload} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  제목
                </label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="자료 제목을 입력하세요"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  파일 선택 (최대 5개, 총 50MB)
                </label>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  accept="image/*,application/pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                  onChange={handleFileSelect}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
                {selectedFiles.length > 0 && (
                  <div className="mt-2 text-sm text-gray-600">
                    선택된 파일: {selectedFiles.map(f => f.name).join(', ')}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={uploading || !selectedFiles.length || !uploadTitle.trim()}
                className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? '업로드 중...' : '업로드'}
              </button>
            </form>
          </motion.div>
        )}

        {/* 포토카드 그리드 */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {materials.map((material, index) => (
              <motion.div
                key={material.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group relative"
              >
                <div className={`bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg border transition-all duration-300 hover:scale-[1.02] ${
                  isSelectMode && selectedMaterials.has(material.id) 
                    ? 'border-blue-500 shadow-blue-200' 
                    : 'border-white/20 hover:shadow-xl'
                }`}>
                  {/* 썸네일 또는 첫 번째 이미지 */}
                  <div className="relative w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200">
                    {material.attachments.length > 0 ? (
                      material.attachments[0].mimeType.startsWith('image/') && !imageErrors.has(material.attachments[0].id) ? (
                        <Image
                          src={material.attachments[0].filePath}
                          alt={material.title}
                          fill
                          className="object-contain"
                          unoptimized={true}
                          onLoad={() => {
                            console.log('Image loaded successfully:', material.attachments[0].filePath);
                          }}
                          onError={() => {
                            console.error('Image failed to load:', material.attachments[0].filePath, material.attachments[0].mimeType);
                            setImageErrors(prev => new Set([...prev, material.attachments[0].id]));
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-6xl">
                          {getFileIcon(material.attachments[0].mimeType)}
                        </div>
                      )
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-6xl">
                        📁
                      </div>
                    )}

                    {/* 파일 개수 표시 */}
                    {material.attachments.length > 1 && (
                      <div className="absolute top-2 right-2 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded-full">
                        +{material.attachments.length - 1}
                      </div>
                    )}

                    {/* 선택 체크박스 (선택 모드일 때) */}
                    {isAdmin && isSelectMode && (
                      <button
                        onClick={() => handleSelectMaterial(material.id)}
                        className="absolute top-2 left-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110"
                        title="선택/해제"
                      >
                        {selectedMaterials.has(material.id) ? (
                          <span className="text-blue-600 text-lg font-bold">✓</span>
                        ) : (
                          <span className="text-gray-400 text-lg">○</span>
                        )}
                      </button>
                    )}

                    {/* 관리자 개별 삭제 버튼 (일반 모드일 때) */}
                    {isAdmin && !isSelectMode && (
                      <button
                        onClick={() => handleDelete(material.id)}
                        className="absolute top-2 left-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        title="삭제"
                      >
                        ×
                      </button>
                    )}
                  </div>

                  {/* 카드 정보 */}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 text-sm mb-2 line-clamp-2">
                      {material.title}
                    </h3>
                    
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>업로드: {new Date(material.uploadedAt).toLocaleDateString('ko-KR')}</p>
                      {material.attachments.length > 0 && (
                        <p>
                          {material.attachments.length}개 파일 | {' '}
                          {formatFileSize(material.attachments.reduce((sum, file) => sum + file.fileSize, 0))}
                        </p>
                      )}
                    </div>

                    {/* 파일 다운로드 링크들 */}
                    {material.attachments.length > 0 && (
                      <div className="mt-3 space-y-1">
                        {material.attachments.slice(0, 2).map((file) => (
                          <a
                            key={file.id}
                            href={file.filePath}
                            download={file.filename}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-xs text-blue-600 hover:text-blue-800 truncate transition-colors hover:bg-blue-50 p-1 rounded"
                            title={`다운로드: ${file.filename}`}
                          >
                            {getFileIcon(file.mimeType)} {file.filename}
                          </a>
                        ))}
                        {material.attachments.length > 2 && (
                          <p className="text-xs text-gray-400">
                            +{material.attachments.length - 2}개 파일 더
                          </p>
                        )}
                      </div>
                    )}
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
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
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