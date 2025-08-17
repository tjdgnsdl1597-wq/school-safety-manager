'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

// Interface for Material, matching updated Prisma schema
interface Material {
  id: string;
  title: string;
  content?: string;
  filename?: string;
  filePath?: string;
  uploadedAt: string;
  category: string;
  thumbnailPath?: string;
}

// Props for the component
interface MaterialManagerProps {
  category: '교육자료' | '산업재해';
  title: string;
}

const ITEMS_PER_PAGE = 10;

export default function MaterialManager({ category, title }: MaterialManagerProps) {
  // Auth session
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === 'admin';

  // State variables
  const [materials, setMaterials] = useState<Material[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Material | null>(null);
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

  // Handle post detail view
  const handlePostClick = (material: Material) => {
    setSelectedPost(material);
    setIsDetailModalOpen(true);
  };

  // Handle edit post
  const handleEditPost = (material: Material) => {
    setEditingPost(material);
    setIsEditing(true);
    setIsModalOpen(true);
    setIsDetailModalOpen(false);
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
  const handleDownload = (material: Material) => {
    if (!material.filePath || !material.filename) {
      alert('첨부파일이 없습니다.');
      return;
    }

    // temp:// 경로인 경우 (기존 임시 파일)
    if (material.filePath.startsWith('temp://')) {
      alert(`파일 "${material.filename}"은 임시 저장된 상태입니다.\n실제 파일 다운로드 기능은 외부 스토리지 연동 후 제공될 예정입니다.`);
      return;
    }
    
    // GCS URL 또는 기타 실제 파일 경로인 경우 다운로드
    const link = document.createElement('a');
    link.href = material.filePath;
    link.download = material.filename;
    link.target = '_blank'; // GCS URL의 경우 새 창에서 열기
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle file preview
  const handlePreview = (material: Material) => {
    if (!material.filePath || !material.filename) {
      alert('첨부파일이 없습니다.');
      return;
    }

    if (material.filePath.startsWith('temp://')) {
      alert(`파일 "${material.filename}"의 미리보기는 현재 지원되지 않습니다.\n실제 파일 미리보기 기능은 외부 스토리지 연동 후 제공될 예정입니다.`);
      return;
    }
    
    // GCS URL 또는 실제 파일 경로의 경우 미리보기
    const fileExt = material.filename.toLowerCase().split('.').pop() || '';
    if (['pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt)) {
      window.open(material.filePath, '_blank');
    } else {
      alert(`"${material.filename}" 파일의 미리보기는 지원되지 않습니다.\n다운로드 후 확인해주세요.`);
    }
  };

  // Placeholder for Excel download
  const handleExcelDownload = () => {
    alert('엑셀 다운로드 기능은 현재 구현 중입니다.');
    // To implement: use a library like 'xlsx' to generate an Excel file from the `materials` data.
  };

  if (error) return <div className="text-center p-8 text-red-500">오류: {error}</div>;

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <h1 className="text-2xl md:text-3xl font-bold text-blue-800 mb-6">{title}</h1>

      {/* Search Area */}
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
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
            <button type="submit" className="flex-1 bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600">검색</button>
            <button type="button" onClick={resetSearch} className="flex-1 bg-gray-500 text-white p-2 rounded-md hover:bg-gray-600">초기화</button>
          </div>
        </form>
      </div>

      {/* Summary and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-2 sm:space-y-0">
        <div>
          <span className="text-gray-700 text-sm sm:text-base">총 <span className="font-bold">{totalCount}</span>개의 게시물이 있습니다.</span>
        </div>
        <button onClick={handleExcelDownload} className="bg-green-500 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-green-600 text-sm sm:text-base w-full sm:w-auto">엑셀 다운로드</button>
      </div>

      {/* Grid Area */}
      {isLoading ? (
        <div className="text-center p-8">로딩 중...</div>
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
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
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
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    첨부파일
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
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
                    <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      {material.filename ? (
                        <div className="flex items-center">
                          <span className="text-lg mr-2">{getFileIcon(material.filename)}</span>
                          <span className="text-sm text-gray-900 truncate max-w-40" title={material.filename}>
                            {material.filename}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">첨부파일 없음</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                      {new Date(material.uploadedAt).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2 justify-end">
                        {material.filename && (
                          <>
                            <button
                              onClick={() => handleDownload(material)}
                              className="text-blue-600 hover:text-blue-900 text-xs px-2 py-1 border border-blue-300 rounded hover:bg-blue-50"
                            >
                              다운로드
                            </button>
                            <button
                              onClick={() => handlePreview(material)}
                              className="text-gray-600 hover:text-gray-900 text-xs px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
                            >
                              미리보기
                            </button>
                          </>
                        )}
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
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-4">📁</div>
              <p>등록된 자료가 없습니다.</p>
            </div>
          )}
        </>
      )}

      {/* Footer: Bulk Actions and Pagination */}
      {isAdmin && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-6 space-y-3 sm:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
            <button onClick={handleBulkDelete} className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 disabled:bg-gray-300 text-sm sm:text-base w-full sm:w-auto" disabled={selectedItems.length === 0}>선택 삭제</button>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 text-sm sm:text-base w-full sm:w-auto">새로운 게시글 등록</button>
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-center items-center mt-6 space-x-1 sm:space-x-2 overflow-x-auto">
        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-2 sm:px-3 py-1 border rounded-md disabled:opacity-50 text-xs sm:text-sm">이전</button>
        <div className="flex space-x-1 sm:space-x-2">
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
                className={`px-2 sm:px-3 py-1 border rounded-md text-xs sm:text-sm ${currentPage === pageNum ? 'bg-blue-500 text-white' : ''}`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>
        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-2 sm:px-3 py-1 border rounded-md disabled:opacity-50 text-xs sm:text-sm">다음</button>
      </div>

      {/* Post Creation/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center p-4 z-50">
          <div className="bg-white p-4 sm:p-8 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">
              {isEditing ? '게시글 수정' : '새 게시글 작성'}
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
                <label htmlFor="file" className="block text-gray-700 text-sm font-bold mb-2">첨부파일 (선택사항)</label>
                
                {isEditing && editingPost?.filename && (
                  <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{getFileIcon(editingPost.filename)}</span>
                      <span className="text-sm text-gray-700">현재 파일: {editingPost.filename}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">새 파일을 선택하면 기존 파일이 교체됩니다.</p>
                  </div>
                )}
                
                <input 
                  type="file" 
                  name="file" 
                  id="file" 
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline" 
                  autoComplete="off"
                  accept=".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.webp,.mp4,.webm,.txt"
                />
                <p className="text-xs text-gray-500 mt-1">
                  지원 형식: PDF, PPT, DOC, XLS, 이미지, 동영상 파일 (최대 50MB)
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                <button 
                  type="button" 
                  onClick={isEditing ? handleCancelEdit : () => setIsModalOpen(false)} 
                  className="w-full sm:w-auto bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded" 
                  disabled={uploading}
                >
                  취소
                </button>
                <button 
                  type="submit" 
                  className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded" 
                  disabled={uploading}
                >
                  {uploading 
                    ? (isEditing ? '수정 중...' : '등록 중...') 
                    : (isEditing ? '수정' : '등록')
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Post Detail Modal */}
      {isDetailModalOpen && selectedPost && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 break-keep">
                {selectedPost.title}
              </h2>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            
            <div className="mb-4 text-sm text-gray-500">
              작성일: {new Date(selectedPost.uploadedAt).toLocaleDateString('ko-KR')}
            </div>
            
            {selectedPost.content && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">내용</h3>
                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap break-keep bg-gray-50 p-4 rounded-lg">
                  {selectedPost.content}
                </div>
              </div>
            )}
            
            {selectedPost.filename && selectedPost.filePath && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">첨부파일</h3>
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{getFileIcon(selectedPost.filename)}</span>
                      <div>
                        <div className="font-medium text-gray-900 break-all">
                          {selectedPost.filename}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleDownload(selectedPost)}
                        className="px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                      >
                        다운로드
                      </button>
                      <button
                        onClick={() => handlePreview(selectedPost)}
                        className="px-4 py-2 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors"
                      >
                        미리보기
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-3">
              {isAdmin && (
                <button
                  onClick={() => handleEditPost(selectedPost)}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                >
                  편집
                </button>
              )}
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}