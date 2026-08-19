"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PortalNavbar } from "../../components/PortalNavbar";
import { PortalSidebar } from "../../components/PortalSidebar";
import {
  Layers,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  Star,
  Gamepad2,
  Sparkles,
  Trash2,
  Edit2,
  Filter,
} from "lucide-react";

function AdminGamesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialBrandId = searchParams.get("brand_id") || "";

  const [operator, setOperator] = useState<any>(null);
  const [providers, setProviders] = useState<any[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(initialBrandId);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<any>(null);

  // Form fields
  const [providerId, setProviderId] = useState("");
  const [gameUid, setGameUid] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("slots");
  const [rtp, setRtp] = useState("96.5");
  const [volatility, setVolatility] = useState("MEDIUM");
  const [maxMultiplier, setMaxMultiplier] = useState("5000x");
  const [thumbnail, setThumbnail] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  const fetchGamesData = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedBrand) params.set("brand_id", selectedBrand);
      if (selectedCategory && selectedCategory !== "all") params.set("category", selectedCategory);
      if (searchQuery.trim()) params.set("q", searchQuery.trim());

      const [opRes, provRes, gamesRes] = await Promise.all([
        fetch("/api/operator/me"),
        fetch("/api/admin/providers"),
        fetch(`/api/admin/games?${params.toString()}`),
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
      const gamesJson = await gamesRes.json();

      setOperator(opJson.operator);
      setProviders(provJson.providers || []);
      setGames(gamesJson.games || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGamesData();
  }, [selectedBrand, selectedCategory, searchQuery]);

  const handleOpenAddModal = (g?: any) => {
    if (g) {
      setEditingGame(g);
      setProviderId(g.providerId);
      setGameUid(g.gameUid);
      setName(g.name);
      setCategory(g.category);
      setRtp(String(g.rtp));
      setVolatility(g.volatility);
      setMaxMultiplier(g.maxMultiplier);
      setThumbnail(g.thumbnail || "");
      setIsActive(g.isActive);
      setIsFeatured(g.isFeatured);
    } else {
      setEditingGame(null);
      setProviderId(providers[0]?.id || "");
      setGameUid("");
      setName("");
      setCategory("slots");
      setRtp("96.5");
      setVolatility("MEDIUM");
      setMaxMultiplier("5000x");
      setThumbnail("");
      setIsActive(true);
      setIsFeatured(false);
    }
    setModalOpen(true);
  };

  const handleSaveGame = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerId,
          gameUid,
          name,
          category,
          rtp: Number(rtp),
          volatility,
          maxMultiplier,
          thumbnail,
          isActive,
          isFeatured,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        await fetchGamesData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleStatus = async (id: string, field: "isActive" | "isFeatured") => {
    try {
      await fetch("/api/admin/games/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, field }),
      });
      await fetchGamesData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteGame = async (id: string) => {
    if (!confirm("Delete this game from catalog?")) return;
    try {
      await fetch(`/api/admin/games?id=${id}`, { method: "DELETE" });
      await fetchGamesData();
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
        await fetchGamesData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSyncing(false);
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
                <Layers className="w-5 h-5 text-purple-400" />
                Aggregated Games Catalog ({games.length} Games)
              </h1>
              <p className="text-sm text-slate-400">
                Manage, feature, and toggle titles across Royal Studio, Pragmatic, PG Soft, Spribe, Evolution, and JILI.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSyncAll}
                disabled={syncing}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-2 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
                {syncing ? "Syncing Catalog..." : "Sync All Titles"}
              </button>

              <button
                onClick={() => handleOpenAddModal()}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-purple-500/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                Add New Game
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
              >
                <option value="">All Providers ({providers.length})</option>
                {providers.map((p) => (
                  <option key={p.brandId} value={String(p.brandId)}>
                    {p.name} (#{p.brandId})
                  </option>
                ))}
              </select>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
              >
                <option value="all">All Categories</option>
                <option value="slots">Slots</option>
                <option value="crash">Crash Games</option>
                <option value="live">Live Casino</option>
                <option value="table">Table & Roulette</option>
                <option value="originals">Royal Originals</option>
              </select>
            </div>

            <div className="relative min-w-[240px]">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by game name or UID..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Games Table */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden">
            {games.length === 0 ? (
              <div className="text-center py-16 text-xs text-slate-500">
                No games found matching the selected filters.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Game Title & UID</th>
                      <th className="py-3 px-4">Provider</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">RTP / Volatility</th>
                      <th className="py-3 px-4">Max Multiplier</th>
                      <th className="py-3 px-4">Featured</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {games.map((g) => (
                      <tr key={g.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-white flex items-center gap-2">
                            {g.name}
                            {g.isFeatured && (
                              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
                            )}
                          </div>
                          <div className="font-mono text-[10px] text-slate-500">{g.gameUid}</div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-950 border border-slate-800 text-purple-300">
                            {g.provider?.name || "Provider"}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <span className="capitalize text-slate-300 font-medium">{g.category}</span>
                        </td>

                        <td className="py-3 px-4 font-mono text-[11px]">
                          <span className="text-emerald-400 font-bold">{g.rtp}%</span>
                          <span className="text-slate-500 ml-1">({g.volatility})</span>
                        </td>

                        <td className="py-3 px-4 font-mono text-amber-400 font-bold">
                          {g.maxMultiplier}
                        </td>

                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleToggleStatus(g.id, "isFeatured")}
                            className={`p-1.5 rounded-lg transition-colors ${
                              g.isFeatured ? "text-amber-400 bg-amber-500/10" : "text-slate-600 hover:text-slate-400"
                            }`}
                          >
                            <Star className={`w-4 h-4 ${g.isFeatured ? "fill-amber-400" : ""}`} />
                          </button>
                        </td>

                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleToggleStatus(g.id, "isActive")}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${
                              g.isActive
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                            }`}
                          >
                            {g.isActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            {g.isActive ? "ACTIVE" : "DISABLED"}
                          </button>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenAddModal(g)}
                              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteGame(g.id)}
                              className="p-1.5 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Add / Edit Game Modal */}
          {modalOpen && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Gamepad2 className="w-4 h-4 text-purple-400" />
                    {editingGame ? "Edit Game Metadata" : "Add New Game to Catalog"}
                  </h3>
                  <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white text-xs">
                    ✕ Close
                  </button>
                </div>

                <form onSubmit={handleSaveGame} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Game Studio / Provider</label>
                    <select
                      value={providerId}
                      onChange={(e) => setProviderId(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                    >
                      {providers.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (#{p.brandId})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">Game Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Sweet Bonanza"
                        required
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">Game UID</label>
                      <input
                        type="text"
                        value={gameUid}
                        onChange={(e) => setGameUid(e.target.value)}
                        placeholder="e.g. vs20sweetbonanza"
                        required
                        disabled={!!editingGame}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">Category</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                      >
                        <option value="slots">Slots</option>
                        <option value="crash">Crash</option>
                        <option value="live">Live Casino</option>
                        <option value="table">Table</option>
                        <option value="originals">Originals</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">RTP (%)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={rtp}
                        onChange={(e) => setRtp(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">Max Multiplier</label>
                      <input
                        type="text"
                        value={maxMultiplier}
                        onChange={(e) => setMaxMultiplier(e.target.value)}
                        placeholder="e.g. 5000x"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Thumbnail / Poster URL</label>
                    <input
                      type="url"
                      value={thumbnail}
                      onChange={(e) => setThumbnail(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono"
                    />
                  </div>

                  <div className="flex items-center gap-6 pt-2">
                    <label className="flex items-center gap-2 text-slate-300 font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        className="w-4 h-4 rounded text-purple-600 bg-slate-950 border-slate-700"
                      />
                      Active
                    </label>

                    <label className="flex items-center gap-2 text-slate-300 font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isFeatured}
                        onChange={(e) => setIsFeatured(e.target.checked)}
                        className="w-4 h-4 rounded text-amber-500 bg-slate-950 border-slate-700"
                      />
                      Featured in Lobby
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
                      Save Game
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

export default function AdminGamesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
          <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <AdminGamesContent />
    </Suspense>
  );
}
