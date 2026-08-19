"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PortalNavbar } from "../../components/PortalNavbar";
import { PortalSidebar } from "../../components/PortalSidebar";
import {
  Server,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Shield,
  Layers,
  Sparkles,
  Link as LinkIcon,
} from "lucide-react";

export default function AdminProvidersPage() {
  const router = useRouter();
  const [operator, setOperator] = useState<any>(null);
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<any>(null);

  // Form fields
  const [brandId, setBrandId] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState("NEXX_AGGREGATOR");
  const [apiUrl, setApiUrl] = useState("https://api.nexxapi.tech/api/v1");
  const [apiToken, setApiToken] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [logo, setLogo] = useState("");
  const [ggrMargin, setGgrMargin] = useState("10.0");
  const [isActive, setIsActive] = useState(true);

  const fetchProvidersData = async () => {
    try {
      const [opRes, provRes] = await Promise.all([
        fetch("/api/operator/me"),
        fetch("/api/admin/providers"),
      ]);

      if (opRes.status === 401) {
        router.push("/portal/login");
        return;
      }

      const opJson = await opRes.json();
      if (!opJson.operator?.isAdmin) {
        router.push("/portal/dashboard");
        return;
      }

      const provJson = await provRes.json();

      setOperator(opJson.operator);
      setProviders(provJson.providers || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProvidersData();
  }, []);

  const handleOpenAddModal = (p?: any) => {
    if (p) {
      setEditingProvider(p);
      setBrandId(String(p.brandId));
      setName(p.name);
      setType(p.type);
      setApiUrl(p.apiUrl || "");
      setApiToken(p.apiToken || "");
      setApiSecret(p.apiSecret || "");
      setLogo(p.logo || "");
      setGgrMargin(String(p.ggrMargin || 10.0));
      setIsActive(p.isActive);
    } else {
      setEditingProvider(null);
      setBrandId("");
      setName("");
      setType("NEXX_AGGREGATOR");
      setApiUrl("https://api.nexxapi.tech/api/v1");
      setApiToken("");
      setApiSecret("");
      setLogo("");
      setGgrMargin("10.0");
      setIsActive(true);
    }
    setModalOpen(true);
  };

  const handleSaveProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandId: Number(brandId),
          name,
          type,
          apiUrl,
          apiToken,
          apiSecret,
          logo,
          ggrMargin: Number(ggrMargin),
          isActive,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        await fetchProvidersData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSyncAll = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/admin/games/sync", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        await fetchProvidersData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSyncing(false);
    }
  };

  const handleDeleteProvider = async (id: string) => {
    if (!confirm("Are you sure you want to remove this provider and all its games?")) return;
    try {
      await fetch(`/api/admin/providers?id=${id}`, { method: "DELETE" });
      await fetchProvidersData();
    } catch (e) {
      console.error(e);
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <Server className="w-5 h-5 text-purple-400" />
                Game Studios & Aggregator Hub
              </h1>
              <p className="text-sm text-slate-400">
                Connect external providers (Pragmatic, PG Soft, Spribe, Evolution, NexxAPI) and manage upstream API credentials.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSyncAll}
                disabled={syncing}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-2 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
                {syncing ? "Syncing Providers..." : "1-Click Sync Master Catalog"}
              </button>

              <button
                onClick={() => handleOpenAddModal()}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-purple-500/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                Connect New Provider
              </button>
            </div>
          </div>

          {/* Providers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {providers.map((p) => (
              <div
                key={p.id}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 hover:border-purple-500/40 transition-all group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono">
                      Brand #{p.brandId}
                    </span>

                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.isActive
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}
                    >
                      {p.isActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {p.isActive ? "ACTIVE" : "DISABLED"}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                    {p.name}
                  </h3>

                  <div className="space-y-1.5 text-xs text-slate-400">
                    <div className="flex justify-between">
                      <span>Integration Type:</span>
                      <span className="font-mono text-slate-300 font-semibold">{p.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Games:</span>
                      <span className="font-mono text-amber-400 font-bold">{p._count?.games || p.gameCount || 0} games</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GGR Hold Margin:</span>
                      <span className="font-mono text-emerald-400 font-bold">{p.ggrMargin}%</span>
                    </div>
                    {p.apiUrl && (
                      <div className="truncate font-mono text-[10px] text-slate-500 bg-slate-950 p-1.5 rounded-lg border border-slate-800/80">
                        {p.apiUrl}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => router.push(`/portal/admin/games?brand_id=${p.brandId}`)}
                    className="text-xs text-purple-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    Manage Games
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenAddModal(p)}
                      className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
                      title="Edit Provider"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {p.brandId !== 1 && (
                      <button
                        onClick={() => handleDeleteProvider(p.id)}
                        className="p-1.5 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 rounded-lg transition-colors"
                        title="Delete Provider"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add / Edit Modal */}
          {modalOpen && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Server className="w-4 h-4 text-purple-400" />
                    {editingProvider ? "Edit Provider Settings" : "Connect New Provider / Aggregator"}
                  </h3>
                  <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white text-xs">
                    ✕ Close
                  </button>
                </div>

                <form onSubmit={handleSaveProvider} className="space-y-3.5 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">Brand ID</label>
                      <input
                        type="number"
                        value={brandId}
                        onChange={(e) => setBrandId(e.target.value)}
                        placeholder="e.g. 57, 45, 101"
                        required
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">Provider / Studio Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Pragmatic Play"
                        required
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">Aggregator Type</label>
                      <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                      >
                        <option value="NEXX_AGGREGATOR">NexxAPI Aggregator</option>
                        <option value="ROYAL_NATIVE">Royal Games Native RGS</option>
                        <option value="DIRECT_RGS">Direct Game Studio RGS</option>
                        <option value="CUSTOM_HTTP">Custom HTTP Relay</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">GGR Hold Margin (%)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={ggrMargin}
                        onChange={(e) => setGgrMargin(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Upstream API Gateway Endpoint</label>
                    <input
                      type="url"
                      value={apiUrl}
                      onChange={(e) => setApiUrl(e.target.value)}
                      placeholder="https://api.nexxapi.tech/api/v1"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">API Key / Token</label>
                      <input
                        type="text"
                        value={apiToken}
                        onChange={(e) => setApiToken(e.target.value)}
                        placeholder="Optional API token"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">Secret Key</label>
                      <input
                        type="password"
                        value={apiSecret}
                        onChange={(e) => setApiSecret(e.target.value)}
                        placeholder="Optional secret key"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-4 h-4 rounded text-purple-600 bg-slate-950 border-slate-700"
                    />
                    <label htmlFor="isActive" className="text-slate-300 font-semibold cursor-pointer">
                      Enable this provider in public catalog and API endpoints
                    </label>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-purple-500/20"
                    >
                      Save Provider
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
