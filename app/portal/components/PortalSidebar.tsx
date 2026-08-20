"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  KeyRound,
  Wallet,
  Activity,
  BookOpen,
  Gamepad2,
  Server,
  Layers,
  ShieldAlert,
  Rocket,
} from "lucide-react";

export function PortalSidebar({ operator }: { operator?: any }) {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState<boolean>(Boolean(operator?.isAdmin));

  useEffect(() => {
    if (operator !== undefined) {
      setIsAdmin(Boolean(operator?.isAdmin));
    } else {
      fetch("/api/operator/me")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.operator) {
            setIsAdmin(Boolean(data.operator.isAdmin));
          }
        })
        .catch(() => {});
    }
  }, [operator]);

  const operatorNav = [
    { name: "Dashboard", href: "/portal/dashboard", icon: LayoutDashboard },
    { name: "Games Catalog", href: "/portal/games", icon: Layers },
    { name: "Game Sessions", href: "/portal/sessions", icon: Gamepad2 },
    { name: "Launchpad Sandbox", href: "/portal/launchpad", icon: Rocket },
    { name: "API Credentials", href: "/portal/apikeys", icon: KeyRound },
    { name: "Prepaid Wallet", href: "/portal/wallet", icon: Wallet },
    { name: "Webhook Inspector", href: "/portal/webhooks", icon: Activity },
    { name: "API Documentation", href: "/portal/docs", icon: BookOpen },
  ];

  const adminNav = [
    { name: "Deposit Approvals", href: "/portal/admin/deposits", icon: Wallet },
    { name: "Clients / Operators", href: "/portal/admin/operators", icon: KeyRound },
    { name: "Global Live Sessions", href: "/portal/admin/sessions", icon: Activity },
    { name: "Providers & Aggregators", href: "/portal/admin/providers", icon: Server },
    { name: "Games Catalog (5000+)", href: "/portal/admin/games", icon: Layers },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-4 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <div className="space-y-1">
          <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Operator Console
          </div>
          {operatorNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-amber-400" : "text-slate-400"}`} />
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Master Provider Admin section - visible ONLY to Master Admin operators */}
        {isAdmin && (
          <div className="space-y-1 pt-3 border-t border-slate-800/80">
            <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              Master Provider Admin
            </div>
            {adminNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-purple-500/10 text-purple-400 border border-purple-500/30 shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-purple-400" : "text-slate-400"}`} />
                  {item.name}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <div className="p-3.5 rounded-xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/60 space-y-2">
        <div className="flex items-center gap-2">
          <Gamepad2 className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-semibold text-slate-200">Aggregator Engine</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Royal Studio + Pragmatic, PG Soft, Spribe, Evolution & 5,000+ casino titles.
        </p>
        <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          Gateway: ONLINE (Port 3001)
        </div>
      </div>
    </aside>
  );
}
