"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { DiscoveryChat, ViewState } from "@/components/ui/DiscoveryChat";
import { ShieldCheck, Zap, BarChart3 } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [viewState, setViewState] = useState<ViewState>("INITIAL");

  const handleDiscoverWhy = (query: string, hotelUrl: string) => {
    // Navigate to cube page with mock session data
    const params = new URLSearchParams({ query, hotel: hotelUrl });
    router.push(`/cube?${params.toString()}`);
  };

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#FAFAF9]">
      {/* Background Liquid Glass Elements */}
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-accent/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary/5 blur-[100px]" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-accent/5 blur-[80px] animate-bounce" style={{ animationDuration: '10s' }} />
      </div>

      <div className="container relative z-10 px-6 py-24 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-4 mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent font-semibold text-sm uppercase tracking-widest mb-4">
            <div className="w-6 h-6 rounded-lg bg-accent flex items-center justify-center text-white text-[10px] font-bold">W</div>
            WeBoosta Automation Suite
          </div>
          <h1 className="font-heading text-5xl md:text-7xl font-bold text-primary max-w-4xl leading-tight">
            Visible to Agents, <br />
            <span className="text-accent italic">Not Just Humans.</span>
          </h1>
          <p className="font-body text-xl text-secondary max-w-2xl mx-auto leading-relaxed">
            <span className="font-bold text-primary">WeBoosta</span> automates the discovery and optimization of your hotel for the agentic economy, 
            simulating AI decisions to instantly refine your digital presence for autonomous agents.
          </p>
        </motion.div>

        <DiscoveryChat 
          viewState={viewState} 
          setViewState={setViewState} 
          onDiscoverWhy={handleDiscoverWhy} 
        />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 max-w-5xl w-full"
        >
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="p-3 rounded-2xl bg-white shadow-sm border border-secondary/10">
              <ShieldCheck className="w-6 h-6 text-accent" />
            </div>
            <h3 className="font-heading text-lg font-bold">Automated Simulation</h3>
            <p className="text-sm text-secondary">
              Fully autonomous reasoning simulations using Z.AI GLM pipelines.
            </p>
          </div>
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="p-3 rounded-2xl bg-white shadow-sm border border-secondary/10">
              <BarChart3 className="w-6 h-6 text-accent" />
            </div>
            <h3 className="font-heading text-lg font-bold">Explainable Scoring</h3>
            <p className="text-sm text-secondary">
              Understand exactly why agents pass on your property.
            </p>
          </div>
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="p-3 rounded-2xl bg-white shadow-sm border border-secondary/10">
              <Zap className="w-6 h-6 text-accent" />
            </div>
            <h3 className="font-heading text-lg font-bold">Autonomous Optimization</h3>
            <p className="text-sm text-secondary">
              Self-correcting content refinement loops executed in seconds.
            </p>
          </div>
        </motion.div>
      </div>

      <footer className="mt-24 pb-12 text-sm text-secondary/50 font-body uppercase tracking-tighter">
        © 2026 WeBoosta | UMHackathon Excellence
      </footer>
    </main>
  );
}
