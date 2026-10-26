import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, ArrowLeft, ChevronRight, User, Loader2 } from 'lucide-react';
import { useI18n } from '@/lib/useI18n';
import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function BlogArticle() {
  const { id } = useParams();
  const { lang, isRTL } = useI18n();
  const isAr = lang === 'ar';

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    fetch(`${API_URL}/api/posts/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch article by ID');
        return res.json();
      })
      .then((data) => {
        setPost(data);
      })
      .catch((err) => {
        console.error('Failed to load article from backend:', err);
        setPost(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fcfb] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#009688]" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#f8fcfb] py-20 px-4 text-center">
        <div className="text-5xl mb-4">📝</div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#112d27] mb-2">
          {isAr ? 'المقال غير موجود' : 'Article not found'}
        </h1>
        <p className="text-gray-500 mb-6 text-xs sm:text-sm font-normal">
          {isAr ? 'لم نتمكن من العثور على المقال المطلوب في قاعدة البيانات.' : 'The article you are looking for does not exist in the database.'}
        </p>
        <Link to="/blog">
          <Button className="bg-[#009688] hover:bg-[#00796b] text-white font-bold rounded-xl text-xs sm:text-sm">
            {isAr ? 'العودة للمدونة' : 'Back to Blog'}
          </Button>
        </Link>
      </div>
    );
  }

  const title = isAr ? post.title_ar || post.title : post.title;
  const category = isAr ? post.category_ar || post.category : post.category;
  const content = isAr ? post.content_ar || post.content : post.content;

  return (
    <div className={`min-h-screen bg-[#f8fcfb] ${isAr ? 'dir-rtl' : 'dir-ltr'}`}>
      <article className="py-10 sm:py-16">
        <div className="container-page max-w-3xl mx-auto px-4 sm:px-6">
          
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-6 font-normal">
            <Link to="/blog" className="text-[#009688] hover:underline">
              {isAr ? 'المدونة' : 'Blog'}
            </Link>
            <ChevronRight className={cn('w-4 h-4 text-gray-300', isRTL && 'rotate-180')} />
            <span className="text-gray-700 truncate font-bold">{title}</span>
          </nav>

          {/* Category Badge */}
          <span className="inline-block px-3 py-1 rounded-lg bg-[#e3f6f3] text-xs font-bold text-[#009688] mb-4">
            {category || (isAr ? 'مقال' : 'Article')}
          </span>

          {/* Title */}
          <h1 className="text-2xl sm:text-4xl font-bold text-[#112d27] leading-tight mb-4">
            {title}
          </h1>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-normal text-gray-400 mb-8 pb-6 border-b border-gray-100">
            {post.publish_date && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#009688]" />
                {post.publish_date}
              </span>
            )}
            {post.publish_date && post.read_time && <span>•</span>}
            {post.read_time && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#009688]" />
                {post.read_time}
              </span>
            )}
            <span>•</span>
            <span className="flex items-center gap-1.5 text-gray-600">
              <User className="w-4 h-4 text-[#009688]" />
              {isAr ? 'بقلم:' : 'By'} {post.author || 'Noor Pro Academy'}
            </span>
          </div>

          {/* Featured Cover Image */}
          {post.cover_image && (
            <div className="relative aspect-[16/9] rounded-3xl overflow-hidden shadow-lg bg-gray-100 mb-8 border border-gray-100">
              <Image
                src={post.cover_image}
                alt={title}
                fittingType="fill"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Article Content Area */}
          <div className="prose prose-teal max-w-none text-gray-600 leading-relaxed text-xs sm:text-base font-normal">
            <ReactMarkdown
              components={{
                h2: ({ children }) => (
                  <h2 className="text-lg sm:text-2xl font-bold text-[#112d27] mt-8 mb-4">
                    {children}
                  </h2>
                ),
                p: ({ children }) => (
                  <p className="text-gray-600 leading-relaxed mb-5">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside space-y-2 text-gray-600 mb-5 ps-2">
                    {children}
                  </ul>
                ),
                li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                strong: ({ children }) => (
                  <strong className="text-[#112d27] font-bold">{children}</strong>
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </div>

          {/* Bottom Back Button */}
          <div className="mt-12 pt-6 border-t border-gray-100">
            <Link to="/blog">
              <Button
                variant="outline"
                className="border-[#009688] text-[#009688] hover:bg-[#009688] hover:text-white font-bold rounded-xl gap-2 transition-all duration-300 text-xs sm:text-sm"
              >
                <ArrowLeft className={cn('w-4 h-4', isRTL && 'rotate-180')} />
                <span>{isAr ? 'العودة للمدونة' : 'Back to Blog'}</span>
              </Button>
            </Link>
          </div>

        </div>
      </article>
    </div>
  );
}