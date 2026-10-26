import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, Clock, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/useI18n';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Fallback notifications dataset
const DEFAULT_NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: 'Welcome to Noor Pro Academy!',
    title_ar: 'أهلاً بك في أكاديمية نور برو!',
    message: 'Your account is active. Start exploring your enrolled courses today.',
    message_ar: 'حسابك نشط الآن. ابدأ باستكشاف دوراتك التعليمية اليوم.',
    read: false,
    created_date: '10 mins ago',
  },
  {
    id: 'notif-2',
    title: 'Grammar Assessment Quiz Available',
    title_ar: 'اختبار تقييم القواعد متاح الآن',
    message: 'Test your English proficiency with the newly published assessment quiz.',
    message_ar: 'اختبر مستواك في اللغة الإنجليزية من خلال اختبار التقييم الجديد.',
    read: false,
    created_date: '2 hours ago',
  },
  {
    id: 'notif-3',
    title: 'Course Completed',
    title_ar: 'تم إكمال الدورة بنجاح',
    message: 'Congratulations! You completed "Foundational English for Beginners".',
    message_ar: 'تهانينا! لقد أكملت دورة "اللغة الإنجليزية الأساسية للمبتدئين".',
    read: true,
    created_date: 'Yesterday',
  },
];

export default function Notifications() {
  const { lang } = useI18n();
  const isAr = lang === 'ar';
  const { user } = useAuth();

  const [notifications, setNotifications] = useState(DEFAULT_NOTIFICATIONS);
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (!user) return;
    base44.entities.Notification.filter({ user_id: user.id }, '-created_date', 50)
      .then((res) => {
        if (res && res.length > 0) setNotifications(res);
      })
      .catch(() => null)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [user]);

  const markRead = async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    try {
      await base44.entities.Notification.update(id, { read: true });
    } catch {}
  };

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await Promise.all(
        notifications
          .filter((n) => !n.read)
          .map((n) => base44.entities.Notification.update(n.id, { read: true }))
      );
    } catch {}
  };

  if (loading) {
    return <div className="h-64 rounded-2xl bg-gray-50 animate-pulse" />;
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className={`space-y-6 ${isAr ? 'dir-rtl' : 'dir-ltr'}`}>
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#112d27] flex items-center gap-2">
            {isAr ? 'التنبيهات' : 'Notifications'}
            {unreadCount > 0 && (
              <span className="text-xs font-extrabold bg-[#009688] text-white px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            {isAr
              ? 'تتبع آخر التحديثات والإشعارات الخاصة بحسابك ودوراتك.'
              : 'Stay updated with your latest account activity and course announcements.'}
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            size="sm"
            variant="outline"
            onClick={markAllRead}
            className="border-gray-200 text-[#112d27] hover:bg-[#009688]/10 hover:text-[#009688] font-bold text-xs gap-1.5 rounded-xl h-9"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            {isAr ? 'تحديد الكل كمقروء' : 'Mark all as read'}
          </Button>
        )}
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium text-xs">
            {isAr ? 'لا توجد تنبيهات حالياً.' : 'No notifications available right now.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => {
            const title = isAr ? n.title_ar || n.title : n.title;
            const message = isAr ? n.message_ar || n.message : n.message;

            return (
              <div
                key={n.id}
                className={cn(
                  'flex items-start justify-between gap-4 p-4 rounded-2xl border transition-all duration-200',
                  n.read
                    ? 'bg-white border-gray-100'
                    : 'bg-[#e3f6f3]/60 border-[#009688]/20 shadow-sm'
                )}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div
                    className={cn(
                      'shrink-0 w-10 h-10 rounded-xl flex items-center justify-center',
                      n.read
                        ? 'bg-gray-100 text-gray-400'
                        : 'bg-[#009688]/10 text-[#009688]'
                    )}
                  >
                    <Bell className="w-4 h-4" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3
                        className={cn(
                          'text-xs sm:text-sm font-bold',
                          n.read ? 'text-gray-700' : 'text-[#112d27]'
                        )}
                      >
                        {title}
                      </h3>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-[#009688] shrink-0" />
                      )}
                    </div>

                    <p className="text-xs text-gray-500 font-medium leading-relaxed">
                      {message}
                    </p>

                    {n.created_date && (
                      <p className="text-[10px] text-gray-400 font-semibold flex items-center gap-1 pt-0.5">
                        <Clock className="w-3 h-3" />
                        {n.created_date}
                      </p>
                    )}
                  </div>
                </div>

                {!n.read && (
                  <Button
                    onClick={() => markRead(n.id)}
                    size="sm"
                    variant="ghost"
                    className="text-xs text-[#009688] font-bold hover:bg-[#009688]/10 rounded-lg h-8 px-2 shrink-0 gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{isAr ? 'تم القراءة' : 'Mark Read'}</span>
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}