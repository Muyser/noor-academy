import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle2, MessageCircle, ShieldCheck, ChevronRight, Users, MapPin, Video, Award, Calendar, Loader2, PlayCircle, Lock } from 'lucide-react';
import { useI18n } from '@/lib/useI18n';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import EnrollmentModal from './EnrollmentModal';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function CourseDetail() {
  const { id } = useParams();
  const { lang, isRTL } = useI18n();
  const isAr = lang === 'ar';
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState(null);
  
  // Modal & Preview States
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [previewLecture, setPreviewLecture] = useState(null);

  // Accordion State: Default ONLY index 0 to true (open by default)
  const [expandedSections, setExpandedSections] = useState({ 0: true });

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(`${API_URL}/api/courses/${id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Course not found');
        }
        return res.json();
      })
      .then((data) => {
        if (data && (data._id || data.id)) {
          setCourse(data);
          // Default ONLY the first section to open by default when data loads
          if (Array.isArray(data.sections)) {
            const initialSections = {};
            data.sections.forEach((_, idx) => {
              initialSections[idx] = idx === 0;
            });
            setExpandedSections(initialSections);
          }
        } else {
          setError('Course not found');
        }
      })
      .catch((err) => {
        console.error('Failed to fetch course details:', err);
        setError(err.message || 'Failed to load course details');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const toggleSection = (index) => {
    setExpandedSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate('/login?returnTo=' + encodeURIComponent(`/courses/${id}`));
      return;
    }

    const courseId = course._id || course.id;
    const isFree = Number(course.price || 0) === 0;

    if (isFree) {
      setEnrolling(true);
      try {
        const token = localStorage.getItem('token') || '';
        const res = await fetch(`${API_URL}/api/enrollments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ courseId }),
        });

        const data = await res.json();
        
        if (res.ok || res.status === 400) {
          navigate(`/learning?course=${courseId}`);
        } else {
          throw new Error(data.message || 'Failed to enroll');
        }
      } catch (err) {
        toast({
          title: isAr ? 'خطأ' : 'Error',
          description: err.message || (isAr ? 'فشل التسجيل في الدورة' : 'Failed to enroll in course'),
          variant: 'destructive',
        });
      } finally {
        setEnrolling(false);
      }
    } else {
      setShowPaymentModal(true);
    }
  };

  const handleWhatsApp = () => {
    const courseTitle = isAr ? course?.title_ar || course?.title : course?.title;
    const msg = encodeURIComponent(
      `Hello! I am interested in registering for the in-person/offline course: ${courseTitle}`
    );
    window.open(`https://wa.me/250700000000?text=${msg}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fcfb] flex items-center justify-center py-20">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 animate-spin text-[#009688] mx-auto" />
          <p className="text-xs font-bold text-gray-500">
            {isAr ? 'جاري تحميل تفاصيل الدورة...' : 'Loading course details...'}
          </p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-[#f8fcfb] flex flex-col items-center justify-center py-20 text-center px-4">
        <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4 text-2xl font-black">
          !
        </div>
        <h1 className="text-2xl font-extrabold text-[#112d27] mb-2">
          {isAr ? 'الدورة غير موجودة' : 'Course Not Found'}
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 max-w-md mb-6 font-medium">
          {isAr 
            ? 'عذراً، لم نتمكن من العثور على الدورة المطلوبة من الخادم.' 
            : 'Sorry, we could not retrieve the requested course details from the server.'}
        </p>
        <Link to="/courses">
          <Button className="bg-[#009688] hover:bg-[#00796b] text-white font-bold rounded-xl px-6 h-11 text-xs">
            {isAr ? 'العودة لقائمة الدورات' : 'Back to Courses'}
          </Button>
        </Link>
      </div>
    );
  }

  const courseTitle = isAr ? course.title_ar || course.title : course.title;
  const isOffline = course.modality === 'offline';
  const isFree = Number(course.price || 0) === 0;
  const outcomes = Array.isArray(course.outcomes) ? course.outcomes : [];
  const requirements = Array.isArray(course.requirements) ? course.requirements : [];
  const includes = Array.isArray(course.includes) ? course.includes : [];
  const honors = Array.isArray(course.honors) ? course.honors : [];
  const sections = Array.isArray(course.sections) ? course.sections : [];

  return (
    <div className={`min-h-screen bg-[#f8fcfb] ${isAr ? 'dir-rtl' : 'dir-ltr'}`}>
      
      {/* Header Banner */}
      <section className="bg-[#f8fcfb] text-[#112d27] pt-8 pb-10 border-b border-gray-100/60">
        <div className="container-page max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <nav className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-6 font-medium">
            <Link to="/courses" className="text-[#009688] hover:underline flex items-center gap-1">
              <span>←</span> {isAr ? 'جميع الدورات' : 'All Courses'}
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-600 truncate font-semibold">{courseTitle}</span>
          </nav>

          <div className="grid lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black text-white shadow-xs',
                  isOffline ? 'bg-purple-600' : 'bg-[#009688]'
                )}>
                  {isOffline ? <MapPin className="w-3.5 h-3.5" /> : <Video className="w-3.5 h-3.5" />}
                  {isOffline ? (isAr ? 'دورة حضورية' : 'Offline / In-Person') : (isAr ? 'دورة أونلاين' : 'Online Course')}
                </span>

                <span className="px-3 py-1 rounded-lg bg-gray-100 text-xs font-bold text-gray-700">
                  {course.level || 'A1 → B1'}
                </span>

                {isFree ? (
                  <span className="px-3 py-1 rounded-lg bg-emerald-100 text-xs font-black text-emerald-700">
                    {isAr ? 'مجاني بالكامل' : 'Free Course'}
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-lg bg-teal-50 text-xs font-bold text-[#009688] capitalize">
                    {course.category}
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-4 text-[#112d27]">
                {courseTitle}
              </h1>

              {course.short_description && (
                <p className="text-xs sm:text-sm text-gray-600 font-medium mb-6 leading-relaxed">
                  {course.short_description}
                </p>
              )}

              {isOffline && (
                <div className="mb-6 p-4 rounded-2xl bg-purple-50/80 border border-purple-200 text-purple-900 grid sm:grid-cols-2 gap-3 text-xs font-semibold">
                  {course.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-purple-600 shrink-0" />
                      <span><strong>{isAr ? 'المكان:' : 'Location:'}</strong> {course.location}</span>
                    </div>
                  )}
                  {course.schedule_days && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-purple-600 shrink-0" />
                      <span><strong>{isAr ? 'الأيام:' : 'Days:'}</strong> {course.schedule_days}</span>
                    </div>
                  )}
                  {course.schedule_time && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-purple-600 shrink-0" />
                      <span><strong>{isAr ? 'التوقيت:' : 'Time:'}</strong> {course.schedule_time}</span>
                    </div>
                  )}
                  {course.capacity !== undefined && (
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-600 shrink-0" />
                      <span><strong>{isAr ? 'السعة:' : 'Capacity:'}</strong> {course.capacity} {isAr ? 'مقعد' : 'seats'}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#009688] text-white flex items-center justify-center font-bold text-xs">
                  {course.instructor ? course.instructor.charAt(0) : 'N'}
                </div>
                <div className="text-xs">
                  <span className="text-gray-400 block">{isAr ? 'مقدم من' : 'Instructor'}</span>
                  <span className="font-bold text-[#112d27]">{course.instructor || 'Prof. Ahmed Nour'}</span>
                </div>
              </div>
            </div>

            <div className="relative aspect-video rounded-3xl overflow-hidden shadow-lg bg-gray-900 border border-gray-100">
              {course.image ? (
                <Image src={course.image} alt={courseTitle} fittingType="fill" className="w-full h-full object-cover opacity-90" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#009688]/10 text-[#009688] font-black text-3xl">
                  {courseTitle.charAt(0)}
                </div>
              )}
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-gray-800 text-[11px] font-extrabold px-3 py-1 rounded-lg shadow-sm">
                {isOffline ? (isAr ? 'مركز التدريب' : 'In-Person Class') : (isAr ? 'دورة أونلاين' : 'Online Program')}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Main Content & Sidebar */}
      <div className="container-page max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          
          <div className="lg:col-span-2 space-y-8">
            
            {/* Outcomes */}
            {outcomes.length > 0 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm">
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#009688] mb-1">
                  {isAr ? 'نتائج الدورة' : 'COURSE OUTCOMES'}
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#112d27] mb-2">
                  {isAr ? 'ما ستتعلمه' : "What You'll Learn"}
                </h2>
                <div className="grid sm:grid-cols-2 gap-3 mt-4">
                  {outcomes.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#f8fcfb] border border-gray-100">
                      <CheckCircle2 className="w-4 h-4 text-[#009688] shrink-0 mt-0.5" />
                      <span className="text-xs font-semibold text-gray-700 leading-snug">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Honors */}
            {honors.length > 0 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm">
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-amber-600 mb-1 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" />
                  {isAr ? 'مزايا وشهادات الشرف' : 'COURSE HONORS & PERKS'}
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#112d27] mb-4">
                  {isAr ? 'ما تحصل عليه عند التخرج' : 'Honors & Certification'}
                </h2>
                <div className="space-y-2.5">
                  {honors.map((honor, hIdx) => (
                    <div key={hIdx} className="flex items-center gap-3 p-3 rounded-2xl bg-amber-50/50 border border-amber-200/60 text-amber-900 text-xs font-bold">
                      <Award className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>{honor}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sections & Free Previews (Udemy-Style Accordion - First section open by default) */}
            {sections.length > 0 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm">
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#009688] mb-1">
                  {isAr ? 'المنهج التعليمي' : 'CURRICULUM'}
                </div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-[#112d27]">
                      {isAr ? 'محتوى الدورة والأقسام' : 'Course Content'}
                    </h2>
                    <p className="text-xs text-gray-400 font-medium mt-0.5">
                      {sections.length} {isAr ? 'أقسام دراسية' : 'sections'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const allExpanded = Object.values(expandedSections).every(Boolean);
                      const newState = {};
                      sections.forEach((_, idx) => { newState[idx] = !allExpanded; });
                      setExpandedSections(newState);
                    }}
                    className="text-xs font-bold text-[#009688] hover:underline"
                  >
                    {Object.values(expandedSections).every(Boolean) 
                      ? (isAr ? 'إخفاء الكل' : 'Collapse All') 
                      : (isAr ? 'توسيع الكل' : 'Expand All')}
                  </button>
                </div>

                <div className="space-y-3">
                  {sections.map((sec, sIdx) => {
                    const isOpen = !!expandedSections[sIdx];

                    return (
                      <div key={sec._id || sIdx} className="border border-gray-200 rounded-2xl overflow-hidden bg-[#f8fcfb] transition-all">
                        <button
                          onClick={() => toggleSection(sIdx)}
                          className="w-full flex items-center justify-between p-4 bg-gray-50/80 hover:bg-gray-100/80 transition-colors text-start"
                        >
                          <div className="flex items-center gap-2.5">
                            <ChevronRight className={cn('w-4 h-4 text-[#009688] transition-transform duration-200', isOpen && 'rotate-90')} />
                            <span className="font-extrabold text-xs sm:text-sm text-[#112d27]">
                              {sIdx + 1}. {isAr ? sec.title_ar || sec.title : sec.title}
                            </span>
                          </div>
                          <span className="text-[11px] font-semibold text-gray-400">
                            {sec.lectures?.length || 0} {isAr ? 'دروس' : 'lectures'}
                          </span>
                        </button>

                        {isOpen && (
                          <div className="p-3 space-y-2 bg-white border-t border-gray-100">
                            {sec.lectures?.map((lec, lIdx) => (
                              <div key={lec._id || lIdx} className="text-xs text-gray-700 flex items-center justify-between p-2.5 rounded-xl bg-[#f8fcfb]/50 border border-gray-100 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-2.5">
                                  {lec.is_preview ? (
                                    <PlayCircle className="w-4 h-4 text-[#009688] shrink-0" />
                                  ) : (
                                    <Lock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                  )}
                                  <span className="font-semibold">{isAr ? lec.title_ar || lec.title : lec.title}</span>
                                </div>

                                <div className="flex items-center gap-2">
                                  {lec.is_preview && (
                                    <button
                                      onClick={() => setPreviewLecture(lec)}
                                      className="text-[10px] bg-[#009688]/10 hover:bg-[#009688]/20 text-[#009688] font-bold px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
                                    >
                                      <PlayCircle className="w-3 h-3" />
                                      <span>{isAr ? 'معاينة مجانية' : 'Free Preview'}</span>
                                    </button>
                                  )}
                                  <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded uppercase font-bold">{lec.type}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Description */}
            {course.description && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm">
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#009688] mb-1">
                  {isAr ? 'حول هذه الدورة' : 'ABOUT THIS COURSE'}
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#112d27] mb-4">
                  {isAr ? 'تفاصيل الدورة التدريبية' : 'Course Overview'}
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 font-medium leading-relaxed whitespace-pre-line">
                  {course.description}
                </p>
              </div>
            )}

            {/* Requirements */}
            {requirements.length > 0 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm">
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#009688] mb-1">
                  {isAr ? 'المتطلبات' : 'REQUIREMENTS'}
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#112d27] mb-5">
                  {isAr ? 'قبل أن تبدأ' : 'Before You Start'}
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {requirements.map((req, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-[#f8fcfb] border border-gray-100 text-xs font-semibold text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-[#009688] shrink-0 mt-0.5" />
                      <span>{req}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Enrollment Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-3xl border border-gray-100 shadow-xl p-6 sm:p-7">
              
              <div className="text-center pb-5 border-b border-gray-100">
                <div className="text-[11px] font-bold text-gray-400 uppercase mb-1">
                  {isAr ? 'سعر الدورة' : 'Course Price'}
                </div>
                <div className="text-3xl font-black text-[#112d27]">
                  {isFree ? (
                    <span className="text-emerald-600 font-extrabold">{isAr ? 'مجاناً' : 'FREE'}</span>
                  ) : (
                    <>USD {course.price || 0}<span className="text-sm font-medium text-gray-400">.00</span></>
                  )}
                </div>
                <div className="text-xs font-semibold text-gray-500 mt-1">
                  {isOffline 
                    ? (isAr ? 'تسجيل حضوري بالمعهد' : 'In-person institute registration') 
                    : isFree 
                    ? (isAr ? 'وصول كامل وغير محدود' : 'Full lifetime access') 
                    : (isAr ? 'دفع لمرة واحدة' : 'One-time payment')}
                </div>
              </div>

              <div className="pt-6 space-y-3">
                {isOffline ? (
                  <Button
                    onClick={handleWhatsApp}
                    className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-extrabold gap-2 rounded-xl shadow-md shadow-emerald-600/20 transition-all duration-300"
                  >
                    <MessageCircle className="w-5 h-5 text-white" />
                    <span>{isAr ? 'التسجيل عبر واتساب' : 'Register via WhatsApp'}</span>
                  </Button>
                ) : (
                  <Button
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="w-full h-12 bg-[#009688] hover:bg-[#00796b] text-white text-sm font-extrabold gap-2 rounded-xl shadow-md shadow-[#009688]/20 transition-all duration-300"
                  >
                    {enrolling ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <span>{isFree ? (isAr ? 'سجل مجاناً' : 'Enroll Free') : (isAr ? 'سجل الآن' : 'Enroll Now')}</span>
                    )}
                    {!enrolling && <ChevronRight className={cn('w-4 h-4', isRTL && 'rotate-180')} />}
                  </Button>
                )}

                <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 font-medium pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#009688]" />
                  <span>{isAr ? 'تسجيل آمن ومضمون' : 'Secure enrollment'}</span>
                </div>
              </div>

              {includes.length > 0 && (
                <div className="py-5 border-t border-gray-100 mt-6">
                  <div className="text-xs font-extrabold uppercase tracking-wider text-gray-800 mb-3">
                    {isAr ? 'تتضمن هذه الدورة:' : 'This course includes:'}
                  </div>
                  <ul className="space-y-2.5 text-xs font-semibold text-gray-600">
                    {includes.map((inc, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#009688] shrink-0" />
                        <span>{inc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>

      {/* Free Preview Video Modal */}
      {previewLecture && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 text-white relative shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#009688]">
                  {isAr ? 'معاينة مجانية' : 'Free Preview'}
                </span>
                <h3 className="text-lg font-extrabold">{isAr ? previewLecture.title_ar || previewLecture.title : previewLecture.title}</h3>
              </div>
              <button
                onClick={() => setPreviewLecture(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>
            
            <div className="aspect-video w-full bg-black rounded-2xl overflow-hidden flex items-center justify-center border border-slate-800">
              {previewLecture.video_url ? (
                <iframe
                  src={previewLecture.video_url}
                  title={previewLecture.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="text-gray-400 text-xs font-medium">
                  {isAr ? 'لا يوجد فيديو متاح لهذه المعاينة' : 'No video source available for this preview.'}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Button
                onClick={() => setPreviewLecture(null)}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs h-10 px-5"
              >
                {isAr ? 'إغلاق المعاينة' : 'Close Preview'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Payment & Bankak Modal */}
      {showPaymentModal && (
        <EnrollmentModal
          course={course}
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
        />
      )}

    </div>
  );
}