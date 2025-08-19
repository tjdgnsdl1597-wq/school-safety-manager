'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/simpleAuth';
import Link from 'next/link';

// Interface for MaterialAttachment
interface MaterialAttachment {
  id: string;
  filename: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  thumbnailPath?: string;
  uploadOrder: number;
}

// Interface for Material
interface Material {
  id: string;
  title: string;
  content?: string;
  attachments: MaterialAttachment[];
  uploadedAt: string;
  category: string;
}

export default function IndustrialAccidentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const isAdmin = user?.role === 'super_admin';
  
  const [material, setMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchMaterial(params.id as string);
    }
  }, [params.id]);

  const fetchMaterial = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/materials/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          setError('게시글을 찾을 수 없습니다.');
        } else {
          setError('게시글을 불러오는데 실패했습니다.');
        }
        return;
      }
      const data = await response.json();
      setMaterial(data);
    } catch (err) {
      setError('게시글을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 파일 확장자에 따른 아이콘 반환
  const getFileIcon = (filename: string) => {
    const ext = filename.toLowerCase().split('.').pop() || '';
    
    if (['pdf'].includes(ext)) return '📄';
    if (['ppt', 'pptx'].includes(ext)) return '📊';
    if (['doc', 'docx'].includes(ext)) return '📝';
    if (['xls', 'xlsx'].includes(ext)) return '📈';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return '🖼️';
    if (['mp4', 'webm', 'avi', 'mov'].includes(ext)) return '🎬';
    if (['txt'].includes(ext)) return '📃';
    return '📎';
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Handle file download
  const handleDownload = (attachment: MaterialAttachment) => {
    const link = document.createElement('a');
    link.href = attachment.filePath;
    link.download = attachment.filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle file preview
  const handlePreview = (attachment: MaterialAttachment) => {
    const fileExt = attachment.filename.toLowerCase().split('.').pop() || '';
    if (['pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt)) {
      window.open(attachment.filePath, '_blank');
    } else {
      alert(`"${attachment.filename}" 파일의 미리보기는 지원되지 않습니다.\n다운로드 후 확인해주세요.`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              <p className="mt-4 text-gray-600">로딩 중...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !material) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="text-6xl mb-4">😞</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">오류가 발생했습니다</h1>
            <p className="text-gray-600 mb-8">{error}</p>
            <Link 
              href="/industrial-accidents" 
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              ← 목록으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/industrial-accidents" 
            className="inline-flex items-center text-red-600 hover:text-red-800 mb-4 transition-colors"
          >
            <span className="mr-2">←</span>
            산업재해 목록으로 돌아가기
          </Link>
          
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-4 break-keep">
                  {material.title}
                </h1>
                <div className="flex items-center text-sm text-gray-500 space-x-4">
                  <span>📅 {new Date(material.uploadedAt).toLocaleDateString('ko-KR')}</span>
                  <span>📁 {material.category}</span>
                  {material.attachments.length > 0 && (
                    <span>📎 {material.attachments.length}개 파일</span>
                  )}
                </div>
              </div>
              {isAdmin && (
                <Link
                  href={`/industrial-accidents?edit=${material.id}`}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  편집
                </Link>
              )}
            </div>

            {/* Content */}
            {material.content && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">내용</h2>
                <div className="bg-gray-50 rounded-lg p-6 text-gray-700 leading-relaxed whitespace-pre-wrap break-keep">
                  {material.content}
                </div>
              </div>
            )}

            {/* Attachments */}
            {material.attachments && material.attachments.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  첨부파일 ({material.attachments.length}개)
                </h2>
                <div className="grid gap-4">
                  {material.attachments.map((attachment, index) => (
                    <div key={attachment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {attachment.thumbnailPath ? (
                            <img 
                              src={attachment.thumbnailPath} 
                              alt={attachment.filename} 
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                              <span className="text-3xl">{getFileIcon(attachment.filename)}</span>
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-gray-900 break-all">
                              {attachment.filename}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              {formatFileSize(attachment.fileSize)} • {attachment.mimeType}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleDownload(attachment)}
                            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
                          >
                            <span>⬇️</span>
                            <span>다운로드</span>
                          </button>
                          <button
                            onClick={() => handlePreview(attachment)}
                            className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
                          >
                            <span>👁️</span>
                            <span>미리보기</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}