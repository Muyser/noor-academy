import { useState, useEffect } from 'react';
import { Plus, X, HelpCircle, Loader2 } from 'lucide-react';
import { useI18n } from '@/lib/useI18n';
import { cn } from '@/lib/utils';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function FAQ() {
  const { t, lang } = useI18n();
  const isAr = lang === 'ar';

  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(null);

  // Fetch FAQ entries strictly from backend API and slice to maximum 4 items
  useEffect(() => {
    fetch(`${API_URL}/api/faqs`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const limitedFaqs = data.slice(0, 4);
          setFaqs(limitedFaqs);
          // Automatically open the first FAQ item by default if available
          setOpen(limitedFaqs[0].id || limitedFaqs[0]._id);
        }
      })
      .catch((err) => {
        console.error('Failed to load FAQs', err);
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

      <div className="container-page max-w-3xl relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#009688]/10 text-[#009688] text-xs font-semibold mb-4 border border-[#009688]/20">
            <span className="w-2 h-2 rounded-full bg-[#009688]" />
            {t('faq.eyebrow') || (isAr ? 'أسئلة مهمة' : 'Important Questions')}
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-[#112d27] mb-3">
            {t('faq.heading') || (isAr ? 'الأسئلة الشائعة' : 'Frequently Asked Questions')}
          </h2>

          <p className="text-xs sm:text-sm text-gray-500 font-normal">
            {t('faq.description') || (isAr ? 'كل ما تحتاج إلى معرفته قبل بدء رحلتك في تعلّم اللغات.' : 'Everything you need to know before starting your language learning journey.')}
          </p>
        </div>

        {/* Content Section / Loader / Accordion List */}
        {loading ? (
          <div className="py-16 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#009688]" />
          </div>
        ) : faqs.length === 0 ? (
          <div className="text-center py-16 text-gray-400 font-semibold text-sm">
            {isAr ? 'لا توجد أسئلة شائعة حالياً.' : 'No FAQs available at the moment.'}
          </div>
        ) : (
          <div className="space-y-4">
            {faqs.map((faq) => {
              const faqId = faq.id || faq._id;
              const isOpen = open === faqId;
              const question = isAr ? faq.question_ar || faq.question : faq.question_en || faq.question;
              const answer = isAr ? faq.answer_ar || faq.answer : faq.answer_en || faq.answer;
              
              return (
                <div
                  key={faqId}
                  className={cn(
                    'bg-white/95 backdrop-blur-md rounded-3xl border transition-all duration-300 shadow-sm overflow-hidden',
                    isOpen ? 'border-[#009688]/40 shadow-md ring-1 ring-[#009688]/20' : 'border-gray-100/80 hover:border-gray-200'
                  )}
                >
                  <button
                    onClick={() => setOpen(isOpen ? null : faqId)}
                    className="w-full flex items-center justify-between gap-4 p-4 sm:p-6 text-start cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      {/* Question mark icon box */}
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-[#e3f6f3] text-[#009688] flex items-center justify-center shrink-0">
                        <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 font-semibold" />
                      </div>
                      <span className="font-semibold text-[#112d27] text-xs sm:text-base">
                        {question}
                      </span>
                    </div>

                    {/* Toggle Button Box */}
                    <div
                      className={cn(
                        'shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-2xl flex items-center justify-center transition-all duration-300',
                        isOpen ? 'bg-[#009688] text-white rotate-90 shadow-sm' : 'bg-[#e3f6f3] text-[#009688]'
                      )}
                    >
                      {isOpen ? <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                    </div>
                  </button>

                  {/* Answer Container */}
                  <div
                    className="overflow-hidden transition-all duration-300 ease-out"
                    style={{ maxHeight: isOpen ? '250px' : '0', opacity: isOpen ? 1 : 0 }}
                  >
                    <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-1 text-xs sm:text-sm text-gray-500 font-normal leading-relaxed border-t border-gray-50">
                      {answer}
                    </div>
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