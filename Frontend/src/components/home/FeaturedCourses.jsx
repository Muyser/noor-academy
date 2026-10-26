import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Loader2, Video, MapPin, Award } from 'lucide-react';
import { useI18n } from '@/lib/useI18n';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function FeaturedCourses() {
  const { t, lang, isRTL } = useI18n();
  const isAr = lang === 'ar';

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch featured and published courses strictly from backend API
  useEffect(() => {
    fetch(`${API_URL}/api/courses?status=published`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const featuredOnly = data.filter((c) => c.featured);
          const displayCourses = featuredOnly.length > 0 ? featuredOnly : data;
          // Restricted to maximum 3 courses as requested
          setCourses(displayCourses.slice(0, 3));
        }
      })
      .catch((err) => {
        console.error('Failed to load featured courses', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <section className={`relative overflow-hidden bg-gradient-to-br from-[#f2faf8] via-[#f7fcfb] to-[#eaf7f4] py-16 sm:py-24 ${isAr ? 'dir-rtl' : 'dir-ltr'}`}>
      {/* Background Soft Glow Blobs */}
      <div className="absolute top-1/3 -left-20 w-[450px] h-[450px] bg-[#009688]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -right-20 w-[450px] h-[450px] bg-[#009688]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="container-page relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#009688]/10 text-[#009688] text-xs font-bold mb-4 border border-[#009688]/20">
            <span className="w-2 h-2 rounded-full bg-[#009688]" />
            {t('courses.eyebrow') || (isAr ? 'دورات حقيقية' : 'Featured Programs')}
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#112d27] mb-3">
            {t('courses.heading') || (isAr ? 'الدورات المميزة' : 'Featured Courses')}
          </h2>

          <p className="text-sm sm:text-base text-gray-500 font-medium">
            {t('courses.description') || (isAr ? 'استكشف الدورات المتاحة الآن في أكاديمية نور برو بمساراتها الأونلاين والحضورية.' : 'Explore active online & offline courses available at Noor Pro Academy.')}
          </p>
        </div>

        {/* Content Area / Loader / Empty State / Courses Grid */}
        {loading ? (
          <div className="py-16 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#009688]" />
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-16 text-gray-400 font-semibold text-sm">
            {isAr ? 'لا توجد دورات مميزة متاحة حالياً.' : 'No featured courses available at the moment.'}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-10">
            {courses.map((course, i) => {
              const isOffline = course.modality === 'offline';
              const firstHonor = Array.isArray(course.honors) && course.honors.length > 0 ? course.honors[0] : null;

              return (
                <div key={course.id || course._id || i} className="w-full flex flex-col group relative bg-white/95 backdrop-blur-md rounded-3xl border border-gray-100/80 p-5 shadow-sm hover:shadow-xl transition-all duration-300">
                  
                  {/* Top Image + Modality Badge Overlay */}
                  <div className="relative w-full h-48 rounded-2xl overflow-hidden bg-gray-100 mb-4">
                    {course.image ? (
                      <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#009688]/10 text-[#009688] font-black text-2xl">
                        {course.title ? course.title.charAt(0) : 'C'}
                      </div>
                    )}

                    {/* Modality Badge (Online / Offline) */}
                    <div className="absolute top-3 start-3 z-10">
                      <span className={cn(
                        'inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black shadow-sm backdrop-blur-md',
                        isOffline 
                          ? 'bg-purple-600/90 text-white' 
                          : 'bg-[#009688]/90 text-white'
                      )}>
                        {isOffline ? <MapPin className="w-3.5 h-3.5" /> : <Video className="w-3.5 h-3.5" />}
                        {isOffline ? (isAr ? 'حضوري' : 'Offline') : (isAr ? 'أونلاين' : 'Online')}
                      </span>
                    </div>
                  </div>

                  {/* Course Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs text-gray-400 font-bold mb-2">
                        <span className="text-[#009688] capitalize">{course.category || 'General'}</span>
                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">{course.level || 'A1 → B1'}</span>
                      </div>

                      <h3 className="text-lg font-extrabold text-[#112d27] mb-2 line-clamp-1">
                        {isAr ? course.title_ar || course.title : course.title}
                      </h3>

                      <p className="text-xs text-gray-500 font-medium line-clamp-2 mb-4 leading-relaxed">
                        {course.short_description || course.description || (isAr ? 'استكشف هذه الدورة وابدأ في بناء مهاراتك اللغوية.' : 'Build your skills with practical structured lessons.')}
                      </p>

                      {/* Same Line: Price Badge + Course Honor Tag */}
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <span className="text-[#009688] font-black text-lg bg-[#009688]/10 px-3 py-1 rounded-xl border border-[#009688]/20 shrink-0">
                          ${course.price || 0}
                        </span>

                        {firstHonor ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-xl truncate max-w-[180px]">
                            <Award className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span className="truncate">{firstHonor}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-xl">
                            <Award className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{isAr ? 'شهادة معتمدة' : 'Honors Included'}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bottom Link Action */}
                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-400">
                        {course.instructor || 'Prof. Ahmed Nour'}
                      </span>
                      <Link
                        to={`/courses/${course.id || course._id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#009688] hover:text-[#00796b] transition-colors"
                      >
                        {isAr ? 'التفاصيل ←' : 'Details →'}
                      </Link>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link to="/courses">
            <Button size="lg" variant="outline" className="border-2 border-[#009688] text-[#009688] hover:bg-[#009688] hover:text-white px-8 py-6 rounded-2xl font-bold gap-2 shadow-sm transition-all duration-300">
              {t('courses.viewAll') || (isAr ? 'عرض جميع الدورات' : 'View All Courses')}
              <ArrowRight className={cn('w-4 h-4', isRTL && 'rotate-180')} />
            </Button>
          </Link>
        </div>

      </div>
    </section>
  );
}