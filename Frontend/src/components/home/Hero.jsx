import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useI18n } from '@/lib/useI18n';
import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import { cn } from '@/lib/utils';

export default function Hero() {
  const { t, lang, isRTL } = useI18n();
  const heading = lang === 'ar' ? 'تعلّم اللغات.\nوافتح عالمك.' : 'Learn Languages.\nOpen Your World.';
  const desc = lang === 'ar'
    ? 'تعلّم لغة جديدة من خلال دروس عملية، وأنشطة تفاعلية، ودورات منظمة صُممت لمساعدتك على التواصل بثقة.'
    : 'Learn a new language through practical lessons, interactive activities, and structured courses built to help you communicate with confidence.';

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#eef9f6] via-[#f7fcfb] to-white pt-12 pb-16 sm:pt-16 sm:pb-24">
      {/* Decorative blobs matching screenshot gradient background */}
      <div className="absolute top-10 -end-20 w-96 h-96 bg-[#009688]/10 rounded-full blur-3xl pointer-events-none animate-float" />
      <div className="absolute bottom-10 -start-20 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl pointer-events-none" />

      <div className="container-page relative">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Text */}
          <div className={cn('text-center lg:text-start', isRTL && 'lg:text-right')}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-teal/10 text-brand-teal text-xs font-semibold uppercase tracking-wider mb-5 animate-fade-up">
              <Sparkles className="w-3.5 h-3.5" />
              {t('hero.eyebrow')}
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-brand-ink leading-[1.1] text-balance animate-fade-up" style={{ animationDelay: '0.1s' }}>
              {heading.split('\n').map((line, i) => (
                <span key={i} className="block">
                  {i === 1 ? <span className="text-brand-teal">{line}</span> : line}
                </span>
              ))}
            </h1>
            <p className="mt-5 text-base sm:text-lg text-brand-muted leading-relaxed max-w-xl mx-auto lg:mx-0 animate-fade-up" style={{ animationDelay: '0.2s' }}>
              {desc}
            </p>
            <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start animate-fade-up" style={{ animationDelay: '0.3s' }}>
              <Link to="/languages">
                <Button size="lg" className="w-140 sm:w-auto bg-brand-teal hover:bg-brand-teal-dark text-white shadow-soft gap-2">
                  {t('hero.exploreLanguages')}
                  <ArrowRight className={cn('w-4 h-4', isRTL && 'rotate-180')} />
                </Button>
              </Link>
            </div>
          </div>

          {/* Image */}
          <div className="relative max-w-[300px] sm:max-w-none mx-auto w-full animate-fade-scale" style={{ animationDelay: '0.2s' }}>
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-card-hover">
              <Image
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1000&q=80"
                alt="Language learning"
                fittingType="fill"
                className="w-full h-full"
              />
            </div>
            {/* Floating card - Active Learners */}
            <div className="absolute -bottom-3 -start-3 sm:-bottom-4 sm:-start-6 bg-white rounded-2xl shadow-card-hover p-2.5 sm:p-4 flex items-center gap-2.5 sm:gap-3 animate-float" style={{ animationDelay: '0.5s' }}>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-brand-orange/10 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-brand-orange" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-brand-ink">1,500+</div>
                <div className="text-[10px] sm:text-xs text-brand-muted">{lang === 'ar' ? 'متعلّم نشط' : 'Active Learners'}</div>
              </div>
            </div>
            {/* Floating card - Languages */}
            <div className="absolute -top-3 -end-3 sm:-top-4 sm:-end-6 bg-white rounded-2xl shadow-card-hover p-2.5 sm:p-4 flex items-center gap-2.5 sm:gap-3 animate-float" style={{ animationDelay: '1s' }}>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-brand-teal/10 flex items-center justify-center text-base sm:text-lg shrink-0">🌍</div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-brand-ink">6+</div>
                <div className="text-[10px] sm:text-xs text-brand-muted">{lang === 'ar' ? 'لغات' : 'Languages'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}