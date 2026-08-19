"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { PortalSidebar } from "../components/PortalSidebar";
import {
  Layers,
  Search,
  Gamepad2,
  Sparkles,
  Rocket,
  Play,
  Filter,
  RefreshCw,
  Server,
} from "lucide-react";

export default function OperatorGamesCatalogPage() {
  const [operator, setOperator] = useState<any>(null);
  const [providers, setProviders] = useState<any[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { id: "all", name: "All Categories" },
    { id: "slots", name: "🎰 Slots" },
    { id: "crash", name: "🚀 Crash" },
    { id: "live", name: "🎴 Live Casino" },
    { id: "table", name: "🎡 Table Games" },
    { id: "originals", name: "👑 Royal Originals" },
  ];

  useEffect(() => {
    fetch("/api/operator/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.operator) setOperator(data.operator);
      });
  }, []);

  const loadGamesCatalog = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedBrand) params.set("brand_id", selectedBrand);
      if (selectedCategory && selectedCategory !== "all") params.set("category", selectedCategory);
      if (searchQuery.trim()) params.set("q", searchQuery.trim());
      params.set("limit", "100");

      const res = await fetch(`/api/operator/games?${params.toString()}`);
      const data = await res.json();
      if (data.games) {
        setGames(data.games);
      }
      if (data.providers) {
        setProviders(data.providers);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGamesCatalog();
  }, [selectedBrand, selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadGamesCatalog();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center font-bold text-slate-950 text-sm shadow-md">
            R
          </div>
          <span className="font-bold text-lg tracking-wide text-slate-100">
            ROYAL<span className="text-amber-400">GGR</span>
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            OPERATOR PORTAL
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span>Logged in as: <strong className="text-slate-200">{operator?.email}</strong></span>
          <a href="/portal/docs" className="hover:text-amber-400 font-medium">Docs</a>
          <button onClick={() => (window.location.href = "/portal/login")} className="hover:text-rose-400">
            Logout
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        <PortalSidebar operator={operator} />

        <main className="flex-1 p-8 overflow-y-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                <Layers className="w-6 h-6 text-amber-400" />
                Games Catalog
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Browse all 9,000+ active games available across all integrated providers. Click <strong className="text-amber-400">"Test Launch"</strong> to test any game in Launchpad Sandbox!
              </p>
            </div>

            <Link
              href="/portal/launchpad"
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition-all flex items-center gap-2 shrink-0"
            >
              <Rocket className="w-4 h-4" />
              Open Launchpad Sandbox
            </Link>
          </div>

          {/* Controls: Search, Providers, Categories */}
          <div className="space-y-4">
            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="flex gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search game by title or Game UID (e.g. 10509, Aviator, Super Ace...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 shadow-md transition-all"
              >
                Search
              </button>
            </form>

            {/* Provider Filter Badges */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <button
                onClick={() => setSelectedBrand("")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                  selectedBrand === ""
                    ? "bg-amber-500 text-slate-950 shadow"
                    : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                All Providers ({providers.reduce((acc, p) => acc + p.gameCount, 0)})
              </button>
              {providers.map((p) => (
                <button
                  key={p.brandId}
                  onClick={() => setSelectedBrand(String(p.brandId))}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all flex items-center gap-1.5 ${
                    selectedBrand === String(p.brandId)
                      ? "bg-amber-500 text-slate-950 shadow"
                      : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <span>{p.name}</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-slate-950/40 text-[10px] font-mono">
                    {p.gameCount}
                  </span>
                </button>
              ))}
            </div>

            {/* Category Filter Pills */}
            <div className="flex gap-2 border-b border-slate-800/80 pb-3">
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedCategory === c.id
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Games Grid */}
          {loading ? (
            <div className="p-16 text-center text-slate-400 flex items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-amber-400" />
              Loading Games Catalog...
            </div>
          ) : games.length === 0 ? (
            <div className="p-12 text-center text-slate-500 bg-slate-900/60 rounded-2xl border border-slate-800">
              No games found matching your filters.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {games.map((g) => (
                <div
                  key={g.id}
                  className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden hover:border-amber-500/40 transition-all flex flex-col justify-between group shadow-lg"
                >
                  <div className="relative aspect-[4/3] bg-slate-950 overflow-hidden">
                    {g.thumbnail ? (
                      <img
                        src={g.thumbnail}
                        alt={g.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600 font-bold text-xs">
                        NO IMAGE
                      </div>
                    )}
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-950/80 backdrop-blur text-[10px] font-semibold uppercase text-amber-400 border border-amber-500/20">
                      {g.provider.name}
                    </span>
                  </div>

                  <div className="p-3 space-y-2">
                    <h3 className="text-xs font-bold text-slate-200 truncate">{g.name}</h3>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>UID: {g.gameUid}</span>
                      <span className="capitalize">{g.category}</span>
                    </div>

                    <Link
                      href={`/portal/launchpad?game_uid=${encodeURIComponent(g.gameUid)}&brand_id=${g.provider.brandId}`}
                      className="w-full py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px] font-bold flex items-center justify-center gap-1 transition-all"
                    >
                      <Play className="w-3 h-3 fill-amber-400" />
                      Test Launch
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
