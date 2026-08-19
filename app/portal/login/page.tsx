"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Crown, KeyRound, Mail, Lock, ArrowRight, AlertCircle, ShieldAlert, UserCheck } from "lucide-react";

export default function OperatorLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("demo@royalggr.com");
  const [password, setPassword] = useState("demo1234");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/operator/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Login failed");
      }

      router.push("/portal/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fillAdmin = () => {
    setEmail("admin@royalggr.com");
    setPassword("admin1234");
  };

  const fillDemo = () => {
    setEmail("demo@royalggr.com");
    setPassword("demo1234");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-400 shadow-xl shadow-amber-500/20 mb-2">
            <Crown className="w-8 h-8 text-slate-950" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Operator <span className="text-amber-400">Developer Portal</span>
          </h1>
          <p className="text-sm text-slate-400">
            Sign in to manage API keys, prepaid GGR balances, and webhook callbacks.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl shadow-black/50 space-y-5">
          {error && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Operator Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@casino.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all disabled:opacity-50"
            >
              {loading ? "Authenticating..." : "Sign In to Portal"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-2 border-t border-slate-800 text-center">
            <span className="text-xs text-slate-400">Need a B2B operator account? </span>
            <Link href="/portal/register" className="text-xs text-amber-400 font-semibold hover:underline">
              Register Here
            </Link>
          </div>
        </div>

        {/* Quick Credentials Selection */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="text-xs font-semibold text-slate-300">Select Demo Account to Test:</div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={fillDemo}
              className="p-2.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-xl text-left transition-all group"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 group-hover:text-amber-300">
                <UserCheck className="w-3.5 h-3.5" />
                Client Operator
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                demo@royalggr.com
              </div>
              <div className="text-[9px] text-emerald-400 mt-0.5">isAdmin = false</div>
            </button>

            <button
              type="button"
              onClick={fillAdmin}
              className="p-2.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-xl text-left transition-all group"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-purple-400 group-hover:text-purple-300">
                <ShieldAlert className="w-3.5 h-3.5" />
                Master Admin
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                admin@royalggr.com
              </div>
              <div className="text-[9px] text-purple-400 mt-0.5">isAdmin = true</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
