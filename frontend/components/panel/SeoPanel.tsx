import { StageData } from "@/types/stage";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface SeoPanelProps {
  data: StageData;
}

export const SeoPanel = ({ data }: SeoPanelProps) => {
  const content = data.details.content;
  const scores = content.scores || {};
  const issues = content.issues || [];

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

      <div className="space-y-4">
        <h4 className="text-accent text-[10px] uppercase tracking-[0.2em] font-bold">Lighthouse Issues</h4>
        {issues.length > 0 ? (
          <ul className="space-y-4">
            {issues.map((issue: any, i: number) => (
              <li key={i} className="flex flex-col gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-xl font-body">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span className="text-xs text-red-400 font-bold tracking-wider">{issue.title}</span>
                </div>
                <p className="text-sm text-white/80">{issue.description}</p>
                <div className="mt-2 text-[10px] text-white/40 uppercase tracking-widest">
                  Category: {issue.category} | ID: {issue.id}
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
