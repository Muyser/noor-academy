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
        // Format populated fields for seamless rendering
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
    <div className={`space-y-6 ${isAr ? 'dir-rtl' : 'dir-ltr'}`}>
      
      {/* Welcome Banner */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#112d27]">
          {isAr ? 'مرحباً بك في لوحة الإدارة' : t('admin.welcome') || 'Welcome Back, Admin'}
        </h1>
        <p className="text-xs sm:text-sm font-medium text-gray-500 mt-1">
          {isAr ? 'نظرة عامة على أداء منصة أكاديمية نور برو ومتابعة نشاط الطلاب.' : t('admin.welcomeDesc') || 'Overview of Noor Pro Academy performance and student activity.'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all"
          >
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', card.bg)}>
              <card.icon className={cn('w-5 h-5', card.color)} />
            </div>
            {loading ? (
              <div className="h-7 w-12 bg-gray-100 rounded animate-pulse" />
            ) : (
              <div className="text-2xl font-extrabold text-[#112d27]">{card.value}</div>
            )}
            <div className="text-xs font-semibold text-gray-500 mt-0.5">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Enrollments Card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-extrabold text-[#112d27] text-base">
            {isAr ? 'أحدث التسجيلات' : t('admin.recentEnrollments') || 'Recent Enrollments'}
          </h2>
          <span className="text-xs text-[#009688] font-bold">
            {recentEnrollments.length} {isAr ? 'تسجيلات حديثة' : 'recent'}
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center">
            <div className="w-6 h-6 border-2 border-[#009688] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : recentEnrollments.length === 0 ? (
          <p className="text-xs text-gray-400 font-medium py-6 text-center">
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
                  className="flex items-center justify-between p-3.5 rounded-xl bg-[#f8fcfb] border border-gray-100"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-[#112d27] text-xs sm:text-sm truncate">
                      {enr.student_name || 'Student'}
                    </div>
                    <div className="text-xs text-gray-400 font-medium truncate mt-0.5">
                      {courseTitle}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 ms-3">
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded-md text-[10px] font-extrabold flex items-center gap-1',
                        isCompleted
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-[#009688]/10 text-[#009688]'
                      )}
                    >
                      {isCompleted ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {isCompleted ? (isAr ? 'مكتمل' : 'Completed') : (isAr ? 'نشط' : 'Active')}
                    </span>

                    <span className="text-[11px] font-semibold text-gray-400 hidden sm:inline">
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