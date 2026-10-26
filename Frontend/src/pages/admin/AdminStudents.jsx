import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/useI18n';
import { Search, Loader2, Mail, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function AdminStudents() {
  const { t, lang } = useI18n();
  const isAr = lang === 'ar';

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Fetch users/students from real backend API
  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token') || '';
      const res = await fetch(`${API_URL}/api/admin/users?role=student`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load students');

      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch students', err);
      toast({
        title: isAr ? 'خطأ' : 'Error',
        description: isAr ? 'فشل تحميل قائمة الطلاب' : 'Failed to load student profiles',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filtered = users.filter((u) =>
    !search ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`space-y-6 ${isAr ? 'dir-rtl' : 'dir-ltr'}`}>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#112d27]">
            {isAr ? 'إدارة الطلاب' : t('admin.students') || 'Students Management'}
          </h1>
          <p className="text-xs sm:text-sm font-medium text-gray-500 mt-1">
            {isAr
              ? 'عرض وتقييم جميع حسابات الطلاب المسجلين في منصة الأكاديمية.'
              : 'View and manage student profiles and platform activity.'}
          </p>
        </div>

        {/* Search Input */}
        <div className="relative max-w-xs w-full">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isAr ? 'ابحث باسم الطالب أو البريد...' : 'Search students or email...'}
            className="ps-9 h-10 text-xs sm:text-sm font-semibold border-gray-200 focus:border-[#009688] rounded-xl"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs sm:text-sm">
            <thead className="bg-[#f8fcfb] text-gray-400 text-[11px] font-bold uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="px-4 py-3.5 text-start">{isAr ? 'اسم الطالب' : 'Student Name'}</th>
                <th className="px-4 py-3.5 text-start">{isAr ? 'البريد الإلكتروني' : 'Email Address'}</th>
                <th className="px-4 py-3.5 text-start">{isAr ? 'تاريخ الانضمام' : 'Joined Date'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 font-medium text-[#112d27]">
              {loading ? (
                <tr>
                  <td colSpan={3} className="text-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#009688]" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-12 text-gray-400 font-semibold text-xs">
                    {isAr ? 'لم يتم العثور على نتائج مطابقة للبحث.' : 'No students found matching your search.'}
                  </td>
                </tr>
              ) : (
                filtered.map((u) => {
                  const initial = (u.full_name || u.email || 'S').charAt(0).toUpperCase();

                  return (
                    <tr key={u.id} className="hover:bg-[#f8fcfb]/80 transition-colors">
                      {/* Name & Avatar */}
                      <td className="px-4 py-3.5 font-bold">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-[#009688]/10 text-[#009688] font-black text-xs flex items-center justify-center shrink-0">
                            {initial}
                          </div>
                          <span className="truncate max-w-[220px]">{u.full_name || 'Student User'}</span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-4 py-3.5 text-gray-600 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="truncate max-w-[280px]">{u.email}</span>
                        </div>
                      </td>

                      {/* Joined Date */}
                      <td className="px-4 py-3.5 text-gray-400 text-xs font-semibold">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span>{u.created_date ? u.created_date.split('T')[0] : '—'}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}