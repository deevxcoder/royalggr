"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PortalNavbar } from "../../components/PortalNavbar";
import { PortalSidebar } from "../../components/PortalSidebar";
import {
  Activity,
  RefreshCw,
  Search,
  Gamepad2,
  Building2,
  TrendingUp,
  Coins,
  ArrowUpRight,
} from "lucide-react";

export default function AdminSessionsPage() {
  const router = useRouter();
  const [operator, setOperator] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [rounds, setRounds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = async () => {
    try {
      const [meRes, sessRes] = await Promise.all([
        fetch("/api/operator/me"),
        fetch("/api/admin/sessions?limit=100"),
      ]);

      if (meRes.status === 401) {
        router.push("/portal/login");
        return;
      }

      const meJson = await meRes.json();
      if (!meJson.operator?.isAdmin) {
        router.push("/portal/dashboard");
        return;
      }

      const sessJson = await sessRes.json();

      setOperator(meJson.operator);
      setSessions(sessJson.sessions || []);
      setRounds(sessJson.recentRounds || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, []);

  const filteredRounds = rounds.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.gameUid?.toLowerCase().includes(q) ||
      r.gameName?.toLowerCase().includes(q) ||
      r.operator?.companyName?.toLowerCase().includes(q) ||
      r.memberAccount?.toLowerCase().includes(q) ||
      r.serialNumber?.toLowerCase().includes(q)
    );
  });

  const totalBetVolume = rounds.reduce((acc, r) => acc + (r.betAmount || 0), 0);
  const totalGgrCollected = rounds.reduce((acc, r) => acc + (r.ggrFeeDeducted || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <PortalNavbar operator={operator} />

      <div className="flex-1 flex">
        <PortalSidebar operator={operator} />

        <main className="flex-1 p-8 space-y-8 overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                Global Studio Live Sessions & Real-time Bet Monitor
              </h1>
              <p className="text-sm text-slate-400">
                Live stream of all casino operators, active player sessions, bets, payouts, and automated GGR fee collections.
              </p>
            </div>

            <button
              onClick={fetchData}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-2 transition-all self-start sm:self-auto"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Live Sessions
              </span>
              <div className="text-2xl font-bold text-white font-mono">{sessions.length}</div>
              <div className="text-[11px] text-slate-500">Across all active operators</div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Rounds Monitored
              </span>
              <div className="text-2xl font-bold text-sky-400 font-mono">{rounds.length}</div>
              <div className="text-[11px] text-slate-500">Provably Fair math engine</div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Bet Volume
              </span>
              <div className="text-2xl font-bold text-emerald-400 font-mono">
                ₹{Number(totalBetVolume).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-slate-500">Gross player wagers</div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total GGR Revenue Fee
              </span>
              <div className="text-2xl font-bold text-amber-400 font-mono">
                ₹{Number(totalGgrCollected).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-slate-500">Earned provider revenue</div>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by operator, game, player account, or round serial number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Settled Rounds Table */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            {filteredRounds.length === 0 ? (
              <div className="text-center py-16 text-xs text-slate-500">
                No game rounds recorded yet across operators.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Operator / Client</th>
                      <th className="py-3 px-4">Game Title & UID</th>
                      <th className="py-3 px-4">Player Account</th>
                      <th className="py-3 px-4">Bet Amount</th>
                      <th className="py-3 px-4">Win Amount</th>
                      <th className="py-3 px-4">GGR Cut Deducted</th>
                      <th className="py-3 px-4">Serial Number</th>
                      <th className="py-3 px-4">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredRounds.map((round: any) => (
                      <tr key={round.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-bold text-white">
                            {round.operator?.companyName || "Unknown Operator"}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-200">
                            {round.gameName || round.gameUid}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">{round.gameUid}</div>
                        </td>

                        <td className="py-3 px-4 font-mono text-slate-300">
                          {round.memberAccount || round.userId}
                        </td>

                        <td className="py-3 px-4 font-mono text-slate-300">
                          ₹{Number(round.betAmount).toFixed(2)}
                        </td>

                        <td className="py-3 px-4 font-mono text-emerald-400 font-bold">
                          ₹{Number(round.winAmount).toFixed(2)}
                        </td>

                        <td className="py-3 px-4 font-mono text-amber-400 font-bold">
                          +₹{Number(round.ggrFeeDeducted || 0).toFixed(2)}
                        </td>

                        <td className="py-3 px-4 font-mono text-slate-400 text-[10px] select-all">
                          {round.serialNumber}
                        </td>

                        <td className="py-3 px-4 text-slate-500">
                          {new Date(round.createdAt).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
