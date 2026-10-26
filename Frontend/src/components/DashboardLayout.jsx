import { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, BookOpen, Award, Bell, User, 
  Settings, LogOut, Menu, X, GraduationCap, Globe 
} from 'lucide-react';
import { useI18n } from '@/lib/useI18n';
import { useAuth } from '@/lib/AuthContext';
import { cn } from '@/lib/utils';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function DashboardLayout() {
  const { t, isRTL, lang } = useI18n(); 
  const isAr = lang === 'ar';
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { icon: LayoutDashboard, label: t('dashboard.overview') || 'Overview', to: '/dashboard' },
    { icon: BookOpen, label: t('dashboard.myCourses') || 'My Courses', to: '/dashboard/courses' },
    { icon: GraduationCap, label: t('dashboard.continueLearning') || 'Learning Portal', to: '/learning' },
    { icon: Award, label: t('dashboard.certificates') || 'My Certificates', to: '/dashboard/certificates' },
    { icon: Bell, label: t('dashboard.notifications') || 'Notifications', to: '/dashboard/notifications' },
    { icon: User, label: t('dashboard.profile') || 'My Profile', to: '/profile' },
    { icon: Settings, label: t('dashboard.settings') || 'Settings', to: '/settings' },
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

  const isActive = (path) => location.pathname === path;

  // 1. Get logged in student's name dynamically from AuthContext or localStorage
  const studentName = user?.full_name || user?.name || user?.email?.split('@')[0] || 'Student';

  // 2. Extract first letter for the circular avatar
  const studentInitial = studentName.charAt(0).toUpperCase();

  return (
    <div className={`min-h-screen bg-[#f8fcfb] flex ${isRTL ? 'dir-rtl' : 'dir-ltr'}`}>
      
      {/* Desktop Student Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#112d27] text-white fixed inset-y-0 z-30 justify-between p-4 shadow-xl">
        <div className="space-y-6">
          
          {/* Dynamic Student Header Card */}
          <div className="flex items-center gap-3 px-2 py-3 border-b border-white/10">
            <div className="w-10 h-10 rounded-full bg-[#009688] flex items-center justify-center font-black text-white text-lg shadow-md shrink-0">
              {studentInitial}
            </div>
            <div className="overflow-hidden">
              <h1 className="font-extrabold text-sm tracking-wide text-white truncate">
                {studentName}
              </h1>
              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                {t('dashboard.welcome') || 'STUDENT PORTAL'}
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.to);

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    'flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-200',
                    active
                      ? 'bg-[#009688] text-white shadow-lg shadow-[#009688]/30 border border-white/20'
                      : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions: Go Back to Website & Logout */}
        <div className="space-y-2 pt-4 border-t border-white/10">
          <Link
            to="/"
            className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-bold text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
          >
            <Globe className="w-4 h-4 shrink-0 text-[#009688]" />
            <span>{isAr ? 'العودة للموقع' : 'Back to Website'}</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-bold text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>{t('dashboard.logout') || 'Logout'}</span>
          </button>
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
            <div className="space-y-6">
              
              {/* Mobile Header with Logged-in Student Name */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-9 h-9 rounded-full bg-[#009688] flex items-center justify-center font-bold text-white text-base shrink-0">
                    {studentInitial}
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-extrabold text-xs text-white truncate">
                      {studentName}
                    </p>
                    <p className="text-[9px] text-emerald-400 font-bold uppercase">
                      Student Portal
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

              {/* Mobile Links */}
              <nav className="space-y-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.to);

                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        'flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all',
                        active
                          ? 'bg-[#009688] text-white shadow-md border border-white/20'
                          : 'text-gray-300 hover:bg-white/5 hover:text-white'
                      )}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Mobile Footer Actions */}
            <div className="space-y-2 pt-4 border-t border-white/10">
              <Link
                to="/"
                onClick={() => setSidebarOpen(false)}
                className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-bold text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
              >
                <Globe className="w-4 h-4 shrink-0 text-[#009688]" />
                <span>{isAr ? 'العودة للموقع' : 'Back to Website'}</span>
              </Link>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-bold text-red-400 hover:bg-red-500/10"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span>{t('dashboard.logout') || 'Logout'}</span>
              </button>
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
            Noor Academy
          </span>

          <div className="w-8 h-8 rounded-full bg-[#009688]/10 text-[#009688] flex items-center justify-center font-bold text-xs">
            {studentInitial}
          </div>
        </div>

        {/* Dynamic Page Content */}
        <div className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>

      </div>

    </div>
  );
}