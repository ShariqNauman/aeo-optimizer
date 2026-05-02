import { StageData } from "@/types/stage";
import { AlertCircle, CheckCircle2, Bot, Image as ImageIcon, FileSearch, FileText } from "lucide-react";

interface AeoPanelProps {
  data: StageData;
}

export const AeoPanel = ({ data }: AeoPanelProps) => {
  const content = data.details.content;
  const aeo = content.aeo_results || {};

  const semantics = aeo.semantic_analysis || {};
  const altText = aeo.image_alt_text || {};
  const agentTraffic = aeo.agent_traffic || {};

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500 mb-8 border-b border-white/10 pb-8">
      <div className="flex items-center gap-2 mb-4">
        <Bot className="w-5 h-5 text-accent" />
        <h3 className="text-white font-heading text-xl font-bold tracking-wider">AEO ANALYSIS</h3>
      </div>

      <div className="flex flex-col gap-4">
        {/* Semantic Word Choice */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col space-y-3">
          <div className="flex items-center gap-2">
            <FileSearch className="w-4 h-4 text-blue-400" />
            <h4 className="text-white/70 text-xs font-bold uppercase tracking-widest">Semantic Density</h4>
          </div>
          <div className="flex items-center gap-4">
            <span className={`text-4xl font-heading font-bold ${
              semantics.density_score >= 80 ? "text-green-400" :
              semantics.density_score >= 50 ? "text-yellow-400" : "text-red-400"
            }`}>
              {semantics.density_score || 0}
            </span>
            <p className="text-xs text-white/50 leading-relaxed">
              {semantics.details_specificity || "Analyzing semantic specificity..."}
            </p>
          </div>
          {semantics.vague_phrases && semantics.vague_phrases.length > 0 && (
            <div className="mt-2 pt-2 border-t border-white/5">
              <span className="text-[10px] text-white/40 uppercase tracking-wider block mb-1">Vague Phrases Detected:</span>
              <div className="flex flex-wrap gap-1">
                {semantics.vague_phrases.map((phrase: string, idx: number) => (
                  <span key={idx} className="bg-red-500/20 text-red-300 text-[10px] px-2 py-0.5 rounded border border-red-500/30">
                    "{phrase}"
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Image Alt Text */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col space-y-3">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-purple-400" />
            <h4 className="text-white/70 text-xs font-bold uppercase tracking-widest">Image Alt Text</h4>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2">
            <div className="flex flex-col items-center p-2 bg-black/20 rounded">
              <span className="text-green-400 font-bold text-xl">{altText.good_alt ?? 0}</span>
              <span className="text-[10px] text-white/40 uppercase tracking-widest">Good</span>
            </div>
            <div className="flex flex-col items-center p-2 bg-black/20 rounded">
              <span className="text-red-400 font-bold text-xl">{altText.missing_alt ?? 0}</span>
              <span className="text-[10px] text-white/40 uppercase tracking-widest">Missing</span>
            </div>
            <div className="flex flex-col items-center p-2 bg-black/20 rounded">
              <span className="text-yellow-400 font-bold text-xl">{altText.generic_alt ?? 0}</span>
              <span className="text-[10px] text-white/40 uppercase tracking-widest">Generic</span>
            </div>
          </div>
        </div>
      </div>

      {/* Agent Traffic (llms.txt) */}
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            <h4 className="text-white/70 text-xs font-bold uppercase tracking-widest">Agent Traffic (llms.txt)</h4>
          </div>
          {agentTraffic.llms_txt_exists ? (
             <div className="flex items-center gap-1 bg-green-500/20 text-green-400 text-[10px] px-2 py-1 rounded-full border border-green-500/30">
               <CheckCircle2 className="w-3 h-3" /> Found
             </div>
          ) : (
             <div className="flex items-center gap-1 bg-red-500/20 text-red-400 text-[10px] px-2 py-1 rounded-full border border-red-500/30">
               <AlertCircle className="w-3 h-3" /> Missing
             </div>
          )}
        </div>
        <div className="p-4 bg-black/40">
          <p className="text-xs text-white/50 mb-3">
            {agentTraffic.llms_txt_exists 
              ? "An llms.txt file was detected. AI agents can natively parse core facts from your site."
              : "No llms.txt found at the domain root. AI agents may struggle to parse core facts."}
          </p>
        </div>
      </div>
    </div>
  );
};
