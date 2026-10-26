import { useState, useEffect } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { useI18n } from '@/lib/useI18n';
import { cn } from '@/lib/utils';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function FAQPage() {
  const { lang } = useI18n();
  const isAr = lang === 'ar';
  const [faqs, setFaqs] = useState([]);
  const [open, setOpen] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/faqs`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch FAQs');
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setFaqs(data);
        }
      })
      .catch((err) => {
        console.error('Failed to load FAQs:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className={`min-h-screen bg-[#f8fcfb] ${isAr ? 'dir-rtl' : 'dir-ltr'}`}>
      
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#eaf7f4] via-[#f4faf8] to-[#f8fcfb] py-14 sm:py-16 text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-[#009688]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container-page max-w-3xl mx-auto px-4 relative z-10">
          <div className="inline-block text-[11px] font-bold uppercase tracking-widest text-[#009688] mb-2">
            {isAr ? 'الأسئلة الشائعة' : 'HELP CENTER'}
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#112d27] tracking-tight leading-tight">
            {isAr ? 'كيف يمكننا مساعدتك؟' : 'Frequently Asked Questions.'}
          </h1>
          <p className="mt-3 text-gray-500 text-xs sm:text-sm font-normal max-w-xl mx-auto leading-relaxed">
            {isAr
              ? 'إليك إجابات لأبرز الأسئلة والاستفسارات حول الدورات، التسجيل، وشهادات الأكاديمية.'
              : 'Find answers to common questions about our courses, registration, certificates, and learning process.'}
          </p>
        </div>
      </section>

      {/* FAQ Accordion List */}
      <section className="py-8 sm:py-12">
        <div className="container-page max-w-3xl mx-auto px-4">
          {loading ? (
            <div className="py-16 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#009688]" />
            </div>
          ) : faqs.length === 0 ? (
            <div className="text-center py-16 text-gray-400 font-normal text-xs">
              {isAr ? 'لا توجد أسئلة شائعة مضافة حالياً.' : 'No FAQs available at the moment.'}
            </div>
          ) : (
            <div className="space-y-3">
              {faqs.map((faq) => {
                const faqId = faq._id || faq.id;
                const isOpen = open === faqId;
                const question = isAr ? faq.question_ar || faq.question : faq.question;
                const answer = isAr ? faq.answer_ar || faq.answer : faq.answer;
                
                return (
                  <div key={faqId} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm transition-all duration-200">
                    <button
                      onClick={() => setOpen(isOpen ? null : faqId)}
                      className="w-full flex items-center justify-between gap-4 p-5 text-start hover:bg-gray-50/50 transition-colors"
                    >
                      <span className="font-bold text-[#112d27] text-xs sm:text-sm">{question}</span>
                      <div className={cn(
                        'shrink-0 w-7 h-7 rounded-xl flex items-center justify-center transition-all duration-300',
                        isOpen ? 'bg-[#009688] text-white rotate-45 shadow-sm shadow-[#009688]/30' : 'bg-[#e3f6f3] text-[#009688]'
                      )}>
                        <Plus className="w-3.5 h-3.5" />
                      </div>
                    </button>
                    
                    <div
                      className="overflow-hidden transition-all duration-300 ease-out"
                      style={{ maxHeight: isOpen ? '300px' : '0', opacity: isOpen ? 1 : 0 }}
                    >
                      <div className="px-5 pb-5 text-xs sm:text-sm text-gray-500 font-normal leading-relaxed border-t border-gray-50 pt-3">
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
    </div>
  );
}