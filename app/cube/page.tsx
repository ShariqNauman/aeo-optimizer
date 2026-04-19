"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CubeScene } from "@/components/cube/CubeScene";
import { Stage, StageData } from "@/types/stage";
import { simulatePipeline } from "@/lib/simulation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader } from "@/components/ui/Loader";
import { DetailPanel } from "@/components/panel/DetailPanel";
import { ChevronLeft, Info, X } from "lucide-react";
import Link from "next/link";

export default function CubePage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";
  const hotel = searchParams.get("hotel") || "";

  const [stages, setStages] = useState<Partial<Record<Stage, StageData>>>({});
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const [isSimulating, setIsSimulating] = useState(true);

  useEffect(() => {
    if (query && hotel) {
      simulatePipeline(query, hotel, (stageData) => {
        setStages((prev) => ({ ...prev, [stageData.stage]: stageData }));
        if (stageData.stage === "result") setIsSimulating(false);
      });
    }
  }, [query, hotel]);

  const handleFaceClick = (stage: Stage) => {
    setSelectedStage(stage);
  };

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
          className="text-right pointer-events-auto"
        >
          <div className="glass-card px-4 py-2 flex items-center gap-3">
            <BarIndicator progress={Object.keys(stages).length / 6} />
            <span className="text-[10px] uppercase tracking-widest font-bold text-secondary">
              Pipeline: {Object.keys(stages).length} / 6
            </span>
          </div>
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
                  setStages(prev => ({
                    ...prev,
                    optimization: {
                      ...prev.optimization!,
                      details: {
                        ...prev.optimization!.details,
                        isApproved: true
                      }
                    }
                  }));
                }
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      {Object.keys(stages).length === 0 && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
          <Loader />
          <p className="mt-4 text-[10px] uppercase tracking-[0.2em] font-bold text-secondary animate-pulse">
            Initializing Multi-Agent Pipeline...
          </p>
        </div>
      )}
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
