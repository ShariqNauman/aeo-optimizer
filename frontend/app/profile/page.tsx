"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Hotel,
  Mail,
  Shield,
  BarChart3,
  CreditCard,
  LogOut,
  ArrowRight,
  Zap,
  Rocket,
  Crown,
} from "lucide-react";
import { useAuth } from "@/lib/auth";

const PLAN_CONFIG = {
  starter: {
    label: "Starter",
    icon: Zap,
    color: "bg-secondary/10 text-secondary border-secondary/20",
    badgeColor: "bg-secondary/10 text-secondary",
    limit: 3,
  },
  growth: {
    label: "Growth",
    icon: Rocket,
    color: "bg-accent/10 text-accent border-accent/20",
    badgeColor: "bg-accent/10 text-accent",
    limit: 25,
  },
  enterprise: {
    label: "Enterprise",
    icon: Crown,
    color: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    badgeColor: "bg-amber-500/10 text-amber-600",
    limit: Infinity,
  },
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, hotelName, plan, usageThisMonth, signOut } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-secondary/30 text-[10px] uppercase tracking-[0.4em] font-black font-mono">
          Loading_Profile...
        </div>
      </main>
    );
  }

  const planConfig = PLAN_CONFIG[plan];
  const PlanIcon = planConfig.icon;
  const usagePercent =
    planConfig.limit === Infinity
      ? 5
      : Math.min((usageThisMonth / planConfig.limit) * 100, 100);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <main className="min-h-screen bg-background text-text pb-32 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 blur-[120px] rounded-full -z-10" />

      <div className="max-w-3xl mx-auto px-6 pt-20 md:pt-28 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-primary tracking-tight">
            Your <span className="text-accent italic">Profile</span>
          </h1>
          <p className="font-body text-secondary/60 text-lg">
            Manage your hotel account and subscription.
          </p>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white border border-[#E7E5E4] rounded-[2rem] p-8 shadow-lg shadow-[#1C1917]/5"
        >
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
              <Hotel className="w-7 h-7 text-accent" />
            </div>

            <div className="flex-1 space-y-4">
              {/* Hotel Name */}
              <div>
                <label className="text-[9px] font-black text-secondary/30 uppercase tracking-[0.4em] block mb-1">
                  Hotel Name
                </label>
                <p className="font-heading text-2xl font-bold text-primary">
                  {hotelName}
                </p>
              </div>

              {/* Email */}
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-secondary/30" />
                <span className="text-secondary text-sm">{user.email}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Subscription Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white border border-[#E7E5E4] rounded-[2rem] p-8 shadow-lg shadow-[#1C1917]/5"
        >
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-5 h-5 text-accent" />
            <h2 className="font-heading text-lg font-bold text-primary uppercase tracking-wider">
              Subscription
            </h2>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-xl border ${planConfig.color}`}
              >
                <PlanIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-heading text-xl font-bold text-primary">
                  {planConfig.label} Plan
                </p>
                <p className="text-[10px] text-secondary/40 uppercase tracking-wider">
                  {plan === "starter"
                    ? "Free forever"
                    : plan === "growth"
                    ? "$49 / month"
                    : "$149 / month"}
                </p>
              </div>
            </div>

            <button
              onClick={() => router.push("/pricing")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent/10 hover:bg-accent/20 text-accent text-[10px] uppercase tracking-[0.2em] font-black transition-all cursor-pointer border border-accent/20"
            >
              Change Plan
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Plan Badge */}
          <div
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] uppercase tracking-[0.3em] font-black ${planConfig.badgeColor}`}
          >
            <CreditCard className="w-3 h-3" />
            {planConfig.label}
          </div>
        </motion.div>

        {/* Usage Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white border border-[#E7E5E4] rounded-[2rem] p-8 shadow-lg shadow-[#1C1917]/5"
        >
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="w-5 h-5 text-accent" />
            <h2 className="font-heading text-lg font-bold text-primary uppercase tracking-wider">
              Usage This Month
            </h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-2">
                <span className="font-heading text-3xl font-bold text-primary">
                  {usageThisMonth}
                </span>
                <span className="text-secondary/40 text-sm">
                  /{" "}
                  {planConfig.limit === Infinity
                    ? "∞"
                    : planConfig.limit}{" "}
                  optimizations
                </span>
              </div>
              <span className="text-[10px] text-secondary/30 uppercase tracking-widest font-bold">
                {planConfig.limit === Infinity
                  ? "Unlimited"
                  : `${Math.round(usagePercent)}% used`}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-secondary/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${usagePercent}%` }}
                transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                className="h-full bg-accent rounded-full"
              />
            </div>

            {planConfig.limit !== Infinity && usageThisMonth >= planConfig.limit && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
                <p className="text-red-600 text-sm font-semibold">
                  You&apos;ve reached your monthly limit.
                </p>
                <button
                  onClick={() => router.push("/pricing")}
                  className="text-red-600 text-xs uppercase tracking-widest font-bold hover:text-red-800 transition-colors cursor-pointer"
                >
                  Upgrade →
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Sign Out */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center"
        >
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-red-50 hover:bg-red-100 text-red-500 border border-red-200 transition-all cursor-pointer group"
          >
            <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-xs uppercase tracking-[0.2em] font-black">
              Sign Out
            </span>
          </button>
        </motion.div>
      </div>
    </main>
  );
}
