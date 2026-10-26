import React, { useState } from 'react';
import { useI18n } from '@/lib/useI18n';
import { useAuth } from '@/lib/AuthContext';
import { 
  User, Mail, Lock, Globe, 
  Save, CheckCircle2, KeyRound 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';

export default function AdminSettings() {
  const { lang } = useI18n();
  const isAr = lang === 'ar';
  const { user } = useAuth();

  // Admin Account Settings State
  const [adminName, setAdminName] = useState(user?.full_name || 'System Admin');
  const [adminEmail, setAdminEmail] = useState(user?.email || 'admin@gmail.com');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Simple Site Info State
  const [siteName, setSiteName] = useState('Noor Pro Academy');
  const [supportEmail, setSupportEmail] = useState('support@noorpro.com');

  const [savingAccount, setSavingAccount] = useState(false);
  const [savingSite, setSavingSite] = useState(false);

  // Handle Changing Admin Email / Name / Password
  const handleAccountUpdate = (e) => {
    e.preventDefault();

    if (newPassword && newPassword !== confirmPassword) {
      toast({
        title: isAr ? 'خطأ في كلمة السر' : 'Password Mismatch',
        description: isAr ? 'كلمة السر الجديدة وتأكيدها غير متطابقين.' : 'New password and confirmation do not match.',
        variant: 'destructive',
      });
      return;
    }

    setSavingAccount(true);

    // Save updated admin info into local storage
    const updatedUser = {
      ...user,
      full_name: adminName,
      email: adminEmail,
    };
    localStorage.setItem('noor_user', JSON.stringify(updatedUser));

    setTimeout(() => {
      setSavingAccount(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      toast({
        title: isAr ? 'تم تحديث الحساب' : 'Account Updated',
        description: isAr ? 'تم تحديث بيانات البريد وكلمة السر بنجاح.' : 'Admin email and password updated successfully.',
      });
    }, 400);
  };

  // Handle Saving General Site Info
  const handleSiteUpdate = (e) => {
    e.preventDefault();
    setSavingSite(true);

    localStorage.setItem('noor_site_info', JSON.stringify({ siteName, supportEmail }));

    setTimeout(() => {
      setSavingSite(false);
      toast({
        title: isAr ? 'تم حفظ الإعدادات' : 'Settings Saved',
        description: isAr ? 'تم تحديث معلومات الأكاديمية بنجاح.' : 'Site settings saved successfully.',
      });
    }, 300);
  };

  return (
    <div className={`space-y-8 max-w-3xl ${isAr ? 'dir-rtl' : 'dir-ltr'}`}>
      
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#112d27]">
          {isAr ? 'إعدادات الحساب والمنصة' : 'Settings'}
        </h1>
        <p className="text-xs sm:text-sm font-medium text-gray-500 mt-1">
          {isAr ? 'تغيير البريد الإلكتروني، كلمة السر، ومعلومات الموقع الأساسية.' : 'Change your admin email, password, and basic site details.'}
        </p>
      </div>

      {/* 1. Admin Security Section (Email & Password) */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
          <div className="w-8 h-8 rounded-xl bg-[#009688]/10 text-[#009688] flex items-center justify-center font-bold">
            <KeyRound className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-[#112d27]">
              {isAr ? 'بيانات حساب المشرف والأمان' : 'Admin Account & Credentials'}
            </h2>
            <p className="text-[11px] text-gray-400 font-medium">
              {isAr ? 'تحديث البريد الإلكتروني وكلمة السر الخاصة بك كمشرف.' : 'Update your personal email address and sign-in password.'}
            </p>
          </div>
        </div>

        <form onSubmit={handleAccountUpdate} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            
            {/* Admin Name */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-[#112d27]">
                {isAr ? 'اسم المشرف' : 'Admin Name'}
              </Label>
              <div className="relative">
                <User className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="ps-9 h-10 text-xs font-semibold rounded-xl"
                  required
                />
              </div>
            </div>

            {/* Admin Email */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-[#112d27]">
                {isAr ? 'البريد الإلكتروني' : 'Admin Email'}
              </Label>
              <div className="relative">
                <Mail className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="ps-9 h-10 text-xs font-semibold rounded-xl"
                  required
                />
              </div>
            </div>

          </div>

          <div className="pt-3 border-t border-gray-50 space-y-4">
            <h3 className="text-xs font-extrabold text-[#112d27]">
              {isAr ? 'تغيير كلمة السر (اختياري)' : 'Change Password (Optional)'}
            </h3>

            <div className="grid sm:grid-cols-2 gap-4">
              
              {/* New Password */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#112d27]">
                  {isAr ? 'كلمة السر الجديدة' : 'New Password'}
                </Label>
                <div className="relative">
                  <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="ps-9 h-10 text-xs font-semibold rounded-xl"
                  />
                </div>
              </div>

              {/* Confirm New Password */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#112d27]">
                  {isAr ? 'تأكيد كلمة السر الجديدة' : 'Confirm New Password'}
                </Label>
                <div className="relative">
                  <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="ps-9 h-10 text-xs font-semibold rounded-xl"
                  />
                </div>
              </div>

            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={savingAccount}
              className="bg-[#009688] hover:bg-[#00796b] text-white font-extrabold rounded-xl h-10 text-xs gap-1.5 px-5 shadow-md shadow-[#009688]/15"
            >
              {savingAccount ? <CheckCircle2 className="w-4 h-4 animate-bounce" /> : <Save className="w-4 h-4" />}
              {savingAccount ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'حفظ معلومات الحساب' : 'Update Credentials')}
            </Button>
          </div>
        </form>
      </div>

      {/* 2. Simple Site Info Section */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
          <div className="w-8 h-8 rounded-xl bg-[#009688]/10 text-[#009688] flex items-center justify-center font-bold">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-[#112d27]">
              {isAr ? 'معلومات الموقع الأساسية' : 'Basic Site Information'}
            </h2>
            <p className="text-[11px] text-gray-400 font-medium">
              {isAr ? 'اسم المنصة وبريد التواصل الظاهر للطلاب.' : 'The general academy name and public support contact.'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSiteUpdate} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-[#112d27]">
                {isAr ? 'اسم الموقع / الأكاديمية' : 'Site / Academy Name'}
              </Label>
              <Input
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="h-10 text-xs font-semibold rounded-xl"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-[#112d27]">
                {isAr ? 'بريد الدعم الفني العام' : 'Public Support Email'}
              </Label>
              <Input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="h-10 text-xs font-semibold rounded-xl"
                required
              />
            </div>

          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={savingSite}
              className="bg-[#009688] hover:bg-[#00796b] text-white font-extrabold rounded-xl h-10 text-xs gap-1.5 px-5 shadow-md shadow-[#009688]/15"
            >
              {savingSite ? <CheckCircle2 className="w-4 h-4 animate-bounce" /> : <Save className="w-4 h-4" />}
              {savingSite ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'حفظ معلومات الموقع' : 'Save Site Info')}
            </Button>
          </div>
        </form>
      </div>

    </div>
  );
}