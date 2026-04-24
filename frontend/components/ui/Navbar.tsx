"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Database, Home, Cpu, Layers } from "lucide-react";

export const Navbar = () => {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Database", path: "/records", icon: Database },
  ];

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-1 p-1.5 bg-[#0C0A09]/90 backdrop-blur-2xl border border-accent/20 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
      {navItems.map((item) => {
        const isActive = pathname === item.path;
        return (
          <Link key={item.path} href={item.path}>
            <div className={`relative flex items-center gap-3 px-6 py-2.5 rounded-xl transition-all duration-500 group ${
              isActive ? "text-white" : "text-white/30 hover:text-white/60"
            }`}>
              {isActive && (
                <motion.div
                  layoutId="nav-glow"
                  className="absolute inset-0 bg-accent/10 border border-accent/20 rounded-xl"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <item.icon className={`w-3.5 h-3.5 transition-transform duration-500 group-hover:scale-110 ${isActive ? "text-accent" : ""}`} />
              <span className="text-[9px] uppercase tracking-[0.3em] font-black font-mono whitespace-nowrap">
                {item.name}
              </span>
            </div>
          </Link>
        );
      })}
      
      <div className="w-[1px] h-6 bg-white/5 mx-2" />
      
      <div className="flex items-center gap-4 px-5 py-1">
        <div className="relative">
          <div className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_12px_rgba(202,138,4,0.8)] animate-pulse" />
          <div className="absolute inset-0 w-1.5 h-1.5 rounded-full bg-accent animate-ping opacity-20" />
        </div>
        <span className="text-[8px] uppercase tracking-[0.5em] font-black font-mono text-accent/40">
          Agentic_Mode
        </span>
      </div>
    </nav>
  );
};
