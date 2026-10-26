import { useState, useEffect } from 'react';
import { User, Mail, Phone, Globe, MapPin, Save, Loader2, ShieldCheck, Upload } from 'lucide-react';
import { useI18n } from '@/lib/useI18n';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function Profile() {
  const { lang } = useI18n();
  const isAr = lang === 'ar';
  const { user, checkUserAuth } = useAuth();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('English');
  const [country, setCountry] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch current user profile from Express backend
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token') || '';
        const res = await fetch(`${API_URL}/api/users/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error('Failed to load profile');
        const data = await res.json();

        if (data.user) {
          setFullName(data.user.full_name || '');
          setPhone(data.user.phone || '');
          setBio(data.user.bio || '');
          setAvatar(data.user.avatar || '');
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData();
    formData.append('full_name', fullName);
    formData.append('phone', phone);
    formData.append('bio', bio);
    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }

    try {
      const token = localStorage.getItem('token') || '';
      const res = await fetch(`${API_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update profile');

      if (data.user?.avatar) {
        setAvatar(data.user.avatar);
      }

      if (checkUserAuth) {
        await checkUserAuth().catch(() => null);
      }

      toast({
        title: isAr ? 'تم تحديث الملف الشخصي' : 'Profile Updated',
        description: isAr ? 'تم حفظ التغييرات بنجاح.' : 'Your changes have been saved successfully.',
      });
    } catch (err) {
      toast({
        title: isAr ? 'خطأ' : 'Error',
        description: err.message || (isAr ? 'تعذر حفظ البيانات' : 'Failed to save changes'),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#009688]" />
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${isAr ? 'dir-rtl' : 'dir-ltr'}`}>
      
      {/* Header */}
      <div className="pb-3 border-b border-gray-100">
        <h1 className="text-xl sm:text-2xl font-bold text-[#112d27]">
          {isAr ? 'الملف الشخصي' : 'Profile Settings'}
        </h1>
        <p className="text-xs text-gray-500 font-medium mt-0.5">
          {isAr
            ? 'إدارة معلوماتك الشخصية وتفضيلات الحساب.'
            : 'Manage your personal account details and learning preferences.'}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm">
        
        {/* User Avatar & Info Header */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
          <div className="relative group shrink-0">
            {avatarPreview || avatar ? (
              <img
                src={avatarPreview || avatar}
                alt={fullName}
                className="w-16 h-16 rounded-2xl object-cover border border-gray-200 shadow-sm"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#009688] to-[#00796b] flex items-center justify-center text-white font-extrabold text-2xl shadow-md shadow-[#009688]/20">
                {(fullName || user?.email || 'M').charAt(0).toUpperCase()}
              </div>
            )}
            <label className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white">
              <Upload className="w-5 h-5" />
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </label>
          </div>

          <div className="min-w-0">
            <h2 className="font-bold text-[#112d27] text-base truncate">
              {fullName || user?.email || 'Student'}
            </h2>
            <p className="text-xs text-gray-400 font-medium truncate mt-0.5">
              {user?.email || ''}
            </p>
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-[#009688] bg-[#009688]/10 px-2 py-0.5 rounded-md mt-1.5">
              <ShieldCheck className="w-3 h-3" />
              {isAr ? 'حساب طالب معتمد' : 'Verified Student'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          
          {/* Full Name Input */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-[#112d27]">
              {isAr ? 'الاسم الكامل' : 'Full Name'}
            </Label>
            <div className="relative">
              <User className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="ps-10 h-11 text-xs sm:text-sm font-semibold border-gray-200 focus:border-[#009688] rounded-xl"
                placeholder={isAr ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                required
              />
            </div>
          </div>

          {/* Email Input (Disabled) */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-[#112d27]">
              {isAr ? 'البريد الإلكتروني' : 'Email Address'}
            </Label>
            <div className="relative">
              <Mail className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={user?.email || ''}
                disabled
                className="ps-10 h-11 text-xs sm:text-sm font-semibold border-gray-200 bg-gray-50 text-gray-500 rounded-xl"
              />
            </div>
          </div>

          {/* Phone & Language Fields */}
          <div className="grid sm:grid-cols-2 gap-4">
            
            {/* Phone */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-[#112d27]">
                {isAr ? 'رقم الهاتف' : 'Phone Number'}
              </Label>
              <div className="relative">
                <Phone className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="ps-10 h-11 text-xs sm:text-sm font-semibold border-gray-200 focus:border-[#009688] rounded-xl"
                  placeholder="+250 788 000 000"
                />
              </div>
            </div>

            {/* Language Text Input */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-[#112d27]">
                {isAr ? 'اللغة المفضلة' : 'Preferred Language'}
              </Label>
              <div className="relative">
                <Globe className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={preferredLanguage}
                  onChange={(e) => setPreferredLanguage(e.target.value)}
                  className="ps-10 h-11 text-xs sm:text-sm font-semibold border-gray-200 focus:border-[#009688] rounded-xl"
                  placeholder={isAr ? 'مثال: العربية، الإنجليزية' : 'e.g. English, Arabic'}
                />
              </div>
            </div>

          </div>

          {/* Country Text Input */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-[#112d27]">
              {isAr ? 'الدولة' : 'Country'}
            </Label>
            <div className="relative">
              <MapPin className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="ps-10 h-11 text-xs sm:text-sm font-semibold border-gray-200 focus:border-[#009688] rounded-xl"
                placeholder={isAr ? 'أدخل اسم دولتك' : 'Enter your country'}
              />
            </div>
          </div>

          {/* Bio Input */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-[#112d27]">
              {isAr ? 'نبذة شخصية' : 'Bio'}
            </Label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder={isAr ? 'اكتب نبذة قصيرة عن نفسك...' : 'Write a short bio about yourself...'}
              className="w-full h-20 p-3 text-xs sm:text-sm font-semibold rounded-xl border border-gray-200 focus:border-[#009688] focus:outline-none resize-none"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={saving}
            className="bg-[#009688] hover:bg-[#00796b] text-white font-extrabold rounded-xl h-11 px-6 text-xs sm:text-sm gap-2 shadow-md shadow-[#009688]/15 mt-2"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isAr ? 'حفظ التغييرات' : 'Save Changes'}
          </Button>

        </form>
      </div>
    </div>
  );
}