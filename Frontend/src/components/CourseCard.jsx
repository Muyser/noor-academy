import { Link } from 'react-router-dom';
import { Star, Clock, BookOpen, ArrowRight } from 'lucide-react';
import { useI18n } from '@/lib/useI18n';
import { Image } from '@/components/ui/image';
import { cn } from '@/lib/utils';

export default function CourseCard({ course, index = 0 }) {
  const { t, isRTL } = useI18n();

  return (
    <Link
      to={`/course/${course.slug}`}
      className="group block bg-white rounded-2xl border border-brand-line overflow-hidden shadow-soft hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300"
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-brand-bg">
        <Image
          src={course.image}
          alt={course.title}
          fittingType="fill"
          className="w-full h-full transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 start-3 flex gap-2">
          <span className="px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-sm text-xs font-semibold text-brand-teal shadow-soft">
            {course.level}
          </span>
        </div>
        <div className="absolute top-3 end-3">
          <span className="px-2.5 py-1 rounded-full bg-brand-teal/90 backdrop-blur-sm text-xs font-semibold text-white shadow-soft">
            {course.language}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        <div className="flex items-center gap-3 text-xs text-brand-muted mb-2">
          <span className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-brand-orange text-brand-orange" />
            <span className="font-semibold text-brand-ink">{course.rating}</span>
          </span>
          <span>({course.reviews_count} {t('courses.reviews')})</span>
        </div>

        <h3 className="font-bold text-brand-ink text-base sm:text-lg leading-snug mb-2 group-hover:text-brand-teal transition-colors line-clamp-2">
          {course.title}
        </h3>

        <p className="text-sm text-brand-muted leading-relaxed line-clamp-2 mb-4">
          {course.short_description}
        </p>

        <div className="flex items-center justify-between pt-3 border-t border-brand-line">
          <div className="flex items-center gap-3 text-xs text-brand-muted">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {course.duration}
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" />
              {course.lessons_count} {t('courses.lessons')}
            </span>
          </div>
          <div className="flex items-center gap-1 text-sm font-bold text-brand-orange">
            ${course.price}
            <ArrowRight className={cn('w-4 h-4 transition-transform group-hover:translate-x-1', isRTL && 'rotate-180 group-hover:-translate-x-1')} />
          </div>
        </div>
      </div>
    </Link>
  );
}