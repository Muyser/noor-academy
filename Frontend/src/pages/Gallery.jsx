import { useState, useEffect } from 'react';
import { Loader2, Play, X } from 'lucide-react';
import { useI18n } from '@/lib/useI18n';
import { cn } from '@/lib/utils';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function Gallery() {
  const { lang } = useI18n();
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
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#112d27] tracking-tight leading-tight">
            {isAr ? 'معرض الأكاديمية.' : 'Academy Gallery.'}
            <span className="block text-[#009688] font-black mt-1">
              {isAr ? 'لحظات النجاح والتفاعل.' : 'Moments of success & learning.'}
            </span>
          </h1>

          <p className="mt-3 text-gray-500 text-xs sm:text-sm font-medium max-w-xl mx-auto leading-relaxed">
            {isAr
              ? 'تصفح صور وفيديوهات الأنشطة، الفصول الدراسية، حفلات التخرج، ونجاحات طلابنا في أكاديمية نور برو.'
              : 'Explore photos & video moments from our classes, events, graduations, and community at Noor Pro Academy.'}
          </p>
        </div>
      </section>

      {/* Gallery Content Section */}
      <section className="py-8 sm:py-12">
        <div className="container-page max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className={cn(
                  'px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300',
                  activeFilter === f.key
                    ? 'bg-[#009688] text-white shadow-md shadow-[#009688]/20'
                    : 'bg-white border border-gray-200/80 text-gray-600 hover:border-[#009688] hover:text-[#009688]'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Loading / Grid Layout */}
          {loading ? (
            <div className="py-20 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#009688]" />
            </div>
          ) : galleryItems.length === 0 ? (
            <div className="text-center py-20 text-gray-400 font-semibold text-xs">
              {isAr ? 'لا توجد وسائط مضافة في هذا القسم حالياً.' : 'No gallery media available in this category.'}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleryItems.map((item) => {
                const itemId = item._id || item.id;
                const title = isAr ? item.title_ar || item.title : item.title;
                const desc = isAr ? item.description_ar || item.description : item.description;
                const catLabel = isAr ? item.category_ar || item.category : item.category;
                const isVideo = item.type === 'video' || item.image?.endsWith('.mp4');

                return (
                  <div
                    key={itemId}
                    className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between"
                  >
                    <div 
                      onClick={() => isVideo && setActiveVideo(item)}
                      className={cn(
                        "relative h-56 overflow-hidden bg-gray-900 flex items-center justify-center",
                        isVideo && "cursor-pointer"
                      )}
                    >
                      {isVideo ? (
                        <>
                          <video src={item.image} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/10 transition-colors">
                            <div className="w-14 h-14 rounded-full bg-[#009688] text-white flex items-center justify-center shadow-lg shadow-[#009688]/40 group-hover:scale-110 transition-transform">
                              <Play className="w-6 h-6 fill-white ms-1" />
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
                        <div className="w-full h-full flex items-center justify-center bg-[#009688]/10 text-[#009688] font-black">
                          {title}
                        </div>
                      )}
                      
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-extrabold text-[#009688] shadow-sm uppercase tracking-wider">
                        {catLabel || 'General'}
                      </div>
                    </div>

                    <div className="p-5 sm:p-6 flex flex-col flex-grow">
                      <h3 className="text-base sm:text-lg font-extrabold text-[#112d27] mb-2 leading-snug">
                        {title}
                      </h3>
                      {desc && (
                        <p className="text-xs sm:text-sm text-gray-500 font-medium leading-relaxed">
                          {desc}
                        </p>
                      )}
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full bg-black rounded-3xl overflow-hidden shadow-2xl border border-gray-800">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 bg-gray-900/90 text-white border-b border-gray-800">
              <h3 className="font-extrabold text-sm sm:text-base truncate max-w-md">
                {isAr ? activeVideo.title_ar || activeVideo.title : activeVideo.title}
              </h3>
              <button
                onClick={() => setActiveVideo(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <X className="w-5 h-5" />
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