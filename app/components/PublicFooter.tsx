import React from "react";
import Link from "next/link";
import { Crown, Gamepad2, Shield, Zap } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 py-12 px-6 sm:px-8 text-slate-400 text-xs" suppressHydrationWarning>
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-600 to-yellow-400 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Crown className="w-4 h-4 text-slate-950" />
              </div>
              <span className="font-bold text-lg text-white font-mono tracking-wider">
                ROYAL<span className="text-amber-400">GGR</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-md">
              Master B2B iGaming Remote Gaming Server (RGS) and multi-provider aggregator relay supplying native Royal games + Pragmatic, PG Soft, Spribe, Evolution, and 5,000+ casino titles via a single unified API.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Public Navigation</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>
                <Link href="/" className="hover:text-amber-400 transition-colors">
                  Home Overview
                </Link>
              </li>
              <li>
                <Link href="/docs" className="hover:text-amber-400 transition-colors">
                  API Documentation
                </Link>
              </li>
              <li>
                <Link href="/catalog" className="hover:text-purple-400 transition-colors">
                  Games Catalog (5000+)
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">B2B Developer Portal</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>
                <Link href="/portal/login" className="hover:text-amber-400 transition-colors">
                  Operator Sign In
                </Link>
              </li>
              <li>
                <Link href="/portal/register" className="hover:text-amber-400 transition-colors">
                  Register New Operator
                </Link>
              </li>
              <li>
                <Link href="/portal/apikeys" className="hover:text-amber-400 transition-colors">
                  API Credentials & Firewall
                </Link>
              </li>
              <li>
                <Link href="/portal/wallet" className="hover:text-amber-400 transition-colors">
                  Prepaid GGR Wallet
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>© 2026 Royal GGR B2B Provider Engine. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <span className="text-emerald-400 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              API Status: OPERATIONAL
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
