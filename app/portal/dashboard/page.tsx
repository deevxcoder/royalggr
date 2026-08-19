"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PortalNavbar } from "../components/PortalNavbar";
import { PortalSidebar } from "../components/PortalSidebar";
import {
  Wallet,
  TrendingUp,
  Activity,
  KeyRound,
  Gamepad2,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch("/api/operator/me");
      if (res.status === 401) {
        router.push("/portal/login");
        return;
      }
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 8000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading Operator Dashboard...</span>
        </div>
      </div>
    );
  }

  const operator = data?.operator;
  const stats = data?.stats || {};
  const recentRounds = data?.recentRounds || [];
  const recentWebhooks = data?.recentWebhooks || [];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col" suppressHydrationWarning>
      <PortalNavbar operator={operator} />

      <div className="flex-1 flex">
        <PortalSidebar operator={operator} />

        <main className="flex-1 p-8 space-y-8 overflow-y-auto">
          {/* Welcome Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border border-slate-800 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1 z-10">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h1 className="text-xl font-bold text-white">
                  Welcome, <span className="text-amber-400">{operator?.companyName}</span>
                </h1>
              </div>
              <p className="text-sm text-slate-400">
                Your B2B RGS & GGR Engine is operating in <span className="text-emerald-400 font-semibold">PRODUCTION LIVE</span> mode.
              </p>
            </div>

            <div className="flex items-center gap-3 z-10">
              <button
                onClick={() => router.push("/portal/apikeys")}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-xl border border-slate-700 flex items-center gap-2 transition-all"
              >
                <KeyRound className="w-4 h-4 text-amber-400" />
                API Credentials
              </button>
              <button
                onClick={() => router.push("/portal/wallet")}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-slate-950 text-sm font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
              >
                <Wallet className="w-4 h-4" />
                Recharge GGR
              </button>
            </div>
          </div>

          {/* Metric KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Prepaid GGR Balance</span>
                <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
                  <Wallet className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-emerald-400 font-mono">
                {operator?.currency} {Number(operator?.balance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-slate-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Auto-deducts on player bets
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Player Turnover</span>
                <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-white font-mono">
                {operator?.currency} {Number(stats?.totalBetVolume || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-slate-500">
                Total bets placed across all sessions
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">GGR Share Rate</span>
                <div className="p-2 bg-purple-500/10 rounded-xl text-purple-400">
                  <Activity className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-purple-300 font-mono">
                {operator?.ggrRate || 10.0}%
              </div>
              <div className="text-[11px] text-slate-500">
                Total GGR collected: {operator?.currency} {Number(stats?.totalGgrFees || 0).toFixed(2)}
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Game Rounds</span>
                <div className="p-2 bg-sky-500/10 rounded-xl text-sky-400">
                  <Gamepad2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-sky-300 font-mono">
                {stats?.totalRounds || 0}
              </div>
              <div className="text-[11px] text-slate-500">
                Settled through Provably Fair RGS
              </div>
            </div>
          </div>

          {/* Tables Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Rounds */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Gamepad2 className="w-4 h-4 text-amber-400" />
                  Recent Game Rounds
                </h3>
                <span className="text-xs text-slate-500 font-mono">{recentRounds.length} rounds logged</span>
              </div>

              {recentRounds.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-xs">
                  No rounds recorded yet. Launch a game to start playing!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="pb-2">Serial / Game</th>
                        <th className="pb-2">Player</th>
                        <th className="pb-2">Bet</th>
                        <th className="pb-2">Win</th>
                        <th className="pb-2">GGR Fee</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {recentRounds.map((round: any) => (
                        <tr key={round.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-2.5">
                            <div className="font-semibold text-slate-200">{round.gameName}</div>
                            <div className="text-[10px] text-slate-500 font-mono">{round.serialNumber}</div>
                          </td>
                          <td className="py-2.5 font-mono text-slate-300">{round.userId}</td>
                          <td className="py-2.5 font-mono text-slate-300">₹{round.betAmount}</td>
                          <td className="py-2.5 font-mono text-emerald-400 font-semibold">₹{round.winAmount}</td>
                          <td className="py-2.5 font-mono text-amber-400">-₹{round.ggrFeeDeducted}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Recent Webhook Logs */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  Live Webhook Callback Inspector
                </h3>
                <button
                  onClick={() => router.push("/portal/webhooks")}
                  className="text-xs text-amber-400 hover:underline flex items-center gap-1"
                >
                  View All <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>

              {recentWebhooks.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-xs">
                  No webhooks dispatched yet.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {recentWebhooks.slice(0, 5).map((log: any) => (
                    <div
                      key={log.id}
                      className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              log.status === "SUCCESS"
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                            }`}
                          >
                            HTTP {log.responseCode || 500}
                          </span>
                          <span className="font-mono text-slate-300 text-[11px] truncate max-w-[200px]">
                            {log.serialNumber}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[260px]">
                          {log.targetUrl}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] text-slate-400">
                          {new Date(log.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
