import { useRef } from 'react';
import { Award, Printer, X, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/useI18n';

export default function CertificateModal({ course, onClose }) {
  const { lang } = useI18n();
  const isAr = lang === 'ar';
  const certificateRef = useRef(null);

  // 1. Automatically pull logged-in student information from session/localStorage
  const user = JSON.parse(localStorage.getItem('noor_user') || '{}');
  const studentName = user.full_name || user.name || 'Muyser';

  // 2. Fetch course-specific details & teacher-uploaded certificate theme
  const courseTitle = isAr ? course?.title_ar || course?.title : course?.title || 'English Language & Communication Mastery';
  const teacherName = course?.instructor || course?.author || 'Prof. Ahmed Nour';
  const categoryName = course?.category || 'Professional Training';
  
  // Teacher-uploaded certificate template image (fallback to branded gradient if none uploaded)
  const certificateThemeImage = course?.certificate_image || course?.certificate_template || null;

  // 3. Automated timestamp generation
  const issueDate = new Date().toLocaleDateString(isAr ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const certificateId = `NPA-CERT-${(course?.id || '101').toUpperCase()}-${Date.now().toString().slice(-5)}`;

  // Handle browser native print / save as PDF
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-gray-100 max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8">
        
        {/* Modal Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#009688]/10 text-[#009688] flex items-center justify-center font-bold">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-extrabold text-[#112d27] text-sm sm:text-base">
                {isAr ? 'شهادة إتمام الدورة' : 'Course Certificate of Completion'}
              </h2>
              <p className="text-[11px] text-gray-400 font-medium">
                {isAr ? 'مستند رسمي معتمد صادرة تلقائياً من أكاديمية نور برو' : 'Auto-generated official credential for completing course requirements.'}
              </p>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Certificate Template Card */}
        <div 
          ref={certificateRef}
          className={`relative p-8 sm:p-14 rounded-2xl border-4 border-[#009688]/30 text-center space-y-6 shadow-inner overflow-hidden transition-all ${
            certificateThemeImage ? 'bg-cover bg-center' : 'bg-gradient-to-br from-[#f8fcfb] via-white to-[#f0fbf9]'
          }`}
          style={certificateThemeImage ? { backgroundImage: `url(${certificateThemeImage})` } : {}}
        >
          {/* Subtle overlay if teacher uploaded a custom background image to ensure text contrast */}
          {certificateThemeImage && (
            <div className="absolute inset-0 bg-white/85 backdrop-blur-[1px] z-0" />
          )}

          {/* Decorative Corner Borders */}
          <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-[#009688]/50 z-10 pointer-events-none" />
          <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-[#009688]/50 z-10 pointer-events-none" />
          <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-[#009688]/50 z-10 pointer-events-none" />
          <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-[#009688]/50 z-10 pointer-events-none" />

          {/* Header Badge & Academy Title */}
          <div className="relative z-10 space-y-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-[#009688] bg-[#009688]/10 border border-[#009688]/20 px-3.5 py-1 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" />
              {isAr ? 'شهادة معتمدة من المعلم' : 'Official Verified Certificate'}
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-[#112d27] tracking-tight">
              Noor Pro Academy
            </h1>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
              {categoryName} • Language & Skill Training
            </p>
          </div>

          {/* Stamped Student Name Section */}
          <div className="relative z-10 space-y-3 py-2">
            <p className="text-xs sm:text-sm text-gray-500 font-medium italic">
              {isAr ? 'تمنح هذه الشهادة رسمياً إلى المتدرب:' : 'This certificate is proudly awarded to'}
            </p>
            <div className="inline-block relative">
              <h3 className="text-2xl sm:text-4xl font-black text-[#112d27] px-8 pb-1 border-b-2 border-[#009688]">
                {studentName}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 font-medium pt-2 max-w-lg mx-auto">
              {isAr 
                ? 'لاجتيازه بنجاح جميع الوحدات والمحتوى التدريبي والاختبارات المقررة لدورة:' 
                : 'for successfully finishing all lessons, coursework, and practical evaluations for'}
            </p>
            <h4 className="text-lg sm:text-2xl font-extrabold text-[#009688]">
              {courseTitle}
            </h4>
          </div>

          {/* Footer Info & Verification Seal */}
          <div className="relative z-10 flex items-end justify-between pt-8 border-t border-gray-200/80 text-xs mt-6">
            
            {/* Issue Date & Certificate ID */}
            <div className="text-start space-y-1">
              <p className="font-extrabold text-[#112d27]">{issueDate}</p>
              <p className="text-gray-400 text-[10px] font-medium">{isAr ? 'تاريخ الإصدار' : 'Issue Date'}</p>
              <p className="text-[9px] font-mono font-semibold text-gray-400">{certificateId}</p>
            </div>

            {/* Official NPA Golden Seal Badge */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-[#009688] to-[#00bfa5] text-white font-black flex flex-col items-center justify-center text-[9px] shadow-lg shadow-[#009688]/30 border-2 border-white shrink-0">
              <Award className="w-6 h-6 mb-0.5" />
              <span className="tracking-tighter">VERIFIED</span>
            </div>

            {/* Instructor Signature Block */}
            <div className="text-end space-y-1">
              <p className="font-extrabold text-[#112d27] underline decoration-[#009688]/40 decoration-2 underline-offset-4">
                {teacherName}
              </p>
              <p className="text-gray-400 text-[10px] font-medium">{isAr ? 'المعلم / المحاضر المشرف' : 'Course Instructor'}</p>
            </div>

          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 print:hidden">
          <div className="flex items-center gap-2 text-xs text-emerald-600 font-bold bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{isAr ? 'الشهادة موثقة وجاهزة للطباعة' : 'Certificate verified & ready for PDF export'}</span>
          </div>

          <div className="flex items-center gap-2 justify-end">
            <Button
              variant="outline"
              onClick={onClose}
              className="h-10 rounded-xl text-xs font-bold"
            >
              {isAr ? 'إغلاق' : 'Close'}
            </Button>

            <Button
              onClick={handlePrint}
              className="bg-[#009688] hover:bg-[#00796b] text-white font-extrabold h-10 px-6 rounded-xl text-xs gap-2 shadow-md shadow-[#009688]/20"
            >
              <Printer className="w-4 h-4" />
              {isAr ? 'طباعة / حفظ كـ PDF' : 'Print / Save as PDF'}
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}