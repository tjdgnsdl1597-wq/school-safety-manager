'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

interface Material {
  id: string;
  filename: string;
  filePath: string;
  uploadedAt: string; // ISO string
  uploader: string;
  category: string;
  thumbnailPath?: string;
}

interface MaterialGridProps {
  category: string; // e.g., "교육자료", "산업재해"
  pageDescription: string;
}

const searchOptions = [
  { value: 'filename', label: '파일명' },
  { value: 'uploadedAt', label: '등록날짜' },
  { value: 'uploader', label: '등록자' },
];

export default function MaterialGrid({ category, pageDescription }: MaterialGridProps) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchBy, setSearchBy] = useState<string>('filename'); // Default search by filename

  const fetchMaterials = useCallback(async (term = searchTerm, by = searchBy) => {
    const query = new URLSearchParams({ category });
    if (term) {
      query.append('searchTerm', term);
      query.append('searchBy', by);
    }
    const res = await fetch(`/api/materials?${query.toString()}`);
    const data = await res.json();
    setMaterials(data);
  }, [category, searchTerm, searchBy]);

  useEffect(() => {
    fetchMaterials();
  }, [category, fetchMaterials]); // Refetch when category changes

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    } else {
      setFile(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert('파일을 선택해주세요.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    formData.append('uploader', '관리자'); // Default uploader

    const res = await fetch('/api/materials', {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      alert('자료가 성공적으로 업로드되었습니다.');
      setFile(null);
      fetchMaterials();
    } else {
      const errorData = await res.json();
      alert(`업로드 실패: ${errorData.error}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('정말로 이 자료를 삭제하시겠습니까?')) {
      const res = await fetch('/api/materials', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        alert('자료가 성공적으로 삭제되었습니다.');
        fetchMaterials();
      } else {
        const errorData = await res.json();
        alert(`삭제 실패: ${errorData.error}`);
      }
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMaterials(searchTerm, searchBy);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{category}</h1>
      <p className="mb-6 text-gray-700">{pageDescription}</p>

      {/* Upload Form (Admin Only - for now, always visible) */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-bold mb-4">자료 업로드</h2>
        <form onSubmit={handleUpload}>
          <div className="mb-4">
            <label htmlFor="file" className="block text-sm font-medium text-gray-700">파일 선택</label>
            <input
              type="file"
              id="file"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md"
          >
            업로드
          </button>
        </form>
      </div>

      {/* Search Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-bold mb-4">자료 검색</h2>
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-4">
          <select
            value={searchBy}
            onChange={(e) => setSearchBy(e.target.value)}
            className="flex-shrink-0 border border-gray-300 rounded-md shadow-sm p-2"
          >
            {searchOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <input
            type={searchBy === 'uploadedAt' ? 'date' : 'text'}
            placeholder="검색어 입력"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow border border-gray-300 rounded-md shadow-sm p-2"
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md flex-shrink-0"
          >
            검색
          </button>
        </form>
      </div>

      {/* Materials Grid */}
      <h2 className="text-xl font-bold mb-3">자료 목록</h2>
      {materials.length === 0 ? (
        <p className="text-gray-500 text-center py-8">등록된 자료가 없습니다.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {materials.map((material) => (
            <div key={material.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
              <div className="relative w-full h-40 bg-gray-200 flex items-center justify-center">
                {material.thumbnailPath ? (
                  <Image
                    src={material.thumbnailPath}
                    alt={material.filename}
                    width={160}
                    height={160}
                    className="object-contain max-h-full max-w-full"
                  />
                ) : (
                  <span className="text-gray-500 text-sm">미리보기 없음</span>
                )}
              </div>
              <div className="p-4 flex-grow">
                <h3 className="font-semibold text-gray-800 text-sm mb-2 truncate" title={material.filename}>
                  {material.filename}
                </h3>
                <p className="text-xs text-gray-600">등록자: {material.uploader}</p>
                <p className="text-xs text-gray-600">등록일: {new Date(material.uploadedAt).toLocaleDateString()}</p>
              </div>
              <div className="p-4 border-t border-gray-200 flex justify-between items-center">
                <a
                  href={material.filePath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  다운로드
                </a>
                <button
                  onClick={() => handleDelete(material.id)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
