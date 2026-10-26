import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail, MapPin } from 'lucide-react';
import { useI18n } from '@/lib/useI18n';

export default function Footer() {
  const { t, lang } = useI18n();

  const links = [
    { label: t('footer.home') || (lang === 'ar' ? 'الرئيسية' : 'Home'), to: '/' },
    { label: t('footer.courses') || (lang === 'ar' ? 'الدورات' : 'Courses'), to: '/courses' },
    { label: t('footer.blog') || (lang === 'ar' ? 'المدونة' : 'Blog'), to: '/blog' },
    { label: t('footer.support') || (lang === 'ar' ? 'الدعم الفني' : 'Support'), to: '/support' },
    { label: t('footer.login') || (lang === 'ar' ? 'تسجيل الدخول' : 'Login'), to: '/login' },
    { label: t('footer.languages') || (lang === 'ar' ? 'اللغات' : 'Languages'), to: '/languages' },
    { label: t('footer.learning') || (lang === 'ar' ? 'رحلة التعلّم' : 'Learning'), to: '/learning' },
    { label: t('footer.faq') || (lang === 'ar' ? 'الأسئلة الشائعة' : 'FAQ'), to: '/faq' },
  ];

  return (
    <footer className="relative overflow-hidden bg-gradient-to-b from-[#0d2e28] via-[#0a2520] to-[#071b17] text-white pt-16 pb-12 dir-rtl border-t border-teal-900/50">
      {/* Background Soft Glow Accents */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#009688]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-[#009688]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container-page max-w-6xl relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16">
          
          {/* Column 1: Brand & Socials */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#009688] flex items-center justify-center text-white font-extrabold text-xl shadow-md shadow-[#009688]/20">
                N
              </div>
              <div className="leading-tight">
                <div className="font-extrabold text-lg tracking-tight text-white">NOOR PRO</div>
                <div className="text-[10px] text-[#009688] font-bold tracking-widest uppercase">Academy</div>
              </div>
            </div>

            <p className="text-teal-100/70 text-sm leading-relaxed max-w-sm font-medium">
              {t('footer.tagline') || (lang === 'ar' ? 'منصة تعليم لغات حديثة تهدف لتطوير مهارات التواصل بثقة وسهولة.' : 'A modern language academy designed to build real communication confidence.')}
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-2.5 pt-2">
              {[
                { Icon: Facebook, name: 'Facebook' },
                { Icon: Twitter, name: 'Twitter' },
                { Icon: Instagram, name: 'Instagram' },
                { Icon: Youtube, name: 'Youtube' },
              ].map(({ Icon, name }, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 hover:bg-[#009688] hover:border-[#009688] text-teal-100 hover:text-white flex items-center justify-center transition-all duration-300 shadow-sm"
                  aria-label={name}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div>
            <h4 className="font-extrabold text-sm uppercase tracking-wider text-teal-200/90 mb-5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#009688]" />
              {t('footer.links') || (lang === 'ar' ? 'روابط سريعة' : 'Quick Links')}
            </h4>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-3">
              {links.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-teal-100/70 hover:text-[#009688] text-sm font-medium transition-colors flex items-center gap-1.5"
                  >
                    <span className="text-xs text-[#009688]/60">›</span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact & Info */}
          <div>
            <h4 className="font-extrabold text-sm uppercase tracking-wider text-teal-200/90 mb-5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#009688]" />
              {t('footer.support') || (lang === 'ar' ? 'التواصل والدعم' : 'Contact & Support')}
            </h4>
            <div className="space-y-3.5 text-sm text-teal-100/70 font-medium">
              <a
                href="mailto:info@noor-pro-academy.com"
                className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-[#009688]/40 hover:bg-white/10 transition-all text-teal-100"
              >
                <div className="w-8 h-8 rounded-xl bg-[#009688]/20 text-[#009688] flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <span className="text-xs sm:text-sm font-mono truncate">info@noor-pro-academy.com</span>
              </a>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 text-teal-100">
                <div className="w-8 h-8 rounded-xl bg-[#009688]/20 text-[#009688] flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="text-xs sm:text-sm">
                  {lang === 'ar' ? 'أكاديمية لغات عبر الإنترنت' : 'Online Language Academy'}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Copyright & Developer Credit */}
        <div className="mt-14 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-center text-teal-100/50 text-xs font-medium">
          <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3">
            <span>{t('footer.copyright') || `© ${new Date().getFullYear()} NOOR PRO Academy. جميع الحقوق محفوظة.`}</span>
            <span className="hidden sm:inline text-teal-100/30">•</span>
            <span className="text-teal-200/80">
              {lang === 'ar' ? 'تم التطوير بواسطة ' : 'Developed by '}
              <strong className="text-[#009688] font-bold">Muyser</strong>
            </span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-teal-200 transition-colors">
              {lang === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}
            </Link>
            <Link to="/terms" className="hover:text-teal-200 transition-colors">
              {lang === 'ar' ? 'الشروط والأحكام' : 'Terms of Service'}
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}