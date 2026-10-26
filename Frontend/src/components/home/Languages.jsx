import { useState, useEffect } from 'react';
import { useI18n } from '@/lib/useI18n';
import { Loader2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function Languages() {
  const { t, lang } = useI18n();
  const isAr = lang === 'ar';
  
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  // Fetch languages strictly from backend API
  useEffect(() => {
    fetch(`${API_URL}/api/languages`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const activeLangs = data.filter((l) => l.status === 'active' || !l.status);
          setLanguages(activeLangs);
        }
      })
      .catch((err) => {
        console.error('Failed to load public languages', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filtered = filter === 'all' 
    ? languages 
    : languages.filter((l) => l.slug === filter);

  return (
    <section className={`relative overflow-hidden bg-gradient-to-br from-[#f2faf8] via-[#f7fcfb] to-[#eaf7f4] py-16 sm:py-24 ${isAr ? 'dir-rtl' : 'dir-ltr'}`}>
      {/* Background Soft Ambient Light Globs */}
      <div className="absolute top-10 -left-20 w-[450px] h-[450px] bg-[#009688]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -right-20 w-[450px] h-[450px] bg-[#009688]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="container-page relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Tag / Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#009688]/10 text-[#009688] text-xs font-bold mb-4 border border-[#009688]/20">
            <span className="w-2 h-2 rounded-full bg-[#009688]" />
            {t('languages.eyebrow') || (isAr ? 'اختر مسارك' : 'Choose Your Path')}
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#112d27] mb-3">
            {t('languages.heading') || (isAr ? 'ما اللغة التي ستتعلمها؟' : 'Which language will you learn?')}
          </h2>

          <p className="text-sm sm:text-base text-gray-500 font-medium">
            {t('languages.description') || (isAr ? 'اختر لغة وابدأ في بناء مهارات عملية في التواصل.' : 'Select a language and start building practical communication skills.')}
          </p>
        </div>

        {/* Filter Pills */}
        {!loading && languages.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-12">
            <button
              onClick={() => setFilter('all')}
              className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all duration-300 ${
                filter === 'all'
                  ? 'bg-[#009688] text-white shadow-md shadow-[#009688]/20'
                  : 'bg-white border border-gray-100 text-gray-700 hover:border-[#009688] hover:text-[#009688]'
              }`}
            >
              {isAr ? 'جميع اللغات' : 'All Languages'}
            </button>
            {languages.map((l) => {
              const label = isAr ? l.name_ar || l.name : l.name;
              return (
                <button
                  key={l.slug || l.id}
                  onClick={() => setFilter(l.slug)}
                  className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all duration-300 ${
                    filter === l.slug
                      ? 'bg-[#009688] text-white shadow-md shadow-[#009688]/20'
                      : 'bg-white border border-gray-100 text-gray-700 hover:border-[#009688] hover:text-[#009688]'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}

        {/* Language Cards Grid / States */}
        {loading ? (
          <div className="py-16 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#009688]" />
          </div>
        ) : languages.length === 0 ? (
          <div className="text-center py-16 text-gray-400 font-semibold text-sm">
            {isAr ? 'لا توجد لغات متاحة حالياً.' : 'No languages available at the moment.'}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 justify-items-center sm:justify-items-stretch">
            {filtered.map((item, i) => {
              const title = isAr ? item.name_ar || item.name : item.name;
              const description = isAr ? item.description_ar || item.description : item.description;
              const iconSymbol = item.flag || '🌐';
              const isPrimary = i === 0;

              return (
                <div
                  key={item.id || item._id || i}
                  className={`w-full max-w-[285px] sm:max-w-none relative overflow-hidden bg-white/95 backdrop-blur-md rounded-3xl border ${
                    isPrimary ? 'border-[#009688]/40 shadow-lg shadow-[#009688]/5' : 'border-gray-100/80 shadow-sm'
                  } p-5 sm:p-8 flex flex-col justify-between hover:shadow-xl transition-all duration-300 group`}
                >
                  {/* Soft Mint Corner Blob inside card */}
                  <div className="absolute -top-10 -left-10 w-36 h-36 bg-[#e8f7f4] rounded-full blur-2xl pointer-events-none" />

                  <div>
                    {/* Top Icon Box */}
                    <div className="flex justify-start mb-4 sm:mb-6">
                      <div
                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-lg sm:text-xl shadow-sm ${
                          isPrimary
                            ? 'bg-[#009688] text-white'
                            : 'bg-[#e3f6f3] text-[#009688]'
                        }`}
                      >
                        {iconSymbol}
                      </div>
                    </div>

                    {/* Card Title */}
                    <h3 className="text-xl sm:text-2xl font-extrabold text-[#112d27] mb-2 sm:mb-3">
                      {title}
                    </h3>

                    {/* Card Description */}
                    <p className="text-xs sm:text-sm text-gray-500 font-medium leading-relaxed mb-6 sm:mb-8">
                      {description}
                    </p>
                  </div>

                  {/* Action Link */}
                  <div className="pt-2">
                    <a
                      href={`/courses?language=${item.slug || 'all'}`}
                      className="inline-flex items-center text-xs sm:text-sm font-bold text-[#009688] hover:text-[#00796b] transition-colors gap-1 border-b-2 border-[#009688]/30 pb-0.5 group-hover:border-[#009688]"
                    >
                      {isAr ? `استكشف ${title} ←` : `Explore ${title} →`}
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}