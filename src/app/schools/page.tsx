'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface School {
  id: string;
  name: string;
  phoneNumber: string | null;
  contactPerson: string | null;
}

export default function SchoolsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  
  // 관리자가 아닌 경우 교육자료 페이지로 리다이렉트
  useEffect(() => {
    if (session && session.user?.role !== 'admin') {
      router.push('/educational-materials');
    }
  }, [session, router]);

  const [schools, setSchools] = useState<School[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    contactPerson: ''
  });

  useEffect(() => {
    fetchSchools();
  }, []);

  useEffect(() => {
    if (editingSchool) {
      setFormData({
        name: editingSchool.name,
        phoneNumber: editingSchool.phoneNumber || '',
        contactPerson: editingSchool.contactPerson || ''
      });
    } else {
      setFormData({
        name: '',
        phoneNumber: '',
        contactPerson: ''
      });
    }
  }, [editingSchool]);

  const fetchSchools = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/schools');
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
      const res = await fetch('/api/schools', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
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
    };

    const url = '/api/schools';
    const method = editingSchool ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
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

  if (isLoading) return <div className="text-center p-8">로딩 중...</div>;
  if (error) return <div className="text-center p-8 text-red-500">오류: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-blue-800 mb-6">학교 관리</h1>

      {/* School Add/Edit Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
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
          </div>
          <div className="flex items-center justify-end mt-6">
            {editingSchool && (
              <button type="button" onClick={handleCancelEdit} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded mr-2">
                취소
              </button>
            )}
            <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
              {editingSchool ? '수정' : '추가'}
            </button>
          </div>
        </form>
      </div>

      {/* School List Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">순번</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">학교명</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">전화번호</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">담당자</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">작업</th>
            </tr>
          </thead>
          <tbody>
            {schools.map((school, index) => (
              <tr key={school.id}>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{index + 1}</td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{school.name}</td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{school.phoneNumber}</td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{school.contactPerson}</td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <button onClick={() => setEditingSchool(school)} className="text-indigo-600 hover:text-indigo-900 mr-3">수정</button>
                  <button onClick={() => handleDelete(school.id)} className="text-red-600 hover:text-red-900">삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
