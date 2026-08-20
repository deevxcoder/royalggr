"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PortalNavbar } from "../../components/PortalNavbar";
import { PortalSidebar } from "../../components/PortalSidebar";
import {
  Wallet,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Search,
  Filter,
  Check,
  X,
  AlertCircle,
  Building2,
  Copy,
} from "lucide-react";

export default function AdminDepositsPage() {
  const router = useRouter();
  const [operator, setOperator] = useState<any>(null);
  const [deposits, setDeposits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Reject modal
  const [rejectModalId, setRejectModalId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const fetchData = async () => {
    try {
      const [meRes, depRes] = await Promise.all([
        fetch("/api/operator/me"),
        fetch("/api/admin/deposits"),
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

      const depJson = await depRes.json();

      setOperator(meJson.operator);
      setDeposits(depJson.deposits || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (depositId: string) => {
    if (!confirm("Are you sure you have verified the payment and want to credit this operator's balance?")) {
      return;
    }

    setActionLoadingId(depositId);
    setFeedback(null);

    try {
      const res = await fetch("/api/admin/deposits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          depositId,
          action: "APPROVE",
          adminNotes: "Verified & Approved by Super Admin",
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setFeedback({ type: "success", message: json.message });
        await fetchData();
      } else {
        setFeedback({ type: "error", message: json.error || "Failed to approve deposit" });
      }
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Failed to approve" });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModalId) return;

    setActionLoadingId(rejectModalId);
    setFeedback(null);

    try {
      const res = await fetch("/api/admin/deposits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          depositId: rejectModalId,
          action: "REJECT",
          adminNotes: rejectReason.trim() || "Invalid UTR / Payment not received",
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setFeedback({ type: "success", message: "Deposit request rejected" });
        setRejectModalId(null);
        setRejectReason("");
        await fetchData();
      } else {
        setFeedback({ type: "error", message: json.error || "Failed to reject deposit" });
      }
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Failed to reject" });
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredDeposits = deposits.filter((d) => {
    if (statusFilter !== "ALL" && d.status !== statusFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      d.transactionRef?.toLowerCase().includes(q) ||
      d.operator?.companyName?.toLowerCase().includes(q) ||
      d.operator?.email?.toLowerCase().includes(q)
    );
  });

  const pendingCount = deposits.filter((d) => d.status === "PENDING").length;

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
                <Wallet className="w-5 h-5 text-amber-400" />
                Manual Deposit Approvals Desk
                {pendingCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-slate-950 animate-pulse">
                    {pendingCount} PENDING
                  </span>
                )}
              </h1>
              <p className="text-sm text-slate-400">
                Review client recharge requests, verify payment UTRs in your bank/crypto wallet, and credit GGR balance with 1-click.
              </p>
            </div>

            <button
              onClick={fetchData}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-2 transition-all self-start sm:self-auto"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh Requests
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

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
            <div className="flex items-center gap-2">
              {["ALL", "PENDING", "APPROVED", "REJECTED"].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    statusFilter === status
                      ? "bg-amber-500 text-slate-950 font-bold"
                      : "bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            <div className="relative min-w-[260px]">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search by operator or UTR..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Deposits Queue Table */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            {filteredDeposits.length === 0 ? (
              <div className="text-center py-16 text-xs text-slate-500">
                No deposit requests found matching the current filters.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Operator / Client</th>
                      <th className="py-3 px-4">Payment Method</th>
                      <th className="py-3 px-4">Transaction UTR / TxHash</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Current Balance</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Submitted At</th>
                      <th className="py-3 px-4 text-right">Super Admin Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredDeposits.map((dep: any) => {
                      const isPending = dep.status === "PENDING";
                      const isProcessing = actionLoadingId === dep.id;

                      return (
                        <tr key={dep.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold text-white">
                              {dep.operator?.companyName || "Unknown Operator"}
                            </div>
                            <div className="text-[10px] text-slate-400">{dep.operator?.email}</div>
                          </td>

                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-950 border border-slate-800 text-amber-300">
                              {dep.paymentMethod}
                            </span>
                          </td>

                          <td className="py-3 px-4 font-mono text-slate-200 font-bold select-all">
                            {dep.transactionRef}
                          </td>

                          <td className="py-3 px-4 font-mono text-emerald-400 font-bold text-sm">
                            ₹{Number(dep.amount).toLocaleString()}
                          </td>

                          <td className="py-3 px-4 font-mono text-slate-300">
                            ₹{Number(dep.operator?.balance || 0).toLocaleString()}
                          </td>

                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                dep.status === "APPROVED"
                                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                  : dep.status === "REJECTED"
                                  ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                  : "bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse"
                              }`}
                            >
                              {dep.status}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-slate-500">
                            {new Date(dep.createdAt).toLocaleString()}
                          </td>

                          <td className="py-3 px-4 text-right">
                            {isPending ? (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleApprove(dep.id)}
                                  disabled={isProcessing}
                                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg shadow transition-all flex items-center gap-1 disabled:opacity-50"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  {isProcessing ? "Processing..." : "Approve & Credit"}
                                </button>

                                <button
                                  onClick={() => setRejectModalId(dep.id)}
                                  disabled={isProcessing}
                                  className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-xs rounded-lg transition-all flex items-center gap-1 disabled:opacity-50"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <div className="text-[11px] text-slate-500 italic">
                                {dep.adminNotes || "Processed"}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Reject Reason Modal */}
          {rejectModalId && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-rose-400" />
                    Reject Deposit Request
                  </h3>
                  <button
                    onClick={() => setRejectModalId(null)}
                    className="text-slate-400 hover:text-white text-xs"
                  >
                    ✕ Close
                  </button>
                </div>

                <form onSubmit={handleReject} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1.5 font-semibold">
                      Reason for Rejection (Visible to Operator)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. UTR not found in bank statement, amount mismatch..."
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setRejectModalId(null)}
                      className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-lg"
                    >
                      Confirm Reject
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
