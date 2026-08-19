"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PortalNavbar } from "../components/PortalNavbar";
import { PortalSidebar } from "../components/PortalSidebar";
import {
  KeyRound,
  Shield,
  Copy,
  Check,
  Plus,
  Eye,
  EyeOff,
  AlertTriangle,
  Server,
  Lock,
} from "lucide-react";

export default function ApiKeysPage() {
  const router = useRouter();
  const [operator, setOperator] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tokens, setTokens] = useState<any[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showSecretMap, setShowSecretMap] = useState<{ [key: string]: boolean }>({});
  const [newKeyName, setNewKeyName] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingWhitelistId, setEditingWhitelistId] = useState<string | null>(null);
  const [whitelistText, setWhitelistText] = useState("");

  // Integration Settings State
  const [callbackUrlInput, setCallbackUrlInput] = useState("https://ggrcasinotest.vercel.app/api/callback");
  const [encryptCallbacks, setEncryptCallbacks] = useState(false);
  const [callerIp, setCallerIp] = useState("52.201.249.242");
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSaveMsg, setSettingsSaveMsg] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/operator/me");
      if (res.status === 401) {
        router.push("/portal/login");
        return;
      }
      const json = await res.json();
      setOperator(json.operator);
      setTokens(json.operator?.tokens || []);

      // Fetch integration settings
      const settingsRes = await fetch("/api/operator/settings");
      if (settingsRes.ok) {
        const sJson = await settingsRes.json();
        if (sJson.settings) {
          setCallbackUrlInput(sJson.settings.callbackUrl || "https://ggrcasinotest.vercel.app/api/callback");
          setEncryptCallbacks(Boolean(sJson.settings.encryptCallbacks));
          if (sJson.settings.callerIp) setCallerIp(sJson.settings.callerIp);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveSettings = async (overrides?: { encryptCallbacks?: boolean }) => {
    setSavingSettings(true);
    setSettingsSaveMsg(null);
    try {
      const payload = {
        callbackUrl: callbackUrlInput,
        encryptCallbacks: typeof overrides?.encryptCallbacks === "boolean" ? overrides.encryptCallbacks : encryptCallbacks,
      };

      const res = await fetch("/api/operator/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.settings) {
        setCallbackUrlInput(data.settings.callbackUrl);
        setEncryptCallbacks(Boolean(data.settings.encryptCallbacks));
        setSettingsSaveMsg("Settings saved successfully!");
        setTimeout(() => setSettingsSaveMsg(null), 3000);
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setSavingSettings(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleGenerateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const res = await fetch("/api/operator/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName || "Production API Key" }),
      });
      const data = await res.json();
      if (data.success) {
        setNewKeyName("");
        await fetchData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveWhitelist = async (tokenId: string) => {
    try {
      await fetch("/api/operator/whitelist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokenId, ipWhitelist: whitelistText }),
      });
      setEditingWhitelistId(null);
      await fetchData();
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
                <KeyRound className="w-5 h-5 text-amber-400" />
                API Credentials & Firewall
              </h1>
              <p className="text-sm text-slate-400">
                Manage your B2B API tokens, 256-bit secret keys, and server IP whitelisting.
              </p>
            </div>

            <form onSubmit={handleGenerateKey} className="flex items-center gap-2">
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="Key Name (e.g. Staging Server)"
                className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                disabled={isGenerating}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-4 h-4" />
                Generate Key
              </button>
            </form>
          </div>

          {/* Tokens List */}
          <div className="space-y-4">
            {tokens.map((token) => (
              <div
                key={token.id}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400">
                      <KeyRound className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{token.name}</h3>
                      <div className="text-[11px] text-slate-500">
                        Created {new Date(token.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Live Production
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Public API Token */}
                  <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1.5">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Public API Token (NEXX_TOKEN / Bearer)
                    </div>
                    <div className="flex items-center justify-between gap-2 font-mono text-xs text-amber-300">
                      <span className="truncate">{token.token}</span>
                      <button
                        onClick={() => copyToClipboard(token.token, `token-${token.id}`)}
                        className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors shrink-0"
                      >
                        {copiedId === `token-${token.id}` ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Private Secret Key */}
                  <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1.5">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Private Secret Key (HMAC-SHA256 Webhook Signing)
                    </div>
                    <div className="flex items-center justify-between gap-2 font-mono text-xs text-purple-300">
                      <span className="truncate">
                        {showSecretMap[token.id]
                          ? token.secretKey
                          : "••••••••••••••••••••••••••••••••"}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() =>
                            setShowSecretMap((prev) => ({
                              ...prev,
                              [token.id]: !prev[token.id],
                            }))
                          }
                          className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
                        >
                          {showSecretMap[token.id] ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => copyToClipboard(token.secretKey, `sec-${token.id}`)}
                          className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
                        >
                          {copiedId === `sec-${token.id}` ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* IP Whitelist Firewall */}
                <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Shield className="w-4 h-4 text-sky-400" />
                    <span>IP Whitelist Firewall:</span>
                    <span className="font-mono text-slate-200">
                      {token.ipWhitelist || "Disabled (Any IP Allowed)"}
                    </span>
                  </div>

                  {editingWhitelistId === token.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={whitelistText}
                        onChange={(e) => setWhitelistText(e.target.value)}
                        placeholder="e.g. 192.168.1.1, 10.0.0.1"
                        className="px-2.5 py-1 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                      />
                      <button
                        onClick={() => handleSaveWhitelist(token.id)}
                        className="px-3 py-1 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-lg text-xs"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingWhitelistId(null)}
                        className="px-2 py-1 text-slate-400 hover:text-white text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingWhitelistId(token.id);
                        setWhitelistText(token.ipWhitelist || "");
                      }}
                      className="text-xs text-sky-400 hover:underline font-medium"
                    >
                      Configure Whitelist
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Integration Settings Panel (Matching NexxAPI specification) */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-100">Integration settings</h3>
                {settingsSaveMsg && (
                  <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    {settingsSaveMsg}
                  </span>
                )}
              </div>

              {/* Default Callback Field */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <label className="text-xs font-semibold text-slate-400 w-36 shrink-0">Default callback</label>
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={callbackUrlInput}
                    onChange={(e) => setCallbackUrlInput(e.target.value)}
                    placeholder="https://ggrcasinotest.vercel.app/api/callback"
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono focus:outline-none focus:border-amber-500/50"
                  />
                  <button
                    onClick={() => handleSaveSettings()}
                    disabled={savingSettings}
                    className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all disabled:opacity-50"
                  >
                    {savingSettings ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>

              {/* IP Whitelist Information */}
              <div className="space-y-1 pt-2 border-t border-slate-800/60">
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-slate-400 font-semibold w-36 shrink-0">IP whitelist</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px] font-bold font-mono">
                    {tokens[0]?.ipWhitelist ? `Whitelisted: ${tokens[0].ipWhitelist}` : "Not set — your token works from any server"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 md:pl-40 leading-relaxed">
                  Managed by your account manager. To add or remove a server IP, contact them or configure above. Your last call came from <strong className="text-emerald-400 font-mono">{callerIp}</strong>.
                </p>
              </div>

              {/* Encrypt Callbacks Toggle */}
              <div className="flex flex-col md:flex-row md:items-center gap-3 pt-2 border-t border-slate-800/60">
                <span className="text-xs text-slate-400 font-semibold w-36 shrink-0">Encrypt callbacks</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      const nextVal = !encryptCallbacks;
                      setEncryptCallbacks(nextVal);
                      handleSaveSettings({ encryptCallbacks: nextVal });
                    }}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all shadow ${
                      encryptCallbacks
                        ? "bg-emerald-500 text-slate-950"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
                    }`}
                  >
                    {encryptCallbacks ? "On — turn off" : "Off — turn on"}
                  </button>
                  <span className="text-xs text-slate-400">
                    When on, we send <code className="text-amber-400 font-mono">{`{ payload, timestamp }`}</code> encrypted with your secret instead of plain JSON.
                  </span>
                </div>
              </div>

              {!tokens[0]?.ipWhitelist && (
                <p className="text-xs text-amber-400/90 font-medium pt-1">
                  No IP whitelist is set on your account — your token works from any address. Ask your account manager to lock it to your server before going live.
                </p>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
