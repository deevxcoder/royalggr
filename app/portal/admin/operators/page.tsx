"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PortalNavbar } from "../../components/PortalNavbar";
import { PortalSidebar } from "../../components/PortalSidebar";
import {
  KeyRound,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  Plus,
  Minus,
  Edit2,
  Power,
  ShieldCheck,
  Building2,
  Wallet,
  Activity,
  AlertCircle,
} from "lucide-react";

export default function AdminOperatorsPage() {
  const router = useRouter();
  const [operator, setOperator] = useState<any>(null);
  const [operatorsList, setOperatorsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Balance Adjustment Modal
  const [adjustModal, setAdjustModal] = useState<{ open: boolean; targetOp: any | null; type: "CREDIT" | "DEBIT" }>({
    open: false,
    targetOp: null,
    type: "CREDIT",
  });
  const [adjAmount, setAdjAmount] = useState("5000");
  const [adjReason, setAdjReason] = useState("");
  const [isAdjusting, setIsAdjusting] = useState(false);

  // Settings Edit Modal (GGR Rate & Status)
  const [editModal, setEditModal] = useState<{ open: boolean; targetOp: any | null }>({
    open: false,
    targetOp: null,
  });
  const [editGgrRate, setEditGgrRate] = useState("10.0");
  const [editStatus, setEditStatus] = useState("ACTIVE");
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);

  const fetchData = async () => {
    try {
      const [meRes, opsRes] = await Promise.all([
        fetch("/api/operator/me"),
        fetch("/api/admin/operators"),
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

      const opsJson = await opsRes.json();

      setOperator(meJson.operator);
      setOperatorsList(opsJson.operators || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdjustBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustModal.targetOp) return;

    setIsAdjusting(true);
    setFeedback(null);

    const numericAmount = Math.abs(Number(adjAmount)) * (adjustModal.type === "CREDIT" ? 1 : -1);

    try {
      const res = await fetch("/api/admin/operators", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ADJUST_BALANCE",
          targetOperatorId: adjustModal.targetOp.id,
          amount: numericAmount,
          reason: adjReason.trim() || `Manual ${adjustModal.type} by Super Admin`,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setFeedback({ type: "success", message: json.message });
        setAdjustModal({ open: false, targetOp: null, type: "CREDIT" });
        setAdjAmount("5000");
        setAdjReason("");
        await fetchData();
      } else {
        setFeedback({ type: "error", message: json.error || "Failed to adjust balance" });
      }
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Failed to adjust balance" });
    } finally {
      setIsAdjusting(false);
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModal.targetOp) return;

    setIsUpdatingSettings(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/admin/operators", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_SETTINGS",
          targetOperatorId: editModal.targetOp.id,
          ggrRate: Number(editGgrRate),
          status: editStatus,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setFeedback({ type: "success", message: "Operator settings updated successfully!" });
        setEditModal({ open: false, targetOp: null });
        await fetchData();
      } else {
        setFeedback({ type: "error", message: json.error || "Failed to update settings" });
      }
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Failed to update settings" });
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  const filteredOperators = operatorsList.filter((op) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      op.companyName?.toLowerCase().includes(q) ||
      op.email?.toLowerCase().includes(q) ||
      op.tokens?.some((t: any) => t.token?.toLowerCase().includes(q))
    );
  });

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
                <Building2 className="w-5 h-5 text-purple-400" />
                Casino Operators & Aggregator Clients ({operatorsList.length})
              </h1>
              <p className="text-sm text-slate-400">
                Manage all registered client casinos, adjust prepaid GGR balances, configure revenue share %, and inspect live API tokens.
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

          {feedback && (
            <div
              className={`p-3.5 rounded-xl text-xs flex items-center gap-2 border ${
                feedback.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-rose-500/10 border-rose-500/30 text-rose-400"
              }`}
            >
              {feedback.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search operators by company name, email, or token..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Operators Table */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            {filteredOperators.length === 0 ? (
              <div className="text-center py-16 text-xs text-slate-500">
                No operators found matching the search.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Operator / Casino Name</th>
                      <th className="py-3 px-4">Prepaid GGR Balance</th>
                      <th className="py-3 px-4">GGR Fee Rate</th>
                      <th className="py-3 px-4">Active API Token</th>
                      <th className="py-3 px-4">Total Sessions</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredOperators.map((op: any) => {
                      const mainToken = op.tokens?.[0]?.token || "No Key Generated";

                      return (
                        <tr key={op.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold text-white flex items-center gap-1.5">
                              {op.companyName}
                              {op.isAdmin && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                  MASTER
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400">{op.email}</div>
                          </td>

                          <td className="py-3 px-4 font-mono font-bold text-emerald-400 text-sm">
                            ₹{Number(op.balance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </td>

                          <td className="py-3 px-4 font-mono text-purple-300 font-bold">
                            {op.ggrRate || 10.0}% Hold
                          </td>

                          <td className="py-3 px-4 font-mono text-slate-400 text-[10px] select-all max-w-[160px] truncate">
                            {mainToken}
                          </td>

                          <td className="py-3 px-4 font-mono text-slate-300">
                            {op._count?.sessions || 0} sessions ({op._count?.rounds || 0} rounds)
                          </td>

                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                op.status === "ACTIVE"
                                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                  : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                              }`}
                            >
                              {op.status}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setAdjustModal({ open: true, targetOp: op, type: "CREDIT" });
                                  setAdjAmount("10000");
                                  setAdjReason("Manual GGR Recharge Credit");
                                }}
                                className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-colors"
                                title="Add Balance"
                              >
                                <Plus className="w-3 h-3" />
                                Add ₹
                              </button>

                              <button
                                onClick={() => {
                                  setAdjustModal({ open: true, targetOp: op, type: "DEBIT" });
                                  setAdjAmount("5000");
                                  setAdjReason("Manual Balance Correction");
                                }}
                                className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-colors"
                                title="Deduct Balance"
                              >
                                <Minus className="w-3 h-3" />
                                Cut ₹
                              </button>

                              <button
                                onClick={() => {
                                  setEditModal({ open: true, targetOp: op });
                                  setEditGgrRate(String(op.ggrRate || 10.0));
                                  setEditStatus(op.status || "ACTIVE");
                                }}
                                className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
                                title="Edit Settings"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Balance Adjustment Modal */}
          {adjustModal.open && adjustModal.targetOp && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-emerald-400" />
                    {adjustModal.type === "CREDIT" ? "Credit / Add GGR Balance" : "Debit / Deduct GGR Balance"}
                  </h3>
                  <button
                    onClick={() => setAdjustModal({ open: false, targetOp: null, type: "CREDIT" })}
                    className="text-slate-400 hover:text-white text-xs"
                  >
                    ✕ Close
                  </button>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300">
                  Target Operator: <strong className="text-white">{adjustModal.targetOp.companyName}</strong> (Current Balance: ₹{adjustModal.targetOp.balance})
                </div>

                <form onSubmit={handleAdjustBalance} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold uppercase">
                      Amount to {adjustModal.type === "CREDIT" ? "Add (₹)" : "Deduct (₹)"}
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={adjAmount}
                      onChange={(e) => setAdjAmount(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold uppercase">
                      Remarks / Reason (Saved in Ledger)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Bank IMPS Reference #9812, Special Promotional Grant..."
                      value={adjReason}
                      onChange={(e) => setAdjReason(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setAdjustModal({ open: false, targetOp: null, type: "CREDIT" })}
                      className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isAdjusting}
                      className={`px-5 py-2 font-bold rounded-xl shadow-lg transition-all ${
                        adjustModal.type === "CREDIT"
                          ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20"
                          : "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-500/20"
                      }`}
                    >
                      {isAdjusting ? "Processing..." : `Confirm ${adjustModal.type === "CREDIT" ? "Credit" : "Deduct"}`}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Edit Settings Modal */}
          {editModal.open && editModal.targetOp && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Edit2 className="w-4 h-4 text-purple-400" />
                    Edit Operator Settings ({editModal.targetOp.companyName})
                  </h3>
                  <button
                    onClick={() => setEditModal({ open: false, targetOp: null })}
                    className="text-slate-400 hover:text-white text-xs"
                  >
                    ✕ Close
                  </button>
                </div>

                <form onSubmit={handleUpdateSettings} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold uppercase">
                      GGR Revenue Share Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="50"
                      required
                      value={editGgrRate}
                      onChange={(e) => setEditGgrRate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-purple-500"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Percentage of turnover automatically deducted per round (Standard: 8% – 12%).
                    </p>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold uppercase">
                      Account Status
                    </label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="ACTIVE">ACTIVE (Can launch all enabled games)</option>
                      <option value="SUSPENDED">SUSPENDED (API launch calls blocked)</option>
                    </select>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setEditModal({ open: false, targetOp: null })}
                      className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isUpdatingSettings}
                      className="px-5 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 text-white font-bold rounded-xl shadow-lg shadow-purple-500/20"
                    >
                      {isUpdatingSettings ? "Saving..." : "Save Settings"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
