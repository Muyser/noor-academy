import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useI18n } from '@/lib/useI18n';
import { Button } from '@/components/ui/button';

export default function FinalCTA() {
  const { t, lang, isRTL } = useI18n();
  const heading = lang === 'ar' ? 'لغتك القادمة\nتبدأ من هنا.' : t('cta.heading') || 'Your Next Language\nStarts Here.';
  const desc = t('cta.description') || (lang === 'ar' ? 'تعلّم بهدف. تدرب بثقة. وتواصل مع العالم.' : 'Learn with purpose. Practice with confidence. Connect with the world.');

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#f2faf8] via-[#f7fcfb] to-[#eaf7f4] py-12 sm:py-16 dir-rtl">
      {/* Background Soft Glow Blobs */}
      <div className="absolute top-10 -left-20 w-[350px] h-[350px] bg-[#009688]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -right-20 w-[350px] h-[350px] bg-[#009688]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Reduced Max Width Container */}
      <div className="container-page max-w-3xl relative z-10 mx-auto px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-[#0d2e28] via-[#103a32] to-[#12423a] px-6 py-12 sm:px-12 sm:py-14 text-center shadow-xl shadow-[#103a32]/20 border border-teal-900/40">
          
          {/* Subtle concentric circle patterns on sides */}
          <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full border border-white/10 pointer-events-none" />
          <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full border border-white/5 pointer-events-none" />
          
          <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full border border-white/10 pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-48 h-48 rounded-full border border-white/5 pointer-events-none" />

          {/* Card Content */}
          <div className="relative z-10 max-w-lg mx-auto">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white leading-[1.25] text-balance mb-3">
              {heading.split('\n').map((line, i) => (
                <span key={i} className="block">
                  {line}
                </span>
              ))}
            </h2>

            <p className="text-teal-100/80 text-xs sm:text-sm font-medium max-w-md mx-auto mb-6 leading-relaxed">
              {desc}
            </p>

            <div>
              <Link to="/languages">
                <Button size="lg" className="bg-[#009688] hover:bg-[#00796b] text-white px-7 py-5 rounded-xl font-bold text-sm shadow-md shadow-[#009688]/30 transition-all duration-300 border-none inline-flex items-center gap-2">
                  <span>{t('cta.button') || (lang === 'ar' ? 'استكشف لغتك' : 'Explore Your Language')}</span>
                  {isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                </Button>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}