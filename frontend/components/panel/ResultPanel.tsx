"use client";

import { StageData } from "@/types/stage";
import { RadarChart } from "../charts/RadarChart";
import { Button } from "../ui/Button";
import { Database, TrendingUp, Save, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { useSessionStore } from "@/lib/store";


export const ResultPanel = ({ data }: { data: StageData }) => {
  const { content, query, hotel } = data.details;
  const { addRecord } = useSessionStore();
  const [isSaved, setIsSaved] = useState(false);

  const breakdown = content.breakdown || {};
  const radarData = [
    { criterion: "Relevance", score: breakdown.relevance || 18, fullMark: 20 },
    { criterion: "Completeness", score: breakdown.completeness || 19, fullMark: 20 },
    { criterion: "Trust", score: breakdown.trust_signals || 12, fullMark: 20 },
    { criterion: "Value", score: breakdown.value_proposition || 10, fullMark: 20 },
    { criterion: "Structure", score: breakdown.structured_data_quality || 8, fullMark: 20 },
  ];

  const handleSaveToDatabase = () => {
    if (isSaved) return;

    addRecord({
      date: new Date().toISOString().split('T')[0],
      query: query || "Custom Discovery Session",
      url: hotel || "https://example.com",
      baseline: content.finalScore - content.delta || 48,
      optimized: content.finalScore || 74,
      delta: content.delta ? `+${content.delta}` : "+26",
      reasoning: content.resim_feedback || content.status || "Optimization complete."
    });

    setIsSaved(true);
    console.log("💾 [HITL] Session Saved to Historical Archive");
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h4 className="text-white/40 text-[10px] uppercase tracking-[0.2em] font-bold">Optimization Success</h4>
          <div className="flex items-baseline gap-3">
            <span className="text-6xl font-heading font-bold text-white leading-none">
              {content.finalScore || 74}
            </span>
            <div className="flex items-center gap-1 text-green-500 font-bold text-sm">
              <TrendingUp className="w-4 h-4" />
              +{content.delta || 26}
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="space-y-1">
            <div className="text-[10px] uppercase tracking-widest font-bold text-accent">Status</div>
            <div className="text-white font-heading text-lg italic leading-none">{content.status || "Ready for Agents"}</div>
          </div>
        </div>
      </div>

      <div className="glass-card bg-white/5 border-white/10 p-4">
        <RadarChart data={radarData} />
      </div>

      <div className="p-6 bg-accent/10 border border-accent/20 rounded-2xl">
        <p className="text-sm text-white/80 font-body leading-relaxed text-center italic">
          "{content.resim_feedback || "The optimized profile significantly improves your visibility to AI agents and generative search engines."}"
        </p>
      </div>

      <div className="pt-6">
        <Button
          onClick={handleSaveToDatabase}
          className={`w-full py-6 text-lg group ${
            isSaved ? "bg-green-600/20 border-green-600/40 text-green-500 cursor-default shadow-none" : "shadow-xl shadow-accent/10"
          }`}
        >
          {isSaved ? (
            <span className="flex items-center gap-2">
              Saved to Intelligence Archive <CheckCircle2 className="w-5 h-5" />
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Save to Database
              <Database className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </span>
          )}
        </Button>
        {isSaved && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-center text-xs text-green-500 font-bold uppercase tracking-[0.2em]"
          >
            Session successfully stored in the historical ledger
          </motion.p>
        )}
      </div>
    </div>
  );
};
