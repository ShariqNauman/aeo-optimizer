"use client";

import { Stage, StageData } from "@/types/stage";
import { EvaluationPanel } from "./EvaluationPanel";
import { OptimizationPanel } from "./OptimizationPanel";
import { ResultPanel } from "./ResultPanel";
import { X, Info } from "lucide-react";

interface DetailPanelProps {
  stage: Stage | null;
  data: StageData | null;
  onClose: () => void;
  onApprove: () => void;
}

export const DetailPanel = ({ stage, data, onClose, onApprove }: DetailPanelProps) => {
  if (!stage || !data) return null;

  const renderContent = () => {
    switch (stage) {
      case "evaluation":
        return <EvaluationPanel data={data} />;
      case "optimization":
        return <OptimizationPanel data={data} onApprove={onApprove} />;
      case "result":
        return <ResultPanel data={data} />;
      default:
        return (
          <div className="space-y-6">
            <h3 className="text-white font-heading text-3xl">{data.title}</h3>
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10 text-white/70 font-body leading-relaxed">
              <p className="mb-4">{data.preview}</p>
              <div className="flex items-start gap-3 p-4 bg-white/5 border border-white/10 rounded-xl">
                <Info className="w-5 h-5 text-white/40 shrink-0 mt-0.5" />
                <p className="text-xs text-white/40 italic">
                  Additional structured data for this stage is being processed in real-time.
                </p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="mt-12 space-y-8 h-full flex flex-col">
      <div className="flex-1 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-white/10">
        <div className="mb-8">
          <span className="text-accent text-[10px] uppercase tracking-[0.3em] font-bold block mb-2">
            AI Pipeline Stage
          </span>
          <h2 className="text-white font-heading text-4xl font-bold tracking-tight">
            {data.title}
          </h2>
        </div>
        
        {renderContent()}
      </div>
    </div>
  );
};
