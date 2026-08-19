"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PublicNavbar } from "../components/PublicNavbar";
import { PublicFooter } from "../components/PublicFooter";
import {
  BookOpen,
  Code2,
  Copy,
  Check,
  Send,
  Terminal,
  Layers,
  Sparkles,
  Shield,
  KeyRound,
  Zap,
  CheckCircle,
  Play,
} from "lucide-react";

export default function PublicDocsPage() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeLang, setActiveLang] = useState<"curl" | "node" | "php" | "python">("curl");

  // Interactive tester state
  const [testToken, setTestToken] = useState("roy_live_demo1234567890abcdef");
  const [testPlayerId, setTestPlayerId] = useState("player_user_1001");
  const [testGameUid, setTestGameUid] = useState("royal_coinflip");
  const [testBalance, setTestBalance] = useState("1000");
  const [testingLaunch, setTestingLaunch] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleTestLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestingLaunch(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/v1/launch", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${testToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: testPlayerId,
          game_uid: testGameUid,
          balance: Number(testBalance),
          currency: "INR",
          callback_url: "http://localhost:3000/api/callback",
          return_url: "http://localhost:3000",
        }),
      });

      const json = await res.json();
      setTestResult(json);
    } catch (err: any) {
      setTestResult({ error: err.message });
    } finally {
      setTestingLaunch(false);
    }
  };

  const tokenStr = testToken || "roy_live_your_token_here";

  const codeSnippets = {
    curl: `curl -X POST http://localhost:3001/api/v1/launch \\
  -H "Authorization: Bearer ${tokenStr}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "user_id": "player_8872",
    "game_uid": "royal_coinflip",
    "balance": 1500,
    "currency": "INR",
    "callback_url": "https://yourcasino.com/api/callback",
    "return_url": "https://yourcasino.com/lobby"
  }'`,
    node: `const axios = require('axios');

async function launchGame() {
  const response = await axios.post('http://localhost:3001/api/v1/launch', {
    user_id: 'player_8872',
    game_uid: 'royal_coinflip',
    balance: 1500,
    currency: 'INR',
    callback_url: 'https://yourcasino.com/api/callback',
    return_url: 'https://yourcasino.com/lobby'
  }, {
    headers: {
      'Authorization': 'Bearer ${tokenStr}',
      'Content-Type': 'application/json'
    }
  });

  console.log('Launch URL:', response.data.data.launch_url);
}

launchGame();`,
    php: `<?php
$ch = curl_init("http://localhost:3001/api/v1/launch");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer ${tokenStr}",
    "Content-Type: application/json"
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    "user_id" => "player_8872",
    "game_uid" => "royal_coinflip",
    "balance" => 1500,
    "currency" => "INR",
    "callback_url" => "https://yourcasino.com/api/callback",
    "return_url" => "https://yourcasino.com/lobby"
]));

$response = curl_exec($ch);
$data = json_decode($response, true);
echo "Launch URL: " . $data["data"]["launch_url"];
?>`,
    python: `import requests

url = "http://localhost:3001/api/v1/launch"
headers = {
    "Authorization": "Bearer ${tokenStr}",
    "Content-Type": "application/json"
}
payload = {
    "user_id": "player_8872",
    "game_uid": "royal_coinflip",
    "balance": 1500,
    "currency": "INR",
    "callback_url": "https://yourcasino.com/api/callback",
    "return_url": "https://yourcasino.com/lobby"
}

res = requests.post(url, json=payload, headers=headers)
print("Launch URL:", res.json()["data"]["launch_url"])`,
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between" suppressHydrationWarning>
      <PublicNavbar />

      <main className="max-w-7xl mx-auto w-full px-6 py-10 flex-1 space-y-10">
        {/* Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border border-slate-800 p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
              <BookOpen className="w-3.5 h-3.5" />
              Public API Documentation (v1.0)
            </div>
            <h1 className="text-3xl font-extrabold text-white">
              Royal GGR <span className="gold-gradient-text">B2B Integration Reference</span>
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              Connect your iGaming casino frontend with a single unified REST API gateway. Authenticate via Bearer Token, request game launch sessions, and receive real-time idempotent settlement webhooks.
            </p>
          </div>

          <div className="flex items-center gap-3 z-10">
            <Link
              href="/catalog"
              className="px-5 py-3 bg-purple-950/80 hover:bg-purple-900 text-purple-200 text-xs font-bold rounded-xl border border-purple-800 flex items-center gap-2 transition-all shadow-lg shadow-purple-950/40"
            >
              <Layers className="w-4 h-4 text-purple-400" />
              View Games Catalog
            </Link>
            <Link
              href="/portal/register"
              className="px-5 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
            >
              <KeyRound className="w-4 h-4" />
              Get Live API Key
            </Link>
          </div>
        </div>

        {/* Core Endpoints Reference */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Documentation Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview & Auth */}
            <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-400" />
                Authentication & Headers
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                All requests to the Royal GGR REST Gateway require authentication via an HTTP <code className="text-amber-400 font-mono bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">Authorization: Bearer Token</code> header. You can obtain your token in the Operator Portal.
              </p>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 text-xs font-mono">
                <div className="text-slate-500 uppercase text-[10px] font-bold font-sans">Required Headers</div>
                <div className="text-slate-300">Authorization: Bearer roy_live_79b49f0e7f96cb...</div>
                <div className="text-slate-300">Content-Type: application/json</div>
              </div>
            </section>

            {/* POST /api/v1/launch */}
            <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold font-mono">
                    POST
                  </span>
                  <code className="text-sm font-bold text-white font-mono">/api/v1/launch</code>
                </div>
                <span className="text-xs text-amber-400 font-semibold bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                  Primary Game Launcher
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Generates a secure, authenticated Remote Gaming Server (RGS) launch session URL. Embed this URL inside an iframe on your player frontend.
              </p>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">JSON Body Parameters</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-slate-800 rounded-xl overflow-hidden">
                    <thead className="bg-slate-950 text-slate-400 font-mono">
                      <tr>
                        <th className="p-2.5">Field</th>
                        <th className="p-2.5">Type</th>
                        <th className="p-2.5">Required</th>
                        <th className="p-2.5">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 text-slate-300">
                      <tr>
                        <td className="p-2.5 font-mono text-amber-400">user_id</td>
                        <td className="p-2.5 font-mono text-slate-400">String</td>
                        <td className="p-2.5 font-bold text-emerald-400">Yes</td>
                        <td className="p-2.5">Unique player ID on your casino system</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-mono text-amber-400">game_uid</td>
                        <td className="p-2.5 font-mono text-slate-400">String</td>
                        <td className="p-2.5 font-bold text-emerald-400">Yes</td>
                        <td className="p-2.5">Game unique ID e.g. <code className="text-slate-300 bg-slate-950 px-1 rounded">royal_coinflip</code></td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-mono text-amber-400">balance</td>
                        <td className="p-2.5 font-mono text-slate-400">Number</td>
                        <td className="p-2.5 font-bold text-emerald-400">Yes</td>
                        <td className="p-2.5">Player current starting wallet balance</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-mono text-amber-400">currency</td>
                        <td className="p-2.5 font-mono text-slate-400">String</td>
                        <td className="p-2.5 font-bold text-slate-500">No</td>
                        <td className="p-2.5">Currency code (Default: <code className="text-slate-300">INR</code>)</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-mono text-amber-400">callback_url</td>
                        <td className="p-2.5 font-mono text-slate-400">String</td>
                        <td className="p-2.5 font-bold text-emerald-400">Yes</td>
                        <td className="p-2.5">Your endpoint receiving HTTP POST settlement webhooks</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-mono text-amber-400">return_url</td>
                        <td className="p-2.5 font-mono text-slate-400">String</td>
                        <td className="p-2.5 font-bold text-emerald-400">Yes</td>
                        <td className="p-2.5">Redirect URL when player clicks "Exit Game"</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Code Snippets Section */}
            <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-purple-400" />
                  SDK & Code Examples
                </h3>

                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                  {(["curl", "node", "php", "python"] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setActiveLang(lang)}
                      className={`px-3 py-1 rounded-lg font-mono uppercase text-[11px] transition-all ${
                        activeLang === lang
                          ? "bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative group">
                <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed">
                  {codeSnippets[activeLang]}
                </pre>
                <button
                  onClick={() => copyToClipboard(codeSnippets[activeLang], "snippet")}
                  className="absolute top-3 right-3 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center gap-1 transition-all"
                >
                  {copiedKey === "snippet" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedKey === "snippet" ? "Copied" : "Copy"}
                </button>
              </div>
            </section>

            {/* Webhook Callback Specification */}
            <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded-lg text-xs font-bold font-mono">
                    POST
                  </span>
                  <code className="text-sm font-bold text-white font-mono">[your_callback_url]</code>
                </div>
                <span className="text-xs text-sky-400 font-semibold bg-sky-500/10 border border-sky-500/20 px-2.5 py-0.5 rounded-full">
                  Real-time Settlement Webhook
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                When a round completes in the Remote Gaming Server, Royal GGR dispatches an idempotent HTTP POST callback to your <code className="text-amber-400 font-mono">callback_url</code>. Update player balance on your system based on <code className="text-emerald-400 font-mono">credit_amount</code> or <code className="text-white font-mono">win_amount - bet_amount</code>.
              </p>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 space-y-2">
                <div className="text-slate-500 uppercase text-[10px] font-bold font-sans">Sample Webhook Payload</div>
                <pre className="text-amber-300 text-[11px] leading-relaxed">
{`{
  "serial_number": "SN_1707062018942_25491763",
  "member_account": "player_user_1001",
  "game_uid": "royal_coinflip",
  "game_round": "RND_998124",
  "bet_amount": 100.00,
  "win_amount": 196.00,
  "credit_amount": 1096.00,
  "ggr_fee_deducted": 10.00,
  "timestamp": "2026-08-19T16:00:00Z"
}`}
                </pre>
              </div>
            </section>
          </div>

          {/* Right Column: Live Interactive Launch API Tester */}
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 sticky top-24 shadow-2xl">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                <Zap className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Live Launch API Tester</h3>
              </div>

              <form onSubmit={handleTestLaunch} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">API Token</label>
                  <input
                    type="text"
                    value={testToken}
                    onChange={(e) => setTestToken(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Game UID</label>
                  <select
                    value={testGameUid}
                    onChange={(e) => setTestGameUid(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono"
                  >
                    <option value="royal_coinflip">🪙 Coin Flip Royale (royal_coinflip)</option>
                    <option value="royal_andarbahar">🎴 Andar Bahar Live (royal_andarbahar)</option>
                    <option value="royal_chickencross">🐔 Chicken Road Cross (royal_chickencross)</option>
                    <option value="royal_aviator">✈️ Aviator Royale (royal_aviator)</option>
                    <option value="royal_mines">💣 Mines Gold (royal_mines)</option>
                    <option value="royal_roulette">🎡 European Roulette (royal_roulette)</option>
                    <option value="pragmatic_5701">🎰 Sweet Bonanza Deluxe (pragmatic_5701)</option>
                    <option value="pgsoft_4501">🏮 Mahjong Ways 2 (pgsoft_4501)</option>
                    <option value="spribe_4901">🚀 Spribe Aviator Original (spribe_4901)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Player User ID</label>
                    <input
                      type="text"
                      value={testPlayerId}
                      onChange={(e) => setTestPlayerId(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Starting Balance</label>
                    <input
                      type="number"
                      value={testBalance}
                      onChange={(e) => setTestBalance(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-[11px]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={testingLaunch}
                  className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {testingLaunch ? "Sending API Request..." : "Test POST /api/v1/launch"}
                </button>
              </form>

              {testResult && (
                <div className="space-y-2 pt-3 border-t border-slate-800">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-300">API Response:</span>
                    <span className={testResult.status === 1 ? "text-emerald-400" : "text-rose-400"}>
                      Status: {testResult.status === 1 ? "SUCCESS (1)" : "FAILED (0)"}
                    </span>
                  </div>

                  <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[10px] font-mono text-amber-300 overflow-x-auto max-h-48 leading-relaxed">
                    {JSON.stringify(testResult, null, 2)}
                  </pre>

                  {testResult?.data?.launch_url && (
                    <a
                      href={testResult.data.launch_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-purple-600/30 transition-all"
                    >
                      <Play className="w-3.5 h-3.5" />
                      Open Test Session in New Tab
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
