"use client";

import { StageData } from "@/types/stage";
import { RadarChart } from "../charts/RadarChart";
import { Button } from "../ui/Button";
import { Database, TrendingUp, Save, CheckCircle2, ExternalLink, Bot, FileSearch, Image as ImageIcon, FileText, Copy, AlertCircle } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { useSessionStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";


export const ResultPanel = ({ data }: { data: StageData }) => {
  const { content, query, hotel } = data.details;
  const { addRecord } = useSessionStore();
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const aeo = content.aeo_results || {};
  const semantics = aeo.semantic_analysis || {};
  const altText = aeo.image_alt_text || {};
  const agentTraffic = aeo.agent_traffic || {};
  const seoSuggestions = content.seo_suggestions || [];

  const handleCopy = () => {
    if (agentTraffic.generated_llms_txt) {
      navigator.clipboard.writeText(agentTraffic.generated_llms_txt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const breakdown = content.breakdown || {};
  const radarData = [
    { criterion: "Relevance", score: breakdown.relevance || 0, fullMark: 20 },
    { criterion: "Completeness", score: breakdown.completeness || 0, fullMark: 20 },
    { criterion: "Trust", score: breakdown.trust_signals || 0, fullMark: 20 },
    { criterion: "Value", score: breakdown.value_proposition || 0, fullMark: 20 },
    { criterion: "Structure", score: breakdown.structured_data_quality || 0, fullMark: 20 },
  ];

  const handleSaveToDatabase = async () => {
    if (isSaved) return;

    try {
      // Get the final state stored by the WebSocket pipeline
      const finalStateStr = typeof window !== "undefined"
        ? sessionStorage.getItem("pipeline_final_state")
        : null;

      const finalState = finalStateStr ? JSON.parse(finalStateStr) : null;

      if (finalState) {
        // Inject the authenticated user's ID into the save payload
        const savePayload = { ...finalState, user_id: user?.id || "" };
        
        // Call backend API to save to Supabase
        let backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
        if (!backendUrl.startsWith("http")) {
          backendUrl = `https://${backendUrl}`;
        }
        const cleanBackendUrl = backendUrl.endsWith("/") ? backendUrl.slice(0, -1) : backendUrl;
        
        const response = await fetch(`${cleanBackendUrl}/api/save_record`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(savePayload),
        });
        
        const result = await response.json();

        if (result.success) {
          console.log("💾 [HITL] Record saved to Supabase. ID:", result.id);
          
          // Only update UI if save was successful
          addRecord({
            date: new Date().toISOString().split('T')[0],
            query: query || "Custom Discovery Session",
            url: hotel || "https://example.com",
            baseline: (content.finalScore || 0) - (content.delta || 0),
            optimized: content.finalScore || 0,
            delta: content.delta ? `+${content.delta}` : "+0",
            reasoning: content.resim_feedback || content.status || "Optimization complete."
          });

          setIsSaved(true);
          
          // Clean up sessionStorage
          if (typeof window !== "undefined") {
            sessionStorage.removeItem("pipeline_final_state");
          }
        } else {
          console.warn("⚠️ [HITL] Backend save failed:", result.error);
          alert(`Database Save Failed: ${result.error}. Please check if Supabase variables are set in Railway.`);
        }
      } else {
        console.warn("⚠️ [HITL] No pipeline final state found in session.");
        alert("Session state lost. Please try running the simulation again.");
      }
    } catch (err) {
      console.error("❌ [HITL] Save error:", err);
      alert("A network error occurred while saving. Check your internet connection.");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
      {/* 1. AI EVALUATION */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-accent" />
              <h3 className="text-white font-heading text-xl font-bold tracking-wider">AI EVALUATION</h3>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-widest font-bold text-accent">Status</div>
              <div className="text-white font-heading text-sm italic leading-none">{content.status || "Ready for Agents"}</div>
            </div>
          </div>
          
          <div className="flex items-baseline gap-3">
            <span className="text-7xl font-heading font-bold text-white leading-none tracking-tight">
              {content.finalScore || 74}
            </span>
            <div className="flex items-center gap-1 text-green-500 font-bold text-lg">
              <TrendingUp className="w-5 h-5" />
              +{content.delta || 26} pts
            </div>
          </div>
        </div>

        <div className="glass-card bg-white/5 border-white/10 p-4">
          <RadarChart data={radarData} />
        </div>

        <div className="p-5 bg-white/5 border border-white/10 rounded-xl flex items-start gap-3">
          <Bot className="w-5 h-5 text-accent shrink-0 mt-0.5" />
          <p className="text-sm text-white/80 font-body leading-relaxed whitespace-pre-line">
            {content.resim_feedback || "The optimized profile significantly improves your visibility to AI agents and generative search engines."}
          </p>
        </div>
      </div>

      {/* 2. AEO ANALYSIS */}
      <div className="space-y-4 pt-4 border-t border-white/10">
        <h3 className="text-white font-heading text-xl font-bold tracking-wider mb-4">AEO ANALYSIS</h3>
        
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
                {semantics.details_specificity || "Optimized semantic specificity."}
              </p>
            </div>
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
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden mt-4">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              <h4 className="text-white/70 text-xs font-bold uppercase tracking-widest">Optimized llms.txt</h4>
            </div>
            <div className="flex items-center gap-1 bg-green-500/20 text-green-400 text-[10px] px-2 py-1 rounded-full border border-green-500/30">
              <CheckCircle2 className="w-3 h-3" /> Ready for Deployment
            </div>
          </div>
          <div className="p-4 bg-black/40">
            <div className="relative group">
              <button
                onClick={handleCopy}
                className="absolute top-2 right-2 p-2 bg-white/10 hover:bg-white/20 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
                title="Copy to clipboard"
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
              <pre className="text-[10px] sm:text-xs font-mono text-white/70 bg-black/60 p-4 rounded-lg overflow-x-auto max-h-60 border border-white/5 custom-scrollbar relative">
                {agentTraffic.generated_llms_txt || "Generating..."}
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* 3. SEO SECTION */}
      <div className="space-y-4 pt-4 border-t border-white/10">
        <h3 className="text-white font-heading text-xl font-bold tracking-wider mb-4">SEO SUGGESTIONS</h3>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          {seoSuggestions.length > 0 ? (
            <ul className="space-y-3">
              {seoSuggestions.map((suggestion: string, idx: number) => (
                <li key={idx} className="flex gap-3 items-start">
                  <AlertCircle className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <p className="text-sm text-white/80 leading-relaxed font-body">
                    {suggestion}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-white/60">No major SEO lighthouse issues to fix.</p>
          )}
        </div>
      </div>

      <div className="pt-6">
        <Button
          onClick={handleSaveToDatabase}
          className={`w-full py-6 text-lg group ${isSaved ? "bg-green-600/20 border-green-600/40 text-green-500 cursor-default shadow-none" : "shadow-xl shadow-accent/10"
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
