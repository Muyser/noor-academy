import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Play, FileText, HelpCircle, Mic, Headphones, BookOpen, PenLine, Layers, CheckCircle2, ChevronLeft, ChevronRight, Menu, X, Loader2, Award, Lock, Clock } from 'lucide-react';
import { useI18n } from '@/lib/useI18n';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

const API_URL = import.meta.env.VITE_API_URL || '';

const lessonTypeIcons = {
  video: Play, text: FileText, quiz: HelpCircle, vocabulary: BookOpen,
  speaking: Mic, listening: Headphones, reading: BookOpen, writing: PenLine, mixed: Layers,
};

export default function Learning() {
  const { lang, isRTL } = useI18n();
  const isAr = lang === 'ar';
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const courseParamId = searchParams.get('course');

  const [enrollments, setEnrollments] = useState([]);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // 1. Fetch student enrollments on mount
  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const token = localStorage.getItem('token') || '';
        const res = await fetch(`${API_URL}/api/enrollments/my-courses`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Failed to fetch enrollments');
        const data = await res.json();

        if (Array.isArray(data) && data.length > 0) {
          setEnrollments(data);
          
          let targetEnr = data[0];
          if (courseParamId) {
            const found = data.find((e) => {
              const cId = e.course?._id || e.course?.id || e.course_id;
              return cId === courseParamId;
            });
            if (found) targetEnr = found;
          }
          
          loadCourseDetails(targetEnr);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to load learning enrollments:', err);
        setLoading(false);
      }
    };

    if (user) {
      fetchEnrollments();
    } else {
      setLoading(false);
    }
  }, [user, courseParamId]);

  // 2. Load Course sections & lectures
  const loadCourseDetails = (enr) => {
    setSelectedEnrollment(enr);
    const courseData = enr.course || {};
    setCourse(courseData);

    const courseSections = courseData.sections || [];
    setModules(courseSections);

    let allLessons = [];
    courseSections.forEach((sec, sIndex) => {
      if (sec.lectures && Array.isArray(sec.lectures)) {
        sec.lectures.forEach((lec, lIndex) => {
          allLessons.push({
            id: lec._id || lec.id || `les-${sIndex}-${lIndex}`,
            module_id: sec._id || sec.id || `mod-${sIndex}`,
            title: lec.title || `Lesson ${lIndex + 1}`,
            title_ar: lec.title_ar || '',
            type: lec.type || 'video',
            duration: lec.duration || '10 mins',
            video_url: lec.video_url || lec.video || '',
            content: lec.content || lec.description || '',
            is_preview: lec.is_preview || false,
            vocabulary: lec.vocabulary || [],
          });
        });
      }
    });

    setLessons(allLessons);
    if (allLessons.length > 0) {
      setActiveLesson(allLessons[0]);
    }
    setLoading(false);
  };

  const lessonsByModule = modules.reduce((acc, m, idx) => {
    const modId = m._id || m.id || `mod-${idx}`;
    acc[modId] = lessons.filter((l) => l.module_id === modId);
    return acc;
  }, {});

  const completedLectureIds = new Set(
    selectedEnrollment?.completed_lectures?.map((id) => id.toString()) || []
  );

  const totalLessons = lessons.length;
  const completedCount = completedLectureIds.size;
  const progressPct = selectedEnrollment?.progress !== undefined 
    ? selectedEnrollment.progress 
    : (totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0);

  const isPendingApproval = selectedEnrollment?.status === 'pending_approval';
  const isActiveEnrollment = selectedEnrollment?.status === 'active' || selectedEnrollment?.status === 'completed';

  // Check if active lesson can be accessed (either enrollment is active, or lesson is free preview)
  const canAccessLesson = isActiveEnrollment || activeLesson?.is_preview;

  const currentLessonIndex = activeLesson ? lessons.findIndex((l) => l.id === activeLesson.id) : -1;
  const prevLesson = currentLessonIndex > 0 ? lessons[currentLessonIndex - 1] : null;
  const nextLesson = currentLessonIndex >= 0 && currentLessonIndex < lessons.length - 1 ? lessons[currentLessonIndex + 1] : null;

  // 3. Update Progress & Generate Certificate on Completion
  const handleMarkComplete = async () => {
    if (!activeLesson || !selectedEnrollment || updating || !isActiveEnrollment) return;
    setUpdating(true);

    try {
      const token = localStorage.getItem('token') || '';
      const enrollmentId = selectedEnrollment._id || selectedEnrollment.id;
      const courseId = course._id || course.id || selectedEnrollment.course_id;

      const res = await fetch(`${API_URL}/api/enrollments/${enrollmentId}/progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ lectureId: activeLesson.id }),
      });

      const updatedEnrollment = await res.json();
      if (!res.ok) throw new Error(updatedEnrollment.message || 'Failed to update progress');

      setSelectedEnrollment(updatedEnrollment);

      // Check if course is 100% completed
      if (updatedEnrollment.progress >= 100 || updatedEnrollment.status === 'completed') {
        try {
          await fetch(`${API_URL}/api/certificates`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ courseId }),
          });
        } catch (certErr) {
          console.error('Certificate generation error:', certErr);
        }

        toast({
          title: isAr ? '🎉 تهانينا! أكملت الدورة' : '🎉 Congratulations! Course Completed',
          description: isAr 
            ? 'تم إصدار شهادتك بنجاح! جاري تحويلك إلى قائمة الشهادات...' 
            : 'Your official certificate has been issued! Redirecting to your certificates...',
        });

        setTimeout(() => {
          navigate('/dashboard?tab=certificates');
        }, 2000);
        return;
      }

      toast({
        title: isAr ? 'تم تحديث التقدم' : 'Progress Updated',
        description: isAr ? 'تم تسجيل الدرس كمكتمل بنجاح.' : 'Lesson marked as completed successfully.',
      });

      if (nextLesson) {
        setActiveLesson(nextLesson);
      }
    } catch (err) {
      toast({
        title: isAr ? 'خطأ' : 'Error',
        description: err.message || (isAr ? 'تعذر تحديث التقدم' : 'Failed to update progress'),
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)] bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-[#009688]" />
      </div>
    );
  }

  return (
    <div className={`flex h-[calc(100vh-4rem)] overflow-hidden ${isAr ? 'dir-rtl' : 'dir-ltr'}`}>
      
      {/* Sidebar Navigation */}
      <aside
        className={cn(
          'fixed lg:relative inset-y-0 top-16 lg:top-0 z-40 w-72 sm:w-80 bg-white border-e border-gray-100 overflow-y-auto transition-transform duration-300',
          sidebarOpen ? 'translate-x-0' : isRTL ? 'translate-x-full lg:translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="p-4 sticky top-0 bg-white border-b border-gray-100 z-10 space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-[#112d27] text-xs sm:text-sm truncate max-w-[200px]">
              {course?.title || selectedEnrollment?.course_title || 'Course Modules'}
            </h2>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 text-gray-400 hover:text-gray-700">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-bold text-gray-500">
              <span>{isAr ? 'نسبة التقدم' : 'Progress'}</span>
              <span className="text-[#009688]">{progressPct}%</span>
            </div>
            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full bg-[#009688] rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Pending Approval Banner in Sidebar */}
        {isPendingApproval && (
          <div className="m-3 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-extrabold">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{isAr ? 'قيد مراجعة الإدارة' : 'Pending Approval'}</span>
            </div>
            <p className="text-[11px] text-amber-700 font-medium">
              {isAr ? 'تم إرسال إشعار الدفع بنجاح. يمكنك معاينة الدروس المجانية بينما تنتظر التفعيل.' : 'Bank receipt submitted. You can watch free preview lessons while awaiting admin approval.'}
            </p>
          </div>
        )}

        <div className="p-3 space-y-4">
          {modules.map((mod, mi) => {
            const modId = mod._id || mod.id || `mod-${mi}`;
            const modLessons = lessonsByModule[modId] || [];

            return (
              <div key={modId} className="space-y-1">
                <div className="text-[11px] font-extrabold text-[#009688] uppercase tracking-wider px-2 py-1 truncate">
                  {isAr ? `الوحدة ${mi + 1}` : `Module ${String(mi + 1).padStart(2, '0')}`} — {mod.title || mod.section_title}
                </div>

                {modLessons.map((lesson) => {
                  const Icon = lessonTypeIcons[lesson.type] || Play;
                  const isDone = completedLectureIds.has(lesson.id.toString());
                  const isActive = activeLesson?.id === lesson.id;
                  const isLocked = !isActiveEnrollment && !lesson.is_preview;

                  return (
                    <button
                      key={lesson.id}
                      onClick={() => {
                        setActiveLesson(lesson);
                        setSidebarOpen(false);
                      }}
                      className={cn(
                        'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all text-start',
                        isActive
                          ? 'bg-[#009688] text-white shadow-sm'
                          : 'text-[#112d27] hover:bg-[#f8fcfb]'
                      )}
                    >
                      <div
                        className={cn(
                          'shrink-0 w-6 h-6 rounded-lg flex items-center justify-center',
                          isActive
                            ? 'bg-white/20 text-white'
                            : isDone
                            ? 'bg-green-100 text-green-700'
                            : isLocked
                            ? 'bg-gray-200 text-gray-500'
                            : 'bg-gray-100 text-[#009688]'
                        )}
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : isLocked ? (
                          <Lock className="w-3 h-3" />
                        ) : (
                          <Icon className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <span className="truncate flex-1">{isAr ? lesson.title_ar || lesson.title : lesson.title}</span>
                      
                      <div className="flex items-center gap-1.5 shrink-0">
                        {lesson.is_preview && !isActiveEnrollment && (
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.5 rounded">
                            {isAr ? 'معاينة' : 'Preview'}
                          </span>
                        )}
                        <span className={cn('text-[10px]', isActive ? 'text-white/85' : 'text-gray-400')}>
                          {lesson.duration}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Lesson Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
          
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden flex items-center gap-2 text-xs font-bold text-[#009688] bg-[#009688]/10 px-3 py-1.5 rounded-xl w-fit"
          >
            <Menu className="w-4 h-4" />
            {isAr ? 'عرض الوحدات والدروس' : 'View Course Modules'}
          </button>

          {activeLesson ? (
            <>
              {/* Lesson Title & Header */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider text-[#009688] bg-[#009688]/10 px-2.5 py-1 rounded-md">
                    {activeLesson.type}
                  </span>
                  {activeLesson.is_preview && !isActiveEnrollment && (
                    <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-md">
                      {isAr ? 'معاينة مجانية متاحة' : 'Free Preview Lesson'}
                    </span>
                  )}
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#112d27]">
                  {isAr ? activeLesson.title_ar || activeLesson.title : activeLesson.title}
                </h1>
                <p className="text-xs text-gray-400 font-medium mt-1">
                  {isAr ? 'مدة الدرس:' : 'Duration:'} {activeLesson.duration}
                </p>
              </div>

              {/* Video Player / Access Gate */}
              <div className="aspect-video rounded-3xl bg-slate-900 overflow-hidden shadow-lg relative flex items-center justify-center">
                {canAccessLesson ? (
                  activeLesson.video_url ? (
                    <video
                      src={activeLesson.video_url}
                      controls
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center text-white/70 p-6">
                      <Play className="w-12 h-12 mx-auto mb-2 text-[#009688]" />
                      <p className="text-xs sm:text-sm font-semibold">
                        {isAr ? 'محتوى الدورة التفاعلي' : 'Interactive Lesson Content'}
                      </p>
                    </div>
                  )
                ) : (
                  <div className="text-center text-white p-8 max-w-md space-y-3">
                    <div className="w-14 h-14 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                      <Lock className="w-7 h-7" />
                    </div>
                    <h3 className="font-extrabold text-base">
                      {isAr ? 'هذا الدرس مقفل' : 'This Lesson is Locked'}
                    </h3>
                    <p className="text-xs text-slate-300 font-medium leading-relaxed">
                      {isPendingApproval
                        ? (isAr ? 'تسجيلك قيد المراجعة حالياً من قبل الإدارة. يرجى انتظار التفعيل للوصول إلى كافة دروس الدورة.' : 'Your enrollment is currently pending admin approval. Please wait for activation to unlock full course access.')
                        : (isAr ? 'يرجى إتمام تسجيلك ودفع قيمة الدورة لفتح هذا الدرس وباقي محتوى المنهج.' : 'Please complete your course enrollment and payment to unlock this lesson and the full curriculum.')}
                    </p>
                  </div>
                )}
              </div>

              {/* Content Description */}
              {activeLesson.content && (
                <div className="bg-white rounded-3xl border border-gray-100 p-5 sm:p-6 shadow-sm space-y-2">
                  <h3 className="font-bold text-[#112d27] text-sm sm:text-base">
                    {isAr ? 'محتوى الدرس' : 'Lesson Content'}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium leading-relaxed whitespace-pre-wrap">
                    {activeLesson.content}
                  </p>
                </div>
              )}

              {/* Vocabulary */}
              {activeLesson.vocabulary && activeLesson.vocabulary.length > 0 && (
                <div className="bg-white rounded-3xl border border-gray-100 p-5 sm:p-6 shadow-sm space-y-3">
                  <h3 className="font-bold text-[#112d27] text-sm sm:text-base">
                    {isAr ? 'المفردات والكلمات المفتاحية' : 'Lesson Vocabulary'}
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {activeLesson.vocabulary.map((v, i) => (
                      <div key={i} className="p-3.5 rounded-2xl bg-[#f8fcfb] border border-gray-100 space-y-0.5">
                        <div className="font-extrabold text-[#112d27] text-xs sm:text-sm">{v.word}</div>
                        <div className="text-xs text-[#009688] font-bold">{v.translation}</div>
                        {v.example && (
                          <div className="text-[11px] text-gray-400 font-medium italic mt-1">"{v.example}"</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-100">
                <Button
                  variant="outline"
                  disabled={!prevLesson}
                  onClick={() => setActiveLesson(prevLesson)}
                  className="w-full sm:w-auto border-gray-200 text-[#112d27] hover:bg-gray-50 font-bold rounded-xl h-10 text-xs gap-1"
                >
                  <ChevronLeft className={cn('w-4 h-4', isRTL && 'rotate-180')} />
                  {isAr ? 'الدرس السابق' : 'Previous Lesson'}
                </Button>

                {isActiveEnrollment ? (
                  <Button
                    onClick={handleMarkComplete}
                    disabled={updating}
                    className="w-full sm:w-auto bg-[#009688] hover:bg-[#00796b] text-white font-extrabold rounded-xl h-10 text-xs gap-2 shadow-md shadow-[#009688]/15"
                  >
                    {updating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : progressPct >= 100 ? (
                      <Award className="w-4 h-4 text-amber-300" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    {completedLectureIds.has(activeLesson.id.toString())
                      ? (isAr ? 'مكتمل (الانتقال للتالي)' : 'Completed (Next Lesson)')
                      : (isAr ? 'تحديد كـ مكتمل' : 'Mark as Complete')}
                  </Button>
                ) : (
                  <div className="text-xs font-bold text-amber-700 bg-amber-50 px-4 py-2 rounded-xl border border-amber-200">
                    {isAr ? 'التسجيل غير مفعل بعد' : 'Enrollment Not Yet Active'}
                  </div>
                )}

                <Button
                  variant="outline"
                  disabled={!nextLesson}
                  onClick={() => setActiveLesson(nextLesson)}
                  className="w-full sm:w-auto border-gray-200 text-[#112d27] hover:bg-gray-50 font-bold rounded-xl h-10 text-xs gap-1"
                >
                  {isAr ? 'الدرس التالي' : 'Next Lesson'}
                  <ChevronRight className={cn('w-4 h-4', isRTL && 'rotate-180')} />
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-20 text-gray-400 font-medium text-xs">
              {isAr ? 'اختر درساً للبدء' : 'Select a lesson to begin learning'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}