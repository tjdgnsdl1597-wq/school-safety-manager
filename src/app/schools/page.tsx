'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '@/lib/simpleAuth';
import { useRouter } from 'next/navigation';

interface School {
  id: string;
  name: string;
  phoneNumber: string | null;
  contactPerson: string | null;
  email: string | null;
}

export default function SchoolsPage() {
  const { user } = useAuth();
  const router = useRouter();
  

  const [schools, setSchools] = useState<School[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    contactPerson: '',
    email: ''
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string>('');
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);

  useEffect(() => {
    fetchSchools();
  }, []);

  useEffect(() => {
    if (editingSchool) {
      setFormData({
        name: editingSchool.name,
        phoneNumber: editingSchool.phoneNumber || '',
        contactPerson: editingSchool.contactPerson || '',
        email: editingSchool.email || ''
      });
    } else {
      setFormData({
        name: '',
        phoneNumber: '',
        contactPerson: '',
        email: ''
      });
    }
  }, [editingSchool]);

  const fetchSchools = async () => {
    setIsLoading(true);
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      if (user) {
        headers['x-user-id'] = user.id;
        headers['x-user-role'] = user.role;
      }
      
      const res = await fetch(`/api/schools?t=${Date.now()}`, { 
        headers,
        cache: 'no-store'
      });
      if (!res.ok) throw new Error('Failed to fetch schools');
      const data = await res.json();
      setSchools(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말로 이 학교를 삭제하시겠습니까? 연관된 모든 일정도 함께 삭제될 수 있습니다.')) {
      return;
    }
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      if (user) {
        headers['x-user-id'] = user.id;
        headers['x-user-role'] = user.role;
      }
      
      const res = await fetch('/api/schools', {
        method: 'DELETE',
        headers,
        body: JSON.stringify({ ids: [id] }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete school');
      }
      fetchSchools(); // Refresh list
    } catch (err) {
      alert('삭제 실패: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const schoolData = {
      id: editingSchool?.id,
      name: formData.name,
      phoneNumber: formData.phoneNumber,
      contactPerson: formData.contactPerson,
      email: formData.email,
    };

    const url = '/api/schools';
    const method = editingSchool ? 'PUT' : 'POST';

    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      if (user) {
        headers['x-user-id'] = user.id;
        headers['x-user-role'] = user.role;
      }
      
      const res = await fetch(url, {
        method: method,
        headers,
        body: JSON.stringify(schoolData),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save school');
      }
      fetchSchools();
      setEditingSchool(null); // This will clear the form via useEffect
    } catch (err) {
      alert('저장 실패: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const handleCancelEdit = () => {
    setEditingSchool(null); // This will clear the form via useEffect
  };

  const handleSelectSchool = (schoolId: string) => {
    setSelectedSchools(prev => 
      prev.includes(schoolId) 
        ? prev.filter(id => id !== schoolId)
        : [...prev, schoolId]
    );
  };

  const handleSelectAll = () => {
    if (selectedSchools.length === schools.length) {
      setSelectedSchools([]);
    } else {
      setSelectedSchools(schools.map(school => school.id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedSchools.length === 0) {
      alert('삭제할 학교를 선택해주세요.');
      return;
    }

    if (!confirm(`선택한 ${selectedSchools.length}개 학교를 삭제하시겠습니까? 연관된 모든 일정도 함께 삭제될 수 있습니다.`)) {
      return;
    }

    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      if (user) {
        headers['x-user-id'] = user.id;
        headers['x-user-role'] = user.role;
      }
      
      const res = await fetch('/api/schools', {
        method: 'DELETE',
        headers,
        body: JSON.stringify({ ids: selectedSchools }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete schools');
      }
      
      setSelectedSchools([]);
      fetchSchools(); // Refresh list
    } catch (err) {
      alert('삭제 실패: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setUploadMessage('CSV 파일만 업로드 가능합니다.');
      return;
    }

    setIsUploading(true);
    setUploadMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const headers: HeadersInit = {};
      if (user) {
        headers['x-user-id'] = user.id;
        headers['x-user-role'] = user.role;
      }

      const response = await fetch('/api/schools/bulk', {
        method: 'POST',
        headers,
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setUploadMessage(result.message);
        if (result.duplicateErrors?.length > 0) {
          setUploadMessage(prev => prev + '\n중복된 학교: ' + result.duplicateErrors.join(', '));
        }
        fetchSchools(); // 목록 새로고침
      } else {
        setUploadMessage(`오류: ${result.error}`);
        if (result.details) {
          setUploadMessage(prev => prev + '\n세부사항: ' + (Array.isArray(result.details) ? result.details.join(', ') : result.details));
        }
      }
    } catch (error) {
      setUploadMessage('파일 업로드 중 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
      // 파일 input 초기화
      event.target.value = '';
    }
  };

  if (isLoading) return <div className="text-center p-8">로딩 중...</div>;
  if (error) return <div className="text-center p-8 text-red-500">오류: {error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto p-4 max-w-6xl">
        <div className="flex items-center space-x-3 mb-8">
          <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
            <span className="text-2xl text-white">🏫</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            학교 관리
          </h1>
        </div>

        {/* CSV 일괄 업로드 */}
        <div className="bg-white/80 backdrop-blur-sm p-6 sm:p-8 rounded-xl shadow-xl border border-white/20 mb-8">
          <h2 className="text-2xl font-bold mb-4">📁 CSV 일괄 업로드</h2>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-3 sm:space-y-0">
              <a
                href="/sample-schools.csv"
                download="학교정보_양식.csv"
                className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors shadow-md"
              >
                📥 양식 다운로드
              </a>
              <span className="text-gray-500 text-sm">← 먼저 양식을 다운로드하여 작성해주세요</span>
            </div>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
              />
              {isUploading && (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  <span className="ml-2 text-sm text-gray-600">업로드 중...</span>
                </div>
              )}
            </div>
            {uploadMessage && (
              <div className={`p-3 rounded ${uploadMessage.includes('오류') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                <pre className="text-sm whitespace-pre-wrap">{uploadMessage}</pre>
              </div>
            )}
          </div>
        </div>

        {/* School Add/Edit Form */}
        <div className="bg-white/80 backdrop-blur-sm p-6 sm:p-8 rounded-xl shadow-xl border border-white/20 mb-8">
        <h2 className="text-2xl font-bold mb-4">{editingSchool ? '학교 수정' : '새 학교 추가'}</h2>
        <form id="school-form" onSubmit={handleFormSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">학교명</label>
              <input 
                type="text" 
                name="name" 
                id="name" 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                required 
              />
            </div>
            <div>
              <label htmlFor="phoneNumber" className="block text-gray-700 text-sm font-bold mb-2">전화번호</label>
              <input 
                type="text" 
                name="phoneNumber" 
                id="phoneNumber" 
                value={formData.phoneNumber} 
                onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
              />
            </div>
            <div>
              <label htmlFor="contactPerson" className="block text-gray-700 text-sm font-bold mb-2">담당자</label>
              <input 
                type="text" 
                name="contactPerson" 
                id="contactPerson" 
                value={formData.contactPerson} 
                onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                autoComplete="name" 
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">이메일</label>
              <input 
                type="email" 
                name="email" 
                id="email" 
                value={formData.email} 
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                autoComplete="email" 
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-end mt-6 space-y-2 sm:space-y-0 sm:space-x-3">
            {editingSchool && (
              <button 
                type="button" 
                onClick={handleCancelEdit} 
                className="w-full sm:w-auto bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
              >
                ✕ 취소
              </button>
            )}
            <button 
              type="submit" 
              className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {editingSchool ? '✏️ 수정' : '➕ 추가'}
            </button>
          </div>
        </form>
      </div>

        {/* School List Table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden border border-white/20">
          {/* 일괄 삭제 버튼 */}
          {selectedSchools.length > 0 && (
            <div className="bg-red-50 border-b border-red-200 px-6 py-3 flex items-center justify-between">
              <span className="text-red-700 font-medium">
                {selectedSchools.length}개 학교 선택됨
              </span>
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
              >
                🗑️ 선택한 학교 삭제
              </button>
            </div>
          )}
          
          <div className="hidden md:block">
            <table className="min-w-full leading-normal">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedSchools.length === schools.length && schools.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">순번</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">학교명</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">전화번호</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">담당자</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">이메일</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">작업</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {schools.map((school, index) => (
                  <tr key={school.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm">
                      <input
                        type="checkbox"
                        checked={selectedSchools.includes(school.id)}
                        onChange={() => handleSelectSchool(school.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{index + 1}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{school.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{school.phoneNumber || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{school.contactPerson || '-'}</td>
                    <td className="px-6 py-4 text-sm text-blue-600">{school.email || '-'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex space-x-2 justify-end">
                        <button 
                          onClick={() => setEditingSchool(school)} 
                          className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                        >
                          수정
                        </button>
                        <button 
                          onClick={() => handleDelete(school.id)} 
                          className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                        >
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Mobile Card View */}
          <div className="md:hidden space-y-4 p-4">
            {schools.map((school, index) => (
              <div key={school.id} className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedSchools.includes(school.id)}
                      onChange={() => handleSelectSchool(school.id)}
                      className="rounded border-gray-300 mt-1"
                    />
                    <div>
                      <div className="font-bold text-lg text-gray-900">{school.name}</div>
                      <div className="text-sm text-gray-500">#{index + 1}</div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => setEditingSchool(school)} 
                      className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => handleDelete(school.id)} 
                      className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <span className="text-gray-500 text-sm w-16">📞</span>
                    <span className="text-sm">{school.phoneNumber || '등록된 번호 없음'}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-500 text-sm w-16">👤</span>
                    <span className="text-sm">{school.contactPerson || '담당자 정보 없음'}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-500 text-sm w-16">✉️</span>
                    <span className="text-sm">{school.email || '이메일 정보 없음'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
