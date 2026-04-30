"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Hotel, ArrowRight, Loader2, Eye, EyeOff, ShieldCheck, Zap } from "lucide-react";
import { useAuth } from "@/lib/auth";

// Extract logic into a child component that uses useSearchParams
function AuthFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/";

  const [tab, setTab] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [hotelName, setHotelName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  const { signIn, signUp } = useAuth();

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setHotelName("");
    setError(null);
    setSignupSuccess(false);
  };

  const handleTabSwitch = (newTab: "login" | "signup") => {
    setTab(newTab);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (tab === "login") {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error);
        } else {
          router.push(redirectPath);
        }
      } else {
        if (!hotelName.trim()) {
          setError("Please enter your hotel name.");
          setIsLoading(false);
          return;
        }
        const { error } = await signUp(email, password, hotelName);
        if (error) {
          setError(error);
        } else {
          setSignupSuccess(true);
        }
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="font-heading text-3xl font-bold text-white mb-2">
          {tab === "login" ? "Welcome Back" : "Start Optimizing"}
        </h2>
        <p className="text-white/40 text-sm font-body">
          {tab === "login"
            ? "Sign in to access your agentic dashboard"
            : "Create your hotel account to dominate AI search"}
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="flex bg-white/[0.02] rounded-2xl p-1 mb-8 border border-white/5 shadow-inner">
        <button
          onClick={() => handleTabSwitch("login")}
          className={`flex-1 py-3 rounded-xl text-[10px] uppercase tracking-[0.3em] font-black transition-all cursor-pointer ${
            tab === "login"
              ? "bg-accent/10 text-accent border border-accent/20 shadow-sm"
              : "text-white/30 hover:text-white/50"
          }`}
        >
          Log In
        </button>
        <button
          onClick={() => handleTabSwitch("signup")}
          className={`flex-1 py-3 rounded-xl text-[10px] uppercase tracking-[0.3em] font-black transition-all cursor-pointer ${
            tab === "signup"
              ? "bg-accent/10 text-accent border border-accent/20 shadow-sm"
              : "text-white/30 hover:text-white/50"
          }`}
        >
          Sign Up
        </button>
      </div>

      {signupSuccess ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-8 space-y-5 bg-white/[0.02] rounded-3xl border border-white/5 p-8"
        >
          <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto">
            <Mail className="w-8 h-8 text-green-400" />
          </div>
          <h3 className="text-white font-heading text-2xl font-bold">Check Your Email</h3>
          <p className="text-white/40 text-sm leading-relaxed">
            We sent a confirmation link to <span className="text-accent">{email}</span>.<br />
            Please verify your email to continue.
          </p>
          <button
            onClick={() => handleTabSwitch("login")}
            className="text-accent text-xs uppercase tracking-widest font-bold hover:text-accent/80 transition-colors cursor-pointer mt-6 inline-block"
          >
            Back to Login
          </button>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Hotel Name (Signup only) */}
          <AnimatePresence>
            {tab === "signup" && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 20 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="overflow-hidden"
              >
                <label
                  htmlFor="hotel-name"
                  className="text-[9px] font-black text-white/30 uppercase tracking-[0.4em] mb-2 block"
                >
                  Hotel Name
                </label>
                <div className="relative group">
                  <Hotel className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-accent transition-colors" />
                  <input
                    id="hotel-name"
                    type="text"
                    value={hotelName}
                    onChange={(e) => setHotelName(e.target.value)}
                    placeholder="Grand Resort & Spa"
                    className="w-full bg-white/[0.02] border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white placeholder:text-white/10 focus:ring-1 focus:ring-accent/40 focus:border-accent/40 focus:bg-white/[0.04] outline-none transition-all text-sm"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="text-[9px] font-black text-white/30 uppercase tracking-[0.4em] mb-2 block"
            >
              Email Address
            </label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-accent transition-colors" />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="manager@hotel.com"
                className="w-full bg-white/[0.02] border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white placeholder:text-white/10 focus:ring-1 focus:ring-accent/40 focus:border-accent/40 focus:bg-white/[0.04] outline-none transition-all text-sm"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="text-[9px] font-black text-white/30 uppercase tracking-[0.4em] mb-2 block"
            >
              Password
            </label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-accent transition-colors" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/[0.02] border border-white/10 rounded-2xl pl-12 pr-12 py-4 text-white placeholder:text-white/10 focus:ring-1 focus:ring-accent/40 focus:border-accent/40 focus:bg-white/[0.04] outline-none transition-all text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-xs text-center"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-6 bg-accent hover:bg-accent/90 disabled:bg-accent/50 text-white py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-xs flex items-center justify-center gap-3 transition-all shadow-[0_0_40px_rgba(202,138,4,0.2)] cursor-pointer disabled:cursor-not-allowed group"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {tab === "login" ? "Sign In to Dashboard" : "Create Hotel Account"}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}

export default function AuthPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#0C0A09] flex flex-col lg:flex-row overflow-hidden">
      
      {/* Left Panel - Branding & Value Prop */}
      <div className="relative hidden lg:flex flex-col justify-between w-1/2 p-12 overflow-hidden border-r border-white/5">
        {/* Background Effects */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-accent/10 blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary/5 blur-[100px]" />
          <div 
            className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none"
            style={{ 
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` 
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10">
          <button 
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-white text-lg font-bold shadow-[0_0_20px_rgba(202,138,4,0.3)]">
              W
            </div>
            <span className="text-white font-heading text-2xl tracking-tight group-hover:text-accent transition-colors">
              WeBoosta
            </span>
          </button>
        </div>

        <div className="relative z-10 space-y-8 max-w-lg">
          <h1 className="font-heading text-5xl font-bold text-white leading-tight">
            The Agentic Economy <br/>
            <span className="text-accent italic">Awaits You.</span>
          </h1>
          <p className="text-white/60 text-lg leading-relaxed font-body">
            Join the platform that optimizes your hospitality presence not just for humans, but for the autonomous AI agents that make booking decisions.
          </p>

          <div className="pt-8 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm">Secure Data Isolation</h4>
                <p className="text-white/40 text-xs mt-1">Your hotel's optimization data is strictly walled.</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center">
                <Zap className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm">Instant Pipeline Access</h4>
                <p className="text-white/40 text-xs mt-1">Connect to Gemini 3.1 simulation models directly.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-4 text-white/30 text-[10px] uppercase tracking-[0.4em] font-black font-mono">
          <span>Enterprise Grade</span>
          <div className="w-1 h-1 rounded-full bg-white/20" />
          <span>SSL Secured</span>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative z-10 bg-[#0C0A09]">
        {/* Mobile Header (Hidden on Desktop) */}
        <div className="absolute top-8 left-8 lg:hidden flex items-center gap-2">
          <button 
            onClick={() => router.push("/")}
            className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white text-sm font-bold"
          >
            W
          </button>
        </div>

        <div className="w-full">
          <Suspense fallback={<div className="flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>}>
            <AuthFormContent />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
