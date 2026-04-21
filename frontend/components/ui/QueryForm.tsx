"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Hotel, Sparkles } from "lucide-react";
import { Button } from "./Button";

export const QueryForm = () => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [hotel, setHotel] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query || !hotel) return;

    setIsLoading(true);
    // Simulate a brief "thinking" state before navigation
    setTimeout(() => {
      const params = new URLSearchParams({ query, hotel });
      router.push(`/cube?${params.toString()}`);
    }, 800);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-card w-full max-w-2xl p-8 space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000"
    >
      <div className="space-y-2">
        <label className="text-sm font-semibold text-secondary uppercase tracking-wider flex items-center gap-2">
          <Search className="w-4 h-4" />
          Target Query
        </label>
        <textarea
          required
          placeholder="e.g. Best luxury hotel in KL with a view of the Petronas Twin Towers for a romantic getaway"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full h-32 p-4 bg-white/50 border border-secondary/20 rounded-xl focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all resize-none font-body"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-secondary uppercase tracking-wider flex items-center gap-2">
          <Hotel className="w-4 h-4" />
          Hotel Name or URL
        </label>
        <input
          required
          type="text"
          placeholder="e.g. Mandarin Oriental Kuala Lumpur"
          value={hotel}
          onChange={(e) => setHotel(e.target.value)}
          className="w-full p-4 bg-white/50 border border-secondary/20 rounded-xl focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all font-body"
        />
      </div>

      <Button
        type="submit"
        isLoading={isLoading}
        className="w-full py-6 text-lg group relative overflow-hidden"
      >
        <span className="relative z-10 flex items-center gap-2">
          Simulate AI Decision
          <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-accent via-accent/80 to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Button>
    </form>
  );
};
