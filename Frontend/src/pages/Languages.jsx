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
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#112d27] tracking-tight leading-tight">
            {isAr ? 'اكتشف لغات العالم.' : 'Explore Languages.'}
            <span className="block text-[#009688] font-black mt-1">
              {isAr ? 'ابدأ رحلة تعلمك اليوم.' : 'Start your journey today.'}
            </span>
          </h1>

          <p className="mt-3 text-gray-500 text-xs sm:text-sm font-medium max-w-xl mx-auto leading-relaxed">
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
                className="w-full bg-transparent text-xs sm:text-sm font-medium text-gray-700 outline-none placeholder:text-gray-400 px-1"
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
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map((item) => {
                const itemId = item._id || item.id;
                const langName = isAr ? item.name_ar || item.name : item.name;
                const langDesc = isAr ? item.description_ar || item.description : item.description;
                const langSlug = item.slug || itemId || langName.toLowerCase();

                return (
                  <div
                    key={itemId}
                    className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      {/* Card Banner Image */}
                      <div className="relative h-36 overflow-hidden bg-gray-100">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={langName}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-[#009688]/10 text-[#009688] font-black">
                            {langName}
                          </div>
                        )}
                        
                        <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-extrabold text-[#009688] shadow-sm flex items-center gap-1">
                          <Globe2 className="w-3 h-3" />
                          <span>{item.courses_count || 4} {isAr ? 'دورات' : 'courses'}</span>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-4">
                        <h3 className="text-sm font-extrabold text-[#112d27] mb-1.5 leading-snug">
                          {langName}
                        </h3>

                        {langDesc && (
                          <p className="text-[11px] text-gray-500 font-medium leading-relaxed line-clamp-2 mb-3">
                            {langDesc}
                          </p>
                        )}

                        <div className="flex items-center gap-2 text-[10px] font-semibold text-gray-400 mb-2">
                          <span className="flex items-center gap-1">
                            👥 {item.learners_count || '1,000+' } {isAr ? 'متعلم' : 'learners'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="px-4 pb-4 pt-0 flex items-center justify-between border-t border-gray-50 mt-auto">
                      <span className="text-[11px] text-gray-400 font-medium">
                        {isAr ? 'مسار تعليمي' : 'Language Path'}
                      </span>

                      <Link
                        to={`/courses?lang=${langSlug}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#e3f6f3] hover:bg-[#009688] text-[#009688] hover:text-white text-[11px] font-bold transition-all duration-300"
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