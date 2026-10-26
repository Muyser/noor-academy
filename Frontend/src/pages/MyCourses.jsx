import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight, Award, CheckCircle2, Clock, PlayCircle, Loader2, Hourglass, AlertCircle, RefreshCw, ChevronDown } from 'lucide-react';
import { useI18n } from '@/lib/useI18n';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function MyCourses() {
  const { lang, isRTL } = useI18n();
  const isAr = lang === 'ar';
  const { user } = useAuth();

  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const token = localStorage.getItem('token') || '';
        const res = await fetch(`${API_URL}/api/enrollments/my-courses`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (!res.ok) throw new Error('Failed to fetch enrollments');
        const data = await res.json();
        
        if (Array.isArray(data)) {
          setEnrollments(data);
        }
      } catch (err) {
        console.error('Failed to load student enrollments:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchEnrollments();
    } else {
      setLoading(false);
    }
  }, [user]);

  const filteredEnrollments = enrollments.filter((e) => {
    const status = e.status || 'active';
    if (filter === 'active') return status === 'active';
    if (filter === 'pending') return status === 'pending_approval';
    if (filter === 'rejected') return status === 'rejected';
    if (filter === 'completed') return status === 'completed';
    return true;
  });

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto h-64 rounded-2xl bg-white flex items-center justify-center shadow-sm">
        <Loader2 className="w-8 h-8 animate-spin text-[#009688]" />
      </div>
    );
  }

  return (
    <div className={`max-w-5xl mx-auto space-y-5 px-2 sm:px-0 ${isAr ? 'dir-rtl' : 'dir-ltr'}`}>
      
      {/* Header & Minimal Native Dropdown */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div>
          <h1 className="text-xl font-bold text-[#112d27]">
            {isAr ? 'دوراتي المسجلة' : 'My Courses'}
          </h1>
          <p className="text-xs text-gray-500 font-normal mt-0.5">
            {isAr ? 'واصل دروسك واستعرض حالة تسجيلاتك وتقدمك' : 'Continue learning and track your enrollments'}
          </p>
        </div>

        {/* Minimal Dropdown Filter */}
        <div className="relative">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="appearance-none bg-white border border-gray-200 rounded-xl px-3 py-1.5 pe-8 text-xs font-bold text-gray-700 hover:border-[#009688] focus:outline-none focus:border-[#009688] transition-colors cursor-pointer shadow-xs"
          >
            <option value="all">{isAr ? `الكل (${enrollments.length})` : `All (${enrollments.length})`}</option>
            <option value="active">{isAr ? `نشطة (${enrollments.filter(e => e.status === 'active').length})` : `Active (${enrollments.filter(e => e.status === 'active').length})`}</option>
            <option value="pending">{isAr ? `قيد المراجعة (${enrollments.filter(e => e.status === 'pending_approval').length})` : `Pending (${enrollments.filter(e => e.status === 'pending_approval').length})`}</option>
            <option value="rejected">{isAr ? `مرفوضة (${enrollments.filter(e => e.status === 'rejected').length})` : `Rejected (${enrollments.filter(e => e.status === 'rejected').length})`}</option>
            <option value="completed">{isAr ? `مكتملة (${enrollments.filter(e => e.status === 'completed').length})` : `Completed (${enrollments.filter(e => e.status === 'completed').length})`}</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute end-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Grid Layout */}
      {filteredEnrollments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500 font-normal text-xs mb-3">
            {isAr ? 'لا توجد دورات تطابق الفلتر المختار.' : 'No courses match this filter.'}
          </p>
          <Link to="/courses">
            <Button size="sm" className="bg-[#009688] hover:bg-[#00796b] text-white font-bold rounded-lg text-xs">
              {isAr ? 'تصفح جميع الدورات' : 'Browse All Courses'}
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 justify-items-center sm:justify-items-stretch">
          {filteredEnrollments.map((enr) => {
            const course = enr.course || {};
            const courseId = course._id || course.id || enr.course_id;
            const title = isAr ? course.title_ar || course.title || enr.course_title : course.title || enr.course_title;
            const instructor = course.instructor || enr.instructor || 'Prof. Ahmed Nour';
            const thumbnail = course.image || enr.thumbnail || '';
            const category = course.category || enr.category || 'Language';
            const progress = enr.progress !== undefined ? enr.progress : 0;
            const completedLessons = enr.completed_lectures ? enr.completed_lectures.length : (enr.completed_lessons || 0);
            
            let totalLessons = enr.total_lessons || 20;
            if (course.sections && Array.isArray(course.sections)) {
              let count = 0;
              course.sections.forEach((sec) => {
                if (sec.lectures) count += sec.lectures.length;
              });
              if (count > 0) totalLessons = count;
            }

            const isCompleted = enr.status === 'completed' || progress === 100;
            const isPending = enr.status === 'pending_approval';
            const isRejected = enr.status === 'rejected';

            return (
              <div
                key={enr._id || enr.id}
                className="w-full max-w-[285px] sm:max-w-none bg-white rounded-2xl border border-gray-100/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between p-4 group"
              >
                <div>
                  {/* Card Thumbnail */}
                  <div className="relative w-full h-36 rounded-xl overflow-hidden bg-gray-100 mb-3">
                    {thumbnail ? (
                      <img
                        src={thumbnail}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#009688]/10 text-[#009688] font-bold text-lg">
                        {title?.charAt(0) || 'C'}
                      </div>
                    )}
                    
                    <span className="absolute top-2.5 start-2.5 px-2 py-0.5 rounded-md bg-white/95 backdrop-blur-md text-[10px] font-bold text-[#009688] shadow-sm uppercase tracking-wider">
                      {category}
                    </span>

                    <span
                      className={cn(
                        'absolute top-2.5 end-2.5 px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 backdrop-blur-md text-white shadow-sm',
                        isCompleted ? 'bg-emerald-600/90' : isPending ? 'bg-amber-600/90' : isRejected ? 'bg-red-600/90' : 'bg-teal-600/90'
                      )}
                    >
                      {isCompleted ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" /> {isAr ? 'مكتملة' : 'Done'}
                        </>
                      ) : isPending ? (
                        <>
                          <Hourglass className="w-3 h-3 animate-spin" /> {isAr ? 'قيد المراجعة' : 'Pending'}
                        </>
                      ) : isRejected ? (
                        <>
                          <AlertCircle className="w-3 h-3" /> {isAr ? 'مرفوضة' : 'Rejected'}
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3" /> {isAr ? 'نشطة' : 'Active'}
                        </>
                      )}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="space-y-1.5 mb-3">
                    <h3 className="font-bold text-[#112d27] text-xs sm:text-sm leading-snug line-clamp-2 group-hover:text-[#009688] transition-colors">
                      {title}
                    </h3>

                    <p className="text-[11px] text-gray-400 font-normal">
                      {isAr ? 'المحاضر:' : 'Instructor:'} <span className="text-gray-600 font-bold">{instructor}</span>
                    </p>

                    {/* Rejection Reason Display if Rejected */}
                    {isRejected && enr.rejection_reason && (
                      <div className="p-2 rounded-xl bg-red-50 border border-red-100 text-[11px] text-red-700 font-normal leading-relaxed">
                        <strong>{isAr ? 'السبب:' : 'Reason:'}</strong> {enr.rejection_reason}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Status & Action */}
                <div className="pt-2.5 border-t border-gray-100 space-y-2.5 mt-auto">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-bold text-gray-500">
                      <span>{completedLessons}/{totalLessons} {isAr ? 'دروس' : 'lessons'}</span>
                      <span className={cn('font-bold', isPending ? 'text-amber-600' : isRejected ? 'text-red-600' : 'text-[#009688]')}>
                        {isPending 
                          ? (isAr ? 'بانتظار الموافقة' : 'Pending') 
                          : isRejected 
                          ? (isAr ? 'مرفوض' : 'Rejected') 
                          : `${progress}%`}
                      </span>
                    </div>
                    <div className="h-1 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-500', 
                          isCompleted ? 'bg-emerald-500' : isPending ? 'bg-amber-400' : isRejected ? 'bg-red-400' : 'bg-[#009688]'
                        )}
                        style={{ width: isPending || isRejected ? '100%' : `${progress}%` }}
                      />
                    </div>
                  </div>

                  {isPending ? (
                    <div className="w-full h-8 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold flex items-center justify-center gap-1">
                      <Hourglass className="w-3 h-3 animate-spin" />
                      <span>{isAr ? 'قيد مراجعة الإدارة' : 'Under Admin Review'}</span>
                    </div>
                  ) : isRejected ? (
                    <Link to={`/courses/${courseId}`} className="block">
                      <Button
                        size="sm"
                        className="w-full font-bold rounded-lg h-8 text-xs gap-1.5 bg-red-600 hover:bg-red-700 text-white shadow-none"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>{isAr ? 'إعادة إرسال الإيصال' : 'Re-submit Receipt'}</span>
                      </Button>
                    </Link>
                  ) : (
                    <Link to={`/learning?course=${courseId}`} className="block">
                      <Button
                        size="sm"
                        className={cn(
                          'w-full font-bold rounded-lg h-8 text-xs gap-1.5 shadow-none transition-all',
                          isCompleted ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-[#009688] hover:bg-[#00796b] text-white'
                        )}
                      >
                        {isCompleted ? (
                          <>
                            <Award className="w-3.5 h-3.5" />
                            {isAr ? 'عرض الشهادة' : 'Certificate'}
                          </>
                        ) : (
                          <>
                            <PlayCircle className="w-3.5 h-3.5" />
                            {isAr ? 'متابعة الدرس' : 'Continue'}
                            <ArrowRight className={cn('w-3.5 h-3.5 ms-auto', isRTL && 'rotate-180')} />
                          </>
                        )}
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}