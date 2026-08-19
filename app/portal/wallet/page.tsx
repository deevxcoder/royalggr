"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PortalNavbar } from "../components/PortalNavbar";
import { PortalSidebar } from "../components/PortalSidebar";
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Plus,
} from "lucide-react";

export default function WalletPage() {
  const router = useRouter();
  const [operator, setOperator] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rechargeAmount, setRechargeAmount] = useState("5000");
  const [rechargeMethod, setRechargeMethod] = useState<"UPI" | "USDT_TRC20" | "SIMULATED">("UPI");
  const [isRecharging, setIsRecharging] = useState(false);
  const [rechargeSuccess, setRechargeSuccess] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/operator/me");
      if (res.status === 401) {
        router.push("/portal/login");
        return;
      }
      const json = await res.json();
      setOperator(json.operator);
      setTransactions(json.recentTransactions || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRecharge = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRecharging(true);
    setRechargeSuccess(null);

    try {
      const res = await fetch("/api/operator/recharge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(rechargeAmount),
          method: rechargeMethod,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setRechargeSuccess(`Successfully credited ${operator?.currency} ${rechargeAmount} to your GGR wallet! Ref: ${data.transactionRef}`);
        await fetchData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRecharging(false);
    }
  };

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
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-400" />
              Prepaid GGR Wallet & Recharge
            </h1>
            <p className="text-sm text-slate-400">
              Maintain a positive GGR balance to keep your casino launch API online.
            </p>
          </div>

          {/* Recharge and Balance Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Balance Overview */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Current Available GGR Credit
                </span>
                <div className="text-3xl font-bold text-emerald-400 font-mono">
                  {operator?.currency} {Number(operator?.balance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Hold / Revenue Share Rate:</span>
                  <span className="font-semibold text-white">{operator?.ggrRate || 10.0}%</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Billing Model:</span>
                  <span className="font-semibold text-amber-400">Real-time Auto Deduction</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Status:</span>
                  <span className="font-semibold text-emerald-400">ACTIVE</span>
                </div>
              </div>
            </div>

            {/* Right Recharge Form */}
            <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-400" />
                Add Prepaid GGR Balance
              </h3>

              {rechargeSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{rechargeSuccess}</span>
                </div>
              )}

              <form onSubmit={handleRecharge} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Select Recharge Amount ({operator?.currency})
                  </label>
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    {["1000", "5000", "10000", "50000"].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setRechargeAmount(amt)}
                        className={`py-2 text-xs font-mono font-bold rounded-xl border transition-all ${
                          rechargeAmount === amt
                            ? "bg-amber-500/20 text-amber-400 border-amber-500/50"
                            : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                        }`}
                      >
                        ₹{Number(amt).toLocaleString()}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    min="100"
                    value={rechargeAmount}
                    onChange={(e) => setRechargeAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Payment Channel
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "UPI", label: "Instant UPI QR", icon: QrCode },
                      { id: "USDT_TRC20", label: "USDT Crypto", icon: CreditCard },
                      { id: "SIMULATED", label: "Sandbox Credit", icon: ShieldCheck },
                    ].map((method) => {
                      const Icon = method.icon;
                      return (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => setRechargeMethod(method.id as any)}
                          className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-xs font-medium transition-all ${
                            rechargeMethod === method.id
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/40"
                              : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{method.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isRecharging}
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-bold rounded-xl text-sm shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
                >
                  {isRecharging ? "Processing Recharge..." : `Recharge ${operator?.currency} ${rechargeAmount}`}
                </button>
              </form>
            </div>
          </div>

          {/* Transaction Ledger */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-purple-400" />
              GGR Billing & Recharge Ledger
            </h3>

            {transactions.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                No wallet transactions recorded yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="pb-2">Type</th>
                      <th className="pb-2">Description / Reference</th>
                      <th className="pb-2">Amount</th>
                      <th className="pb-2">Balance After</th>
                      <th className="pb-2">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {transactions.map((tx: any) => (
                      <tr key={tx.id} className="hover:bg-slate-800/40">
                        <td className="py-2.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              tx.amount > 0
                                ? "bg-emerald-500/20 text-emerald-400"
                                : "bg-rose-500/20 text-rose-400"
                            }`}
                          >
                            {tx.type}
                          </span>
                        </td>
                        <td className="py-2.5 text-slate-300">
                          <div>{tx.description}</div>
                          {tx.referenceId && (
                            <div className="text-[10px] text-slate-500 font-mono">{tx.referenceId}</div>
                          )}
                        </td>
                        <td
                          className={`py-2.5 font-mono font-bold ${
                            tx.amount > 0 ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          {tx.amount > 0 ? `+₹${tx.amount}` : `-₹${Math.abs(tx.amount)}`}
                        </td>
                        <td className="py-2.5 font-mono text-slate-300">₹{tx.balanceAfter}</td>
                        <td className="py-2.5 text-slate-500">
                          {new Date(tx.createdAt).toLocaleString()}
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
