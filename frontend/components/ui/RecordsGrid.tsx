"use client";

import { motion } from "framer-motion";
import { 
  FileText, 
  Copy, 
  ArrowUpRight, 
  CheckCircle2,
  TrendingUp,
  Globe,
  Search
} from "lucide-react";
import { RecordEntry } from "@/lib/mockRecords";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./Button";

interface RecordsGridProps {
  records: RecordEntry[];
}

export const RecordsGrid = ({ records }: RecordsGridProps) => {
  const router = useRouter();
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleCopy = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = (record: RecordEntry) => {
    const { reasoning, ...reportData } = record;
    const dataStr = JSON.stringify(reportData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aeo_report_${record.date}_${record.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleNavigate = (record: RecordEntry) => {
    // Store record data in sessionStorage so cube page can restore it
    sessionStorage.setItem("restore_record", JSON.stringify(record));
    router.push(`/cube?query=${encodeURIComponent(record.query)}&hotel=${encodeURIComponent(record.url)}&restore=true`);
  };

  if (records.length === 0) {
    return (
      <div className="p-12 flex flex-col items-center justify-center text-center space-y-4 bg-[#F9F8F7]/30 border border-[#E7E5E4] rounded-[2.5rem] w-full">
        <div className="w-12 h-12 rounded-2xl bg-white border border-[#E7E5E4] flex items-center justify-center shadow-sm">
          <CheckCircle2 className="w-6 h-6 text-secondary/30" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-bold text-primary">No records found</p>
          <p className="text-xs text-secondary/50">Adjust your search filters to find historical data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {records.map((record, index) => (
        <motion.div
          key={record.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="bg-white border border-[#E7E5E4] rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <span className="text-[10px] font-bold text-secondary/40 font-mono tracking-widest bg-[#F9F8F7] px-3 py-1 rounded-full border border-[#E7E5E4]">
              {record.date}
            </span>
            <div className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100 shadow-sm">
              <TrendingUp className="w-3 h-3" />
              {record.delta}
            </div>
          </div>

          {/* Context */}
          <div className="space-y-3 flex-1 mb-6">
            <div className="flex items-start gap-3">
              <div className="bg-accent/10 p-2 rounded-xl mt-1">
                <Search className="w-4 h-4 text-accent" />
              </div>
              <p className="text-sm font-bold text-primary leading-snug">
                {record.query}
              </p>
            </div>
            <div className="flex items-start gap-3 pl-1">
              <Globe className="w-3.5 h-3.5 text-secondary/30 mt-0.5 shrink-0" />
              <p className="text-xs text-secondary/50 line-clamp-2 italic font-medium break-all">
                {record.url}
              </p>
            </div>
          </div>

          {/* Scores */}
          <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-[#F9F8F7] rounded-2xl border border-[#E7E5E4]">
            <div>
              <p className="text-[9px] uppercase tracking-widest font-bold text-secondary/40 mb-1">Baseline</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-heading font-bold text-secondary/60">{record.baseline}</span>
                <span className="text-[9px] text-secondary/30 font-bold uppercase tracking-widest">idx</span>
              </div>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-widest font-bold text-secondary/40 mb-1">Optimized</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-heading font-bold text-primary">{record.optimized}</span>
                <span className="text-[9px] text-secondary/30 font-bold uppercase tracking-widest">idx</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-[#E7E5E4] mt-auto">
            <div className="flex gap-2">
              <button 
                onClick={() => handleCopy(record.id, JSON.stringify(record.optimized_profile || {}, null, 2))}
                className="p-2 hover:bg-[#F9F8F7] rounded-xl border border-transparent hover:border-[#E7E5E4] transition-all text-secondary/40 hover:text-accent" 
                title="Copy Optimized Content"
              >
                {copiedId === record.id ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
              <button 
                onClick={() => handleDownload(record)}
                className="p-2 hover:bg-[#F9F8F7] rounded-xl border border-transparent hover:border-[#E7E5E4] transition-all text-secondary/40 hover:text-accent" 
                title="Download Report"
              >
                <FileText className="w-4 h-4" />
              </button>
            </div>
            
            <Button 
              onClick={() => handleNavigate(record)}
              className="py-2 px-4 h-auto text-[10px] rounded-xl bg-primary hover:bg-primary/90 text-white gap-2 shadow-md hover:shadow-lg transition-all"
            >
              Analyze
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
