"use client";

import { RadarChart } from "../charts/RadarChart";
import { StageData } from "@/types/stage";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export const EvaluationPanel = ({ data }: { data: StageData }) => {
  const { content } = data.details;
  
  const radarData = [
    { criterion: "Price", score: content.breakdown.price, fullMark: 20 },
    { criterion: "Location", score: content.breakdown.location, fullMark: 20 },
    { criterion: "Amenities", score: content.breakdown.amenities, fullMark: 20 },
    { criterion: "Reviews", score: content.breakdown.reviews, fullMark: 20 },
    { criterion: "Audience", score: content.breakdown.audience, fullMark: 20 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
      <div className="flex items-end gap-4">
        <span className="text-7xl font-heading font-bold text-white leading-none">
          {content.score}
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
        <ul className="space-y-3">
          <ReasoningItem 
            text="Price clarity is insufficient for agent extraction." 
            isPositive={false} 
          />
          <ReasoningItem 
            text="Location relevance to landmarks is missing." 
            isPositive={false} 
          />
          <ReasoningItem 
            text="Review sentiment is strong for solo travelers." 
            isPositive={true} 
          />
        </ul>
      </div>
    </div>
  );
};

const ReasoningItem = ({ text, isPositive }: { text: string; isPositive: boolean }) => (
  <li className="flex items-start gap-3 text-sm text-white/70 font-body">
    {isPositive ? (
      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
    ) : (
      <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
    )}
    {text}
  </li>
);
