"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Sparkles, 
  Send, 
  Hotel, 
  ExternalLink, 
  ArrowRight, 
  User, 
  Bot,
  Command,
  Globe,
  Loader2,
  Cpu,
  RefreshCw
} from "lucide-react";
import { Button } from "./Button";
import { useSessionStore } from "@/lib/store";

export type ViewState = "INITIAL" | "SEARCHING" | "RESULTS" | "INVESTIGATION" | "TERMINATED";

interface DiscoveryChatProps {
  onDiscoverWhy: (query: string, hotelUrl: string) => void;
  viewState: ViewState;
  setViewState: (state: ViewState) => void;
}

const isValidUrl = (url: string) => {
  try {
    const pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
      '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    return !!pattern.test(url);
  } catch (e) {
    return false;
  }
};

export const DiscoveryChat = ({ onDiscoverWhy, viewState, setViewState }: DiscoveryChatProps) => {
  const [query, setQuery] = useState("");
  const [hotelUrl, setHotelUrl] = useState("");
  const [statusIndex, setStatusIndex] = useState(0);
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [hotels, setHotels] = useState<{name: string, url: string}[]>([]);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isValidatingUrl, setIsValidatingUrl] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const setSession = useSessionStore((state) => state.setSession);
  const clearSession = useSessionStore((state) => state.clearSession);
  
  const statusMessages = [
    "Initializing Discovery Agent...",
    "Accessing Search API...",
    "Scanning hospitality networks...",
    "Ranking candidates by agentic preference...",
    "Finalizing results..."
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (viewState === "SEARCHING") {
      interval = setInterval(() => {
        setStatusIndex((prev) => {
          // Stay on the last message if still searching
          if (prev < statusMessages.length - 1) return prev + 1;
          return prev;
        });
      }, 2000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [viewState, statusMessages.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setSubmittedQuery(query);
    setSession(query, ""); 
    setViewState("SEARCHING");
    setStatusIndex(0);
    setIsError(false);

    try {
      let backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
      if (!backendUrl.startsWith("http")) {
        backendUrl = `https://${backendUrl}`;
      }
      // Remove trailing slash if present to avoid double slashes
      const cleanBackendUrl = backendUrl.endsWith("/") ? backendUrl.slice(0, -1) : backendUrl;
      const response = await fetch(`${cleanBackendUrl}/api/search_hotels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query }),
      });

      if (!response.ok) throw new Error("Search failed");

      const data = await response.json();
      
      if (data.is_valid === false) {
        setHotels([]);
        setIsError(true);
        setErrorMessage(data.error_message || "Invalid query detected.");
      } else {
        setHotels(data.hotels);
        setIsError(false);
        setErrorMessage(null);
      }
    } catch (err) {
      console.error("Discovery error:", err);
      setIsError(true);
      setErrorMessage("Agentic discovery protocol failed. Please verify your connection.");
    } finally {
      // Small delay to ensure smooth transition
      setTimeout(() => {
        setViewState("RESULTS");
      }, 500);
    }
  };

  const handleAnalyze = async () => {
    if (!hotelUrl || !isValidUrl(hotelUrl)) return;
    
    setIsValidatingUrl(true);
    setUrlError(null);
    
    try {
      let backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
      if (!backendUrl.startsWith("http")) {
        backendUrl = `https://${backendUrl}`;
      }
      const cleanBackendUrl = backendUrl.endsWith("/") ? backendUrl.slice(0, -1) : backendUrl;
      
      const response = await fetch(`${cleanBackendUrl}/api/validate_url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: hotelUrl }),
      });
      
      if (!response.ok) throw new Error("Validation failed");
      
      const data = await response.json();
      
      if (data.is_valid) {
        onDiscoverWhy(submittedQuery, hotelUrl);
      } else {
        setUrlError(data.reason || "This doesn't look like a valid hotel website.");
      }
    } catch (err) {
      console.error("URL Validation error:", err);
      // Fallback: allow if AI fails but regex passed
      onDiscoverWhy(submittedQuery, hotelUrl);
    } finally {
      setIsValidatingUrl(false);
    }
  };

  const handleReset = () => {
    clearSession();
    setViewState("INITIAL");
    setQuery("");
    setHotelUrl("");
    setSubmittedQuery("");
    setHotels([]);
    setIsError(false);
    setErrorMessage(null);
    setUrlError(null);
  };

  const handleTerminate = () => {
    clearSession();
    setViewState("TERMINATED");
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 perspective-1000">
      <motion.div
        layout
        className="relative z-20 group"
        transition={{ type: "spring", stiffness: 260, damping: 25 }}
      >
        {/* The Blackbox Container */}
        <motion.div
          layout
          className="relative bg-black/80 backdrop-blur-3xl overflow-hidden shadow-[0_0_80px_-20px_rgba(0,0,0,0.8)] rounded-[3rem] ring-1 ring-white/10"
        >
          {/* Noise Texture Overlay */}
          <div 
            className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
            style={{ 
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` 
            }}
          />

          <AnimatePresence mode="wait">
            {viewState === "INITIAL" ? (
              <motion.div
                key="initial"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                className="p-10"
              >
                <form onSubmit={handleSubmit} className="relative">
                  <div className="flex items-center gap-4 bg-black/40 shadow-inner rounded-3xl p-6 border border-white/5 focus-within:border-accent/40 focus-within:ring-1 focus-within:ring-accent/20 transition-all duration-500">
                    <div className="bg-accent/10 p-2 rounded-xl">
                      <Cpu className="w-6 h-6 text-accent animate-pulse" />
                    </div>
                    <textarea
                      autoFocus
                      required
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSubmit(e);
                        }
                      }}
                      placeholder="Enter discovery parameters..."
                      className="flex-1 bg-transparent text-white border-none focus:ring-0 outline-none resize-none font-mono text-sm tracking-wider py-2 placeholder:text-white/10 h-12"
                    />
                    <Button 
                      type="submit" 
                      className="rounded-2xl w-14 h-14 p-0 bg-accent hover:bg-accent/80 shadow-[0_0_20px_rgba(202,138,4,0.3)] transition-all hover:scale-105 active:scale-95 border-none"
                    >
                      <ArrowRight className="w-6 h-6 text-white" />
                    </Button>
                  </div>
                  <div className="mt-6 flex items-center justify-center gap-6">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent/40" />
                      <p className="text-accent/30 text-[9px] uppercase tracking-[0.4em] font-black font-mono">
                        WEBOOSTA_v2.0
                      </p>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-white/5" />
                    <p className="text-white/10 text-[9px] uppercase tracking-[0.4em] font-black font-mono">
                      ENCRYPTED_FEED
                    </p>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="chat-flow"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col min-h-[450px]"
              >
                {/* Hardware Header */}
                <div className="p-5 px-10 border-b border-white/5 flex items-center justify-between bg-black/20">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-2.5 h-2.5 rounded-full bg-accent shadow-[0_0_10px_rgba(202,138,4,0.8)]" />
                      <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-accent animate-ping opacity-40" />
                    </div>
                    <span className="text-accent text-[9px] uppercase tracking-[0.5em] font-black font-mono">Process Active</span>
                  </div>
                  <div className="flex items-center gap-5">
                    <Globe className="w-4 h-4 text-white/10" />
                    <div className="h-4 w-[1px] bg-white/5" />
                    <Sparkles className="w-4 h-4 text-accent/50" />
                  </div>
                </div>

                {/* Void Interface Content */}
                <div className="flex-1 p-10 space-y-12 overflow-y-auto max-h-[500px] scrollbar-hide">
                  {/* Input Echo */}
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-6 justify-end"
                  >
                    <div className="max-w-[80%] bg-white/[0.02] border border-white/5 rounded-[2rem] rounded-tr-none p-6 shadow-2xl">
                      <p className="text-white/60 font-mono text-xs leading-relaxed tracking-wide italic">
                        {`> ${submittedQuery}`}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-white/[0.03] flex items-center justify-center flex-shrink-0 border border-white/5">
                      <User className="w-5 h-5 text-white/20" />
                    </div>
                  </motion.div>

                  {/* Machine Response */}
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex gap-6"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center flex-shrink-0 shadow-[0_0_30px_rgba(202,138,4,0.3)]">
                      <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 space-y-8">
                      <div className="relative pl-8 border-l border-accent/20">
                        <AnimatePresence mode="wait">
                          {viewState === "SEARCHING" && (
                            <motion.div
                              key="searching-state"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="flex items-center gap-6 py-6"
                            >
                              <div className="relative">
                                <Loader2 className="w-6 h-6 text-accent animate-spin" />
                                <div className="absolute inset-0 w-6 h-6 border-2 border-accent/20 rounded-full animate-pulse" />
                              </div>
                              <motion.p
                                key={statusIndex}
                                initial={{ opacity: 0, x: 5 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -5 }}
                                className="text-accent/60 font-mono text-[10px] uppercase tracking-[0.4em] font-black"
                              >
                                {statusMessages[statusIndex]}
                              </motion.p>
                            </motion.div>
                          )}

                          {viewState === "RESULTS" && (
                            <motion.div
                              key="results-state"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="space-y-10"
                            >
                              <div className="space-y-4">
                                <h3 className="text-accent text-[9px] uppercase tracking-[0.5em] font-black">Output_Stream:</h3>
                                {isError ? (
                                  <p className="text-red-400 leading-relaxed font-mono text-xs italic bg-red-500/10 p-4 border border-red-500/20 rounded-xl">
                                    [Validation_Error]: {errorMessage || "Retrieval failure. Search API returned non-zero exit code."}
                                  </p>
                                ) : (
                                  <p className="text-white/80 leading-relaxed font-body text-lg italic">
                                    Retrieval complete. AI agentic pathways established for the following properties:
                                  </p>
                                )}
                              </div>

                              <div className="grid gap-4">
                                {hotels.length > 0 ? (
                                  hotels.map((hotel, i) => (
                                    <motion.a
                                      key={`${hotel.name}-${i}`}
                                      href={hotel.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      initial={{ opacity: 0, scale: 0.95 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      transition={{ delay: 0.4 + i * 0.1 }}
                                      className="flex items-center justify-between group p-6 rounded-[1.5rem] bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-accent/40 transition-all cursor-pointer shadow-lg"
                                    >
                                      <div className="flex items-center gap-6">
                                        <div className="w-12 h-12 rounded-xl bg-accent/5 flex items-center justify-center group-hover:bg-accent/20 transition-all group-hover:scale-110">
                                          <Hotel className="w-5 h-5 text-accent" />
                                        </div>
                                        <span className="text-white text-lg font-medium tracking-tight group-hover:text-accent transition-colors">{hotel.name}</span>
                                      </div>
                                      <ExternalLink className="w-5 h-5 text-white/10 group-hover:text-white/60 transition-all group-hover:translate-x-1 group-hover:-translate-y-1" />
                                    </motion.a>
                                  ))
                                ) : !isError && (
                                  <p className="text-white/20 font-mono text-[10px] text-center py-10 uppercase tracking-[0.3em]">
                                    No candidates discovered in current sector.
                                  </p>
                                )}
                              </div>

                              {!isError && (
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: 1 }}
                                  className="pt-8 flex flex-col sm:flex-row gap-4"
                                >
                                  <Button
                                    onClick={() => setViewState("INVESTIGATION")}
                                    className="flex-1 py-8 bg-accent hover:bg-accent/90 text-white font-black tracking-[0.4em] uppercase text-xs group shadow-[0_0_40px_rgba(202,138,4,0.3)] border-none rounded-2xl"
                                  >
                                    Discover_Why
                                    <Sparkles className="ml-3 w-5 h-5 group-hover:scale-125 transition-transform" />
                                  </Button>
                                  <Button
                                    onClick={handleTerminate}
                                    variant="outline"
                                    className="flex-1 py-8 border-white/10 text-white/40 hover:text-white hover:bg-white/5 font-black tracking-[0.4em] uppercase text-xs rounded-2xl transition-all"
                                  >
                                    End_Discovery
                                    <RefreshCw className="ml-3 w-4 h-4" />
                                  </Button>
                                </motion.div>
                              )}

                              {isError && (
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  className="pt-8 flex justify-center"
                                >
                                  <Button
                                    onClick={handleReset}
                                    variant="outline"
                                    className="border-accent/20 text-accent hover:bg-accent/10 font-bold uppercase tracking-widest text-[10px] py-6 px-10 rounded-2xl"
                                  >
                                    Try Another Query
                                  </Button>
                                </motion.div>
                              )}
                            </motion.div>
                          )}

                          {viewState === "TERMINATED" && (
                            <motion.div
                              key="terminated-state"
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="flex flex-col items-center justify-center py-20 text-center space-y-6"
                            >
                              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                                <Bot className="w-10 h-10 text-white/20" />
                              </div>
                              <div className="space-y-2">
                                <h3 className="text-white font-heading text-2xl font-bold uppercase tracking-widest">Session Terminated</h3>
                                <p className="text-white/40 font-body text-sm max-w-xs mx-auto">
                                  Agentic discovery protocol successfully closed. Thank you for using AEO Optimizer.
                                </p>
                              </div>
                              <Button
                                onClick={handleReset}
                                variant="outline"
                                className="mt-8 border-accent/20 text-accent hover:bg-accent/10 font-bold uppercase tracking-widest text-[10px]"
                              >
                                Start New Session
                              </Button>
                            </motion.div>
                          )}

                          {viewState === "INVESTIGATION" && (
                            <motion.div
                              key="investigation-state"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="space-y-8"
                            >
                              <div className="p-8 bg-accent/[0.03] border border-accent/20 rounded-3xl relative overflow-hidden group">
                                <div className="absolute -top-4 -right-4 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                                  <Cpu className="w-24 h-24 text-accent" />
                                </div>
                                <p className="text-accent text-[9px] font-black uppercase tracking-[0.5em] leading-loose relative z-10 font-mono">
                                  SYSTEM_OVERRIDE: INITIATING_DEEP_PROPERTY_INVESTIGATION_PROTOCOL...
                                </p>
                              </div>
                              <div className="space-y-6">
                                <div className="flex items-center justify-between px-2">
                                  <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.5em] font-mono">Target_URL</label>
                                  {hotelUrl && !isValidUrl(hotelUrl) && (
                                    <span className="text-[9px] font-bold text-red-500 uppercase tracking-widest animate-pulse">Invalid URL Format</span>
                                  )}
                                  {urlError && (
                                    <span className="text-[9px] font-bold text-red-500 uppercase tracking-widest animate-pulse">{urlError}</span>
                                  )}
                                </div>
                                <div className="flex flex-col sm:flex-row gap-4">
                                  <input
                                    autoFocus
                                    disabled={isValidatingUrl}
                                    type="text"
                                    placeholder="https://hotel-website.com"
                                    value={hotelUrl}
                                    onChange={(e) => {
                                      setHotelUrl(e.target.value);
                                      setSession(submittedQuery, e.target.value);
                                      if (urlError) setUrlError(null);
                                    }}
                                    className={`flex-1 bg-black/40 border ${hotelUrl && (!isValidUrl(hotelUrl) || urlError) ? 'border-red-500/50' : 'border-white/10'} rounded-2xl px-6 py-5 text-white placeholder:text-white/5 focus:ring-1 focus:ring-accent/40 outline-none transition-all font-mono text-sm disabled:opacity-50`}
                                  />
                                  <Button 
                                    disabled={!isValidUrl(hotelUrl) || isValidatingUrl}
                                    onClick={handleAnalyze}
                                    className="bg-accent hover:bg-accent/90 disabled:bg-white/5 disabled:text-white/20 px-10 py-5 font-black uppercase tracking-[0.4em] text-xs shadow-[0_0_30px_rgba(202,138,4,0.2)] border-none rounded-2xl transition-all"
                                  >
                                    {isValidatingUrl ? (
                                      <>
                                        <Loader2 className="mr-3 w-4 h-4 animate-spin" />
                                        Checking...
                                      </>
                                    ) : (
                                      "Analyze"
                                    )}
                                  </Button>
                                </div>
                                <div className="flex justify-center">
                                  <button 
                                    onClick={handleReset}
                                    className="text-[9px] uppercase tracking-[0.3em] font-bold text-white/20 hover:text-white/40 transition-colors"
                                  >
                                    Cancel & Start Over
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                </div>
                
                {/* Reset Interface Overlay (redundant now but keeping as fallback) */}
                {viewState === "RESULTS" && (
                   <div className="p-6 bg-black/40 border-t border-white/5 flex justify-center lg:hidden">
                     <button 
                       onClick={handleReset}
                       className="text-white/10 hover:text-accent/60 text-[8px] uppercase tracking-[0.6em] font-black transition-all flex items-center gap-4 group font-mono"
                     >
                       Terminate_Session
                     </button>
                   </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        
        {/* Hardware Ambient Glow */}
        <div className="absolute -inset-20 bg-accent/5 blur-[150px] -z-10 rounded-full animate-pulse pointer-events-none" />
      </motion.div>
    </div>
  );
};
