"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  RefreshCw,
  Loader2,
  Code,
  X,
} from "lucide-react";

interface AuditLogItem {
  id: string;
  actorUserId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  actor?: {
    id: string;
    name?: string | null;
    email?: string | null;
    role?: string | null;
  } | null;
}

export default function AuditLogsClient() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [inspectingLog, setInspectingLog] = useState<AuditLogItem | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/audit-logs");
      const json = await res.json();
      if (res.ok && json.success) {
        setLogs(json.data);
      }
    } catch (err) {
      console.warn("Failed to fetch audit logs:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const filteredLogs = logs.filter((l) => {
    const q = searchQuery.toLowerCase();
    const matchesAction = l.action.toLowerCase().includes(q);
    const matchesEntity = l.entityType.toLowerCase().includes(q);
    const matchesActor = l.actor?.email?.toLowerCase().includes(q) || false;
    return matchesAction || matchesEntity || matchesActor;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-primary uppercase tracking-wider">
            Security & Governance
          </span>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1">
            Audit Trail & Event Log
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
            Immutable audit record of all administrative operations, price edits, role changes, and payments.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchLogs}
          className="px-3.5 py-2 rounded-button bg-white border border-sand-300 hover:bg-sand-50 text-stone-700 text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="glass-card bg-white p-4 rounded-card border border-sand-300 shadow-elevation-1 flex flex-wrap items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search action (e.g. ORDER, USER), actor..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-button bg-sand-50/60 border border-sand-300 focus:border-primary outline-none transition-all"
          />
        </div>

        <span className="text-xs font-semibold text-stone-500">
          Showing {filteredLogs.length} Log Records
        </span>
      </div>

      {/* Audit Logs Table */}
      <div className="glass-card bg-white rounded-card border border-sand-300 shadow-elevation-1 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-sand-50 text-stone-600 font-bold uppercase tracking-wider border-b border-sand-200">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Actor</th>
                <th className="p-4">Action Type</th>
                <th className="p-4">Entity</th>
                <th className="p-4 text-center">Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-200 font-mono text-[11px]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-stone-500 font-sans">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary mb-2" />
                    Loading audit trail...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-stone-400 font-sans">
                    No audit records matching search criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  let actionColor = "bg-stone-100 text-stone-700 border-stone-300";
                  if (log.action.includes("ORDER")) actionColor = "bg-blue-50 text-blue-800 border-blue-200";
                  if (log.action.includes("PAYMENT")) actionColor = "bg-emerald-50 text-emerald-800 border-emerald-200";
                  if (log.action.includes("ROLE") || log.action.includes("USER")) actionColor = "bg-purple-50 text-purple-800 border-purple-200";
                  if (log.action.includes("SETTINGS")) actionColor = "bg-amber-50 text-amber-800 border-amber-200";

                  return (
                    <tr key={log.id} className="hover:bg-sand-50/60 transition-colors">
                      <td className="p-4 text-stone-500 font-sans whitespace-nowrap">
                        <span className="font-semibold text-stone-800 block text-xs">
                          {new Date(log.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </span>
                        <span className="text-[10px] text-stone-400">
                          {new Date(log.createdAt).toLocaleDateString("en-US")}
                        </span>
                      </td>

                      <td className="p-4 font-sans">
                        {log.actor ? (
                          <div>
                            <span className="font-bold text-stone-900 block text-xs">
                              {log.actor.name || log.actor.email}
                            </span>
                            <span className="text-[10px] text-stone-400">
                              {log.actor.role}
                            </span>
                          </div>
                        ) : (
                          <span className="text-stone-400 italic">System / Webhook</span>
                        )}
                      </td>

                      <td className="p-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full font-bold border text-[10px] ${actionColor}`}
                        >
                          {log.action}
                        </span>
                      </td>

                      <td className="p-4 text-stone-600 font-sans">
                        <span className="font-bold text-stone-800">
                          {log.entityType}
                        </span>
                        {log.entityId && (
                          <span className="font-mono text-[10px] text-stone-400 block">
                            ID: {log.entityId.slice(0, 8)}...
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-center font-sans">
                        <button
                          type="button"
                          onClick={() => setInspectingLog(log)}
                          className="px-2 py-1 rounded bg-sand-100 hover:bg-sand-200 text-stone-700 text-[11px] font-semibold inline-flex items-center gap-1 transition-colors"
                        >
                          <Code className="w-3 h-3" />
                          <span>View JSON</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* JSON Inspector Modal */}
      {inspectingLog && (
        <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card bg-white rounded-card w-full max-w-lg border border-sand-300 shadow-elevation-3 p-6 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-sand-200">
              <div>
                <span className="text-[11px] font-bold text-primary uppercase block">
                  Log Inspector
                </span>
                <h3 className="font-heading font-bold text-sm text-stone-900 font-mono">
                  {inspectingLog.action}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectingLog(null)}
                className="p-1 text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-stone-900 rounded-card p-4 overflow-x-auto text-amber-300 font-mono text-xs max-h-72 custom-scrollbar">
              <pre>{JSON.stringify(inspectingLog.metadata || {}, null, 2)}</pre>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setInspectingLog(null)}
                className="px-4 py-2 text-xs font-semibold rounded-button bg-sand-100 hover:bg-sand-200 text-stone-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
