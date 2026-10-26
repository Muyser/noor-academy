import { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, BookOpen, Users, GraduationCap, Globe, 
  FileText, HelpCircle, BarChart3, LogOut, Menu, X, Settings, 
  Award, Image, ArrowLeft, ArrowRight, ExternalLink, ReceiptText 
} from 'lucide-react';
import { useI18n } from '@/lib/useI18n';
import { useAuth } from '@/lib/AuthContext';
import { cn } from '@/lib/utils';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function AdminLayout() {
  const { t, isRTL, lang } = useI18n();
  const isAr = lang === 'ar';
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { icon: LayoutDashboard, label: t('admin.overview') || (isAr ? 'لوحة التحكم' : 'Overview'), to: '/admin' },
    { icon: ReceiptText, label: isAr ? 'إيصالات الدفع' : 'Bank Receipts', to: '/admin/enrollments' },
    { icon: Users, label: t('admin.students') || (isAr ? 'الطلاب' : 'Students'), to: '/admin/students' },
    { icon: GraduationCap, label: t('admin.instructors') || (isAr ? 'المحاضرون' : 'Instructors'), to: '/admin/instructors' },
    { icon: BookOpen, label: t('admin.courses') || (isAr ? 'الدورات' : 'Courses'), to: '/admin/courses' },
    { icon: Award, label: t('admin.certificates') || (isAr ? 'الشهادات' : 'Certificates'), to: '/admin/certificates' },
    { icon: Globe, label: t('admin.languages') || (isAr ? 'اللغات' : 'Languages'), to: '/admin/languages' },
    { icon: FileText, label: t('admin.blog') || (isAr ? 'المدونة' : 'Blog'), to: '/admin/blog' },
    { icon: HelpCircle, label: t('admin.faq') || (isAr ? 'الأسئلة الشائعة' : 'FAQ'), to: '/admin/faq' },
    { icon: Image, label: t('admin.gallery') || (isAr ? 'معرض الصور' : 'Gallery'), to: '/admin/gallery' }, 
    { icon: BarChart3, label: t('admin.statistics') || (isAr ? 'الإحصائيات' : 'Statistics'), to: '/admin/statistics' },
    { icon: Settings, label: t('admin.settings') || (isAr ? 'الإعدادات' : 'Settings'), to: '/admin/settings' },
  ];

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
      // Clear all local auth storage keys
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

  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  return (
    <div className={`min-h-screen bg-[#f8fcfb] flex ${isRTL ? 'dir-rtl' : 'dir-ltr'}`}>
      
      {/* Desktop Admin Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#112d27] text-white fixed inset-y-0 z-30 justify-between p-4 shadow-xl">
        <div className="flex flex-col h-full min-h-0">
          
          {/* Admin Header Branding */}
          <div className="flex items-center gap-3 px-2 py-3 pb-4 border-b border-white/10 shrink-0">
            <div className="w-10 h-10 rounded-2xl bg-[#009688] flex items-center justify-center font-black text-white text-lg shadow-md shrink-0">
              N
            </div>
            <div className="overflow-hidden">
              <h1 className="font-extrabold text-sm tracking-wide text-white truncate">
                NOOR PRO
              </h1>
              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">
                ADMIN PANEL
              </p>
            </div>
          </div>

          {/* Scrollable Navigation Links */}
          <nav className="flex-1 overflow-y-auto space-y-1.5 my-4 pe-1 scrollbar-thin scrollbar-thumb-white/10">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.to);

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    'flex items-center gap-3.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200',
                    active
                      ? 'bg-[#009688] text-white shadow-lg shadow-[#009688]/30 border border-white/20'
                      : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Admin Footer Controls */}
          <div className="pt-3 border-t border-white/10 space-y-1 shrink-0">
            {/* Return to Website Button */}
            <Link
              to="/"
              className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-2xl text-xs font-bold text-emerald-300 hover:bg-emerald-500/10 hover:text-emerald-200 transition-colors"
            >
              <BackIcon className="w-4 h-4 shrink-0" />
              <span>{isAr ? 'العودة للموقع الرئيسي' : 'Back to Website'}</span>
            </Link>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-2xl text-xs font-bold text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>{t('dashboard.logout') || (isAr ? 'تسجيل الخروج' : 'Logout')}</span>
            </button>
          </div>

        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity" 
          onClick={() => setSidebarOpen(false)}
        >
          <div 
            className={cn(
              'absolute top-0 bottom-0 w-64 bg-[#112d27] text-white p-4 flex flex-col justify-between shadow-2xl transition-transform duration-300',
              isRTL ? 'right-0' : 'left-0'
            )} 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col h-full min-h-0">
              
              {/* Mobile Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-[#009688] flex items-center justify-center font-bold text-white text-base shrink-0">
                    N
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-extrabold text-xs text-white truncate">
                      NOOR PRO
                    </p>
                    <p className="text-[9px] text-emerald-400 font-bold uppercase">
                      Admin Panel
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => setSidebarOpen(false)} 
                  className="p-1.5 rounded-xl hover:bg-white/10 text-gray-300 hover:text-white shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Scrollable Links */}
              <nav className="flex-1 overflow-y-auto space-y-1.5 my-4 pe-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.to);

                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        'flex items-center gap-3.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all',
                        active
                          ? 'bg-[#009688] text-white shadow-md border border-white/20'
                          : 'text-gray-300 hover:bg-white/5 hover:text-white'
                      )}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Mobile Footer Controls */}
              <div className="pt-3 border-t border-white/10 space-y-1 shrink-0">
                <Link
                  to="/"
                  onClick={() => setSidebarOpen(false)}
                  className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-2xl text-xs font-bold text-emerald-300 hover:bg-emerald-500/10 transition-colors"
                >
                  <BackIcon className="w-4 h-4 shrink-0" />
                  <span>{isAr ? 'العودة للموقع الرئيسي' : 'Back to Website'}</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-2xl text-xs font-bold text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  <span>{t('dashboard.logout') || (isAr ? 'تسجيل الخروج' : 'Logout')}</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 lg:ms-64 w-full min-w-0">
        
        {/* Mobile Header Bar */}
        <div className="lg:hidden sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 py-3.5 flex items-center justify-between z-20 shadow-xs">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            className="p-2 rounded-xl bg-gray-50 text-[#112d27] hover:bg-[#009688]/10 transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <span className="font-extrabold text-[#112d27] text-sm tracking-wide">
            Noor Pro Admin
          </span>

          <Link to="/" className="p-2 rounded-xl bg-gray-50 text-[#009688] hover:bg-[#009688]/10">
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>

        {/* Dynamic Page Content */}
        <div className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>

      </div>

    </div>
  );
}