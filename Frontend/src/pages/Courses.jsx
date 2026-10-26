import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, ArrowUpDown, Loader2, Video, MapPin, Award } from 'lucide-react';
import { useI18n } from '@/lib/useI18n';
import { cn } from '@/lib/utils';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function Courses() {
  const { lang, isRTL } = useI18n();
  const isAr = lang === 'ar';
  const [searchParams] = useSearchParams();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState(searchParams.get('lang') || 'all');
  const [modalityFilter, setModalityFilter] = useState('all'); // 'all', 'online', 'offline'
  const [sortBy, setSortBy] = useState('priceLow');

  // Fetch real courses from backend API
  useEffect(() => {
    fetch(`${API_URL}/api/courses?status=published`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCourses(data);
        }
      })
      .catch((err) => {
        console.error('Failed to load courses', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const languageFilters = [
    { key: 'all', label: isAr ? 'جميع اللغات' : 'All Languages' },
    { key: 'english', label: isAr ? 'الإنجليزية' : 'English' },
    { key: 'french', label: isAr ? 'الفرنسية' : 'French' },
    { key: 'german', label: isAr ? 'الألمانية' : 'German' },
    { key: 'spanish', label: isAr ? 'الإسبانية' : 'Spanish' },
    { key: 'business', label: isAr ? 'الأعمال' : 'Business' },
  ];

  // Filter & Sort Logic
  let filtered = courses.filter((c) => {
    // Modality filter (Online / Offline)
    if (modalityFilter !== 'all' && c.modality !== modalityFilter) {
      return false;
    }

    // Language / Category filter
    const matchesLang =
      activeFilter === 'all'
        ? true
        : activeFilter === 'business'
        ? c.category === 'business'
        : (c.category && c.category.toLowerCase() === activeFilter) ||
          (c.title && c.title.toLowerCase().includes(activeFilter));

    // Search filter
    const titleText = isAr ? c.title_ar || c.title : c.title;
    const descText = isAr ? c.short_description || c.description : c.description;

    const matchesSearch =
      !search ||
      titleText?.toLowerCase().includes(search.toLowerCase()) ||
      c.category?.toLowerCase().includes(search.toLowerCase()) ||
      descText?.toLowerCase().includes(search.toLowerCase());

    return matchesLang && matchesSearch;
  });

  if (sortBy === 'rating') filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  if (sortBy === 'priceLow') filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
  if (sortBy === 'priceHigh') filtered.sort((a, b) => (b.price || 0) - (a.price || 0));

  return (
    <div className={`min-h-screen bg-[#f8fcfb] ${isAr ? 'dir-rtl' : 'dir-ltr'}`}>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#eaf7f4] via-[#f4faf8] to-[#f8fcfb] py-14 sm:py-16 text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-[#009688]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container-page max-w-3xl mx-auto px-4 relative z-10">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-[#112d27] tracking-tight leading-tight">
            {isAr ? 'تعلّم لغة.' : 'Learn a language.'}
            <span className="block text-[#009688] font-bold mt-1">
              {isAr ? 'ابنِ مستقبلك.' : 'Build your future.'}
            </span>
          </h1>

          <p className="mt-3 text-gray-500 text-xs sm:text-sm font-normal max-w-xl mx-auto leading-relaxed">
            {isAr
              ? 'استكشف دورات لغوية منظمة مصممة لمساعدتك على التواصل بثقة، أونلاين أو حضورياً.'
              : 'Explore structured online and in-person language courses designed to help you communicate confidently.'}
          </p>

          {/* Search Bar Input */}
          <div className="mt-6 max-w-lg mx-auto">
            <div className="relative flex items-center bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100">
              <Search className="w-4 h-4 text-gray-400 mx-3 shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={
                  isAr
                    ? 'ابحث عن دورة، لغة، أو مهارة...'
                    : 'Search for a course, language or skill...'
                }
                className="w-full bg-transparent text-xs sm:text-sm font-normal text-gray-700 outline-none placeholder:text-gray-400 px-1"
              />
              <button className="bg-[#009688] hover:bg-[#00796b] text-white px-5 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-[#009688]/20 transition-all duration-300 shrink-0">
                {isAr ? 'بحث' : 'Search'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content & Responsive Filters */}
      <section className="py-6 sm:py-10">
        <div className="container-page max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Unified Responsive Filter & Control Bar */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-100 shadow-sm mb-8 space-y-4">
            
            {/* Top Row: Modality Format Pills & Sort Dropdown */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-gray-100">
              
              {/* Modality Format Selector */}
              <div className="flex items-center gap-1.5 flex-wrap justify-center sm:justify-start w-full sm:w-auto">
                <button
                  onClick={() => setModalityFilter('all')}
                  className={cn(
                    'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all',
                    modalityFilter === 'all'
                      ? 'bg-[#112d27] text-white shadow-sm'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  )}
                >
                  {isAr ? 'جميع الأنماط' : 'All Formats'}
                </button>
                <button
                  onClick={() => setModalityFilter('online')}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all',
                    modalityFilter === 'online'
                      ? 'bg-[#009688] text-white shadow-sm'
                      : 'bg-gray-50 text-gray-600 hover:bg-[#009688]/10 hover:text-[#009688]'
                  )}
                >
                  <Video className="w-3.5 h-3.5" />
                  {isAr ? 'أونلاين' : 'Online'}
                </button>
                <button
                  onClick={() => setModalityFilter('offline')}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all',
                    modalityFilter === 'offline'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-gray-50 text-gray-600 hover:bg-purple-50 hover:text-purple-600'
                  )}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  {isAr ? 'حضوري' : 'Offline'}
                </button>
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-gray-50 border border-gray-200/80 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-700 outline-none cursor-pointer hover:border-[#009688] transition-colors"
                >
                  <option value="priceLow">
                    {isAr ? 'السعر: من الأقل للأعلى' : 'Price: Low to High'}
                  </option>
                  <option value="priceHigh">
                    {isAr ? 'السعر: من الأعلى للأقل' : 'Price: High to Low'}
                  </option>
                  <option value="rating">
                    {isAr ? 'الأعلى تقييماً' : 'Highest Rated'}
                  </option>
                </select>
              </div>
            </div>

            {/* Bottom Row: Language Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none w-full">
              {languageFilters.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setActiveFilter(f.key)}
                  className={cn(
                    'px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-300 shrink-0',
                    activeFilter === f.key
                      ? 'bg-[#009688] text-white shadow-sm shadow-[#009688]/20'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-[#009688]'
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>

          </div>

          {/* Loader State */}
          {loading ? (
            <div className="py-20 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#009688]" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400 font-semibold text-sm bg-white rounded-3xl border border-gray-100 shadow-sm">
              {isAr ? 'لا توجد دورات مطابقة لخيارات البحث.' : 'No courses found matching your criteria.'}
            </div>
          ) : (
            /* Courses Grid - Matching the compact FeaturedCourses card sizing */
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 justify-items-center sm:justify-items-stretch">
              {filtered.map((course) => {
                const courseId = course.id || course._id;
                const isOffline = course.modality === 'offline';
                const firstHonor = Array.isArray(course.honors) && course.honors.length > 0 ? course.honors[0] : null;

                return (
                  <div
                    key={courseId}
                    className="w-full max-w-[285px] sm:max-w-none flex flex-col group relative bg-white/95 backdrop-blur-md rounded-3xl border border-gray-100/80 p-4 sm:p-5 shadow-sm hover:shadow-xl transition-all duration-300 justify-between"
                  >
                    <div>
                      {/* Banner Image & Modality Badge */}
                      <div className="relative w-full h-40 sm:h-44 rounded-2xl overflow-hidden bg-gray-100 mb-3 sm:mb-4">
                        {course.image ? (
                          <img
                            src={course.image}
                            alt={course.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-[#009688]/10 text-[#009688] font-bold text-xl">
                            {course.title ? course.title.charAt(0) : 'C'}
                          </div>
                        )}
                        
                        {/* Modality Badge (Online/Offline) */}
                        <div className="absolute top-3 start-3 z-10">
                          <span className={cn(
                            'inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:py-1 rounded-xl text-[11px] sm:text-xs font-bold text-white shadow-sm backdrop-blur-md',
                            isOffline ? 'bg-purple-600/90' : 'bg-[#009688]/90'
                          )}>
                            {isOffline ? <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : <Video className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                            {isOffline ? (isAr ? 'حضوري' : 'Offline') : (isAr ? 'أونلاين' : 'Online')}
                          </span>
                        </div>

                        {/* Level Badge Tag */}
                        <div className="absolute top-3 end-3 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-lg text-[10px] font-bold text-gray-800 shadow-xs">
                          {course.level || 'A1 → B1'}
                        </div>
                      </div>

                      {/* Card Body */}
                      <div>
                        <div className="flex items-center justify-between text-[11px] font-bold mb-1.5">
                          <span className="text-[#009688] uppercase tracking-wider">
                            {course.category || 'General'}
                          </span>
                          <span className="flex items-center gap-0.5 text-gray-800">
                            <span className="text-amber-400">★</span>
                            {course.rating || 4.9}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-sm sm:text-base font-bold text-[#112d27] mb-1.5 leading-snug line-clamp-1">
                          {isAr ? course.title_ar || course.title : course.title}
                        </h3>

                        {/* Description */}
                        <p className="text-[11px] sm:text-xs text-gray-500 font-normal leading-relaxed line-clamp-2 mb-3">
                          {course.short_description || course.description || (isAr ? 'استكشف هذه الدورة وابدأ في بناء مهاراتك.' : 'Build your language skills with active practical training.')}
                        </p>

                        {/* Same Line: Price & Honors Pill */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="text-base sm:text-lg font-bold text-[#112d27]">
                            ${course.price || 0}
                          </span>

                          {firstHonor ? (
                            <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-xl truncate max-w-[130px]">
                              <Award className="w-3 h-3 text-amber-600 shrink-0" />
                              <span className="truncate">{firstHonor}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-xl">
                              <Award className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span>{isAr ? 'شهادة' : 'Honors'}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="pt-2.5 sm:pt-3 border-t border-gray-100 flex items-center justify-between mt-auto">
                      <span className="text-[11px] font-normal text-gray-400 truncate max-w-[120px]">
                        {course.instructor || 'Prof. Ahmed Nour'}
                      </span>

                      <Link
                        to={`/courses/${courseId}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#e3f6f3] hover:bg-[#009688] text-[#009688] hover:text-white text-[11px] font-bold transition-all duration-300"
                      >
                        <span>{isAr ? 'التفاصيل' : 'View'}</span>
                        <span className="text-xs">{isAr ? '←' : '→'}</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </section>
    </div>
  );
}