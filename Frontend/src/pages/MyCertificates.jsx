import { useState, useEffect } from 'react';
import { Award, CheckCircle2, Calendar, FileText, Eye, Loader2 } from 'lucide-react';
import { useI18n } from '@/lib/useI18n';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import CertificateModal from './CertificateModal';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function MyCertificates() {
  const { lang } = useI18n();
  const isAr = lang === 'ar';
  const { user } = useAuth();
  
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState(null);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const token = localStorage.getItem('token') || '';
        const res = await fetch(`${API_URL}/api/certificates/my-certificates`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error('Failed to fetch certificates');
        const data = await res.json();

        if (Array.isArray(data)) {
          setCertificates(data);
        }
      } catch (err) {
        console.error('Failed to load certificates:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchCertificates();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="h-64 rounded-2xl bg-white border border-gray-100 flex items-center justify-center shadow-sm">
        <Loader2 className="w-8 h-8 animate-spin text-[#009688]" />
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${isAr ? 'dir-rtl' : 'dir-ltr'}`}>
      
      {/* Header */}
      <div className="pb-3 border-b border-gray-100">
        <h1 className="text-xl sm:text-2xl font-bold text-[#112d27]">
          {isAr ? 'شهاداتي المكتسبة' : 'My Certificates'}
        </h1>
        <p className="text-xs text-gray-500 font-medium mt-0.5">
          {isAr
            ? 'استعرض وقم بتنزيل أو طباعة جميع الشهادات الرسمية المكتسبة.'
            : 'View, print, or download your official academy completion certificates.'}
        </p>
      </div>

      {/* Grid Layout */}
      {certificates.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium text-xs">
            {isAr ? 'لم تحصل على شهادات بعد.' : 'No certificates earned yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {certificates.map((cert) => {
            const certId = cert.id || cert._id;
            const title = isAr ? cert.course_title_ar || cert.course_title : cert.course_title;
            const studentName = cert.student_name || user?.full_name || user?.name || 'Student';

            return (
              <div
                key={certId}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between p-3.5 space-y-3 relative"
              >
                {/* Accent Top Bar */}
                <div className="absolute top-0 inset-x-0 h-1.5 bg-[#009688]" />

                <div className="space-y-2.5 pt-1">
                  {/* Badge & Validity */}
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[9px] font-bold text-[#009688] bg-[#009688]/10 px-2 py-0.5 rounded flex items-center gap-1 truncate">
                      <Award className="w-3 h-3 shrink-0" />
                      {isAr ? 'إتمام' : 'Completion'}
                    </span>

                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-emerald-200 shrink-0">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      {isAr ? 'معتمدة' : 'Valid'}
                    </span>
                  </div>

                  {/* Course Title */}
                  <h3 className="font-bold text-[#112d27] text-xs sm:text-sm leading-snug line-clamp-2 min-h-[36px]">
                    {title}
                  </h3>

                  {/* Student Details */}
                  <div className="bg-[#f8fcfb] p-2.5 rounded-xl border border-gray-100 space-y-1 text-[11px] text-gray-600 font-medium">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-[10px]">{isAr ? 'الطالب:' : 'Student:'}</span>
                      <span className="font-bold text-[#112d27] truncate max-w-[90px]">{studentName}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-[10px] flex items-center gap-1">
                        <FileText className="w-2.5 h-2.5" />
                        {isAr ? 'الرقم:' : 'ID:'}
                      </span>
                      <span className="font-mono text-[10px] font-semibold text-[#009688]">{cert.certificate_number || cert.certificate_code}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-[10px] flex items-center gap-1">
                        <Calendar className="w-2.5 h-2.5" />
                        {isAr ? 'التاريخ:' : 'Date:'}
                      </span>
                      <span className="text-[10px] font-semibold">{cert.issue_date}</span>
                    </div>
                  </div>
                </div>

                {/* View / Print Button */}
                <Button
                  onClick={() => setSelectedCert(cert)}
                  size="sm"
                  className="w-full bg-[#009688] hover:bg-[#00796b] text-white font-bold rounded-xl h-8 text-[11px] gap-1 shadow-none"
                >
                  <Eye className="w-3 h-3" />
                  {isAr ? 'معاينة / طباعة' : 'Preview / Print'}
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {/* Certificate Modal Preview */}
      {selectedCert && (
        <CertificateModal
          course={{
            id: selectedCert.id || selectedCert.course_id,
            title: selectedCert.course_title,
            title_ar: selectedCert.course_title_ar,
            instructor: selectedCert.instructor || 'Prof. Ahmed Nour',
            category: selectedCert.category || 'Professional Training',
            certificate_image: selectedCert.certificate_template,
          }}
          onClose={() => setSelectedCert(null)}
        />
      )}

    </div>
  );
}