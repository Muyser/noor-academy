import { useState, useEffect } from 'react';
import { Loader2, Play, X, ArrowRight } from 'lucide-react';
import { useI18n } from '@/lib/useI18n';
import { cn } from '@/lib/utils';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function Gallery() {
  const { lang, isRTL } = useI18n();
  const isAr = lang === 'ar';
  
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  // Video Lightbox / Modal State
  const [activeVideo, setActiveVideo] = useState(null);

  const filters = [
    { key: 'all', label: isAr ? 'جميع الوسائط' : 'All Media' },
    { key: 'classes', label: isAr ? 'الفصول' : 'Classes' },
    { key: 'events', label: isAr ? 'الفعاليات' : 'Events' },
    { key: 'certificates', label: isAr ? 'الشهادات' : 'Certificates' },
    { key: 'campus', label: isAr ? 'المنشأة' : 'Campus' },
  ];

  // Fetch gallery items from backend API
  useEffect(() => {
    setLoading(true);
    const queryParam = activeFilter !== 'all' ? `?category=${activeFilter}` : '';
    
    fetch(`${API_URL}/api/gallery${queryParam}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch gallery items');
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setGalleryItems(data);
        }
      })
      .catch((err) => {
        console.error('Failed to load gallery items:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [activeFilter]);

  return (
    <div className={`min-h-screen bg-[#f8fcfb] ${isAr ? 'dir-rtl' : 'dir-ltr'}`}>
      
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#eaf7f4] via-[#f4faf8] to-[#f8fcfb] py-14 sm:py-16 text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-[#009688]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container-page max-w-3xl mx-auto px-4 relative z-10">
          <div className="inline-block text-[11px] font-bold uppercase tracking-widest text-[#009688] mb-2">
            {isAr ? 'معرض الأكاديمية' : 'ACADEMY GALLERY'}
          </div>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-[#112d27] tracking-tight leading-tight">
            {isAr ? 'معرض الصور والفيديوهات.' : 'Moments of success & learning.'}
          </h1>
          <p className="mt-3 text-gray-500 text-xs sm:text-sm font-normal max-w-xl mx-auto leading-relaxed">
            {isAr
              ? 'تصفح صور وفيديوهات الأنشطة، الفصول الدراسية، حفلات التخرج، ونجاحات طلابنا في أكاديمية نور برو.'
              : 'Explore photos & video moments from our classes, events, graduations, and community at Noor Pro Academy.'}
          </p>
        </div>
      </section>

      {/* Gallery Content Section */}
      <section className="py-8 sm:py-12">
        <div className="container-page max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Filter Pills Bar */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-3 mb-8 sm:mb-10 justify-start sm:justify-center w-full">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className={cn(
                  'px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 whitespace-nowrap shrink-0',
                  activeFilter === f.key
                    ? 'bg-[#009688] text-white shadow-md shadow-[#009688]/20'
                    : 'bg-white border border-gray-200/80 text-gray-600 hover:border-[#009688] hover:text-[#009688]'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Loading / Blog-Matched Card Grid Layout */}
          {loading ? (
            <div className="py-20 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#009688]" />
            </div>
          ) : galleryItems.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 p-8 shadow-sm text-gray-400 font-semibold text-xs sm:text-sm">
              {isAr ? 'لا توجد وسائط مضافة في هذا القسم حالياً.' : 'No gallery media available in this category.'}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 justify-items-center sm:justify-items-stretch">
              {galleryItems.map((item) => {
                const itemId = item._id || item.id;
                const title = isAr ? item.title_ar || item.title : item.title;
                const desc = isAr ? item.description_ar || item.description : item.description;
                const catLabel = isAr ? item.category_ar || item.category : item.category;
                const isVideo = item.type === 'video' || item.image?.endsWith('.mp4');

                return (
                  <div
                    key={itemId}
                    onClick={() => isVideo && setActiveVideo(item)}
                    className={cn(
                      "w-full max-w-[285px] sm:max-w-none group bg-white rounded-2xl border border-gray-100/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between p-4",
                      isVideo && "cursor-pointer"
                    )}
                  >
                    <div>
                      {/* Matching Blog Card Image Banner */}
                      <div className="relative w-full h-36 rounded-xl overflow-hidden bg-gray-100 mb-3">
                        {isVideo ? (
                          <>
                            <video src={item.image} className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/10 transition-colors">
                              <div className="w-10 h-10 rounded-full bg-[#009688] text-white flex items-center justify-center shadow-md shadow-[#009688]/40 group-hover:scale-110 transition-transform">
                                <Play className="w-4 h-4 fill-white ms-0.5" />
                              </div>
                            </div>
                          </>
                        ) : item.image ? (
                          <img
                            src={item.image}
                            alt={title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-[#009688]/10 text-[#009688] font-bold text-lg">
                            {title.charAt(0)}
                          </div>
                        )}
                        
                        <span className="absolute top-2.5 start-2.5 px-2.5 py-0.5 rounded-md bg-white/95 backdrop-blur-md text-[10px] font-bold text-[#009688] shadow-sm uppercase tracking-wider">
                          {catLabel || 'General'}
                        </span>
                      </div>

                      {/* Content Section */}
                      <div>
                        <h3 className="font-bold text-[#112d27] text-xs sm:text-sm mb-1.5 group-hover:text-[#009688] transition-colors line-clamp-2 leading-snug">
                          {title}
                        </h3>

                        {desc && (
                          <p className="text-[11px] text-gray-500 font-normal leading-relaxed line-clamp-2 mb-3">
                            {desc}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="pt-2.5 border-t border-gray-100 flex items-center justify-between mt-auto">
                      <span className="text-[10px] font-normal text-gray-400">
                        {isAr ? 'أكاديمية نور' : 'Noor Academy'}
                      </span>
                      <div className="inline-flex items-center gap-1 text-[11px] font-bold text-[#009688]">
                        <span>{isVideo ? (isAr ? 'تشغيل' : 'Play') : (isAr ? 'عرض' : 'View')}</span>
                        <ArrowRight className={cn('w-3.5 h-3.5 transition-transform group-hover:translate-x-1', isRTL && 'rotate-180 group-hover:-translate-x-1')} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </section>

      {/* Video Lightbox Modal Popup */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="relative max-w-4xl w-full bg-black rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-gray-800">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-900/90 text-white border-b border-gray-800">
              <h3 className="font-bold text-xs sm:text-base truncate max-w-[260px] sm:max-w-md">
                {isAr ? activeVideo.title_ar || activeVideo.title : activeVideo.title}
              </h3>
              <button
                onClick={() => setActiveVideo(null)}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors shrink-0"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Video Player */}
            <div className="aspect-video w-full bg-black flex items-center justify-center">
              <video
                src={activeVideo.image}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>

          </div>
        </div>
      )}

    </div>
  );
}