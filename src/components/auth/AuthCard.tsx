"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  UtensilsCrossed,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Shield,
  ChefHat,
  UserCheck,
} from "lucide-react";

interface AuthCardProps {
  initialMode?: "login" | "register";
}

export default function AuthCard({ initialMode = "login" }: AuthCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setErrorMsg(null);
  };

  const handleFillDemo = (email: string, pass: string = "Password123!") => {
    setMode("login");
    setFormData((prev) => ({
      ...prev,
      email,
      password: pass,
    }));
    setErrorMsg(null);
  };

  const handleGoogleSignIn = async () => {
    try {
      setErrorMsg(null);
      setGoogleLoading(true);
      await signIn("google", { callbackUrl });
    } catch (err) {
      console.error("Google sign-in error:", err);
      setErrorMsg("Failed to initiate Google Sign-in. Please ensure Google OAuth credentials are configured.");
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === "login") {
        if (!formData.email || !formData.password) {
          setErrorMsg("Please enter your email and password.");
          setLoading(false);
          return;
        }

        const res = await signIn("credentials", {
          email: formData.email.trim(),
          password: formData.password,
          redirect: false,
        });

        if (res?.error) {
          setErrorMsg("Invalid email or password.");
          setLoading(false);
          return;
        }

        setSuccessMsg("Signed in successfully! Redirecting...");
        setTimeout(() => {
          router.push(callbackUrl);
          router.refresh();
        }, 500);
      } else {
        // Register Mode
        if (formData.password !== formData.confirmPassword) {
          setErrorMsg("Passwords do not match.");
          setLoading(false);
          return;
        }

        if (formData.password.length < 8) {
          setErrorMsg("Password must be at least 8 characters.");
          setLoading(false);
          return;
        }

        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            confirmPassword: formData.confirmPassword,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setErrorMsg(data.message || "Failed to complete registration.");
          setLoading(false);
          return;
        }

        // Auto sign-in after registration
        setSuccessMsg("Registration successful! Connecting your session...");
        const res = await signIn("credentials", {
          email: formData.email.trim(),
          password: formData.password,
          redirect: false,
        });

        if (res?.error) {
          setMode("login");
          setSuccessMsg("Account created successfully. Please sign in.");
          setLoading(false);
        } else {
          setTimeout(() => {
            router.push(callbackUrl);
            router.refresh();
          }, 800);
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Network or server error. Please try again later.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-white shadow-elevation-2 mb-3">
          <UtensilsCrossed className="w-7 h-7" />
        </div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-stone-900">
          Nusantara Artisan
        </h1>
        <p className="text-sm text-stone-600 mt-1">
          {mode === "login"
            ? "Sign in to manage and track your dining experience"
            : "Create an account for seamless ordering and rewards"}
        </p>
      </div>

      {/* Main Card */}
      <div className="glass-card bg-white/95 rounded-card p-6 sm:p-8 shadow-elevation-2 border border-sand-300">
        {/* Tab Switcher */}
        <div className="flex bg-sand-100 p-1 rounded-button mb-6">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-2 text-sm font-medium rounded-button transition-all ${
              mode === "login"
                ? "bg-white text-stone-900 shadow-elevation-1"
                : "text-stone-500 hover:text-stone-900"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-2 text-sm font-medium rounded-button transition-all ${
              mode === "register"
                ? "bg-white text-stone-900 shadow-elevation-1"
                : "text-stone-500 hover:text-stone-900"
            }`}
          >
            Register
          </button>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-button bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-5 p-3.5 rounded-button bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Google OAuth Button */}
        <div className="space-y-4">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            className="w-full py-2.5 px-4 rounded-button border border-sand-300 bg-white hover:bg-sand-50 active:scale-[0.99] text-stone-700 font-semibold text-xs flex items-center justify-center gap-2.5 shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {googleLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            ) : (
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>{mode === "login" ? "Continue with Google" : "Sign up with Google"}</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-sand-300 w-full" />
            <span className="bg-white px-3 text-[11px] font-semibold uppercase tracking-wider text-stone-400 absolute">
              or with email
            </span>
          </div>
        </div>

        {/* Email & Password Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {mode === "register" && (
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Alexander Pratama"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-button bg-sand-50/50 border border-sand-300 focus:border-primary focus:ring-2 focus:ring-primary/20 text-stone-900 text-sm placeholder:text-stone-400 outline-none transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@email.com"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-button bg-sand-50/50 border border-sand-300 focus:border-primary focus:ring-2 focus:ring-primary/20 text-stone-900 text-sm placeholder:text-stone-400 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={mode === "login" ? "••••••••" : "Minimum 8 characters"}
                required
                className="w-full pl-10 pr-10 py-2.5 rounded-button bg-sand-50/50 border border-sand-300 focus:border-primary focus:ring-2 focus:ring-primary/20 text-stone-900 text-sm placeholder:text-stone-400 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {mode === "register" && (
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat your password"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-button bg-sand-50/50 border border-sand-300 focus:border-primary focus:ring-2 focus:ring-primary/20 text-stone-900 text-sm placeholder:text-stone-400 outline-none transition-all"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full mt-2 py-3 rounded-button bg-primary text-white font-semibold text-sm shadow-elevation-1 hover:bg-primary-hover active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{mode === "login" ? "Sign In with Email" : "Register with Email"}</span>
          </button>
        </form>

        {/* Demo Fast Login Shortcuts */}
        <div className="mt-8 pt-6 border-t border-sand-200">
          <p className="text-xs font-medium text-stone-500 mb-3 text-center">
            🚀 Quick Demo Access (Password: <code className="bg-sand-200 px-1 py-0.5 rounded text-stone-800">Password123!</code>):
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleFillDemo("admin@restaurant.com")}
              className="px-2 py-2 rounded-button bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium transition-colors flex flex-col items-center gap-1 shadow-sm"
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>Admin</span>
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo("kitchen@restaurant.com")}
              className="px-2 py-2 rounded-button bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium transition-colors flex flex-col items-center gap-1 shadow-sm"
            >
              <ChefHat className="w-3.5 h-3.5 text-white" />
              <span>Kitchen</span>
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo("customer@gmail.com")}
              className="px-2 py-2 rounded-button bg-sand-200 hover:bg-sand-300 text-stone-800 text-xs font-medium transition-colors flex flex-col items-center gap-1"
            >
              <UserCheck className="w-3.5 h-3.5 text-primary" />
              <span>Customer</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
