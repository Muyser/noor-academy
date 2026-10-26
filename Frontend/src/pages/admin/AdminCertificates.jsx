import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/useI18n';
import { 
  Award, Search, Eye, ShieldCheck, 
  User, BookOpen, Calendar, Loader2, FileText 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CertificateModal from '../CertificateModal';
import { toast } from '@/components/ui/use-toast';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function AdminCertificates() {
  const { lang } = useI18n();
  const isAr = lang === 'ar';

  const [certificates, setCertificates] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    thisMonth: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCert, setSelectedCert] = useState(null);

  // Fetch all issued certificates from the real backend API
  const fetchCertificates = async () => {
    try {
      const token = localStorage.getItem('token') || '';
      const res = await fetch(`${API_URL}/api/certificates`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load certificates');

      // Map backend fields for consistent component rendering
      const formatted = data.map((cert) => ({
        id: cert._id,
        student_name: cert.student_name || cert.student?.full_name || 'Student',
        student_email: cert.student_email || cert.student?.email || '',
        course_title: cert.course_title || cert.course?.title || 'Course Title',
        course_title_ar: cert.course_title_ar || '',
        instructor: cert.instructor || 'Academy Instructor',
        category: cert.category || cert.course?.category || 'General',
        issue_date: cert.issue_date ? cert.issue_date.split('T')[0] : '—',
        certificate_code: cert.certificate_code,
        certificate_template: cert.certificate_template || '',
      }));

      setCertificates(formatted);

      // Compute dynamic stats counters
      const currentMonthPrefix = new Date().toISOString().slice(0, 7);
      setStats({
        total: formatted.length,
        thisMonth: formatted.filter(c => c.issue_date && c.issue_date.startsWith(currentMonthPrefix)).length,
      });
    } catch (err) {
      console.error('Failed to fetch certificates', err);
      toast({
        title: isAr ? 'خطأ' : 'Error',
        description: isAr ? 'فشل تحميل سجل الشهادات' : 'Failed to load issued certificates records',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const filtered = certificates.filter((c) =>
    !search ||
    c.student_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.course_title?.toLowerCase().includes(search.toLowerCase()) ||
    c.certificate_code?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`max-w-6xl mx-auto space-y-6 px-3 sm:px-0 ${isAr ? 'dir-rtl' : 'dir-ltr'}`}>
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl sm:rounded-3xl border border-gray-100 p-5 sm:p-6 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#112d27] tracking-tight">
            {isAr ? 'سجل الشهادات الصادرة' : 'Issued Certificates'}
          </h1>
          <p className="text-xs sm:text-sm font-normal text-gray-500 mt-1">
            {isAr ? 'استعراض وإدارة جميع شهادات الطلاب المعتمدة الصادرة تلقائياً عند إكمال الدورات.' : 'View, search, and verify all student certificates generated upon course completion.'}
          </p>
        </div>

        <div className="relative w-full sm:max-w-xs shrink-0">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isAr ? 'ابحث باسم الطالب أو الدورة...' : 'Search student or course...'}
            className="ps-9 h-10 text-xs sm:text-sm font-normal border-gray-200 focus:border-[#009688] rounded-xl w-full"
          />
        </div>
      </div>

      {/* Summary Stat Bar with Dynamic Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400">{isAr ? 'إجمالي الشهادات الصادرة' : 'Total Issued'}</p>
            <p className="text-xl sm:text-2xl font-bold text-[#112d27] mt-0.5">{stats.total}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#009688]/10 text-[#009688] flex items-center justify-center font-bold shrink-0">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400">{isAr ? 'شهادات هذا الشهر' : 'Issued This Month'}</p>
            <p className="text-xl sm:text-2xl font-bold text-emerald-600 mt-0.5">{stats.thisMonth}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400">{isAr ? 'حالة النظام' : 'System Status'}</p>
            <p className="text-sm sm:text-base font-bold text-[#009688] mt-1">{isAr ? 'متصل وفعال' : 'Online & Active'}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#009688]/10 text-[#009688] flex items-center justify-center font-bold shrink-0">
            <FileText className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Certificates Data Table */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs sm:text-sm">
            <thead className="bg-[#f8fcfb] text-gray-400 text-[11px] font-bold uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="px-4 sm:px-6 py-3.5 text-start">{isAr ? 'اسم الطالب' : 'Student Name'}</th>
                <th className="px-4 sm:px-6 py-3.5 text-start">{isAr ? 'عنوان الدورة' : 'Course Title'}</th>
                <th className="px-4 sm:px-6 py-3.5 text-start">{isAr ? 'كود التوثيق' : 'Certificate ID'}</th>
                <th className="px-4 sm:px-6 py-3.5 text-start">{isAr ? 'تاريخ الإصدار' : 'Issue Date'}</th>
                <th className="px-4 sm:px-6 py-3.5 text-end">{isAr ? 'المعاينة والطباعة' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 font-normal text-[#112d27]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#009688]" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-400 font-normal text-xs">
                    {isAr ? 'لا توجد شهادات مطابقة للبحث.' : 'No certificates found matching search.'}
                  </td>
                </tr>
              ) : (
                filtered.map((cert) => (
                  <tr key={cert.id} className="hover:bg-[#f8fcfb]/80 transition-colors">
                    
                    {/* Student Info */}
                    <td className="px-4 sm:px-6 py-3.5 font-bold">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[#009688]/10 text-[#009688] flex items-center justify-center shrink-0">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[#112d27] font-bold truncate max-w-[130px] sm:max-w-[180px]">{cert.student_name}</p>
                          <p className="text-[10px] text-gray-400 font-normal truncate max-w-[130px] sm:max-w-[180px]">{cert.student_email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Course Info */}
                    <td className="px-4 sm:px-6 py-3.5 text-gray-600 font-normal">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="truncate max-w-[150px] sm:max-w-[220px]">
                          {isAr ? cert.course_title_ar || cert.course_title : cert.course_title}
                        </span>
                      </div>
                    </td>

                    {/* Code */}
                    <td className="px-4 sm:px-6 py-3.5">
                      <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-[#009688] bg-[#009688]/10 px-2.5 py-0.5 rounded-md">
                        {cert.certificate_code}
                      </span>
                    </td>

                    {/* Issue Date */}
                    <td className="px-4 sm:px-6 py-3.5 text-gray-400 text-xs font-normal">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span>{cert.issue_date}</span>
                      </div>
                    </td>

                    {/* View Certificate */}
                    <td className="px-4 sm:px-6 py-3.5 text-end">
                      <Button
                        size="sm"
                        onClick={() => setSelectedCert(cert)}
                        className="bg-[#009688] hover:bg-[#00796b] text-white font-bold h-8 text-xs px-3 rounded-xl gap-1.5 shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{isAr ? 'معاينة الشهادة' : 'Preview'}</span>
                      </Button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Certificate Modal Preview */}
      {selectedCert && (
        <CertificateModal
          course={{
            id: selectedCert.id,
            title: selectedCert.course_title,
            title_ar: selectedCert.course_title_ar,
            instructor: selectedCert.instructor,
            category: selectedCert.category,
            certificate_image: selectedCert.certificate_template,
          }}
          onClose={() => setSelectedCert(null)}
        />
      )}

    </div>
  );
}