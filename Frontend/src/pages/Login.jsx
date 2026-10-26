import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Mail, Lock, Loader2, ShieldCheck } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
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

      const { user, token } = data;

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
        <div className="text-[#112d27] text-xs sm:text-sm font-normal">
          {isAr ? "ليس لديك حساب؟" : "Don't have an account?"}{" "}
          <Link to="/register" className="text-[#009688] font-bold hover:underline inline-block mt-1 sm:mt-0">
            {isAr ? "أنشئ حساباً جديداً" : "Create one here"}
          </Link>
        </div>
      }
    >
      <div className="w-full max-w-md mx-auto px-4 sm:px-6 py-2">
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-xs font-semibold border border-red-200 leading-relaxed">
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
              <Mail className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 shrink-0" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="ps-10 h-10 sm:h-11 text-xs sm:text-sm font-normal border-gray-200 focus:border-[#009688] rounded-xl w-full"
                placeholder="user@example.com"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <Label className="text-xs font-bold text-[#112d27]">
                {isAr ? "كلمة السر" : "Password"}
              </Label>
              <Link to="/forgot-password" className="text-[11px] sm:text-xs text-[#009688] font-bold hover:underline shrink-0">
                {isAr ? "نسيت كلمة السر؟" : "Forgot Password?"}
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 shrink-0" />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="ps-10 h-10 sm:h-11 text-xs sm:text-sm font-normal border-gray-200 focus:border-[#009688] rounded-xl w-full"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-11 sm:h-12 text-xs sm:text-sm font-bold bg-[#009688] hover:bg-[#00796b] text-white rounded-xl shadow-md shadow-[#009688]/20 transition-all duration-300 mt-2 gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                <span>{isAr ? "جاري تسجيل الدخول..." : "Signing in..."}</span>
              </>
            ) : (
              <>
                {email.trim().toLowerCase().includes("admin") && <ShieldCheck className="w-4 h-4 shrink-0" />}
                <span>{isAr ? "تسجيل الدخول" : "Sign In"}</span>
              </>
            )}
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
}