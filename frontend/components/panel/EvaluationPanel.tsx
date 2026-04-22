"use client";

import { RadarChart } from "../charts/RadarChart";
import { StageData } from "@/types/stage";
import { AlertCircle, CheckCircle2, Bot } from "lucide-react";

export const EvaluationPanel = ({ data }: { data: StageData }) => {
  const { content } = data.details;
  const breakdown = content.breakdown || {};
  
  const radarData = [
    { criterion: "Relevance", score: breakdown.relevance || 0, fullMark: 20 },
    { criterion: "Completeness", score: breakdown.completeness || 0, fullMark: 20 },
    { criterion: "Trust", score: breakdown.trust_signals || 0, fullMark: 20 },
    { criterion: "Value", score: breakdown.value_proposition || 0, fullMark: 20 },
    { criterion: "Structure", score: breakdown.structured_data_quality || 0, fullMark: 20 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
      <div className="flex items-end gap-4">
        <span className="text-7xl font-heading font-bold text-white leading-none">
          {content.score || 0}
        </span>
        <span className="text-xl text-white/40 font-heading mb-2">/ 100</span>
      </div>

      <div className="glass-card bg-white/5 border-white/10 p-4">
        <RadarChart data={radarData} />
      </div>

      <div className="space-y-4">
        <h4 className="text-accent text-[10px] uppercase tracking-[0.2em] font-bold">
          AI Reasoning
        </h4>
        <div className="p-5 bg-white/5 border border-white/10 rounded-xl flex items-start gap-3">
          <Bot className="w-5 h-5 text-accent shrink-0 mt-0.5" />
          <p className="text-sm text-white/80 font-body leading-relaxed whitespace-pre-line">
            {content.reasoning || "No reasoning provided."}
          </p>
        </div>
      </div>
    </div>
  );
};

