import React, { useState } from 'react';
import { Globe, Bell, Shield, Check } from 'lucide-react';
import { useI18n } from '@/lib/useI18n';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

export default function Settings() {
  const { t, lang, toggleLang } = useI18n();
  const isAr = lang === 'ar';
  const { user } = useAuth();

  const [emailNotifs, setEmailNotifs] = useState(true);
  const [courseNotifs, setCourseNotifs] = useState(true);

  const handleToggleNotif = (type) => {
    if (type === 'email') {
      setEmailNotifs(!emailNotifs);
    } else {
      setCourseNotifs(!courseNotifs);
    }
    toast({
      title: isAr ? 'تم تحديث التفضيلات' : 'Preferences Updated',
      description: isAr ? 'تم حفظ إعدادات الإشعارات بنجاح.' : 'Your notification preferences have been saved.',
    });
  };

  return (
    <div className={`space-y-6 ${isAr ? 'dir-rtl' : 'dir-ltr'}`}>
      
      {/* Header */}
      <div className="pb-3 border-b border-gray-100">
        <h1 className="text-xl sm:text-2xl font-bold text-[#112d27]">
          {isAr ? 'الإعدادات' : 'Settings'}
        </h1>
        <p className="text-xs text-gray-500 font-medium mt-0.5">
          {isAr
            ? 'إدارة تفضيلات الواجهة وتنبيهات الحساب'
            : 'Manage your app preferences and notification settings'}
        </p>
      </div>

      {/* Interface Language */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-10 h-10 rounded-xl bg-[#009688]/10 flex items-center justify-center shrink-0">
            <Globe className="w-5 h-5 text-[#009688]" />
          </div>
          <div>
            <h2 className="font-bold text-[#112d27] text-sm sm:text-base">
              {isAr ? 'لغة الواجهة' : 'Interface Language'}
            </h2>
            <p className="text-xs text-gray-400 font-medium mt-0.5">
              {isAr ? 'اختر اللغة المفضلة لعرض التطبيق' : 'Switch between English and Arabic'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 max-w-sm">
          <Button
            variant={lang === 'en' ? 'default' : 'outline'}
            onClick={() => lang !== 'en' && toggleLang()}
            className={cn(
              'h-11 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all',
              lang === 'en'
                ? 'bg-[#009688] hover:bg-[#00796b] text-white shadow-md shadow-[#009688]/15'
                : 'border-gray-200 text-gray-700 hover:bg-gray-50'
            )}
          >
            <span>English</span>
            {lang === 'en' && <Check className="w-4 h-4" />}
          </Button>

          <Button
            variant={lang === 'ar' ? 'default' : 'outline'}
            onClick={() => lang !== 'ar' && toggleLang()}
            className={cn(
              'h-11 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all',
              lang === 'ar'
                ? 'bg-[#009688] hover:bg-[#00796b] text-white shadow-md shadow-[#009688]/15'
                : 'border-gray-200 text-gray-700 hover:bg-gray-50'
            )}
          >
            <span>العربية</span>
            {lang === 'ar' && <Check className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Notifications Preferences */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-10 h-10 rounded-xl bg-[#009688]/10 flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5 text-[#009688]" />
          </div>
          <div>
            <h2 className="font-bold text-[#112d27] text-sm sm:text-base">
              {isAr ? 'إشعارات الحساب' : 'Notification Settings'}
            </h2>
            <p className="text-xs text-gray-400 font-medium mt-0.5">
              {isAr ? 'تخصيص الرسائل والتنبيهات المستلمة' : 'Control how you receive updates and alerts'}
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs sm:text-sm">
          {/* Email Updates */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#f8fcfb] border border-gray-100">
            <div>
              <div className="font-bold text-[#112d27]">
                {isAr ? 'إشعارات البريد الإلكتروني' : 'Email Notifications'}
              </div>
              <div className="text-gray-400 text-xs font-medium mt-0.5">
                {isAr ? 'استلام تحديثات الدورات والإعلانات الهامة' : 'Receive course updates and important announcements'}
              </div>
            </div>
            <button
              onClick={() => handleToggleNotif('email')}
              className={cn(
                'w-11 h-6 rounded-full transition-colors p-0.5 shrink-0 flex items-center',
                emailNotifs ? 'bg-[#009688]' : 'bg-gray-200'
              )}
            >
              <div
                className={cn(
                  'w-5 h-5 rounded-full bg-white shadow-sm transition-transform',
                  emailNotifs ? (isAr ? '-translate-x-5' : 'translate-x-5') : 'translate-x-0'
                )}
              />
            </button>
          </div>

          {/* Course Progress Updates */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#f8fcfb] border border-gray-100">
            <div>
              <div className="font-bold text-[#112d27]">
                {isAr ? 'تحديثات تقدم الدورات' : 'Course Progress Reminders'}
              </div>
              <div className="text-gray-400 text-xs font-medium mt-0.5">
                {isAr ? 'تنبيهات عند إكمال الدروس والحصول على الشهادات' : 'Alerts when completing lessons and receiving certificates'}
              </div>
            </div>
            <button
              onClick={() => handleToggleNotif('course')}
              className={cn(
                'w-11 h-6 rounded-full transition-colors p-0.5 shrink-0 flex items-center',
                courseNotifs ? 'bg-[#009688]' : 'bg-gray-200'
              )}
            >
              <div
                className={cn(
                  'w-5 h-5 rounded-full bg-white shadow-sm transition-transform',
                  courseNotifs ? (isAr ? '-translate-x-5' : 'translate-x-5') : 'translate-x-0'
                )}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Account Info */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h2 className="font-bold text-[#112d27] text-sm sm:text-base">
              {isAr ? 'معلومات الحساب' : 'Account Overview'}
            </h2>
            <p className="text-xs text-gray-400 font-medium mt-0.5">
              {isAr ? 'بيانات الاعتماد المسجلة في أكاديمية نور برو' : 'Your credentials registered with Noor Pro Academy'}
            </p>
          </div>
        </div>

        <div className="space-y-2.5 text-xs sm:text-sm font-medium">
          <div className="flex justify-between items-center py-2.5 border-b border-gray-100">
            <span className="text-gray-400">{isAr ? 'البريد الإلكتروني:' : 'Email Address:'}</span>
            <span className="font-bold text-[#112d27]">{user?.email || 'muyser@gmail.com'}</span>
          </div>

          <div className="flex justify-between items-center py-2.5 border-b border-gray-100">
            <span className="text-gray-400">{isAr ? 'نوع الحساب:' : 'Account Role:'}</span>
            <span className="font-extrabold text-[#009688] bg-[#009688]/10 px-2.5 py-0.5 rounded-md capitalize">
              {user?.role || 'Student'}
            </span>
          </div>

          <div className="flex justify-between items-center py-2.5">
            <span className="text-gray-400">{isAr ? 'عضو منذ:' : 'Member Since:'}</span>
            <span className="font-bold text-[#112d27]">
              {user?.created_date ? user.created_date.split('T')[0] : '2026-10-01'}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}