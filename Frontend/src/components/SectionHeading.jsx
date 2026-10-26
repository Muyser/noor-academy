import { cn } from '@/lib/utils';

export default function SectionHeading({ eyebrow, heading, description, center = true, className }) {
  return (
    <div className={cn(center && 'text-center', 'max-w-2xl', center && 'mx-auto', className)}>
      {eyebrow && (
        <div className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-brand-orange mb-3 animate-fade-up">
          {eyebrow}
        </div>
      )}
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-ink leading-tight text-balance animate-fade-up" style={{ animationDelay: '0.1s' }}>
        {heading}
      </h2>
      {description && (
        <p className="mt-3 text-brand-muted text-base sm:text-lg leading-relaxed animate-fade-up" style={{ animationDelay: '0.2s' }}>
          {description}
        </p>
      )}
    </div>
  );
}