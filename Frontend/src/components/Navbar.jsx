import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Globe, User, ShieldCheck, LogOut } from 'lucide-react';
import { useI18n } from '@/lib/useI18n';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function Navbar() {
  const { t, lang, toggleLang, isRTL } = useI18n();
  const { isAuthenticated, user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { label: t('nav.languages') || 'Languages', to: '/languages' },
    { label: t('nav.courses') || 'Courses', to: '/courses' },
    { label: t('nav.blog') || 'Blog', to: '/blog' },
    { label: lang === 'ar' ? 'المعرض' : 'Gallery', to: '/gallery' },
    { label: t('nav.learning') || 'Learning', to: '/learning', protected: true },
    { label: t('nav.faq') || 'FAQ', to: '/faq' },
  ];

  const handleNavClick = (e, link) => {
    if (link.protected && !isAuthenticated) {
      e.preventDefault();
      navigate('/login?returnTo=' + encodeURIComponent(link.to));
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token && API_URL) {
        await fetch(`${API_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).catch(() => {});
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('noor_user');
      
      if (typeof logout === 'function') {
        try {
          logout(false);
        } catch (e) {
          // ignore
        }
      }

      navigate('/');
      window.location.reload();
    }
  };

  const isAdmin = user?.role === 'admin';
  const dashboardPath = isAdmin ? '/admin' : '/dashboard';
  const dashboardLabel = isAdmin 
    ? (lang === 'ar' ? 'لوحة المسؤول' : 'Admin Dashboard')
    : (t('nav.dashboard') || 'My Dashboard');

  return (
    <>
      <header
        className={cn(
          'fixed top-0 inset-x-0 z-50 transition-all duration-300',
          scrolled
            ? 'bg-[#112d27]/95 text-white backdrop-blur-md shadow-lg py-2.5 border-b border-emerald-900/30'
            : 'bg-[#112d27] text-white py-3.5 shadow-md'
        )}
      >
        <nav className="container-page flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden shadow-md border border-white/20 transition-transform group-hover:scale-105">
              <img 
                src="/nr.png" 
                alt="Noor Academy Logo" 
                className="w-full h-full object-cover scale-125 transition-transform"
              />
            </div>
            <div className="leading-tight">
              <div className="font-extrabold text-white text-sm tracking-tight">NOOR</div>
              <div className="text-[9px] text-emerald-400 font-bold tracking-widest uppercase">Academy</div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={(e) => handleNavClick(e, link)}
                className={cn(
                  'px-3.5 py-2 text-xs font-bold rounded-lg transition-all',
                  location.pathname === link.to 
                    ? 'bg-[#009688] text-white shadow-sm' 
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Language switcher */}
            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/15 text-xs font-bold text-gray-200 hover:bg-white/10 transition-colors h-9"
              aria-label="Switch language"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>{lang === 'en' ? 'العربية' : 'EN'}</span>
            </button>

            {/* Auth section */}
            <div className="hidden lg:flex items-center gap-1.5">
              {isAuthenticated ? (
                <>
                  <Link to={dashboardPath}>
                    <Button variant="ghost" size="sm" className="text-gray-200 hover:text-white hover:bg-white/10 gap-1.5 font-bold text-xs h-9 px-3">
                      {isAdmin ? <ShieldCheck className="w-3.5 h-3.5 text-purple-400" /> : <User className="w-3.5 h-3.5 text-emerald-400" />}
                      {dashboardLabel}
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    onClick={handleLogout}
                    variant="outline"
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 font-bold text-xs h-9 px-3"
                  >
                    <LogOut className="w-3.5 h-3.5 mr-1" />
                    {t('nav.logout') || 'Logout'}
                  </Button>
                </>
              ) : (
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="text-gray-200 hover:text-white hover:bg-white/10 font-bold text-xs h-9 px-3">
                    {t('nav.login') || 'Sign In'}
                  </Button>
                </Link>
              )}

              <Link to="/courses">
                <Button size="sm" className="bg-[#009688] hover:bg-[#00796b] text-white shadow-md font-extrabold rounded-lg px-4 h-9 text-xs">
                  {t('nav.startLearning') || 'Browse Courses'}
                </Button>
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" />
          <div
            className={cn(
              'absolute top-0 bottom-0 w-[300px] max-w-[85vw] bg-[#112d27] text-white shadow-2xl overflow-y-auto pt-16 pb-6 px-4 flex flex-col justify-between',
              isRTL ? 'left-0' : 'right-0'
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-2">
              <div className="text-xs font-bold text-emerald-400 px-3 mb-2 uppercase tracking-wider">
                {lang === 'ar' ? 'القائمة الرئيسية' : 'Main Menu'}
              </div>
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={(e) => handleNavClick(e, link)}
                  className={cn(
                    'block px-4 py-3 rounded-xl text-xs font-bold transition-colors',
                    location.pathname === link.to
                      ? 'bg-[#009688] text-white shadow-sm'
                      : 'text-gray-200 hover:bg-white/10'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* أزرار تسجيل الدخول وحساب المستخدم المتجاوبة في الهاتف */}
            <div className="pt-4 border-t border-white/10 space-y-2.5">
              {isAuthenticated ? (
                <>
                  <Link to={dashboardPath} className="block w-full">
                    <Button variant="outline" className="w-full justify-center border-white/20 bg-white/5 text-white hover:bg-white/10 font-bold gap-2 text-xs h-11 rounded-xl shadow-sm">
                      {isAdmin ? <ShieldCheck className="w-4 h-4 text-purple-400" /> : <User className="w-4 h-4 text-emerald-400" />}
                      <span className="truncate">{dashboardLabel}</span>
                    </Button>
                  </Link>
                  <Button onClick={handleLogout} variant="outline" className="w-full justify-center border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 font-bold text-xs h-11 rounded-xl shadow-sm">
                    <LogOut className="w-4 h-4 mr-2 shrink-0" />
                    <span>{t('nav.logout') || 'Logout'}</span>
                  </Button>
                </>
              ) : (
                <Link to="/login" className="block w-full">
                  <Button variant="outline" className="w-full justify-center border-white/20 bg-white/10 text-white hover:bg-white/20 font-bold text-xs h-11 rounded-xl shadow-sm">
                    <span>{t('nav.login') || 'Sign In'}</span>
                  </Button>
                </Link>
              )}
              
              <Link to="/courses" className="block w-full">
                <Button className="w-full justify-center bg-[#009688] hover:bg-[#00796b] text-white font-extrabold rounded-xl h-11 text-xs shadow-md">
                  <span>{t('nav.startLearning') || 'Browse Courses'}</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}