import { StageData } from "@/types/stage";
import { AlertCircle, CheckCircle2, ChevronDown } from "lucide-react";

interface SeoPanelProps {
  data: StageData;
}

export const SeoPanel = ({ data }: SeoPanelProps) => {
  const content = data.details.content;
  const scores = content.scores || {};
  const issues = content.issues || [];
  const perf = content.performance_metrics || {};

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "SEO", score: scores.seo || 0 },
          { label: "Accessibility", score: scores.accessibility || 0 },
          { label: "Best Practices", score: scores.best_practices || 0 },
        ].map((metric, idx) => (
          <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col items-center justify-center space-y-2">
            <span className="text-white/50 text-[10px] uppercase tracking-widest font-bold text-center">
              {metric.label}
            </span>
            <span className={`text-3xl font-heading font-bold ${
              metric.score >= 90 ? "text-green-400" :
              metric.score >= 50 ? "text-yellow-400" : "text-red-400"
            }`}>
              {metric.score}
            </span>
          </div>
        ))}
      </div>

      <details className="group border border-white/10 rounded-xl bg-white/5 overflow-hidden">
        <summary className="p-4 cursor-pointer text-xs font-bold text-white/70 uppercase tracking-widest flex items-center justify-between hover:bg-white/5 transition-colors">
          View Technical Performance Metrics
          <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
        </summary>
        <div className="p-4 border-t border-white/10 bg-black/20">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] text-white/40 uppercase tracking-wider">Overall Score</span>
              <span className="text-lg text-white font-bold">{scores.performance || "N/A"}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-white/40 uppercase tracking-wider">LCP</span>
              <span className="text-lg text-white font-bold">{perf.lcp || "N/A"}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-white/40 uppercase tracking-wider">FCP</span>
              <span className="text-lg text-white font-bold">{perf.fcp || "N/A"}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-white/40 uppercase tracking-wider">CLS</span>
              <span className="text-lg text-white font-bold">{perf.cls || "N/A"}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-white/40 uppercase tracking-wider">TBT</span>
              <span className="text-lg text-white font-bold">{perf.tbt || "N/A"}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-white/40 uppercase tracking-wider">Speed Index</span>
              <span className="text-lg text-white font-bold">{perf.speed_index || "N/A"}</span>
            </div>
          </div>
        </div>
      </details>

      <div className="space-y-4">
        <h4 className="text-accent text-[10px] uppercase tracking-[0.2em] font-bold">Lighthouse Issues</h4>
        {issues.length > 0 ? (
          <ul className="space-y-4">
            {issues.map((issue: any, i: number) => (
              <li key={i} className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/20 rounded-lg font-body">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span className="text-sm text-red-400 font-bold">{issue.title}</span>
                </div>
                <div className="text-[10px] text-white/40 uppercase tracking-widest whitespace-nowrap ml-4">
                  {issue.category}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <span className="text-green-400 font-body text-sm">No critical issues found!</span>
          </div>
        )}
      </div>
    </div>
  );
};
