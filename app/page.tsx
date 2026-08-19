import Link from "next/link";
import { PublicNavbar } from "./components/PublicNavbar";
import { PublicFooter } from "./components/PublicFooter";
import { Crown, ArrowRight, Shield, Zap, Sparkles, BookOpen, KeyRound, Gamepad2, Layers } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between" suppressHydrationWarning>
      <PublicNavbar />

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-16 text-center space-y-8 flex-1 flex flex-col justify-center items-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
          <Sparkles className="w-4 h-4 text-amber-400" />
          Next-Gen B2B iGaming Aggregation & Remote Gaming Server
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl leading-tight text-white">
          Empowering Next-Gen Casinos with{" "}
          <span className="gold-gradient-text">Unified B2B API</span> & Provably Fair Games
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed">
          One single REST integration gives your casino platform instant access to native Royal Studio HTML5 games, automated 10% GGR billing, instant signed webhooks, and 5,000+ top provider titles.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
          <Link
            href="/portal/register"
            className="px-8 py-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-slate-950 font-bold rounded-2xl text-base flex items-center gap-2 shadow-xl shadow-amber-500/25 transition-all"
          >
            Launch Developer Portal
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/docs"
            className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold rounded-2xl text-base border border-slate-700 flex items-center gap-2 transition-all"
          >
            <BookOpen className="w-5 h-5 text-amber-400" />
            Explore API Docs
          </Link>
          <Link
            href="/catalog"
            className="px-8 py-4 bg-purple-950/60 hover:bg-purple-900/60 text-purple-200 font-semibold rounded-2xl text-base border border-purple-800/80 flex items-center gap-2 transition-all"
          >
            <Layers className="w-5 h-5 text-purple-400" />
            Browse Catalog (5000+)
          </Link>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 text-left w-full">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400 w-fit">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">6 Native Studio Games</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Coin Flip Royale, Andar Bahar Live, Chicken Road Cross, Aviator Royale Crash, Mines Gold, and European Roulette.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 w-fit">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Real-Time GGR Billing</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Automated prepaid revenue share deductions on player turnover with live transaction ledgers and balance alerts.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400 w-fit">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Cryptographic Webhooks</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              HMAC-SHA256 signed HTTP POST callbacks with idempotent serial keys and interactive 1-click retry inspector.
            </p>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
