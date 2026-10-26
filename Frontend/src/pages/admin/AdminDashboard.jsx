import { useState, useEffect } from 'react';
import { useI18n } from '@/lib/useI18n';
import { 
  Users, BookOpen, Award, TrendingUp, 
  Clock, CheckCircle2 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function AdminDashboard() {
  const { t, lang } = useI18n();
  const isAr = lang === 'ar';

  const [stats, setStats] = useState({
    students: 0,
    courses: 0,
    enrollments: 0,
    certificates: 0,
  });
  const [recentEnrollments, setRecentEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch stats and recent enrollments from real backend API
  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token') || '';
      const res = await fetch(`${API_URL}/api/enrollments/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load dashboard statistics');

      if (data.stats) setStats(data.stats);
      if (data.recentEnrollments) {
        const formatted = data.recentEnrollments.map((enr) => ({
          id: enr._id,
          student_name: enr.student?.full_name || enr.student?.name || enr.student?.email || 'Student User',
          course_title: enr.course?.title || 'Course Title',
          course_title_ar: enr.course?.title_ar || enr.course?.title || '',
          enrolled_date: enr.enrolled_date || new Date().toISOString(),
          status: enr.status || 'active',
        }));
        setRecentEnrollments(formatted);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard stats', err);
      toast({
        title: isAr ? 'خطأ' : 'Error',
        description: isAr ? 'فشل تحميل إحصائيات لوحة التحكم' : 'Failed to load dashboard overview stats',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const cards = [
    {
      icon: Users,
      label: isAr ? 'إجمالي الطلاب' : t('admin.totalStudents') || 'Total Students',
      value: stats.students,
      color: 'text-[#009688]',
      bg: 'bg-[#009688]/10',
    },
    {
      icon: BookOpen,
      label: isAr ? 'إجمالي الدورات' : t('admin.totalCourses') || 'Total Courses',
      value: stats.courses,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
    {
      icon: TrendingUp,
      label: isAr ? 'إجمالي التسجيلات' : t('admin.totalEnrollments') || 'Total Enrollments',
      value: stats.enrollments,
      color: 'text-[#009688]',
      bg: 'bg-[#009688]/10',
    },
    {
      icon: Award,
      label: isAr ? 'إجمالي الشهادات' : t('admin.totalCertificates') || 'Total Certificates',
      value: stats.certificates,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
  ];

  return (
    <div className={`max-w-6xl mx-auto space-y-6 px-3 sm:px-0 ${isAr ? 'dir-rtl' : 'dir-ltr'}`}>
      
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 p-5 sm:p-6 shadow-sm">
        <h1 className="text-xl sm:text-2xl font-bold text-[#112d27] tracking-tight">
          {isAr ? 'مرحباً بك في لوحة الإدارة' : t('admin.welcome') || 'Welcome Back, Admin'}
        </h1>
        <p className="text-xs sm:text-sm font-normal text-gray-500 mt-1">
          {isAr ? 'نظرة عامة على أداء منصة أكاديمية نور برو ومتابعة نشاط الطلاب.' : t('admin.welcomeDesc') || 'Overview of Noor Pro Academy performance and student activity.'}
        </p>
      </div>

      {/* Stats Cards (Fully Responsive Grid) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {cards.map((card, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all"
          >
            <div className={cn('w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center mb-3', card.bg)}>
              <card.icon className={cn('w-4 h-4 sm:w-5 sm:h-5', card.color)} />
            </div>
            {loading ? (
              <div className="h-7 w-12 bg-gray-100 rounded animate-pulse" />
            ) : (
              <div className="text-xl sm:text-2xl font-bold text-[#112d27]">{card.value}</div>
            )}
            <div className="text-[11px] sm:text-xs font-normal text-gray-500 mt-0.5 truncate">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Enrollments Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 p-4 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-50">
          <h2 className="font-bold text-[#112d27] text-sm sm:text-base">
            {isAr ? 'أحدث التسجيلات' : t('admin.recentEnrollments') || 'Recent Enrollments'}
          </h2>
          <span className="text-xs text-[#009688] font-bold">
            {recentEnrollments.length} {isAr ? 'حديثة' : 'recent'}
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center">
            <div className="w-6 h-6 border-2 border-[#009688] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : recentEnrollments.length === 0 ? (
          <p className="text-xs text-gray-400 font-normal py-6 text-center">
            {isAr ? 'لا توجد بيانات متاحة حالياً.' : t('admin.noData') || 'No recent enrollments available.'}
          </p>
        ) : (
          <div className="space-y-2.5">
            {recentEnrollments.map((enr) => {
              const courseTitle = isAr ? enr.course_title_ar || enr.course_title : enr.course_title;
              const isCompleted = enr.status === 'completed';

              return (
                <div
                  key={enr.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 sm:p-3.5 rounded-xl bg-[#f8fcfb] border border-gray-100"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-[#112d27] text-xs sm:text-sm truncate">
                      {enr.student_name || 'Student'}
                    </div>
                    <div className="text-[11px] sm:text-xs text-gray-500 font-normal truncate mt-0.5">
                      {courseTitle}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-1 sm:pt-0 border-t sm:border-0 border-gray-100">
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1',
                        isCompleted
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-[#009688]/10 text-[#009688]'
                      )}
                    >
                      {isCompleted ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {isCompleted ? (isAr ? 'مكتمل' : 'Completed') : (isAr ? 'نشط' : 'Active')}
                    </span>

                    <span className="text-[10px] sm:text-[11px] font-normal text-gray-400">
                      {enr.enrolled_date ? enr.enrolled_date.split('T')[0] : '—'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}