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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    
    if (files.length > 0) {
      setSelectedFiles(files);
    }
  };

  const handleUpload = async () => {
    if (!selectedFiles.length) return;

    setUploading(true);
    
    for (const file of selectedFiles) {
      const formData = new FormData();
      // 파일명에서 확장자 제거하여 제목으로 사용
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

    setSelectedFiles([]);
    fetchMaterials();
    setUploading(false);
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
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="container mx-auto px-6">
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{title}</h1>
          <p className="text-xl text-gray-400">산업재해 사례 및 예방 자료</p>
        </motion.div>

        {/* 업로드 섹션 (관리자만) */}
        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-700 mb-12"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <span className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mr-3">
                <span className="text-white text-lg">📸</span>
              </span>
              새 자료 업로드
            </h2>
            
            <div className="space-y-6">
              {/* 드래그 앤 드롭 영역 */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                  isDragOver 
                    ? 'border-blue-400 bg-blue-500/10' 
                    : 'border-gray-600 bg-gray-700/50'
                }`}
              >
                <div className="text-6xl mb-4">{isDragOver ? '📤' : '📁'}</div>
                <p className="text-white text-lg mb-2">
                  {isDragOver ? '파일을 여기에 놓으세요' : '이미지를 드래그하여 업로드'}
                </p>
                <p className="text-gray-400 text-sm">
                  또는 클릭하여 파일 선택
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleFileSelect(Array.from(e.target.files || []))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>

              {/* 선택된 파일 미리보기 */}
              {selectedFiles.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {file.name}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={uploading || !selectedFiles.length}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? '업로드 중...' : `업로드 (${selectedFiles.length}개 파일)`}
              </button>
            </div>
          </motion.div>
        )}

        {/* 포토카드 그리드 */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {materials.map((material, index) => (
              <motion.div
                key={material.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group relative"
              >
                <div className="bg-gray-800 rounded-2xl overflow-hidden shadow-xl border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:scale-[1.02]">
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
                        <div className="w-full h-full flex items-center justify-center bg-gray-700 text-gray-400 text-6xl">
                          {getFileIcon(material.attachments[0].mimeType)}
                        </div>
                      )
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-700 text-gray-400 text-6xl">
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
                    <h3 className="font-bold text-white text-sm mb-2 line-clamp-2 leading-tight">
                      {material.title}
                    </h3>
                    
                    <div className="text-xs text-gray-400 flex items-center justify-between">
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
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
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