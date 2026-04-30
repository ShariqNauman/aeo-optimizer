"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  Rocket,
  Crown,
  Check,
  X,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
const PLANS = [
  {
    id: "starter" as const,
    name: "Starter",
    tagline: "For hotels getting started with AEO",
    price: 0,
    priceLabel: "Free",
    icon: Zap,
    color: "accent",
    popular: false,
    features: [
      { name: "3 optimizations / month", included: true },
      { name: "Basic pipeline (4 agents)", included: true },
      { name: "7-day record retention", included: true },
      { name: "View optimization suggestions", included: true },
      { name: "Export reports (CSV)", included: false },
      { name: "View full optimized content", included: false },
      { name: "Priority pipeline queue", included: false },
    ],
  },
  {
    id: "growth" as const,
    name: "Growth",
    tagline: "For hotels scaling their AI visibility",
    price: 49,
    priceLabel: "$49",
    icon: Rocket,
    color: "accent",
    popular: true,
    features: [
      { name: "25 optimizations / month", included: true },
      { name: "Full pipeline (7 agents)", included: true },
      { name: "90-day record retention", included: true },
      { name: "View optimization suggestions", included: true },
      { name: "Export reports (CSV)", included: true },
      { name: "View full optimized content", included: true },
      { name: "Priority pipeline queue", included: false },
    ],
  },
  {
    id: "enterprise" as const,
    name: "Enterprise",
    tagline: "For hotel chains dominating AI search",
    price: 149,
    priceLabel: "$149",
    icon: Crown,
    color: "accent",
    popular: false,
    features: [
      { name: "Unlimited optimizations", included: true },
      { name: "Full pipeline + priority", included: true },
      { name: "Unlimited record retention", included: true },
      { name: "View optimization suggestions", included: true },
      { name: "Export reports (CSV + PDF)", included: true },
      { name: "View full optimized content", included: true },
      { name: "Priority pipeline queue", included: true },
    ],
  },
];

export default function PricingPage() {
  const { user, plan: currentPlan } = useAuth();
  const router = useRouter();
  const [toast, setToast] = useState<string | null>(null);

  const handleSubscribe = (planId: string) => {
    if (!user) {
      router.push("/auth?redirect=/pricing");
      return;
    }

    if (planId === currentPlan) {
      setToast("You're already on this plan!");
    } else if (planId === "starter") {
      setToast("Successfully switched to Starter plan!");
    } else {
      setToast(`Successfully subscribed to ${planId === "growth" ? "Growth" : "Enterprise"} plan!`);
    }

    setTimeout(() => setToast(null), 3000);
  };

  return (
    <main className="min-h-screen bg-background text-text pb-32 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-accent/5 blur-[150px] rounded-full -z-10" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-accent/3 blur-[120px] rounded-full -z-10" />

      <div className="max-w-6xl mx-auto px-6 pt-20 md:pt-28">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16 space-y-5"
        >
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white border border-[#E7E5E4] text-secondary/60 font-bold text-[10px] uppercase tracking-[0.25em] shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            Subscription Plans
          </div>
          <h1 className="font-heading text-5xl md:text-6xl font-bold text-primary tracking-tight">
            Choose Your{" "}
            <span className="text-accent italic">AI Edge</span>
          </h1>
          <p className="font-body text-lg text-secondary/70 max-w-2xl mx-auto leading-relaxed">
            Unlock the full power of WeBoosta&apos;s agentic optimization pipeline.
            Every plan includes our core AI simulation engine.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.1 }}
              className={`relative flex flex-col bg-white border rounded-[2rem] overflow-hidden transition-all duration-300 hover:-translate-y-1 cursor-pointer group ${
                plan.popular
                  ? "border-accent/30 shadow-xl shadow-accent/10 scale-[1.02]"
                  : "border-[#E7E5E4] shadow-lg shadow-[#1C1917]/5"
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-0 left-1/2 -translate-x-1/2 bg-accent text-white text-[8px] uppercase tracking-[0.4em] font-black px-6 py-1.5 rounded-b-xl shadow-lg shadow-accent/20">
                  Most Popular
                </div>
              )}

              <div className="p-8 pt-10 flex-1 flex flex-col">
                {/* Icon & Name */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`p-2.5 rounded-xl ${
                      plan.popular
                        ? "bg-accent/10 border border-accent/20"
                        : "bg-secondary/5 border border-secondary/10"
                    }`}
                  >
                    <plan.icon
                      className={`w-5 h-5 ${
                        plan.popular ? "text-accent" : "text-secondary"
                      }`}
                    />
                  </div>
                  <div>
                    <h3 className="font-heading text-xl font-bold text-primary">
                      {plan.name}
                    </h3>
                    <p className="text-[10px] text-secondary/50 uppercase tracking-wider">
                      {plan.tagline}
                    </p>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className="font-heading text-4xl font-bold text-primary">
                      {plan.priceLabel}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-secondary/40 text-sm font-body">
                        / month
                      </span>
                    )}
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3 flex-1">
                  {plan.features.map((feature, j) => (
                    <div key={j} className="flex items-center gap-3">
                      {feature.included ? (
                        <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3 text-accent" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-secondary/5 flex items-center justify-center flex-shrink-0">
                          <X className="w-3 h-3 text-secondary/20" />
                        </div>
                      )}
                      <span
                        className={`text-sm ${
                          feature.included
                            ? "text-primary"
                            : "text-secondary/30"
                        }`}
                      >
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => handleSubscribe(plan.id)}
                  className={`mt-8 w-full py-4 rounded-xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    currentPlan === plan.id
                      ? "bg-secondary/5 text-secondary/40 border border-secondary/10 cursor-default"
                      : plan.popular
                      ? "bg-accent hover:bg-accent/90 text-white shadow-[0_0_30px_rgba(202,138,4,0.15)]"
                      : "bg-primary hover:bg-primary/90 text-white"
                  }`}
                  disabled={currentPlan === plan.id}
                >
                  {currentPlan === plan.id ? (
                    "Current Plan"
                  ) : (
                    <>
                      {plan.price === 0 ? "Get Started Free" : "Subscribe Now"}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-secondary/30 text-xs mt-12 uppercase tracking-widest"
        >
          All plans include SSL encryption &bull; 99.9% uptime &bull; Cancel anytime
        </motion.p>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 20, x: "-50%" }}
            className="fixed bottom-28 left-1/2 bg-[#0C0A09] text-white px-8 py-4 rounded-2xl shadow-2xl border border-accent/20 z-[150] flex items-center gap-3"
          >
            <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
              <Check className="w-3 h-3 text-accent" />
            </div>
            <span className="text-sm font-semibold">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  );
}
