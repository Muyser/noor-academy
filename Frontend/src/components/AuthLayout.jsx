import { Link } from 'react-router-dom';
import { useLanguage } from '@/lib/LanguageContext';

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  const { dir } = useLanguage();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-brand-bg to-white px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand */}
        <Link to="/" className="flex items-center justify-center gap-3 mb-8 group">
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center overflow-hidden shadow-md border border-gray-100 transition-transform group-hover:scale-105">
            <img 
              src="/nr.png" 
              alt="Noor Academy Logo" 
              className="w-full h-full object-cover scale-125 transition-transform"
            />
          </div>
          <div className="leading-tight text-start">
            <div className="font-extrabold text-[#112d27] text-xl tracking-tight">NOOR</div>
            <div className="text-xs text-[#009688] font-bold tracking-widest uppercase">Academy</div>
          </div>
        </Link>

        <div className="text-center mb-8">
          {Icon && (
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-teal/10 mb-4">
              <Icon className="w-7 h-7 text-brand-teal" aria-hidden="true" />
            </div>
          )}
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-brand-ink">{title}</h1>
          {subtitle && <p className="text-brand-muted mt-2 text-sm">{subtitle}</p>}
        </div>

        <div className="bg-white rounded-2xl shadow-card border border-brand-line p-6 sm:p-8">
          {children}
        </div>

        {footer && (
          <p className="text-center text-sm text-brand-muted mt-6">{footer}</p>
        )}
      </div>
    </div>
  );
}