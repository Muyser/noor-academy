import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useI18n } from '@/lib/useI18n';
import { Image } from '@/components/ui/image';
import { cn } from '@/lib/utils';

export default function LanguageCard({ language, index = 0 }) {
  const { t, lang, isRTL } = useI18n();
  const name = lang === 'ar' ? language.name_ar || language.name : language.name;
  const desc = lang === 'ar' ? language.description_ar || language.description : language.description;

  return (
    <Link
      to={`/courses?lang=${language.slug}`}
      className="group block bg-white rounded-2xl border border-brand-line overflow-hidden shadow-soft hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-brand-teal/10 to-brand-bg">
        {language.image ? (
          <Image
            src={language.image}
            alt={name}
            fittingType="fill"
            className="w-full h-full transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl">{language.flag || '🌐'}</span>
          </div>
        )}
        <div className="absolute top-3 end-3 w-10 h-10 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center text-xl shadow-soft">
          {language.flag || '🌐'}
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-bold text-brand-ink text-lg mb-1.5 group-hover:text-brand-teal transition-colors">
          {name}
        </h3>
        <p className="text-sm text-brand-muted leading-relaxed mb-4 line-clamp-2">
          {desc}
        </p>
        <div className="flex items-center gap-1.5 text-sm font-semibold text-brand-teal">
          {t('languages.explore')} {name}
          <ArrowRight className={cn('w-4 h-4 transition-transform group-hover:translate-x-1', isRTL && 'rotate-180 group-hover:-translate-x-1')} />
        </div>
      </div>
    </Link>
  );
}