"use client";

import { StageData } from "@/types/stage";
import { RadarChart } from "../charts/RadarChart";
import { Button } from "../ui/Button";
import { Rocket, TrendingUp } from "lucide-react";
import { useState } from "react";

export const ResultPanel = ({ data }: { data: StageData }) => {
  const { content } = data.details;
  const [isDeployed, setIsDeployed] = useState(false);

  const radarData = [
    { criterion: "Price", score: 18, fullMark: 20 },
    { criterion: "Location", score: 19, fullMark: 20 },
    { criterion: "Amenities", score: 12, fullMark: 20 },
    { criterion: "Reviews", score: 10, fullMark: 20 },
    { criterion: "Audience", score: 8, fullMark: 20 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h4 className="text-white/40 text-[10px] uppercase tracking-[0.2em] font-bold">Optimization Success</h4>
          <div className="flex items-baseline gap-3">
            <span className="text-6xl font-heading font-bold text-white leading-none">
              67
            </span>
            <div className="flex items-center gap-1 text-green-500 font-bold text-sm">
              <TrendingUp className="w-4 h-4" />
              +26
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-widest font-bold text-accent mb-1">Status</div>
          <div className="text-white font-heading text-lg italic">Ready for Agent Selection</div>
        </div>
      </div>

      <div className="glass-card bg-white/5 border-white/10 p-4">
        <RadarChart data={radarData} />
      </div>

      <div className="p-6 bg-accent/10 border border-accent/20 rounded-2xl">
        <p className="text-sm text-white/80 font-body leading-relaxed text-center">
          "Your hotel is now signaling clear machine-readable data for pricing and location relevance, 
          significantly increasing citation likelihood in generative search."
        </p>
      </div>

      <div className="pt-6">
        <Button
          onClick={() => setIsDeployed(true)}
          className={`w-full py-6 text-lg group ${
            isDeployed ? "bg-accent/20 border-accent/40 text-accent cursor-default" : ""
          }`}
        >
          {isDeployed ? (
            <span className="flex items-center gap-2">
              Content Deployed & Active 🚀
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Ready for Deployment
              <Rocket className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </span>
          )}
        </Button>
        {isDeployed && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-center text-xs text-accent font-bold uppercase tracking-[0.2em]"
          >
            AEO signals are now live across all AI agent networks
          </motion.p>
        )}
      </div>
    </div>
  );
};
