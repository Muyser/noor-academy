import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Mail, Lock, Loader2, User } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";
import { toast } from "@/components/ui/use-toast";
import { safeReturnTo } from "@/lib/authReturnTo";
import { useI18n } from "@/lib/useI18n";

const API_URL = import.meta.env.VITE_API_URL || '';

export default function Register() {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const isAr = lang === 'ar';

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError(isAr ? "كلمات المرور غير متطابقة" : "Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      // Direct call to your backend API route
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: fullName,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || (isAr ? "فشل إنشاء الحساب" : "Registration failed"));
      }

      toast({
        title: isAr ? "تم إنشاء الحساب بنجاح" : "Account Created Successfully",
        description: isAr ? "جاري إعادة توجيهك إلى صفحة تسجيل الدخول..." : "Redirecting you to the login page...",
      });

      // Redirect to login page
      setTimeout(() => {
        const returnUrl = safeReturnTo();
        const loginPath = "/login" + (returnUrl !== "/" ? "?returnTo=" + encodeURIComponent(returnUrl) : "");
        navigate(loginPath);
      }, 500);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      icon={UserPlus}
      title={isAr ? "إنشاء حساب جديد" : "Create an Account"}
      subtitle={isAr ? "ادخل بياناتك للبدء في تعلم اللغات" : "Enter your details to start learning"}
      footer={
        <>
          {isAr ? "لديك حساب بالفعل؟" : "Already have an account?"}{" "}
          <Link
            to={"/login" + (safeReturnTo() !== "/" ? "?returnTo=" + encodeURIComponent(safeReturnTo()) : "")}
            className="text-[#009688] font-bold hover:underline"
          >
            {isAr ? "تسجيل الدخول هنا" : "Log in here"}
          </Link>
        </>
      }
    >

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-3 text-gray-400 font-medium">
            {isAr ? "أو" : "or"}
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-xs font-semibold border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name Input */}
        <div className="space-y-1.5">
          <Label htmlFor="fullName" className="text-xs font-bold text-[#112d27]">
            {isAr ? "الاسم الكامل" : "Full Name"}
          </Label>
          <div className="relative">
            <User className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              id="fullName"
              type="text"
              placeholder="e.g. John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="ps-10 h-11 text-xs sm:text-sm font-semibold border-gray-200 focus:border-[#009688] rounded-xl"
              required
            />
          </div>
        </div>

        {/* Email Input */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-bold text-[#112d27]">
            {isAr ? "البريد الإلكتروني" : "Email Address"}
          </Label>
          <div className="relative">
            <Mail className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="ps-10 h-11 text-xs sm:text-sm font-semibold border-gray-200 focus:border-[#009688] rounded-xl"
              required
            />
          </div>
        </div>

        {/* Password & Confirm Password Grid */}
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-bold text-[#112d27]">
              {isAr ? "كلمة السر" : "Password"}
            </Label>
            <div className="relative">
              <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="ps-10 h-11 text-xs sm:text-sm font-semibold border-gray-200 focus:border-[#009688] rounded-xl"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirm" className="text-xs font-bold text-[#112d27]">
              {isAr ? "تأكيد كلمة السر" : "Confirm Password"}
            </Label>
            <div className="relative">
              <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="confirm"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="ps-10 h-11 text-xs sm:text-sm font-semibold border-gray-200 focus:border-[#009688] rounded-xl"
                required
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-12 text-xs sm:text-sm font-extrabold bg-[#009688] hover:bg-[#00796b] text-white rounded-xl shadow-md shadow-[#009688]/20 transition-all duration-300 mt-2"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 me-2 animate-spin" />
              {isAr ? "جاري إنشاء الحساب..." : "Creating account..."}
            </>
          ) : (
            isAr ? "إنشاء حساب" : "Create Account"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}