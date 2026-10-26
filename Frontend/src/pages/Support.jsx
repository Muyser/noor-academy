import React, { useState, useEffect } from 'react';
import { MessageCircle, Mail, Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/useI18n';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function Support() {
  const { t, lang } = useI18n();
  const [faqs, setFaqs] = useState([]);
  const [open, setOpen] = useState(null);

  useEffect(() => {
    base44.entities.FAQ.list('order', 20).then(setFaqs).catch(() => {});
  }, []);

  return (
    <div>
      <section className="bg-gradient-to-b from-brand-bg to-white py-16 sm:py-20">
        <div className="container-page text-center max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-5xl font-bold text-brand-ink leading-tight animate-fade-up">{t('support.title')}</h1>
          <p className="mt-4 text-brand-muted text-lg animate-fade-up" style={{ animationDelay: '0.1s' }}>{t('support.description')}</p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <a href="https://wa.me/1234567890" target="_blank" rel="noreferrer">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white gap-2 w-full sm:w-auto">
                <MessageCircle className="w-5 h-5" />
                {t('support.whatsapp')}
              </Button>
            </a>
            <a href="mailto:info@noor-pro-academy.com">
              <Button size="lg" variant="outline" className="border-brand-teal text-brand-teal hover:bg-brand-teal hover:text-white gap-2 w-full sm:w-auto">
                <Mail className="w-5 h-5" />
                {t('support.email')}
              </Button>
            </a>
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-14 bg-background">
        <div className="container-page max-w-3xl">
          <h2 className="text-xl font-bold text-brand-ink mb-6">{t('support.faqTitle')}</h2>
          <div className="space-y-3">
            {faqs.map((faq) => {
              const isOpen = open === faq.id;
              const question = lang === 'ar' ? faq.question_ar || faq.question : faq.question;
              const answer = lang === 'ar' ? faq.answer_ar || faq.answer : faq.answer;
              return (
                <div key={faq.id} className="bg-white rounded-2xl border border-brand-line overflow-hidden shadow-soft">
                  <button onClick={() => setOpen(isOpen ? null : faq.id)} className="w-full flex items-center justify-between gap-4 p-5 text-start">
                    <span className="font-semibold text-brand-ink text-base">{question}</span>
                    <div className={cn('shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300', isOpen ? 'bg-brand-teal text-white rotate-45' : 'bg-brand-bg text-brand-teal')}>
                      <Plus className="w-4 h-4" />
                    </div>
                  </button>
                  <div className="overflow-hidden transition-all duration-300 ease-out" style={{ maxHeight: isOpen ? '300px' : '0', opacity: isOpen ? 1 : 0 }}>
                    <div className="px-5 pb-5 text-sm text-brand-muted leading-relaxed">{answer}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}