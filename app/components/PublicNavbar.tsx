"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Crown, BookOpen, Layers, LogIn, ArrowRight } from "lucide-react";

export function PublicNavbar() {
  const pathname = usePathname();

  return (
    <header className="h-20 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur sticky top-0 z-50 px-6 sm:px-8" suppressHydrationWarning>
      <div className="max-w-7xl mx-auto w-full h-full flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-400 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <Crown className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <span className="font-bold text-xl tracking-wider text-amber-400 font-mono">
              ROYAL<span className="text-white">GGR</span>
            </span>
            <span className="ml-2 text-[10px] uppercase tracking-widest bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
              B2B Engine
            </span>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/90 border border-slate-800/80 p-1.5 rounded-2xl text-xs font-semibold">
          <Link
            href="/"
            className={`px-4 py-2 rounded-xl transition-all ${
              pathname === "/"
                ? "bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            Home
          </Link>
          <Link
            href="/docs"
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              pathname === "/docs"
                ? "bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            API Documentation
          </Link>
          <Link
            href="/catalog"
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              pathname === "/catalog"
                ? "bg-purple-500/10 text-purple-400 border border-purple-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Games Catalog
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/portal/login"
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <LogIn className="w-3.5 h-3.5 text-amber-400" />
            Operator Login
          </Link>
          <Link
            href="/portal/register"
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1"
          >
            Get API Key
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
