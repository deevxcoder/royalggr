"use client";

import React, { useEffect, useState } from "react";
import { PortalSidebar } from "../components/PortalSidebar";
import {
  Rocket,
  Play,
  ExternalLink,
  Lock,
  Code,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Copy,
  ChevronDown,
  Monitor,
} from "lucide-react";

export default function LaunchpadPage() {
  const [operator, setOperator] = useState<any>(null);
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Section 1: Test Launch State
  const [selectedBrandId, setSelectedBrandId] = useState<number | string>("");
  const [selectedGameUid, setSelectedGameUid] = useState<string>("");
  const [userId, setUserId] = useState("test-player-1");
  const [balance, setBalance] = useState("100");
  const [callbackUrl, setCallbackUrl] = useState("https://ggrcasinotest.vercel.app/api/callback");
  const [launching, setLaunching] = useState(false);
  const [launchResult, setLaunchResult] = useState<any>(null);
  const [launchError, setLaunchError] = useState<string | null>(null);
  const [showIframe, setShowIframe] = useState(false);

  // Section 2: Check Encryption State
  const [ciphertextInput, setCiphertextInput] = useState("");
  const [checkingEncryption, setCheckingEncryption] = useState(false);
  const [encryptionResult, setEncryptionResult] = useState<any>(null);

  // Section 3: Reference Payload State
  const [generatingReference, setGeneratingReference] = useState(false);
  const [referencePayload, setReferencePayload] = useState<any>(null);

  useEffect(() => {
    fetch("/api/operator/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.operator) {
          setOperator(data.operator);
        }
      });

    fetch("/api/operator/launchpad")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.providers) {
          setProviders(data.providers);
          if (data.providers.length > 0) {
            const firstProv = data.providers[0];
            setSelectedBrandId(firstProv.brandId);
            if (firstProv.games && firstProv.games.length > 0) {
              setSelectedGameUid(firstProv.games[0].gameUid);
            }
          }
        }
      })
      .finally(() => setLoading(false));
  }, []);

  // Update selected game list when provider changes
  const activeProvider = providers.find((p) => String(p.brandId) === String(selectedBrandId));
  const activeGames = activeProvider?.games || [];

  const handleProviderChange = (brandId: string) => {
    setSelectedBrandId(brandId);
    const prov = providers.find((p) => String(p.brandId) === String(brandId));
    if (prov && prov.games && prov.games.length > 0) {
      setSelectedGameUid(prov.games[0].gameUid);
    } else {
      setSelectedGameUid("");
    }
  };

  const handleTestLaunch = async () => {
    if (!selectedGameUid) return;
    setLaunching(true);
    setLaunchError(null);
    setLaunchResult(null);

    try {
      const res = await fetch("/api/operator/launchpad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "launch",
          gameUid: selectedGameUid,
          userId,
          balance: Number(balance),
          callbackUrl,
        }),
      });

      const data = await res.json();
      if (res.ok && data.ok) {
        setLaunchResult(data);
      } else {
        setLaunchError(data.error || "Launch request failed");
      }
    } catch (err: any) {
      setLaunchError(err.message || "Connection error");
    } finally {
      setLaunching(false);
    }
  };

  const handleCheckPayload = async () => {
    if (!ciphertextInput.trim()) return;
    setCheckingEncryption(true);
    setEncryptionResult(null);

    try {
      const res = await fetch("/api/operator/launchpad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "check-payload",
          ciphertext: ciphertextInput,
          secret: operator?.apiSecret || undefined,
        }),
      });

      const data = await res.json();
      setEncryptionResult(data);
    } catch (err: any) {
      setEncryptionResult({ ok: false, error: err.message || "Decryption failed" });
    } finally {
      setCheckingEncryption(false);
    }
  };

  const handleGenerateReference = async () => {
    setGeneratingReference(true);
    try {
      const res = await fetch("/api/operator/launchpad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "sample-payload",
          gameUid: selectedGameUid || "10509",
          userId,
          balance: Number(balance),
          secret: operator?.apiSecret || undefined,
        }),
      });

      const data = await res.json();
      if (data.ok) {
        setReferencePayload(data);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setGeneratingReference(false);
    }
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

        <main className="flex-1 p-8 overflow-y-auto space-y-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <Rocket className="w-6 h-6 text-amber-400" />
              Launchpad
            </h1>
            <p className="text-xs text-slate-400 max-w-4xl mt-1 leading-relaxed">
              Test your integration end to end. This runs the <strong className="text-slate-200">same code path as the live API</strong> — a real session is created, callbacks are sent to your callback URL, and any bets placed are real and billed to your GGR credit.
            </p>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-amber-400" />
              Loading Launchpad Sandbox Engine...
            </div>
          ) : (
            <div className="space-y-6">
              {/* Section 1: Test Launch */}
              <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
                <div className="text-base font-bold text-slate-200 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-mono">
                    1
                  </span>
                  Test launch
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Provider Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                      Select Provider ({providers.length})
                    </label>
                    <select
                      value={selectedBrandId}
                      onChange={(e) => handleProviderChange(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-amber-500/50"
                    >
                      {providers.map((p) => (
                        <option key={p.brandId} value={p.brandId}>
                          {p.name} ({p.gameCount} games)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Game Selector */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                      Select Game ({activeGames.length})
                    </label>
                    <select
                      value={selectedGameUid}
                      onChange={(e) => setSelectedGameUid(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-amber-500/50"
                    >
                      {activeGames.length === 0 ? (
                        <option value="">No games available</option>
                      ) : (
                        activeGames.map((g: any) => (
                          <option key={g.gameUid} value={g.gameUid}>
                            {g.name} ({g.category} · UID: {g.gameUid})
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  {/* Player & Balance Input */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">Player ID</label>
                      <input
                        type="text"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono focus:outline-none focus:border-amber-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">Balance</label>
                      <input
                        type="number"
                        value={balance}
                        onChange={(e) => setBalance(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono focus:outline-none focus:border-amber-500/50"
                      />
                    </div>
                  </div>
                </div>

                {/* Callback URL & Test Button */}
                <div className="flex flex-col md:flex-row gap-4 items-end">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                      Callback URL (default: {callbackUrl})
                    </label>
                    <input
                      type="text"
                      value={callbackUrl}
                      onChange={(e) => setCallbackUrl(e.target.value)}
                      placeholder="https://your-site.com/api/callback"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono focus:outline-none focus:border-amber-500/50"
                    />
                  </div>

                  <button
                    onClick={handleTestLaunch}
                    disabled={launching || !selectedGameUid}
                    className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {launching ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Launching...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-slate-950" />
                        Test launch
                      </>
                    )}
                  </button>
                </div>

                {/* Error Banner */}
                {launchError && (
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    {launchError}
                  </div>
                )}

                {/* Launch Output */}
                {launchResult && (
                  <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3 font-mono">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                          LAUNCH OK
                        </span>
                        <span className="text-slate-400">{launchResult.durationMs} ms</span>
                        <span className="text-slate-400">session {launchResult.sessionId}</span>
                        <span className="text-amber-400 font-semibold">{launchResult.gameName} ({launchResult.providerName})</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={launchResult.url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold text-xs border border-amber-500/30 flex items-center gap-1.5 transition-all"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Open in new tab
                        </a>

                        <button
                          onClick={() => setShowIframe(!showIframe)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center gap-1.5 transition-all"
                        >
                          <Monitor className="w-3.5 h-3.5 text-slate-400" />
                          {showIframe ? "Hide iframe" : "Preview in iframe"}
                        </button>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400">
                      Place a bet in the game, then check your Sessions page — callbacks should appear within seconds. If they don't reach your server, your callback URL isn't receiving.
                    </p>

                    {/* Embedded Iframe Preview */}
                    {showIframe && (
                      <div className="mt-4 rounded-xl border border-amber-500/30 overflow-hidden bg-black shadow-2xl">
                        <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
                          <span>Live Game Preview: <strong className="text-slate-200">{launchResult.gameName}</strong></span>
                          <button onClick={() => setShowIframe(false)} className="text-rose-400 hover:underline text-[11px]">
                            Close Preview
                          </button>
                        </div>
                        <iframe
                          src={launchResult.url}
                          className="w-full h-[600px] border-0"
                          allow="autoplay; fullscreen"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Section 2: Check your encryption */}
              <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
                <div className="text-base font-bold text-slate-200 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-mono">
                    2
                  </span>
                  Check your encryption
                </div>
                <p className="text-xs text-slate-400">
                  Paste a payload your own code generated. We'll decrypt it with your secret and tell you exactly what we received and what we'd reject — before you go hunting through logs.
                </p>

                <div className="flex gap-3">
                  <textarea
                    rows={3}
                    value={ciphertextInput}
                    onChange={(e) => setCiphertextInput(e.target.value)}
                    placeholder="Base64 ciphertext from your encrypt() function"
                    className="flex-1 px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono focus:outline-none focus:border-amber-500/50"
                  />
                  <button
                    onClick={handleCheckPayload}
                    disabled={checkingEncryption || !ciphertextInput.trim()}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 shadow-md transition-all self-end disabled:opacity-50"
                  >
                    {checkingEncryption ? "Decrypting..." : "Check payload"}
                  </button>
                </div>

                {encryptionResult && (
                  <div
                    className={`p-4 rounded-xl text-xs font-mono space-y-2 border ${
                      encryptionResult.ok
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                        : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                    }`}
                  >
                    {encryptionResult.ok ? (
                      <div>
                        <strong className="text-emerald-400">Decryption Successful! Received Payload:</strong>
                        <pre className="mt-2 text-[11px] text-slate-300 overflow-x-auto">
                          {JSON.stringify(encryptionResult.decrypted, null, 2)}
                        </pre>
                      </div>
                    ) : (
                      <div>
                        <strong className="text-rose-400">Decryption Error:</strong>
                        <p className="mt-1 text-slate-300">{encryptionResult.error}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Section 3: Reference payload */}
              <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
                <div className="text-base font-bold text-slate-200 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-mono">
                    3
                  </span>
                  Reference payload
                </div>
                <p className="text-xs text-slate-400">
                  A correctly-built request for the options above, encrypted with your secret. Compare it against what your code produces, or run the cURL directly.
                </p>

                <button
                  onClick={handleGenerateReference}
                  disabled={generatingReference}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 shadow-md transition-all disabled:opacity-50"
                >
                  {generatingReference ? "Building..." : "Generate reference payload"}
                </button>

                {referencePayload && (
                  <div className="space-y-4 pt-2">
                    <div>
                      <div className="text-xs text-slate-400 mb-1 font-semibold">Plaintext Payload:</div>
                      <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 font-mono overflow-x-auto">
                        {JSON.stringify(referencePayload.plaintext, null, 2)}
                      </pre>
                    </div>

                    <div>
                      <div className="text-xs text-slate-400 mb-1 font-semibold">Encrypted Base64 Payload:</div>
                      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-amber-400 font-mono break-all select-all">
                        {referencePayload.encrypted}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-slate-400 mb-1 font-semibold">cURL Request:</div>
                      <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-emerald-400 font-mono overflow-x-auto">
                        {referencePayload.curl}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
