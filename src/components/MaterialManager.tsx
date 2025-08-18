'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/lib/simpleAuth';
import Image from 'next/image';

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

// Interface for Material, matching updated Prisma schema
interface Material {
  id: string;
  title: string;
  content?: string;
  attachments: MaterialAttachment[];
  uploadedAt: string;
  category: string;
}

// Props for the component
interface MaterialManagerProps {
  category: '교육자료' | '산업재해';
  title: string;
}

const ITEMS_PER_PAGE = 10;

export default function MaterialManager({ category, title }: MaterialManagerProps) {
  // Auth session
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // State variables
  const [materials, setMaterials] = useState<Material[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPost, setEditingPost] = useState<Material | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchBy, setSearchBy] = useState('title');

  // Function to fetch materials from the API
  const fetchMaterials = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        category,
        page: String(currentPage),
        limit: String(ITEMS_PER_PAGE),
      });
      if (searchTerm) {
        params.append('searchTerm', searchTerm);
        params.append('searchBy', searchBy);
      }
      const res = await fetch(`/api/materials?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch materials');
      const { data, totalCount } = await res.json();
      setMaterials(data);
      setTotalCount(totalCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [category, currentPage, searchTerm, searchBy]);

  // Fetch materials when category, currentPage, or search terms change
  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  // 파일 확장자에 따른 아이콘 반환
  const getFileIcon = (filename?: string) => {
    if (!filename) return '📝'; // 파일이 없는 경우 기본 아이콘
    
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


  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
    fetchMaterials();
  };

  // Reset search fields and fetch all materials
  const resetSearch = () => {
    setSearchTerm('');
    setSearchBy('title');
    setCurrentPage(1);
    // useEffect will trigger a refetch
  };

  // Handle post detail view - navigate to detail page
  const handlePostClick = (material: Material) => {
    const categoryPath = category === '교육자료' ? 'educational-materials' : 'industrial-accidents';
    window.location.href = `/${categoryPath}/${material.id}`;
  };

  // Handle edit post
  const handleEditPost = (material: Material) => {
    setEditingPost(material);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  // Close edit modal
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingPost(null);
    setIsModalOpen(false);
  };

  // Handle file upload/update
  const handleFileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);
    const formData = new FormData(e.currentTarget);
    formData.append('category', category);

    try {
      if (isEditing && editingPost) {
        // 편집 모드
        formData.append('id', editingPost.id);
        const res = await fetch('/api/materials', { method: 'PUT', body: formData });
        if (!res.ok) throw new Error((await res.json()).error || 'Update failed');
      } else {
        // 새 게시글 생성
        const res = await fetch('/api/materials', { method: 'POST', body: formData });
        if (!res.ok) throw new Error((await res.json()).error || 'Upload failed');
      }
      fetchMaterials(); // Refresh list
      setIsModalOpen(false);
      handleCancelEdit(); // 편집 상태 초기화
    } catch (err) {
      alert((isEditing ? 'Update' : 'Upload') + ' failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

  // Handle bulk deletion
  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) {
      alert('삭제할 항목을 선택하세요.');
      return;
    }
    if (!confirm(`선택된 ${selectedItems.length}개의 항목을 정말로 삭제하시겠습니까?`)) return;

    try {
      const res = await fetch('/api/materials', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedItems }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Deletion failed');
      setSelectedItems([]);
      fetchMaterials(); // Refresh list
    } catch (err) {
      alert('Deletion failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  // Toggle selection for a single item
  const handleSelectItem = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Toggle selection for all items on the current page
  const handleSelectAll = () => {
    if (selectedItems.length === materials.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(materials.map(m => m.id));
    }
  };

  // Memoized pagination calculation
  const totalPages = useMemo(() => Math.ceil(totalCount / ITEMS_PER_PAGE), [totalCount]);

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

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };


  if (error) return <div className="text-center p-8 text-red-500">오류: {error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto p-4 max-w-7xl">
        <div className="flex items-center space-x-3 mb-8">
          <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
            <span className="text-2xl text-white">
              {category === '교육자료' ? '📚' : '⚠️'}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {title}
          </h1>
        </div>

        {/* Search Area */}
        <div className="bg-white/70 backdrop-blur-sm border border-white/20 shadow-xl rounded-xl p-6 mb-8">
        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="sm:col-span-1 lg:col-span-1">
            <label htmlFor="searchBy" className="block text-sm font-medium text-gray-700 mb-1">검색 조건</label>
            <select id="searchBy" value={searchBy} onChange={e => setSearchBy(e.target.value)} className="w-full p-2 border rounded-md">
              <option value="title">제목</option>
              <option value="content">내용</option>
            </select>
          </div>
          <div className="sm:col-span-1 lg:col-span-2">
            <label htmlFor="searchTerm" className="block text-sm font-medium text-gray-700 mb-1">검색어</label>
            <input
              type="text"
              id="searchTerm"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="검색어를 입력하세요..."
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-1 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <button type="submit" className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg">
              🔍 검색
            </button>
            <button type="button" onClick={resetSearch} className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white p-2 rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-md hover:shadow-lg">
              🔄 초기화
            </button>
          </div>
        </form>
        </div>

        {/* Summary */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-2 sm:space-y-0">
          <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-2 shadow-md">
            <span className="text-gray-700 text-sm sm:text-base flex items-center space-x-2">
              <span>📊</span>
              <span>총 <span className="font-bold text-blue-600">{totalCount}</span>개의 게시물이 있습니다.</span>
            </span>
          </div>
        </div>

        {/* Content Area */}
        {isLoading ? (
          <div className="text-center p-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">로딩 중...</p>
          </div>
      ) : (
        <>
          {/* Selection Controls */}
          <div className="mb-4 flex items-center justify-between">
            {isAdmin && (
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    onChange={handleSelectAll} 
                    checked={selectedItems.length === materials.length && materials.length > 0}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">전체 선택</span>
                </label>
                {selectedItems.length > 0 && (
                  <span className="text-sm text-blue-600">{selectedItems.length}개 선택됨</span>
                )}
              </div>
            )}
          </div>

          {/* Posts Table */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden border border-white/20">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  {isAdmin && (
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                      <input 
                        type="checkbox" 
                        onChange={handleSelectAll} 
                        checked={selectedItems.length === materials.length && materials.length > 0}
                        className="rounded"
                      />
                    </th>
                  )}
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    제목
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell w-80">
                    첨부파일
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell w-32">
                    작성일
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {materials.map((material) => (
                  <tr 
                    key={material.id} 
                    className={`hover:bg-gray-50 ${selectedItems.includes(material.id) ? 'bg-blue-50' : ''}`}
                  >
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap w-12">
                        <input 
                          type="checkbox" 
                          checked={selectedItems.includes(material.id)} 
                          onChange={() => handleSelectItem(material.id)}
                          className="rounded"
                        />
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <button
                          onClick={() => handlePostClick(material)}
                          className="text-sm font-medium text-blue-600 hover:text-blue-800 break-keep text-left w-full"
                        >
                          {material.title}
                        </button>
                        {material.content && (
                          <div className="text-sm text-gray-500 mt-1 line-clamp-2 break-keep">
                            {material.content.length > 100 
                              ? material.content.substring(0, 100) + '...' 
                              : material.content
                            }
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell w-80">
                      {material.attachments && material.attachments.length > 0 ? (
                        <div className="space-y-2">
                          {material.attachments.map((attachment, index) => (
                            <div key={attachment.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                              {attachment.thumbnailPath ? (
                                <img src={attachment.thumbnailPath} alt={attachment.filename} className="w-8 h-8 object-cover rounded flex-shrink-0" />
                              ) : (
                                <span className="text-lg flex-shrink-0">{getFileIcon(attachment.filename)}</span>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="text-sm text-gray-900 truncate" title={attachment.filename}>
                                  {attachment.filename}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {formatFileSize(attachment.fileSize)}
                                </div>
                              </div>
                              <div className="flex space-x-1 flex-shrink-0">
                                <button
                                  onClick={() => handleDownload(attachment)}
                                  className="text-blue-600 hover:text-blue-900 text-xs px-1 py-1 rounded hover:bg-blue-100"
                                  title="다운로드"
                                >
                                  ⬇
                                </button>
                                <button
                                  onClick={() => handlePreview(attachment)}
                                  className="text-gray-600 hover:text-gray-900 text-xs px-1 py-1 rounded hover:bg-gray-100"
                                  title="미리보기"
                                >
                                  👁
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">첨부파일 없음</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell w-32">
                      {new Date(material.uploadedAt).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2 justify-end">
                        {isAdmin && (
                          <button
                            onClick={() => handleEditPost(material)}
                            className="text-green-600 hover:text-green-900 text-xs px-2 py-1 border border-green-300 rounded hover:bg-green-50"
                          >
                            편집
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {materials.length === 0 && (
            <div className="text-center py-16">
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-8 max-w-md mx-auto shadow-lg">
                <div className="text-6xl mb-4">📁</div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">등록된 자료가 없습니다</h3>
                <p className="text-gray-500">새로운 게시글을 등록해보세요!</p>
              </div>
            </div>
          )}
        </>
      )}

        {/* Footer: Bulk Actions and Pagination */}
        {isAdmin && (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-8 space-y-3 sm:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
              <button 
                onClick={handleBulkDelete} 
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 disabled:from-gray-300 disabled:to-gray-400 text-sm sm:text-base w-full sm:w-auto transition-all duration-200 shadow-md hover:shadow-lg disabled:shadow-none flex items-center justify-center space-x-2" 
                disabled={selectedItems.length === 0}
              >
                <span>🗑️</span>
                <span>선택 삭제</span>
              </button>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)} 
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-indigo-700 text-sm sm:text-base w-full sm:w-auto transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
            >
              <span>✏️</span>
              <span>새로운 게시글 등록</span>
            </button>
          </div>
        )}

        {/* Pagination */}
        <div className="flex justify-center items-center mt-8 space-x-2 overflow-x-auto">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
            disabled={currentPage === 1} 
            className="px-4 py-2 bg-white/70 backdrop-blur-sm border border-white/20 rounded-lg disabled:opacity-50 text-sm shadow-md hover:shadow-lg transition-all duration-200 hover:bg-white/90"
          >
            ← 이전
          </button>
          <div className="flex space-x-1">
            {[...Array(Math.min(totalPages, 7)).keys()].map(num => {
              let pageNum;
              if (totalPages <= 7) {
                pageNum = num + 1;
              } else if (currentPage <= 4) {
                pageNum = num + 1;
              } else if (currentPage >= totalPages - 3) {
                pageNum = totalPages - 6 + num;
              } else {
                pageNum = currentPage - 3 + num;
              }
              return (
                <button 
                  key={pageNum} 
                  onClick={() => setCurrentPage(pageNum)} 
                  className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                    currentPage === pageNum 
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg' 
                      : 'bg-white/70 backdrop-blur-sm border border-white/20 shadow-md hover:shadow-lg hover:bg-white/90'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
            disabled={currentPage === totalPages} 
            className="px-4 py-2 bg-white/70 backdrop-blur-sm border border-white/20 rounded-lg disabled:opacity-50 text-sm shadow-md hover:shadow-lg transition-all duration-200 hover:bg-white/90"
          >
            다음 →
          </button>
        </div>

        {/* Post Creation/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full flex items-center justify-center p-4 z-50">
            <div className="bg-white/95 backdrop-blur-sm p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto border border-white/20">
              <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center space-x-3">
                <span>{isEditing ? '✏️' : '📝'}</span>
                <span>{isEditing ? '게시글 수정' : '새 게시글 작성'}</span>
              </h2>
            <form onSubmit={handleFileSubmit}>
              <div className="mb-4">
                <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">제목 *</label>
                <input 
                  type="text" 
                  name="title" 
                  id="title" 
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline" 
                  required 
                  autoComplete="off"
                  placeholder="게시글 제목을 입력하세요"
                  defaultValue={isEditing ? editingPost?.title || '' : ''}
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="content" className="block text-gray-700 text-sm font-bold mb-2">내용</label>
                <textarea 
                  name="content" 
                  id="content" 
                  rows={6}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline resize-none" 
                  autoComplete="off"
                  placeholder="게시글 내용을 입력하세요"
                  defaultValue={isEditing ? editingPost?.content || '' : ''}
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="files" className="block text-gray-700 text-sm font-bold mb-2">첨부파일 (선택사항, 최대 5개)</label>
                
                {isEditing && editingPost?.attachments && editingPost.attachments.length > 0 && (
                  <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700 font-medium mb-2">현재 첨부파일:</p>
                    <div className="space-y-2">
                      {editingPost.attachments.map((attachment, index) => (
                        <div key={attachment.id} className="flex items-center space-x-2">
                          <span className="text-lg">{getFileIcon(attachment.filename)}</span>
                          <span className="text-sm text-gray-700">{attachment.filename}</span>
                          <span className="text-xs text-gray-500">({formatFileSize(attachment.fileSize)})</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">새 파일을 선택하면 기존 파일들이 모두 교체됩니다.</p>
                  </div>
                )}
                
                <input 
                  type="file" 
                  name="files" 
                  id="files" 
                  multiple
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline" 
                  autoComplete="off"
                  accept=".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.webp,.mp4,.webm,.txt"
                />
                <p className="text-xs text-gray-500 mt-1">
                  지원 형식: PDF, PPT, DOC, XLS, 이미지, 동영상 파일 (최대 5개, 총합 50MB)
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                <button 
                  type="button" 
                  onClick={isEditing ? handleCancelEdit : () => setIsModalOpen(false)} 
                  className="w-full sm:w-auto bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg" 
                  disabled={uploading}
                >
                  ✕ 취소
                </button>
                <button 
                  type="submit" 
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50" 
                  disabled={uploading}
                >
                  {uploading 
                    ? (
                      <span className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>{isEditing ? '수정 중...' : '등록 중...'}</span>
                      </span>
                    ) 
                    : (
                      <span className="flex items-center space-x-2">
                        <span>{isEditing ? '✏️' : '📝'}</span>
                        <span>{isEditing ? '수정' : '등록'}</span>
                      </span>
                    )
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}