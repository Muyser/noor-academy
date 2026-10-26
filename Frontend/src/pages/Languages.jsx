import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Globe2, Loader2 } from 'lucide-react';
import { useI18n } from '@/lib/useI18n';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function Languages() {
  const { lang, isRTL } = useI18n();
  const isAr = lang === 'ar';

  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    // Fetch directly from Express backend API
    fetch(`${API_URL}/api/languages`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch languages');
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          // Filter only active languages if status field exists
          const activeLanguages = data.filter((item) => !item.status || item.status === 'active');
          setLanguages(activeLanguages);
        }
      })
      .catch((err) => {
        console.error('Failed to load languages from backend:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filtered = languages.filter((item) => {
    const nameText = isAr ? item.name_ar || item.name : item.name;
    const descText = isAr ? item.description_ar || item.description : item.description;

    return (
      !search ||
      nameText?.toLowerCase().includes(search.toLowerCase()) ||
      descText?.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className={`min-h-screen bg-[#f8fcfb] ${isAr ? 'dir-rtl' : 'dir-ltr'}`}>
      
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#eaf7f4] via-[#f4faf8] to-[#f8fcfb] py-14 sm:py-16 text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-[#009688]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container-page max-w-3xl mx-auto px-4 relative z-10">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-[#112d27] tracking-tight leading-tight">
            {isAr ? 'اكتشف لغات العالم.' : 'Explore Languages.'}
            <span className="block text-[#009688] font-bold mt-1">
              {isAr ? 'ابدأ رحلة تعلمك اليوم.' : 'Start your journey today.'}
            </span>
          </h1>

          <p className="mt-3 text-gray-500 text-xs sm:text-sm font-normal max-w-xl mx-auto leading-relaxed">
            {isAr
              ? 'تصفح اللغات المتاحة في الأكاديمية وابحث عن مسارك التعليمي المناسب لتحقيق طموحاتك.'
              : 'Browse available languages in the academy and find your ideal learning pathway.'}
          </p>

          {/* Search Bar */}
          <div className="mt-6 max-w-lg mx-auto">
            <div className="relative flex items-center bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100">
              <Search className="w-4 h-4 text-gray-400 mx-3 shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={
                  isAr
                    ? 'ابحث عن لغة أو اختصاص...'
                    : 'Search for a language or skill...'
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

      {/* Languages Grid Section */}
      <section className="py-6 sm:py-10">
        <div className="container-page max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {loading ? (
            <div className="py-20 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#009688]" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400 font-semibold text-xs">
              {isAr ? 'لا توجد لغات متاحة حالياً.' : 'No languages available at the moment.'}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 justify-items-center sm:justify-items-stretch">
              {filtered.map((item) => {
                const itemId = item._id || item.id;
                const langName = isAr ? item.name_ar || item.name : item.name;
                const langDesc = isAr ? item.description_ar || item.description : item.description;
                const langSlug = item.slug || itemId || langName.toLowerCase();

                return (
                  <div
                    key={itemId}
                    className="w-full max-w-[285px] sm:max-w-none flex flex-col group relative bg-white/95 backdrop-blur-md rounded-3xl border border-gray-100/80 p-4 sm:p-5 shadow-sm hover:shadow-xl transition-all duration-300 justify-between"
                  >
                    <div>
                      {/* Top Image + Badge */}
                      <div className="relative w-full h-40 sm:h-48 rounded-2xl overflow-hidden bg-gray-100 mb-3 sm:mb-4">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={langName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-[#009688]/10 text-[#009688] font-bold text-2xl">
                            {langName.charAt(0)}
                          </div>
                        )}
                        
                        <div className="absolute top-3 start-3 z-10">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:py-1 rounded-xl text-[11px] sm:text-xs font-bold shadow-sm backdrop-blur-md bg-[#009688]/90 text-white">
                            <Globe2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            {item.courses_count || 4} {isAr ? 'دورات' : 'courses'}
                          </span>
                        </div>
                      </div>

                      {/* Content Details */}
                      <div>
                        <div className="flex items-center justify-between text-[11px] sm:text-xs text-gray-400 font-bold mb-1.5 sm:mb-2">
                          <span className="text-[#009688] capitalize">{isAr ? 'مسار لغوي' : 'Language Path'}</span>
                          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">
                            👥 {item.learners_count || '1,000+'}
                          </span>
                        </div>

                        <h3 className="text-base sm:text-lg font-bold text-[#112d27] mb-1.5 sm:mb-2 line-clamp-1">
                          {langName}
                        </h3>

                        {langDesc && (
                          <p className="text-[11px] sm:text-xs text-gray-500 font-normal line-clamp-2 mb-3 sm:mb-4 leading-relaxed">
                            {langDesc}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action Link */}
                    <div className="pt-2.5 sm:pt-3 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-[11px] sm:text-xs font-normal text-gray-400">
                        {isAr ? 'أكاديمية نور' : 'Noor Academy'}
                      </span>
                      <Link
                        to={`/courses?lang=${langSlug}`}
                        className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-[#009688] hover:text-[#00796b] transition-colors"
                      >
                        <span>{isAr ? 'عرض الدورات' : 'View Courses'}</span>
                        <span className="text-xs">{isRTL ? '←' : '→'}</span>
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