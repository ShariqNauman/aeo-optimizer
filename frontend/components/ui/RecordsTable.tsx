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

interface RecordsTableProps {
  records: RecordEntry[];
}

export const RecordsTable = ({ records }: RecordsTableProps) => {
  const router = useRouter();
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleCopy = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = (record: RecordEntry) => {
    const dataStr = JSON.stringify(record, null, 2);
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
    router.push(`/cube?query=${encodeURIComponent(record.query)}&hotel=${encodeURIComponent(record.url)}`);
  };

  return (
    <div className="w-full overflow-x-auto scrollbar-hide">
      <table className="w-full text-left border-collapse min-w-[1000px]">
        <thead>
          <tr className="border-b border-[#E7E5E4] bg-[#F9F8F7]/50">
            <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] font-bold text-secondary/50">Timestamp</th>
            <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] font-bold text-secondary/50">Discovery Context</th>
            <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] font-bold text-secondary/50">Baseline</th>
            <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] font-bold text-secondary/50">Optimized</th>
            <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] font-bold text-secondary/50 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E7E5E4]">
          {records.map((record, index) => (
            <motion.tr 
              key={record.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group hover:bg-[#FDFCFB] transition-all duration-300"
            >
              <td className="px-8 py-6 whitespace-nowrap">
                <span className="text-xs font-medium text-secondary/70 font-mono tracking-tighter">
                  {record.date}
                </span>
              </td>
              <td className="px-8 py-6">
                <div className="space-y-1.5 max-w-md">
                  <div className="flex items-center gap-2">
                    <Search className="w-3 h-3 text-accent" />
                    <p className="text-sm font-bold text-primary line-clamp-1 leading-tight">
                      {record.query}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-3 h-3 text-secondary/30" />
                    <p className="text-[11px] text-secondary/40 line-clamp-1 italic font-medium">
                      {record.url}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-8 py-6">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-sm font-bold text-secondary/60">{record.baseline}</span>
                  <span className="text-[9px] text-secondary/30 font-bold uppercase tracking-widest">idx</span>
                </div>
              </td>
              <td className="px-8 py-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-heading font-bold text-primary">{record.optimized}</span>
                    <span className="text-[9px] text-secondary/30 font-bold uppercase tracking-widest">idx</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100 shadow-sm">
                    <TrendingUp className="w-3 h-3" />
                    {record.delta}
                  </div>
                </div>
              </td>
              <td className="px-8 py-6">
                <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                  <button 
                    onClick={() => handleCopy(record.id, record.reasoning)}
                    className="p-2.5 hover:bg-white rounded-xl border border-transparent hover:border-[#E7E5E4] transition-all text-secondary/40 hover:text-accent shadow-sm" 
                    title="Copy Reasoning"
                  >
                    {copiedId === record.id ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <button 
                    onClick={() => handleDownload(record)}
                    className="p-2.5 hover:bg-white rounded-xl border border-transparent hover:border-[#E7E5E4] transition-all text-secondary/40 hover:text-accent shadow-sm" 
                    title="Download Report"
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                  <div className="w-px h-4 bg-[#E7E5E4] mx-1" />
                  <button 
                    onClick={() => handleNavigate(record)}
                    className="p-2.5 hover:bg-primary hover:text-white rounded-xl border border-transparent transition-all text-secondary/40 shadow-sm" 
                    title="Open Full Analysis"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
      
      {records.length === 0 && (
        <div className="p-12 flex flex-col items-center justify-center text-center space-y-4 bg-[#F9F8F7]/30">
          <div className="w-12 h-12 rounded-2xl bg-white border border-[#E7E5E4] flex items-center justify-center shadow-sm">
            <CheckCircle2 className="w-6 h-6 text-secondary/30" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-primary">No records found</p>
            <p className="text-xs text-secondary/50">Adjust your search filters to find historical data.</p>
          </div>
        </div>
      )}
    </div>
  );
};
