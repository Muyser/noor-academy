import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Award, ArrowRight, Loader2, Hourglass } from 'lucide-react';
import { useI18n } from '@/lib/useI18n';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function Dashboard() {
  const { lang, isRTL } = useI18n();
  const isAr = lang === 'ar';
  const { user } = useAuth();

  const [enrollments, setEnrollments] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token') || '';
        const res = await fetch(`${API_URL}/api/dashboard/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error('Failed to fetch dashboard stats');
        const data = await res.json();

        if (data) {
          if (Array.isArray(data.enrollments)) setEnrollments(data.enrollments);
          if (Array.isArray(data.certificates)) setCertificates(data.certificates);
        }
      } catch (err) {
        console.error('Failed to load student dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const activeCourses = enrollments.filter((e) => e.status === 'active');
  const completedCourses = enrollments.filter((e) => e.status === 'completed');
  const pendingCourses = enrollments.filter((e) => e.status === 'pending_approval');
  
  const totalLessons = enrollments.reduce((sum, e) => sum + (e.completed_lessons || 0), 0);

  const stats = [
    { 
      icon: BookOpen, 
      label: isAr ? 'الدورات النشطة' : 'Active Courses', 
      value: activeCourses.length, 
      color: 'text-[#009688]', 
      bg: 'bg-[#009688]/10' 
    },
    { 
      icon: Award, 
      label: isAr ? 'الدورات المكتملة' : 'Completed Courses', 
      value: completedCourses.length, 
      color: 'text-amber-500', 
      bg: 'bg-amber-500/10' 
    },
    { 
      icon: Hourglass, 
      label: isAr ? 'قيد المراجعة' : 'Pending Approvals', 
      value: pendingCourses.length, 
      color: 'text-blue-500', 
      bg: 'bg-blue-500/10' 
    },
  ];

  return (
    <div className={`space-y-6 ${isAr ? 'dir-rtl' : 'dir-ltr'}`}>
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#009688] to-[#00796b] rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-[#009688]/20 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block px-3 py-1 rounded-lg bg-white/20 backdrop-blur-md text-xs font-bold text-white mb-2">
            {isAr ? 'لوحة التحكم' : 'STUDENT DASHBOARD'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {isAr ? 'مرحباً بك،' : 'Welcome back,'} {user?.full_name || user?.name || 'Student'} 👋
          </h1>
          <p className="mt-2 text-white/80 text-xs sm:text-sm font-medium leading-relaxed">
            {isAr
              ? 'واصل رحلة تعلم اللغات وتتبع تقدمك وإنجازاتك اليومية.'
              : 'Continue your language learning journey and track your progress today.'}
          </p>
        </div>
      </div>

      {/* Stats Grid (3 columns now) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', stat.bg)}>
              <stat.icon className={cn('w-5 h-5', stat.color)} />
            </div>
            <div className="text-2xl font-extrabold text-[#112d27]">{stat.value}</div>
            <div className="text-xs text-gray-500 font-medium mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Continue Learning / Active & Pending Courses */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-extrabold text-[#112d27] text-base sm:text-lg">
            {isAr ? 'متابعة التعلم والدورات المسجلة' : 'Continue Learning & Enrollments'}
          </h2>
          <Link to="/my-courses" className="text-xs sm:text-sm text-[#009688] font-bold hover:underline">
            {isAr ? 'عرض الكل' : 'View All'}
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#009688]" />
          </div>
        ) : enrollments.length === 0 ? (
          <div className="text-center py-10">
            <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm font-medium mb-4">
              {isAr ? 'لا توجد دورات مسجلة حالياً.' : 'No courses enrolled yet.'}
            </p>
            <Link to="/courses">
              <Button className="bg-[#009688] hover:bg-[#00796b] text-white font-bold rounded-xl text-xs">
                {isAr ? 'تصفح الدورات' : 'Browse Courses'}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {enrollments.slice(0, 5).map((enr) => {
              const title = isAr ? enr.course_title_ar || enr.course_title : enr.course_title;
              const isPending = enr.status === 'pending_approval';
              const isRejected = enr.status === 'rejected';
              const isCompleted = enr.status === 'completed';

              return (
                <div key={enr.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#f8fcfb] border border-gray-100">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="font-extrabold text-[#112d27] text-sm truncate">{title}</div>
                      {isPending && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold">
                          {isAr ? 'قيد المراجعة' : 'Pending'}
                        </span>
                      )}
                      {isRejected && (
                        <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-700 text-[10px] font-bold">
                          {isAr ? 'مرفوض' : 'Rejected'}
                        </span>
                      )}
                    </div>

                    {!isPending && !isRejected && (
                      <>
                        <div className="mt-2.5 h-2 rounded-full bg-gray-200 overflow-hidden max-w-md">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all duration-500',
                              isCompleted ? 'bg-amber-500' : 'bg-[#009688]'
                            )}
                            style={{ width: `${enr.progress || 0}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-400 font-semibold mt-1.5">
                          {enr.progress || 0}% {isAr ? 'مكتمل' : 'completed'}
                        </div>
                      </>
                    )}

                    {isPending && (
                      <p className="text-xs text-amber-600 font-medium mt-1">
                        {isAr ? 'إيصال الدفع قيد مراجعة الإدارة.' : 'Payment receipt is under admin review.'}
                      </p>
                    )}
                    {isRejected && (
                      <p className="text-xs text-red-600 font-medium mt-1">
                        {enr.rejection_reason || (isAr ? 'تم رفض إيصال الدفع.' : 'Payment receipt was rejected.')}
                      </p>
                    )}
                  </div>

                  {!isPending && (
                    <Link to={`/learning?course=${enr.course_id}`}>
                      <Button size="sm" className="bg-[#009688] hover:bg-[#00796b] text-white font-bold rounded-xl gap-1.5 shrink-0 w-full sm:w-auto text-xs">
                        <span>{isCompleted ? (isAr ? 'عرض الشهادة' : 'View') : (isAr ? 'متابعة' : 'Continue')}</span>
                        <ArrowRight className={cn('w-3.5 h-3.5', isRTL && 'rotate-180')} />
                      </Button>
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Certificates Section (Full Width) */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-amber-500" />
          <h2 className="font-extrabold text-[#112d27] text-base">
            {isAr ? 'الشهادات المكتسبة' : 'My Certificates'}
          </h2>
        </div>

        {loading ? (
          <div className="py-8 text-center">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#009688]" />
          </div>
        ) : certificates.length === 0 ? (
          <p className="text-xs text-gray-400 font-medium py-6 text-center">
            {isAr ? 'لم تحصل على شهادات بعد.' : 'No certificates earned yet.'}
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {certificates.map((cert) => {
              const title = isAr ? cert.course_title_ar || cert.course_title : cert.course_title;
              return (
                <div key={cert.id} className="flex items-center justify-between p-4 rounded-2xl bg-[#f8fcfb] border border-gray-100">
                  <div>
                    <div className="font-bold text-[#112d27] text-xs sm:text-sm">{title}</div>
                    <div className="text-[11px] text-gray-400 font-medium mt-0.5">{cert.certificate_number}</div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-green-50 text-[11px] font-extrabold text-green-600 border border-green-200">
                    {isAr ? 'معتمدة' : 'Valid'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}