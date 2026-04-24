"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RecordsTable } from "@/components/ui/RecordsTable";
import { RecordsGrid } from "@/components/ui/RecordsGrid";
import { Download, Database, Filter, LayoutGrid, List, Search, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";
import { RecordEntry } from "@/lib/mockRecords";

export default function RecordsPage() {
  const [records, setRecords] = useState<RecordEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const { data, error } = await supabase
          .from('optimization_records')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
          const formatted: RecordEntry[] = data.map((r: any) => ({
            id: r.id,
            date: new Date(r.created_at).toLocaleDateString(),
            query: r.query,
            url: r.hotel_url,
            baseline: r.baseline_score,
            optimized: r.optimized_score,
            delta: (r.delta >= 0 ? "+" : "") + r.delta,
            reasoning: r.reasoning
          }));
          setRecords(formatted);
        }
      } catch (err) {
        console.error("Failed to fetch records:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, []);

  const filteredRecords = records.filter(record => 
    record.query.toLowerCase().includes(searchQuery.toLowerCase()) || 
    record.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.date.includes(searchQuery)
  );

  const handleExportCSV = () => {
    // 1. Create CSV headers
    const headers = ["ID", "Date", "Query", "URL", "Baseline", "Optimized", "Delta", "Reasoning"];
    
    // 2. Map data to rows
    const rows = filteredRecords.map(r => [
      r.id,
      r.date,
      `"${r.query.replace(/"/g, '""')}"`,
      `"${r.url}"`,
      r.baseline,
      r.optimized,
      `"${r.delta}"`,
      `"${r.reasoning.replace(/"/g, '""')}"`
    ]);

    // 3. Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    // 4. Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `weboosta_records_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-[#FDFCFB] text-[#1C1917] pb-24">
      {/* Decorative background accent */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 blur-[120px] rounded-full -z-10" />
      
      <div className="max-w-7xl mx-auto px-6 pt-20 md:pt-28 space-y-12 relative z-10">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-5">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white border border-[#E7E5E4] text-secondary/60 font-bold text-[10px] uppercase tracking-[0.25em] shadow-sm"
            >
              <Database className="w-3.5 h-3.5 text-accent" />
              Intelligence Archive
            </motion.div>
            <div className="space-y-2">
              <h1 className="font-heading text-5xl md:text-6xl font-bold text-primary tracking-tight">
                Optimization <span className="text-accent italic">Records</span>
              </h1>
              <p className="font-body text-lg text-secondary/70 max-w-2xl leading-relaxed">
                A historical ledger of AI agent simulations, scoring benchmarks, and optimized hospitality signals for the global retrieval network.
              </p>
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
          >
             {/* Filter Input */}
             <AnimatePresence>
               {isSearchOpen && (
                 <motion.div
                   initial={{ width: 0, opacity: 0 }}
                   animate={{ width: 250, opacity: 1 }}
                   exit={{ width: 0, opacity: 0 }}
                   className="relative overflow-hidden"
                 >
                   <input
                     autoFocus
                     type="text"
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     placeholder="Search queries, URLs..."
                     className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#E7E5E4] focus:ring-2 focus:ring-accent/20 outline-none text-sm bg-white shadow-sm"
                   />
                   <Search className="w-4 h-4 text-secondary/40 absolute left-3 top-1/2 -translate-y-1/2" />
                   <button 
                     onClick={() => {
                       setIsSearchOpen(false);
                       setSearchQuery("");
                     }}
                     className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary/40 hover:text-primary"
                   >
                     <X className="w-3 h-3" />
                   </button>
                 </motion.div>
               )}
             </AnimatePresence>

             <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-[#E7E5E4] shadow-sm">
               <div className="flex bg-[#F9F8F7] p-1 rounded-xl border border-[#E7E5E4]">
                 <button 
                   onClick={() => setViewMode("list")}
                   className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-white shadow-sm border border-[#E7E5E4] text-primary" : "text-secondary/40 hover:text-secondary"}`}
                 >
                   <List className="w-4 h-4" />
                 </button>
                 <button 
                   onClick={() => setViewMode("grid")}
                   className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-white shadow-sm border border-[#E7E5E4] text-primary" : "text-secondary/40 hover:text-secondary"}`}
                 >
                   <LayoutGrid className="w-4 h-4" />
                 </button>
               </div>
               <div className="w-px h-8 bg-[#E7E5E4] mx-1" />
               {!isSearchOpen && (
                 <Button 
                   variant="ghost" 
                   onClick={() => setIsSearchOpen(true)}
                   className="gap-2 text-secondary/60 font-bold text-xs uppercase tracking-widest px-4"
                 >
                   <Filter className="w-4 h-4" />
                   Filter
                 </Button>
               )}
               <Button 
                 onClick={handleExportCSV}
                 className="gap-2 shadow-md shadow-accent/10 px-6"
               >
                 <Download className="w-4 h-4" />
                 Export CSV
               </Button>
             </div>
          </motion.div>
        </div>

        {/* Content Container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center py-40 space-y-4">
              <Loader2 className="w-10 h-10 text-accent animate-spin" />
              <p className="text-[10px] uppercase tracking-[0.4em] font-black font-mono text-secondary/40">Synchronizing_Archive...</p>
            </div>
          ) : viewMode === "list" ? (
            <div className="bg-white border border-[#E7E5E4] rounded-[2.5rem] overflow-hidden shadow-xl shadow-[#1C1917]/5">
              <RecordsTable records={filteredRecords} />
            </div>
          ) : (
            <RecordsGrid records={filteredRecords} />
          )}
        </motion.div>
        
        {/* Footer info */}
        <div className="flex items-center justify-between px-8 text-[10px] uppercase tracking-[0.3em] font-bold text-secondary/30">
          <p>Showing {filteredRecords.length} Records</p>
          <p>Last Sync: Just Now</p>
        </div>
      </div>
    </main>
  );
}
