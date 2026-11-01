import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import CountUp from '@/components/CountUp';
import { useI18n } from '@/lib/useI18n';

const DEFAULT_STATS = [
  { id: '1', value: 24, label: 'Specialized Lessons', label_ar: 'دروس متخصصة', icon: '📖' },
  { id: '2', value: 1200, label: 'Learning Activities', label_ar: 'أنشطة تعليمية', icon: '📝' },
  { id: '3', value: 40, label: 'Interactive Courses', label_ar: 'دورات تفاعلية', icon: '🎯' },
  { id: '4', value: 6, label: 'Language Programs', label_ar: 'برامج لغوية', icon: '🌍' },
];

export default function Stats() {
  const { lang } = useI18n();
  const [stats, setStats] = useState(DEFAULT_STATS);

  useEffect(() => {
    base44.entities.Statistic.list('order', 10)
      .then((data) => {
        if (data && data.length > 0) {
          setStats(data);
        }
      })
      .catch(() => {
        // Keeps default stats on API error
      });
  }, []);

  return (
    <section className="py-8 bg-[#f2faf8] dir-rtl">
      <div className="container-page mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Exact Pill Card Container matching the uploaded image */}
        <div className="relative overflow-hidden bg-white/95 backdrop-blur-md rounded-3xl border border-gray-100/80 shadow-[0_10px_30px_rgba(0,0,0,0.03)] p-6 sm:p-8">
          
          {/* Subtle Ambient Glow moved to bottom-right only to prevent text fading */}
          <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-[#e8f7f4] rounded-full blur-3xl pointer-events-none opacity-40" />

          {/* grid-cols-2 on small screens, lg:grid-cols-4 on large screens */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 items-center relative z-10">
            {stats.map((stat, index) => (
              <div
                key={stat.id || index}
                className="flex items-center justify-center gap-3 sm:gap-4 px-1 sm:px-2"
              >
                {/* Number & Label */}
                <div className="flex flex-col items-end">
                  <div className="text-xl sm:text-3xl font-extrabold text-[#112d27] tracking-tight">
                    <CountUp end={stat.value} prefix="+" />
                  </div>
                  <div className="text-[11px] sm:text-sm font-medium text-gray-700 mt-1 text-right">
                    {lang === 'ar' ? stat.label_ar || stat.label : stat.label}
                  </div>
                </div>

                {/* Mint Rounded Icon Container */}
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#e3f6f3] flex items-center justify-center text-[#009688] text-sm sm:text-base shadow-sm font-semibold shrink-0">
                  {stat.icon || '✨'}
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}