"use client";

import { Stage, StageData } from "@/types/stage";
import { EvaluationPanel } from "./EvaluationPanel";
import { OptimizationPanel } from "./OptimizationPanel";
import { ResultPanel } from "./ResultPanel";
import { X, Info, CheckCircle2 } from "lucide-react";

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
      case "original":
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="space-y-4">
              <h4 className="text-accent text-[10px] uppercase tracking-[0.2em] font-bold">Extracted Description</h4>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-sm text-white/80 font-body leading-relaxed">
                {data.details.content.description || "No description found."}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-accent text-[10px] uppercase tracking-[0.2em] font-bold">Amenities</h4>
                <div className="flex flex-wrap gap-2">
                  {data.details.content.amenities?.map((item: string, i: number) => (
                    <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] text-white/70">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-accent text-[10px] uppercase tracking-[0.2em] font-bold">Room Types</h4>
                <ul className="space-y-2">
                  {data.details.content.room_types?.map((item: string, i: number) => (
                    <li key={i} className="text-xs text-white/60 flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-white/20" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-accent text-[10px] uppercase tracking-[0.2em] font-bold">Unique Selling Points</h4>
              <ul className="space-y-2">
                {data.details.content.unique_selling_points?.map((item: string, i: number) => (
                  <li key={i} className="text-xs text-white/80 flex items-start gap-3 p-3 bg-white/5 border border-white/5 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-accent shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      case "evaluation":
        return <EvaluationPanel data={data} />;
      case "gap":
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="space-y-4">
              <h4 className="text-accent text-[10px] uppercase tracking-[0.2em] font-bold">Identified Gaps</h4>
              <ul className="space-y-4">
                {data.details.content.gaps && data.details.content.gaps.length > 0 ? (
                  data.details.content.gaps.map((gap: any, i: number) => {
                    const severityColor = 
                      gap.severity?.toLowerCase() === "high" ? "text-red-500 border-red-500/20 bg-red-500/10" :
                      gap.severity?.toLowerCase() === "medium" ? "text-orange-500 border-orange-500/20 bg-orange-500/10" :
                      "text-yellow-500 border-yellow-500/20 bg-yellow-500/10";
                      
                    return (
                      <li key={i} className="flex flex-col gap-2 p-4 bg-white/5 border border-white/10 rounded-xl font-body">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 text-[9px] uppercase font-bold tracking-wider rounded border ${severityColor}`}>
                            {gap.severity || "Unknown"}
                          </span>
                          <span className="text-xs text-white/50 uppercase tracking-wider">{gap.category}</span>
                        </div>
                        <p className="text-sm text-white/90">{gap.description}</p>
                        <div className="flex items-center justify-between mt-2 p-3 bg-accent/10 border border-accent/20 rounded-lg">
                          <p className="text-xs text-accent/90"><span className="font-bold">Suggestion:</span> {gap.suggested_improvement}</p>
                          <div className="text-[10px] font-bold text-accent bg-accent/20 px-2 py-1 rounded">
                            +{gap.estimated_point_gain} PTS
                          </div>
                        </div>
                      </li>
                    );
                  })
                ) : (
                  <span className="text-white/40 text-sm italic">No gaps identified.</span>
                )}
              </ul>
            </div>
          </div>
        );
      case "optimization":
        return <OptimizationPanel data={data} onApprove={onApprove} />;
      case "validation":
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center border-4 border-white/10">
                <span className="text-2xl font-heading text-white">{Math.round(data.details.content.confidence * 100)}%</span>
              </div>
              <div>
                <h4 className="text-white/40 text-[10px] uppercase tracking-[0.2em] font-bold">Confidence Score</h4>
                <p className="text-white font-heading text-xl">{data.details.content.confidence > 0.8 ? "High" : "Low"}</p>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-accent text-[10px] uppercase tracking-[0.2em] font-bold">Validation Status</h4>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-sm text-white/80 font-body leading-relaxed">
                {data.details.content.status || "Validating..."}
              </div>
            </div>
          </div>
        );
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
