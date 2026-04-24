"use client";

import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Box, History, Home } from "lucide-react";

export const NavigationToggle = () => {
  const pathname = usePathname();
  const router = useRouter();

  const isLanding = pathname === "/";
  const isRecords = pathname === "/records";
  const isCube = pathname.startsWith("/cube");

  // Determine the label, icon, and target based on context
  const getToggleConfig = () => {
    if (isLanding) {
      // On landing page → go to records
      return {
        target: "/records",
        label: "Historical_Archive",
        icon: <History className="w-7 h-7 text-white" />,
      };
    }
    if (isRecords) {
      // On records page → go back to where user came from
      // Check if they came from the cube page
      const referrer = typeof window !== "undefined" ? sessionStorage.getItem("nav_referrer") : null;
      if (referrer && referrer.startsWith("/cube")) {
        return {
          target: referrer,
          label: "3D_Analysis_Cube",
          icon: <Box className="w-7 h-7 text-white" />,
        };
      }
      // Otherwise go to landing
      return {
        target: "/",
        label: "Return_Home",
        icon: <Home className="w-7 h-7 text-white" />,
      };
    }
    if (isCube) {
      // On cube page → go to records
      return {
        target: "/records",
        label: "Historical_Archive",
        icon: <History className="w-7 h-7 text-white" />,
      };
    }
    // Fallback
    return {
      target: "/records",
      label: "Historical_Archive",
      icon: <History className="w-7 h-7 text-white" />,
    };
  };

  const config = getToggleConfig();

  const handleClick = () => {
    // Store current path as the referrer before navigating
    if (typeof window !== "undefined") {
      sessionStorage.setItem("nav_referrer", pathname + (typeof window !== "undefined" ? window.location.search : ""));
    }
    router.push(config.target);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -5 }}
      className="fixed bottom-10 right-10 z-50"
    >
      <button
        onClick={handleClick}
        className="group relative flex items-center gap-5 bg-black/80 backdrop-blur-3xl text-white p-3 pr-10 rounded-full shadow-[0_30px_100px_-20px_rgba(0,0,0,0.8)] hover:scale-105 active:scale-95 transition-all duration-200 border border-white/5 ring-1 ring-white/5 overflow-hidden cursor-pointer"
      >
        {/* Noise Texture Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay"
          style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` 
          }}
        />

        <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center shadow-[0_0_30px_rgba(202,138,4,0.4)] group-hover:rotate-[20deg] transition-transform duration-700 relative z-10">
          {config.icon}
        </div>
        
        <div className="flex flex-col items-start relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(202,138,4,0.8)] animate-pulse" />
            <span className="text-[10px] uppercase tracking-[0.4em] font-black font-mono text-accent/60">Switch_Mode</span>
          </div>
          <span className="text-sm font-heading font-bold tracking-wider text-white/90">
            {config.label}
          </span>
        </div>

        {/* Ambient Glow */}
        <div className="absolute -inset-4 bg-accent/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
      </button>
    </motion.div>
  );
};
