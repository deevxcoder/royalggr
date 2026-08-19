"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PortalNavbar } from "../components/PortalNavbar";
import { PortalSidebar } from "../components/PortalSidebar";
import {
  BookOpen,
  Code2,
  Copy,
  Check,
  Send,
  Terminal,
  Layers,
  Sparkles,
} from "lucide-react";

export default function DocsPage() {
  const router = useRouter();
  const [operator, setOperator] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeLang, setActiveLang] = useState<"curl" | "node" | "php" | "python">("curl");

  // Interactive tester state
  const [testPlayerId, setTestPlayerId] = useState("player_user_1001");
  const [testGameUid, setTestGameUid] = useState("royal_coinflip");
  const [testBalance, setTestBalance] = useState("1000");
  const [testingLaunch, setTestingLaunch] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/operator/me");
      if (res.status === 401) {
        router.push("/portal/login");
        return;
      }
      const json = await res.json();
      setOperator(json.operator);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const copySnippet = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleTestLaunch = async () => {
    const token = operator?.tokens[0]?.token || "YOUR_ROYAL_API_TOKEN";
    setTestingLaunch(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/v1/launch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: testPlayerId,
          game_uid: testGameUid,
          balance: Number(testBalance),
          currency: operator?.currency || "INR",
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400" suppressHydrationWarning>
        <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" suppressHydrationWarning></div>
      </div>
    );
  }

  const tokenStr = operator?.tokens[0]?.token || "roy_live_your_token_here";

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
    node: `// Node.js (axios / fetch)
import axios from "axios";

const response = await axios.post("http://localhost:3001/api/v1/launch", {
  user_id: "player_8872",
  game_uid: "royal_coinflip",
  balance: 1500,
  currency: "INR",
  callback_url: "https://yourcasino.com/api/callback",
  return_url: "https://yourcasino.com/lobby"
}, {
  headers: {
    "Authorization": "Bearer ${tokenStr}",
    "Content-Type": "application/json"
  }
});

console.log("Game URL:", response.data.data.launch_url);`,
    php: `<?php
// PHP cURL
$ch = curl_init("http://localhost:3001/api/v1/launch");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
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
    python: `# Python (requests)
import requests

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
    <div className="min-h-screen bg-slate-950 flex flex-col" suppressHydrationWarning>
      <PortalNavbar operator={operator} />

      <div className="flex-1 flex">
        <PortalSidebar operator={operator} />

        <main className="flex-1 p-8 space-y-8 overflow-y-auto">
          {/* Header */}
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-400" />
              Interactive B2B API Documentation & SDKs
            </h1>
            <p className="text-sm text-slate-400">
              Integrate Royal Games RGS & multi-provider aggregator with standard REST endpoints and signed webhooks.
            </p>
          </div>

          {/* Interactive Sandbox & Code Generator */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Code Generator */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-bold text-white">POST /api/v1/launch</span>
                </div>

                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  {(["curl", "node", "php", "python"] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setActiveLang(lang)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold uppercase transition-all ${
                        activeLang === lang
                          ? "bg-amber-500 text-slate-950 font-bold"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative">
                <pre className="bg-slate-950 border border-slate-800 p-4 rounded-xl font-mono text-xs text-amber-300 overflow-x-auto leading-relaxed max-h-72">
                  {codeSnippets[activeLang]}
                </pre>
                <button
                  onClick={() => copySnippet(codeSnippets[activeLang], "code")}
                  className="absolute top-3 right-3 p-1.5 bg-slate-800/80 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white text-xs flex items-center gap-1 transition-colors"
                >
                  {copiedKey === "code" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Right: Live Interactive Sandbox Tester */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-bold text-white">Live API Sandbox Tester</span>
                </div>
                <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Online
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Game UID</label>
                  <select
                    value={testGameUid}
                    onChange={(e) => setTestGameUid(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs"
                  >
                    <option value="10509">JILI - 3 Coin Golden Ox (10509)</option>
                    <option value="473">JILI - Fortune Tree (473)</option>
                    <option value="10508">JILI - Gallina Fortunata (10508)</option>
                    <option value="1168">YGRGaming - 100x Diamond 7 (1168)</option>
                    <option value="4006">YGRGaming - Temple Adventure (4006)</option>
                    <option value="royal_coinflip">Royal Games - Coin Flip Royale (royal_coinflip)</option>
                    <option value="royal_andarbahar">Royal Games - Andar Bahar Live (royal_andarbahar)</option>
                    <option value="royal_chickencross">Royal Games - Chicken Road Cross (royal_chickencross)</option>
                    <option value="royal_aviator">Royal Games - Aviator Royale Crash (royal_aviator)</option>
                    <option value="royal_mines">Royal Games - Mines Gold (royal_mines)</option>
                    <option value="royal_roulette">Royal Games - European Roulette (royal_roulette)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Player ID</label>
                  <input
                    type="text"
                    value={testPlayerId}
                    onChange={(e) => setTestPlayerId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-xs mb-1">Player Starting Balance</label>
                <input
                  type="number"
                  value={testBalance}
                  onChange={(e) => setTestBalance(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-mono"
                />
              </div>

              <button
                onClick={handleTestLaunch}
                disabled={testingLaunch}
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                {testingLaunch ? "Launching..." : "Execute Test Launch Request"}
              </button>

              {testResult && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-400">Response JSON:</span>
                  <pre className="bg-slate-950 border border-slate-800 p-3 rounded-xl font-mono text-[11px] text-emerald-400 overflow-x-auto max-h-36">
                    {JSON.stringify(testResult, null, 2)}
                  </pre>
                  {testResult?.data?.launch_url && (
                    <a
                      href={testResult.data.launch_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-amber-400 hover:underline font-semibold mt-1"
                    >
                      Open Generated Play Session In New Tab →
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Endpoints Reference Table */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              Complete B2B REST Endpoints Catalog
            </h3>

            <div className="space-y-3">
              {[
                {
                  method: "POST",
                  path: "/api/v1/launch",
                  desc: "Generates an authenticated fullscreen game session URL for a player.",
                  auth: "Bearer Token",
                },
                {
                  method: "GET",
                  path: "/api/v1/games",
                  desc: "Returns list of active games, RTP, volatility, thumbnails, and categories.",
                  auth: "Bearer Token",
                },
                {
                  method: "GET",
                  path: "/api/v1/ggr-balance",
                  desc: "Queries remaining prepaid GGR wallet balance and revenue share status.",
                  auth: "Bearer Token",
                },
                {
                  method: "GET",
                  path: "/api/v1/whoami",
                  desc: "Diagnoses caller IP address and verifies IP whitelist firewall rules.",
                  auth: "Bearer Token",
                },
              ].map((ep) => (
                <div
                  key={ep.path}
                  className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                        ep.method === "POST"
                          ? "bg-amber-500/20 text-amber-400"
                          : "bg-sky-500/20 text-sky-400"
                      }`}
                    >
                      {ep.method}
                    </span>
                    <span className="font-mono text-white font-semibold">{ep.path}</span>
                  </div>
                  <div className="text-slate-400">{ep.desc}</div>
                  <div className="text-slate-500 font-mono text-[10px]">{ep.auth}</div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
