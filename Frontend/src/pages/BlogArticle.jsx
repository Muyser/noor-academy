import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, ArrowLeft, ChevronRight, User } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/useI18n';
import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

// Fallback dataset for instant article preview
const DEFAULT_POSTS = [
  {
    id: '1',
    slug: 'how-to-learn-languages-fast',
    title: 'How to Learn a New Language Faster: 5 Proven Strategies',
    title_ar: 'كيف تتعلم لغة جديدة بشكل أسرع: 5 استراتيجيات مثبتة',
    category: 'Language Tips',
    category_ar: 'نصائح لغوية',
    author: 'Noor Pro Academy',
    publish_date: 'Oct 10, 2026',
    read_time: '4 min read',
    cover_image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80',
    content: `Learning a new language effectively isn't about memorizing dictionary pages; it's about building a sustainable daily habit focused on active practice and practical communication.

## 1. Immerse Yourself Daily
Surround yourself with the language every single day. Change your phone's system language, listen to foreign podcasts during your commute, and watch shows with native subtitles.

## 2. Focus on Core Vocabulary First
Did you know that mastering the **top 1,000 most common words** in any language allows you to understand nearly **85%** of daily conversations? Prioritize words you will actually use.

## 3. Speak From Day One
Don't wait until you feel "ready" to speak. Mistakes are the most valuable learning signals your brain receives. Practice out loud with teachers, conversation partners, or language apps.

## 4. Use Spaced Repetition (SRS)
Review new vocabulary at increasing time intervals. Tools using spaced repetition memory techniques help transfer words from short-term memory to long-term recall effortlessly.

## 5. Be Consistent
Consistently spending **20 minutes every day** yields far better fluency results than cramming for 3 hours once a week.`,
    content_ar: `إن تعلم لغة جديدة بفعالية لا يتعلق بحفظ صفحات القواميس، بل ببناء عادة يومية مستدامة تركز على الممارسة النشطة والتواصل العملي.

## 1. انغمس يومياً في اللغة
أحِط نفسك باللغة يومياً. قم بتغيير لغة هاتفك، واستمع إلى البودكاست باللغة المستهدفة أثناء التنقل، وشاهد البرامج مع الترجمة.

## 2. ركّز على المفردات الأساسية أولاً
هل تعلم أن إتقان **أكثر 1,000 كلمة شائعة** يتيح لك فهم ما يقرب من **85%** من المحادثات اليومية؟ أعطِ الأولوية للكلمات التي ستستخدمها بالفعل.

## 3. تحدث من اليوم الأول
لا تنتظر حتى تشعر بأنك "جاهز" للتحدث. الأخطاء هي أسرع وسيلة للتعلم. مارس المحادثة بصوت عالٍ مع المعلمين أو زملائك.

## 4. استخدم التكرار المتباعد
راجع المفردات الجديدة على فترات زمنية متزايدة لتثبيتها في الذاكرة طويلة المدى بسهولة.

## 5. الاستمرارية هي السر
ممارسة **20 دقيقة يومياً** تحقق نتائج أفضل بكثير للطلاقة من الدراسة لمدة 3 ساعات مرة واحدة في الأسبوع.`
  },
  {
    id: '2',
    slug: 'business-english-essential-phrases',
    title: 'Essential Business English Phrases for Meetings and Emails',
    title_ar: 'عبارات إنجليزية أساسية للأعمال في الاجتماعات والرسائل',
    category: 'Business English',
    category_ar: 'إنجليزية الأعمال',
    author: 'Noor Pro Academy',
    publish_date: 'Oct 08, 2026',
    read_time: '6 min read',
    cover_image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80',
    content: `Professional communication requires clarity, politeness, and precision. Master these phrases to feel confident in any corporate setting.

## Key Email Openings
* **"I hope this email finds you well."** (Standard formal opening)
* **"Thank you for your prompt reply."** (Polite acknowledgment)

## Leading and Participating in Meetings
* **"Let's dive straight into today's agenda."** (Transitioning to business)
* **"Could you elaborate on that point?"** (Politely asking for details)

## Closing Proposals
* **"I look forward to hearing your thoughts."** (Encouraging feedback)`,
    content_ar: `يتطلب التواصل المهني الوضوح واللياقة والدقة. أتقن هذه العبارات لتشعر بالثقة في أي بيئة عمل.

## افتتحات البريد الإلكتروني
* **"أتمنى أن تجدك هذه الرسالة بخير."**
* **"شكراً لك على ردك السريع."**

## إدارة الاجتماعات والمشاركة فيها
* **"دعونا ننتقل مباشرة إلى جدول أعمال اليوم."**
* **"هل يمكنك التوسع في هذه النقطة؟"**`
  },
  {
    id: '3',
    slug: 'overcoming-fear-of-speaking',
    title: 'How to Overcome the Fear of Speaking a Foreign Language',
    title_ar: 'كيف تتغلب على الخوف من التحدث بلغة أجنبية',
    category: 'Confidence',
    category_ar: 'الثقة بالنفس',
    author: 'Noor Pro Academy',
    publish_date: 'Oct 02, 2026',
    read_time: '5 min read',
    cover_image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80',
    content: `Many language learners suffer from speaking anxiety. Here is how to shift your mindset and speak with natural ease.

## Shift From Perfection to Communication
Your goal in a foreign language is not to sound like a news anchor; it is to express your thoughts and connect with people.

## Embrace Native Reactions
Native speakers appreciate your effort to speak their language far more than they care about minor grammar slips!`,
    content_ar: `يعاني العديد من متعلمي اللغات من القلق أثناء التحدث. إليك كيفية تغيير عقليتك والتحدث بسهولة وطبيعية.

## انتقل من الكمال إلى التواصل
هدفك ليس أن تبدو كمذيع أخبار، بل أن تعبر عن أفكارك وتتواصل مع الآخرين.`
  }
];

export default function BlogArticle() {
  const { slug } = useParams();
  const { t, lang, isRTL } = useI18n();
  const isAr = lang === 'ar';

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    base44.entities.BlogPost.filter({ slug, status: 'published' }, '-created_date', 1)
      .then((data) => {
        let article = data[0];
        if (!article) {
          article = DEFAULT_POSTS.find((p) => p.slug === slug) || DEFAULT_POSTS[0];
        }
        setPost(article);
        setLoading(false);
      })
      .catch(() => {
        const article = DEFAULT_POSTS.find((p) => p.slug === slug) || DEFAULT_POSTS[0];
        setPost(article);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="container-page max-w-4xl mx-auto py-16 px-4">
        <div className="h-96 rounded-3xl bg-gray-100 animate-pulse" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container-page max-w-3xl mx-auto py-20 px-4 text-center">
        <div className="text-5xl mb-4">📝</div>
        <h1 className="text-2xl font-extrabold text-[#112d27] mb-2">
          {isAr ? 'المقال غير موجود' : 'Article not found'}
        </h1>
        <p className="text-gray-500 mb-6 text-sm font-medium">
          {isAr ? 'لم نتمكن من العثور على المقال المطلوب.' : 'The article you are looking for does not exist.'}
        </p>
        <Link to="/blog">
          <Button className="bg-[#009688] hover:bg-[#00796b] text-white font-bold rounded-xl">
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
          <nav className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-6 font-medium">
            <Link to="/blog" className="text-[#009688] hover:underline">
              {isAr ? 'المدونة' : 'Blog'}
            </Link>
            <ChevronRight className={cn('w-4 h-4 text-gray-300', isRTL && 'rotate-180')} />
            <span className="text-gray-700 truncate font-semibold">{title}</span>
          </nav>

          {/* Category Badge */}
          <span className="inline-block px-3 py-1 rounded-lg bg-[#e3f6f3] text-xs font-extrabold text-[#009688] mb-4">
            {category}
          </span>

          {/* Title */}
          <h1 className="text-2xl sm:text-4xl lg:text-4xl font-extrabold text-[#112d27] leading-tight mb-4">
            {title}
          </h1>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-400 mb-8 pb-6 border-b border-gray-100">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#009688]" />
              {post.publish_date}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#009688]" />
              {post.read_time}
            </span>
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
          <div className="prose prose-teal max-w-none text-gray-600 leading-relaxed text-sm sm:text-base font-medium">
            <ReactMarkdown
              components={{
                h2: ({ children }) => (
                  <h2 className="text-xl sm:text-2xl font-extrabold text-[#112d27] mt-8 mb-4">
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
                  <strong className="text-[#112d27] font-extrabold">{children}</strong>
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
                className="border-[#009688] text-[#009688] hover:bg-[#009688] hover:text-white font-bold rounded-xl gap-2 transition-all duration-300"
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