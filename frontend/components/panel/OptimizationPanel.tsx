"use client";

import { StageData } from "@/types/stage";
import { Button } from "../ui/Button";
import { Check, ArrowRight, Wand2 } from "lucide-react";

interface OptimizationPanelProps {
  data: StageData;
  onApprove: () => void;
}

export const OptimizationPanel = ({ data, onApprove }: OptimizationPanelProps) => {
  const { content, isApproved } = data.details;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
      <div className="space-y-6">
        <div className="space-y-2">
          <h4 className="text-white/40 text-[10px] uppercase tracking-[0.2em] font-bold">Original Content</h4>
          <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-xs text-white/60 font-body italic leading-relaxed">
            {data.details.hotel} is a premier property. We offer rooms and amenities.
          </div>
        </div>

        <div className="flex justify-center">
          <ArrowRight className="w-6 h-6 text-accent/50 rotate-90" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h4 className="text-accent text-[10px] uppercase tracking-[0.2em] font-bold">Optimized for AI Agents</h4>
            <div className="flex items-center gap-1 text-[10px] text-green-500 font-bold px-2 py-0.5 bg-green-500/10 rounded-full border border-green-500/20">
              <Wand2 className="w-3 h-3" />
              +26 IMPROVEMENT
            </div>
          </div>
          <div className="p-5 bg-accent/5 rounded-xl border border-accent/20 text-sm text-white font-body leading-relaxed ring-1 ring-accent/30 shadow-[0_0_20px_rgba(202,138,4,0.1)]">
            {content.improvedDescription}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-white/40 text-[10px] uppercase tracking-[0.2em] font-bold">Key Improvements</h4>
        <ul className="grid grid-cols-1 gap-3">
          {content.improvements.map((improvement: string, i: number) => (
            <li key={i} className="flex items-center gap-3 text-sm text-white/80">
              <div className="w-1.5 h-1.5 rounded-full bg-accent" />
              {improvement}
            </li>
          ))}
        </ul>
      </div>

      <div className="pt-6">
        <Button
          onClick={onApprove}
          disabled={isApproved}
          className={`w-full py-6 text-lg transition-all duration-500 ${
            isApproved ? "bg-green-600 border-green-600 hover:opacity-100" : ""
          }`}
        >
          {isApproved ? (
            <span className="flex items-center gap-2">
              Approved <Check className="w-5 h-5" />
            </span>
          ) : (
            "Approve Optimized Content"
          )}
        </Button>
      </div>
    </div>
  );
};
