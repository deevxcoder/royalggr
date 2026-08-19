"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { PublicNavbar } from "../components/PublicNavbar";
import { PublicFooter } from "../components/PublicFooter";
import {
  Layers,
  Search,
  Gamepad2,
  Sparkles,
  Star,
  CheckCircle2,
  Flame,
  Zap,
  Filter,
  Info,
  Play,
  KeyRound,
  Code,
} from "lucide-react";

export default function PublicCatalogPage() {
  const [providers, setProviders] = useState<any[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGameModal, setSelectedGameModal] = useState<any>(null);

  const categories = [
    { id: "all", name: "All Games" },
    { id: "slots", name: "🎰 Slots" },
    { id: "crash", name: "🚀 Crash & Stepper" },
    { id: "live", name: "🎴 Live Casino" },
    { id: "table", name: "🎡 Table Games" },
    { id: "originals", name: "👑 Royal Originals" },
  ];

  const fetchPublicCatalog = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedBrand) params.set("brand_id", selectedBrand);
      if (selectedCategory && selectedCategory !== "all") params.set("category", selectedCategory);
      if (searchQuery.trim()) params.set("q", searchQuery.trim());

      const res = await fetch(`/api/public/catalog?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setProviders(data.providers || []);
        setGames(data.games || []);
      }
    } catch (e) {
      console.error("Catalog fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicCatalog();
  }, [selectedBrand, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between" suppressHydrationWarning>
      <PublicNavbar />

      <main className="max-w-7xl mx-auto w-full px-6 py-10 flex-1 space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border border-slate-800 p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold">
              <Layers className="w-3.5 h-3.5" />
              Unified Multi-Provider iGaming Catalog
            </div>
            <h1 className="text-3xl font-extrabold text-white">
              Explore <span className="purple-gradient-text">5,000+ Casino Titles</span> & Studio Games
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              Instant access to Pragmatic Play, PG Soft, Spribe, Evolution, JILI, Hacksaw, and native Royal Studio RGS games through our single unified B2B REST API.
            </p>
          </div>

          <div className="flex items-center gap-3 z-10">
            <Link
              href="/portal/register"
              className="px-6 py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all shrink-0"
            >
              <KeyRound className="w-4 h-4" />
              Get API Access Token
            </Link>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="space-y-4">
          {/* Top Search & Brand Filter */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search game title or game_uid..."
                className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Provider Brand Selection Pills */}
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
              <button
                onClick={() => setSelectedBrand("")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedBrand === ""
                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm"
                    : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                All Providers ({providers.reduce((acc, p) => acc + (p.gameCount || 0), 0)})
              </button>

              {providers.map((p) => (
                <button
                  key={p.brandId}
                  onClick={() => setSelectedBrand(String(p.brandId))}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    selectedBrand === String(p.brandId)
                      ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm"
                      : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  <span>{p.name}</span>
                  <span className="text-[10px] font-mono opacity-60">#{p.brandId}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-800/80">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Games Grid Section */}
        {loading ? (
          <div className="py-20 text-center text-slate-400 space-y-3">
            <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div className="text-xs">Loading Games Catalog...</div>
          </div>
        ) : games.length === 0 ? (
          <div className="py-20 text-center text-slate-500 space-y-2 bg-slate-900/40 rounded-3xl border border-slate-800">
            <Gamepad2 className="w-8 h-8 text-slate-600 mx-auto" />
            <div className="text-sm font-semibold text-slate-400">No games matched your filters</div>
            <p className="text-xs text-slate-500">Try selecting "All Providers" or clearing search terms.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {games.map((g) => (
              <div
                key={g.id}
                onClick={() => setSelectedGameModal(g)}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all duration-300 group cursor-pointer flex flex-col justify-between shadow-lg hover:shadow-purple-950/20"
              >
                <div>
                  {/* Thumbnail Banner */}
                  <div className="relative h-40 w-full overflow-hidden bg-slate-950">
                    <img
                      src={g.thumbnail || "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=600&q=80"}
                      alt={g.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />

                    {/* Featured Tag */}
                    {g.isFeatured && (
                      <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px] flex items-center gap-1 shadow-md">
                        <Flame className="w-3 h-3" />
                        HOT
                      </div>
                    )}

                    {/* Brand Badge */}
                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-slate-950/80 backdrop-blur border border-slate-700 text-[10px] font-mono font-semibold text-purple-300">
                      {g.provider?.name || "Aggregator"}
                    </div>
                  </div>

                  {/* Content Info */}
                  <div className="p-4 space-y-2">
                    <h3 className="font-bold text-sm text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                      {g.name}
                    </h3>

                    <div className="text-[11px] font-mono text-slate-400 bg-slate-950/80 px-2 py-1 rounded-lg border border-slate-800/80 truncate">
                      game_uid: <span className="text-amber-300">{g.gameUid}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-1 pt-1 text-[10px]">
                      <div className="bg-slate-950 p-1.5 rounded-lg border border-slate-800 text-center">
                        <span className="text-slate-500 block">RTP</span>
                        <span className="text-emerald-400 font-bold font-mono">{g.rtp}%</span>
                      </div>
                      <div className="bg-slate-950 p-1.5 rounded-lg border border-slate-800 text-center">
                        <span className="text-slate-500 block">Vol.</span>
                        <span className="text-amber-400 font-bold font-mono">{g.volatility}</span>
                      </div>
                      <div className="bg-slate-950 p-1.5 rounded-lg border border-slate-800 text-center">
                        <span className="text-slate-500 block">Max</span>
                        <span className="text-purple-300 font-bold font-mono">{g.maxMultiplier}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-4 pb-4 pt-1">
                  <div className="w-full py-2 bg-slate-800/80 group-hover:bg-purple-600 text-slate-300 group-hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all">
                    <Info className="w-3.5 h-3.5" />
                    Integration Details
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal for Game Integration Details */}
        {selectedGameModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Gamepad2 className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-bold text-white">{selectedGameModal.name}</h3>
                </div>
                <button
                  onClick={() => setSelectedGameModal(null)}
                  className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 rounded bg-slate-800"
                >
                  ✕ Close
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400">Provider Brand:</span>
                  <span className="font-bold text-purple-300">
                    {selectedGameModal.provider?.name} (Brand #{selectedGameModal.provider?.brandId})
                  </span>
                </div>

                <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400">Game UID:</span>
                  <code className="font-mono text-amber-400 font-bold">{selectedGameModal.gameUid}</code>
                </div>

                <div className="space-y-1.5">
                  <span className="text-slate-400 font-semibold block">Sample API Launch Payload:</span>
                  <pre className="bg-slate-950 border border-slate-800 p-3 rounded-xl font-mono text-[11px] text-emerald-300 leading-relaxed overflow-x-auto">
{`// POST http://localhost:3001/api/v1/launch
{
  "user_id": "player_1001",
  "game_uid": "${selectedGameModal.gameUid}",
  "balance": 1000,
  "currency": "INR",
  "callback_url": "https://yourcasino.com/api/callback",
  "return_url": "https://yourcasino.com/lobby"
}`}
                  </pre>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <Link
                    href="/docs"
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl flex items-center gap-1.5"
                  >
                    <Code className="w-3.5 h-3.5 text-amber-400" />
                    View Full API Docs
                  </Link>
                  <Link
                    href="/portal/register"
                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold rounded-xl flex items-center gap-1 shadow-lg shadow-amber-500/20"
                  >
                    Get API Token
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}
