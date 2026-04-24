"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CubeScene } from "@/components/cube/CubeScene";
import { Stage, StageData } from "@/types/stage";
import { simulatePipeline } from "@/lib/simulation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader } from "@/components/ui/Loader";
import { DetailPanel } from "@/components/panel/DetailPanel";
import { ChevronLeft, Info, X, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useSessionStore } from "@/lib/store";

export default function CubePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Zustand Store
  const { 
    query: storedQuery, 
    hotelUrl: storedHotel, 
    stages, 
    _hasHydrated,
    setSession, 
    addStage 
  } = useSessionStore();

  // Local state for non-persisted UI markers
  const query = searchParams.get("query") || storedQuery || "";
  const hotel = searchParams.get("hotel") || storedHotel || "";

  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    if (!_hasHydrated) return;

    const urlQuery = searchParams.get("query");
    const urlHotel = searchParams.get("hotel");
    const isRestore = searchParams.get("restore") === "true";
    
    if (urlQuery && urlHotel && (urlQuery !== storedQuery || urlHotel !== storedHotel)) {
      setSession(urlQuery, urlHotel);
    }

    // If restoring from a past record, hydrate stages from sessionStorage
    if (isRestore) {
      const raw = sessionStorage.getItem("restore_record");
      if (raw) {
        try {
          const record = JSON.parse(raw);
          sessionStorage.removeItem("restore_record");

          // Build stage data from the saved record
          const originalProfile = record.original_profile || {};
          const optimizedProfile = record.optimized_profile || {};
          const baseline = record.baseline || 0;
          const optimized = record.optimized || 0;
          const delta = optimized - baseline;

          const restoredStages: StageData[] = [
            {
              stage: "original",
              title: "Original Profile",
              preview: "Restored from Archive",
              details: { query: record.query, hotel: record.url, content: originalProfile },
            },
            {
              stage: "evaluation",
              title: "AI Evaluation",
              preview: `Score: ${baseline} / 100`,
              details: { query: record.query, hotel: record.url, content: { score: baseline, reasoning: record.reasoning || "", breakdown: { relevance: Math.round(baseline * 0.25), completeness: Math.round(baseline * 0.2), trust_signals: Math.round(baseline * 0.3), value_proposition: Math.round(baseline * 0.15), structured_data_quality: Math.round(baseline * 0.1) } } },
            },
            {
              stage: "gap",
              title: "Gap Analysis",
              preview: "Restored from Archive",
              details: { query: record.query, hotel: record.url, content: { gaps: [] } },
            },
            {
              stage: "optimization",
              title: "Content Optimization",
              preview: `Profile Enhanced +${delta}`,
              details: { query: record.query, hotel: record.url, isApproved: true, content: { optimizedProfile, improvedDescription: optimizedProfile.description || "", improvements: optimizedProfile.unique_selling_points || [] } },
            },
            {
              stage: "validation",
              title: "AI Validation",
              preview: "Passed (Archived)",
              details: { query: record.query, hotel: record.url, content: { confidence: 0.99, status: "Restored from historical archive." } },
            },
            {
              stage: "result",
              title: "Final Result",
              preview: `+${delta} Improvement`,
              details: { query: record.query, hotel: record.url, content: { finalScore: optimized, delta, status: "Restored from Archive", resim_feedback: record.reasoning || "Optimization complete.", breakdown: { relevance: Math.round(optimized * 0.25), completeness: Math.round(optimized * 0.2), trust_signals: Math.round(optimized * 0.3), value_proposition: Math.round(optimized * 0.15), structured_data_quality: Math.round(optimized * 0.1) } } },
            },
          ];

          restoredStages.forEach((s, i) => {
            setTimeout(() => {
              addStage(s);
              setSelectedStage(s.stage);
            }, i * 300);
          });
        } catch (e) {
          console.error("Failed to restore record:", e);
        }
      }
      return; // Skip normal simulation
    }
  }, [searchParams, storedQuery, storedHotel, setSession, _hasHydrated]);

  useEffect(() => {
    if (!_hasHydrated) return;
    if (searchParams.get("restore") === "true") return; // Skip simulation for restored records

    // Only simulate if we have a query/hotel AND no stages yet
    if (query && hotel && Object.keys(stages).length === 0) {
      setIsSimulating(true);
      const ws = simulatePipeline(query, hotel, (stageData) => {
        // Update global store directly
        addStage(stageData);
        
        // Auto-snap to the new stage as it arrives
        setSelectedStage(stageData.stage);
        
        if (stageData.stage === "result") setIsSimulating(false);
      });

      return () => {
        if (ws && typeof ws.close === "function") {
          ws.close();
        }
      };
    }
  }, [query, hotel, addStage, _hasHydrated]);

  const handleFaceClick = (stage: Stage) => {
    setSelectedStage(stage);
  };

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const STAGE_ORDER: Stage[] = ["original", "evaluation", "gap", "optimization", "validation", "result"];

  return (
    <main className="min-h-screen bg-background overflow-hidden relative">
      {/* Header Info */}
      <div className="absolute top-0 left-0 w-full p-8 z-20 flex justify-between items-start pointer-events-none">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="pointer-events-auto"
        >
          <Link href="/" className="flex items-center gap-2 text-secondary hover:text-accent transition-colors group">
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-semibold uppercase tracking-widest text-xs">Back to Search</span>
          </Link>
          <div className="mt-8 space-y-2">
            <h2 className="text-secondary text-[10px] uppercase tracking-[0.3em] font-bold">Simulating for</h2>
            <p className="text-primary font-heading text-xl max-w-md leading-tight">
              "{query}"
            </p>
            <div className="flex items-center gap-2 text-accent">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-[10px] uppercase tracking-widest font-bold">{hotel}</span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-right pointer-events-auto relative"
        >
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="glass-card px-4 py-2 flex items-center gap-3 hover:bg-white/5 transition-colors cursor-pointer w-full"
          >
            <BarIndicator progress={Object.keys(stages).length / 6} />
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest font-bold text-secondary">
                Unknown Revealed: {Object.keys(stages).length} / 6
              </span>
              <ChevronDown className={`w-3 h-3 text-secondary transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </div>
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-full min-w-[200px] glass-panel flex flex-col p-2 z-50 rounded-xl"
              >
                {STAGE_ORDER.map((stage) => {
                  const data = stages[stage];
                  const isCompleted = !!data;
                  return (
                    <button
                      key={stage}
                      disabled={!isCompleted}
                      onClick={() => {
                        handleFaceClick(stage);
                        setIsDropdownOpen(false);
                      }}
                      className={`text-left px-4 py-3 rounded-lg text-[10px] uppercase tracking-widest font-bold transition-all ${
                        isCompleted 
                          ? selectedStage === stage 
                            ? "bg-accent/20 text-accent" 
                            : "text-secondary hover:bg-white/5 hover:text-white"
                          : "text-secondary/30 cursor-not-allowed"
                      }`}
                    >
                      {data ? data.title : `${stage}...`}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Main 3D Canvas */}
      <motion.div 
        animate={{ x: selectedStage ? "20%" : "0%" }}
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
        className="flex items-center justify-center w-full h-screen"
      >
        <CubeScene 
          stages={stages} 
          selectedStage={selectedStage} 
          onFaceClick={handleFaceClick} 
        />
      </motion.div>

      {/* Real Detail Panel (Phase 4) */}
      <AnimatePresence>
        {selectedStage && (
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute top-0 left-0 w-[500px] h-full glass-panel z-30 p-12 overflow-hidden flex flex-col"
          >
            <button 
              onClick={() => setSelectedStage(null)}
              className="absolute top-8 right-8 text-white/30 hover:text-white transition-colors flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold z-40"
            >
              Close [Esc] <X className="w-4 h-4" />
            </button>
            
            <DetailPanel 
              stage={selectedStage}
              data={stages[selectedStage] || null}
              onClose={() => setSelectedStage(null)}
              onApprove={() => {
                if (selectedStage === "optimization") {
                  const currentOptimization = stages.optimization;
                  if (currentOptimization) {
                    addStage({
                      ...currentOptimization,
                      details: {
                        ...currentOptimization.details,
                        isApproved: true
                      }
                    });
                  }
                }
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Removed Loading Overlay to show empty cube immediately */}
    </main>
  );
}

const BarIndicator = ({ progress }: { progress: number }) => (
  <div className="w-24 h-1.5 bg-secondary/10 rounded-full overflow-hidden">
    <motion.div 
      className="h-full bg-accent"
      initial={{ width: 0 }}
      animate={{ width: `${progress * 100}%` }}
    />
  </div>
);
