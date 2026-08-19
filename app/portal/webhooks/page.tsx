"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PortalNavbar } from "../components/PortalNavbar";
import { PortalSidebar } from "../components/PortalSidebar";
import {
  Activity,
  RotateCw,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  AlertCircle,
} from "lucide-react";

export default function WebhooksPage() {
  const router = useRouter();
  const [operator, setOperator] = useState<any>(null);
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/operator/me");
      if (res.status === 401) {
        router.push("/portal/login");
        return;
      }
      const json = await res.json();
      setOperator(json.operator);
      setWebhooks(json.recentWebhooks || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleRetryWebhook = async (logId: string) => {
    setRetryingId(logId);
    try {
      const res = await fetch("/api/operator/webhooks/retry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ webhookLogId: logId }),
      });
      const data = await res.json();
      await fetchData();
      if (selectedLog && selectedLog.id === logId && data.log) {
        setSelectedLog(data.log);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRetryingId(null);
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                Real-Time Webhook Delivery Inspector
              </h1>
              <p className="text-sm text-slate-400">
                Inspect every HTTP POST callback dispatched to your casino endpoint with 1-click manual retry.
              </p>
            </div>

            <button
              onClick={fetchData}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-2 transition-all"
            >
              <RotateCw className="w-3.5 h-3.5" />
              Refresh Logs
            </button>
          </div>

          {/* Webhooks Table */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden">
            {webhooks.length === 0 ? (
              <div className="text-center py-16 text-xs text-slate-500">
                No webhook callbacks dispatched yet. Once games are played, callbacks will appear here in real-time.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Serial Number</th>
                      <th className="py-3 px-4">Destination URL</th>
                      <th className="py-3 px-4">HTTP Response</th>
                      <th className="py-3 px-4">Attempts</th>
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {webhooks.map((log: any) => (
                      <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              log.status === "SUCCESS"
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                            }`}
                          >
                            {log.status === "SUCCESS" ? (
                              <CheckCircle className="w-3 h-3" />
                            ) : (
                              <XCircle className="w-3 h-3" />
                            )}
                            {log.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-300 text-[11px]">
                          {log.serialNumber}
                        </td>
                        <td className="py-3 px-4 text-slate-400 max-w-[220px] truncate font-mono text-[11px]">
                          {log.targetUrl}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`font-mono text-[11px] font-semibold ${
                              log.responseCode && log.responseCode < 400
                                ? "text-emerald-400"
                                : "text-rose-400"
                            }`}
                          >
                            {log.responseCode ? `HTTP ${log.responseCode}` : "No Response"}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-400">{log.attempts}</td>
                        <td className="py-3 px-4 text-slate-500">
                          {new Date(log.createdAt).toLocaleTimeString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedLog(log)}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs flex items-center gap-1 transition-colors"
                            >
                              <Eye className="w-3 h-3 text-amber-400" />
                              Inspect
                            </button>
                            <button
                              onClick={() => handleRetryWebhook(log.id)}
                              disabled={retryingId === log.id}
                              className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-xs flex items-center gap-1 transition-colors disabled:opacity-50"
                            >
                              <RotateCw className={`w-3 h-3 ${retryingId === log.id ? "animate-spin" : ""}`} />
                              Retry
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

          {/* Modal Payload Inspector */}
          {selectedLog && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-amber-400" />
                    Webhook Inspection ({selectedLog.serialNumber})
                  </h3>
                  <button
                    onClick={() => setSelectedLog(null)}
                    className="text-slate-400 hover:text-white text-xs p-1"
                  >
                    ✕ Close
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-400">Destination Endpoint:</span>
                    <div className="font-mono text-emerald-400 text-xs bg-slate-950 p-2 rounded-lg border border-slate-800 mt-1">
                      {selectedLog.targetUrl}
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400">Dispatched JSON Payload:</span>
                    <pre className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-amber-300 font-mono text-[11px] overflow-x-auto max-h-48">
                      {(() => {
                        try {
                          return JSON.stringify(JSON.parse(selectedLog.payload), null, 2);
                        } catch {
                          return selectedLog.payload;
                        }
                      })()}
                    </pre>
                  </div>

                  <div>
                    <span className="text-slate-400">Endpoint HTTP Response:</span>
                    <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg font-mono text-[11px] text-slate-300 overflow-x-auto max-h-24">
                      {selectedLog.responseBody || "Empty Response"}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-end gap-2">
                  <button
                    onClick={() => handleRetryWebhook(selectedLog.id)}
                    disabled={retryingId === selectedLog.id}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all"
                  >
                    <RotateCw className={`w-3.5 h-3.5 ${retryingId === selectedLog.id ? "animate-spin" : ""}`} />
                    Re-Send Webhook Now
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
