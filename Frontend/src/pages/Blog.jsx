import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar, Clock, ArrowRight, Loader2 } from 'lucide-react';
import { useI18n } from '@/lib/useI18n';
import { Image } from '@/components/ui/image';
import { cn } from '@/lib/utils';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function Blog() {
  const { lang, isRTL } = useI18n();
  const isAr = lang === 'ar';
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Fetch directly from Express backend API endpoint
    fetch(`${API_URL}/api/posts`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch blog posts');
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setPosts(data);
        }
      })
      .catch((err) => {
        console.error('Failed to load blog posts from backend:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filtered = posts.filter((p) => {
    const title = isAr ? p.title_ar || p.title : p.title;
    const excerpt = isAr ? p.excerpt_ar || p.excerpt : p.excerpt;
    const category = isAr ? p.category_ar || p.category : p.category;

    return (
      !search ||
      title?.toLowerCase().includes(search.toLowerCase()) ||
      category?.toLowerCase().includes(search.toLowerCase()) ||
      excerpt?.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className={`min-h-screen bg-[#f8fcfb] ${isAr ? 'dir-rtl' : 'dir-ltr'}`}>
      
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#eaf7f4] via-[#f4faf8] to-[#f8fcfb] py-14 sm:py-16 text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-[#009688]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container-page max-w-3xl mx-auto px-4 relative z-10">
          <div className="inline-block text-[11px] font-extrabold uppercase tracking-widest text-[#009688] mb-2">
            {isAr ? 'مدونة الأكاديمية' : 'ACADEMY BLOG'}
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#112d27] tracking-tight leading-tight">
            {isAr ? 'مقالات ونصائح لتعلم اللغات.' : 'Insights, tips & language guides.'}
          </h1>
          <p className="mt-3 text-gray-500 text-xs sm:text-sm font-medium max-w-xl mx-auto leading-relaxed">
            {isAr
              ? 'اكتشف أحدث المقالات والنصائح لتحسين مستواك اللغوي وتسريع رحلتك التعليمية.'
              : 'Discover expert tips, study techniques, and updates to accelerate your language learning journey.'}
          </p>

          {/* Search Bar */}
          <div className="mt-6 max-w-lg mx-auto">
            <div className="relative flex items-center bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100">
              <Search className="w-4 h-4 text-gray-400 mx-3 shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={isAr ? 'ابحث في المقالات...' : 'Search articles...'}
                className="w-full bg-transparent text-xs sm:text-sm font-medium text-gray-700 outline-none placeholder:text-gray-400 px-1"
              />
              <button className="bg-[#009688] hover:bg-[#00796b] text-white px-5 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-[#009688]/20 transition-all duration-300 shrink-0">
                {isAr ? 'بحث' : 'Search'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Grid Section */}
      <section className="py-8 sm:py-12">
        <div className="container-page max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-extrabold text-[#112d27] mb-6">
            {isAr ? 'أحدث المقالات' : 'Latest Articles'}
          </h2>

          {loading ? (
            <div className="py-20 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#009688]" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
              <div className="text-5xl mb-4">📝</div>
              <h3 className="text-lg font-extrabold text-[#112d27] mb-1">
                {isAr ? 'لا توجد مقالات مطابقة' : 'No articles found'}
              </h3>
              <p className="text-xs text-gray-400 font-medium">
                {isAr ? 'جرب البحث بكلمات أخرى.' : 'Try searching with different keywords.'}
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((post) => {
                const postId = post.id || post._id;
                const title = isAr ? post.title_ar || post.title : post.title;
                const excerpt = isAr ? post.excerpt_ar || post.excerpt : post.excerpt;
                const category = isAr ? post.category_ar || post.category : post.category;

                return (
                  <Link
                    key={postId}
                    to={`/blog/${post.slug}`}
                    className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                        {post.cover_image ? (
                          <Image
                            src={post.cover_image}
                            alt={title}
                            fittingType="fill"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-[#009688]/10 text-[#009688] font-black">
                            {title.charAt(0)}
                          </div>
                        )}
                        <span className="absolute top-3 start-3 px-3 py-1 rounded-lg bg-white/95 backdrop-blur-md text-[11px] font-extrabold text-[#009688] shadow-sm">
                          {category || 'Article'}
                        </span>
                      </div>

                      <div className="p-5 sm:p-6">
                        <div className="flex items-center gap-3 text-[11px] font-semibold text-gray-400 mb-2.5">
                          {post.publish_date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-[#009688]" />
                              {post.publish_date}
                            </span>
                          )}
                          {post.publish_date && post.read_time && <span>•</span>}
                          {post.read_time && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-[#009688]" />
                              {post.read_time}
                            </span>
                          )}
                        </div>

                        <h3 className="font-extrabold text-[#112d27] text-sm sm:text-base mb-2 group-hover:text-[#009688] transition-colors line-clamp-2 leading-snug">
                          {title}
                        </h3>

                        {excerpt && (
                          <p className="text-xs text-gray-500 font-medium leading-relaxed line-clamp-2 mb-4">
                            {excerpt}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="px-5 sm:px-6 pb-5 pt-0 flex items-center gap-1.5 text-xs font-bold text-[#009688]">
                      <span>{isAr ? 'قراءة المقال' : 'Read Article'}</span>
                      <ArrowRight className={cn('w-4 h-4 transition-transform group-hover:translate-x-1', isRTL && 'rotate-180 group-hover:-translate-x-1')} />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}