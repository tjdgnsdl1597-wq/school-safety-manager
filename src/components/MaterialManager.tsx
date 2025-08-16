'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';

// Interface for Material, matching Prisma schema
interface Material {
  id: string;
  filename: string;
  filePath: string;
  uploadedAt: string;
  uploader: string;
  category: string;
}

// Props for the component
interface MaterialManagerProps {
  category: '교육자료' | '산업재해';
  title: string;
}

const ITEMS_PER_PAGE = 10;

export default function MaterialManager({ category, title }: MaterialManagerProps) {
  // State variables
  const [materials, setMaterials] = useState<Material[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchBy, setSearchBy] = useState('filename');

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

  // 파일 크기 포맷팅
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
    setSearchBy('filename');
    setCurrentPage(1);
    // useEffect will trigger a refetch
  };

  // Handle file upload
  const handleFileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);
    const formData = new FormData(e.currentTarget);
    formData.append('category', category);
    formData.append('uploader', '강성훈'); // Placeholder for logged-in user

    try {
      const res = await fetch('/api/materials', { method: 'POST', body: formData });
      if (!res.ok) throw new Error((await res.json()).error || 'Upload failed');
      fetchMaterials(); // Refresh list
      setIsModalOpen(false);
    } catch (err) {
      alert('Upload failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
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
    // Vercel 환경에서는 실제 파일이 저장되지 않으므로 대안 제공
    if (material.filePath.startsWith('temp://')) {
      alert(`파일 "${material.filename}"은 임시 저장된 상태입니다.\n실제 파일 다운로드 기능은 외부 스토리지 연동 후 제공될 예정입니다.`);
      return;
    }
    
    // 실제 파일 경로가 있는 경우 다운로드
    const link = document.createElement('a');
    link.href = material.filePath;
    link.download = material.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle file preview
  const handlePreview = (material: Material) => {
    if (material.filePath.startsWith('temp://')) {
      alert(`파일 "${material.filename}"의 미리보기는 현재 지원되지 않습니다.\n실제 파일 미리보기 기능은 외부 스토리지 연동 후 제공될 예정입니다.`);
      return;
    }
    
    // PDF나 이미지 파일의 경우 새 창에서 열기
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
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-blue-800 mb-6">{title}</h1>

      {/* Search Area */}
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-1">
            <label htmlFor="searchBy" className="block text-sm font-medium text-gray-700 mb-1">검색 조건</label>
            <select id="searchBy" value={searchBy} onChange={e => setSearchBy(e.target.value)} className="w-full p-2 border rounded-md">
              <option value="filename">제목</option>
              <option value="uploader">작성자</option>
            </select>
          </div>
          <div className="md:col-span-2">
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
          <div className="flex space-x-2">
            <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600">검색</button>
            <button type="button" onClick={resetSearch} className="w-full bg-gray-500 text-white p-2 rounded-md hover:bg-gray-600">초기화</button>
          </div>
        </form>
      </div>

      {/* Summary and Actions */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <span className="text-gray-700">총 <span className="font-bold">{totalCount}</span>개의 게시물이 있습니다.</span>
        </div>
        <button onClick={handleExcelDownload} className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">엑셀 다운로드</button>
      </div>

      {/* Grid Area */}
      {isLoading ? (
        <div className="text-center p-8">로딩 중...</div>
      ) : (
        <>
          {/* Selection Controls */}
          <div className="mb-4 flex items-center justify-between">
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
          </div>

          {/* 4-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {materials.map((material, index) => (
              <div 
                key={material.id} 
                className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 ${
                  selectedItems.includes(material.id) ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                {/* Thumbnail Area */}
                <div className="h-48 bg-gray-100 flex items-center justify-center relative">
                  <div className="absolute top-2 left-2">
                    <input 
                      type="checkbox" 
                      checked={selectedItems.includes(material.id)} 
                      onChange={() => handleSelectItem(material.id)}
                      className="rounded"
                    />
                  </div>
                  <div className="text-center">
                    <div className="text-6xl mb-2">{getFileIcon(material.filename)}</div>
                    <div className="text-xs text-gray-500 px-2">
                      {material.filename.split('.').pop()?.toUpperCase()}
                    </div>
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-4">
                  <h3 
                    className="font-semibold text-sm text-gray-900 mb-2 overflow-hidden" 
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      maxHeight: '2.5rem'
                    }}
                    title={material.filename}
                  >
                    {material.filename}
                  </h3>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span>{material.uploader}</span>
                    <span>{new Date(material.uploadedAt).toLocaleDateString()}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleDownload(material)}
                      className="flex-1 bg-blue-500 text-white text-xs py-2 px-3 rounded hover:bg-blue-600 transition-colors"
                    >
                      다운로드
                    </button>
                    <button
                      onClick={() => handlePreview(material)}
                      className="flex-1 bg-gray-500 text-white text-xs py-2 px-3 rounded hover:bg-gray-600 transition-colors"
                    >
                      미리보기
                    </button>
                  </div>
                </div>
              </div>
            ))}
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
      <div className="flex justify-between items-center mt-6">
        <div className="flex space-x-2">
          <button onClick={handleBulkDelete} className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 disabled:bg-gray-300" disabled={selectedItems.length === 0}>선택 삭제</button>
          {/* <button className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 disabled:bg-gray-300" disabled={selectedItems.length === 0}>선택 이동</button> */}
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">새로운 게시물 등록</button>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center mt-6 space-x-2">
        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 border rounded-md disabled:opacity-50">이전</button>
        {[...Array(totalPages).keys()].map(num => (
          <button key={num + 1} onClick={() => setCurrentPage(num + 1)} className={`px-3 py-1 border rounded-md ${currentPage === num + 1 ? 'bg-blue-500 text-white' : ''}`}>
            {num + 1}
          </button>
        ))}
        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 border rounded-md disabled:opacity-50">다음</button>
      </div>

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">새 자료 업로드</h2>
            <form onSubmit={handleFileSubmit}>
              <div className="mb-4">
                <label htmlFor="file" className="block text-gray-700 text-sm font-bold mb-2">파일</label>
                <input 
                  type="file" 
                  name="file" 
                  id="file" 
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" 
                  required 
                  autoComplete="off"
                  accept=".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.webp,.mp4,.webm,.txt"
                />
                <p className="text-xs text-gray-500 mt-1">
                  지원 형식: PDF, PPT, DOC, XLS, 이미지, 동영상 파일 (최대 50MB)
                </p>
              </div>
              <div className="mb-4">
                <label htmlFor="uploader" className="block text-gray-700 text-sm font-bold mb-2">업로더</label>
                <input 
                  type="text" 
                  name="uploader" 
                  id="uploader" 
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" 
                  required 
                  placeholder="업로드하는 사람의 이름을 입력하세요"
                  autoComplete="name"
                />
              </div>
              <div className="flex items-center justify-end">
                <button type="button" onClick={() => setIsModalOpen(false)} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded mr-2" disabled={uploading}>취소</button>
                <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded" disabled={uploading}>
                  {uploading ? '업로드 중...' : '업로드'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}