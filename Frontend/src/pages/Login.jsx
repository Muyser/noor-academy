import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Mail, Lock, Loader2, ShieldCheck } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
// import GoogleIcon from "@/components/GoogleIcon";
import { useI18n } from "@/lib/useI18n";
import { toast } from "@/components/ui/use-toast";

const API_URL = import.meta.env.VITE_API_URL || '';

export default function Login() {
  const { lang } = useI18n();
  const isAr = lang === 'ar';
  const navigate = useNavigate();
  const { checkUserAuth } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || (isAr ? "خطأ في تسجيل الدخول" : "Login failed"));
      }

      // 2. Extract user & token returned from controller
      const { user, token } = data;

      // 3. Store authentication credentials in localStorage
      localStorage.setItem("is_logged_in", "true");
      localStorage.setItem("token", token);
      localStorage.setItem("noor_user", JSON.stringify(user));

      if (checkUserAuth) {
        await checkUserAuth().catch(() => null);
      }

      const isAdmin = user?.role === 'admin';

      toast({
        title: isAdmin 
          ? (isAr ? "تم تسجيل الدخول كمشرف النظام" : "Logged in as Administrator")
          : (isAr ? "تم تسجيل الدخول بنجاح" : "Logged in successfully"),
        description: isAdmin 
          ? (isAr ? "جاري التوجيه إلى لوحة التحكم الإدارية..." : "Redirecting to Admin Portal...")
          : (isAr ? "جاري التوجيه إلى لوحة الطالب..." : "Redirecting to student dashboard..."),
      });

      // 4. Navigate based on real user role returned from DB
      setTimeout(() => {
        if (isAdmin) {
          navigate("/admin", { replace: true });
        } else {
          navigate("/dashboard", { replace: true });
        }
      }, 300);

    } catch (err) {
      console.error("❌ [LOGIN ERROR]:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      icon={LogIn}
      title={isAr ? "أهلاً بك مجدداً" : "Welcome Back"}
      subtitle={isAr ? "سجّل الدخول لمتابعة حسابك" : "Sign in to access your dashboard"}
      footer={
        <>
          {isAr ? "ليس لديك حساب؟" : "Don't have an account?"}{" "}
          <Link to="/register" className="text-[#009688] font-bold hover:underline">
            {isAr ? "أنشئ حساباً جديداً" : "Create one here"}
          </Link>
        </>
      }
    >

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-xs font-semibold border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Input */}
        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-[#112d27]">
            {isAr ? "البريد الإلكتروني" : "Email Address"}
          </Label>
          <div className="relative">
            <Mail className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="ps-10 h-11 text-xs sm:text-sm font-semibold border-gray-200 focus:border-[#009688] rounded-xl"
              placeholder="user@example.com"
              required
            />
          </div>
        </div>

        {/* Password Input */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-bold text-[#112d27]">
              {isAr ? "كلمة السر" : "Password"}
            </Label>
            <Link to="/forgot-password" className="text-xs text-[#009688] font-bold hover:underline">
              {isAr ? "نسيت كلمة السر؟" : "Forgot Password?"}
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="ps-10 h-11 text-xs sm:text-sm font-semibold border-gray-200 focus:border-[#009688] rounded-xl"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-12 text-xs sm:text-sm font-extrabold bg-[#009688] hover:bg-[#00796b] text-white rounded-xl shadow-md shadow-[#009688]/20 transition-all duration-300 mt-2 gap-2"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {isAr ? "جاري تسجيل الدخول..." : "Signing in..."}
            </>
          ) : (
            <>
              {email.trim().toLowerCase().includes("admin") && <ShieldCheck className="w-4 h-4" />}
              {isAr ? "تسجيل الدخول" : "Sign In"}
            </>
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}