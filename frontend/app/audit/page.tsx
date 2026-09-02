'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface AuditEntry {
  id: number;
  timestamp: string;
  event_type: string;
  actor: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL' | 'SUCCESS';
  target?: string;
  summary: string;
  details?: any;
}

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditEntry | null>(null);

  const fetchLogs = () => {
    fetch('/api/v1/audit/')
      .then(res => res.json())
      .then(data => {
        setLogs(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch audit logs:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 15000); // 15s auto-refresh
    return () => clearInterval(interval);
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesSeverity = selectedSeverity === 'ALL' || log.severity === selectedSeverity;
    const matchesSearch = searchQuery === '' || 
      log.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.event_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.target && log.target.toLowerCase().includes(searchQuery.toLowerCase())) ||
      log.actor.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSeverity && matchesSearch;
  });

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'WARNING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'SUCCESS':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const exportAuditJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `aigra_audit_trail_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <main className="p-8 md:p-12 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              📜 Audit Trail & Governance
            </h1>
            <p className="text-gray-500 mt-1">
              Immutable operational event ledger across AI agents, security filters, and monitor cycles.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={exportAuditJSON}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg shadow-sm hover:bg-gray-50 transition text-sm flex items-center gap-1.5"
            >
              📥 Export JSON
            </button>
            <Link href="/" className="text-blue-600 hover:underline font-medium text-sm">← Dashboard</Link>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search events, targets, actors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-80 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-800"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
            <span className="text-xs text-gray-500 font-medium uppercase mr-1">Severity:</span>
            {['ALL', 'CRITICAL', 'WARNING', 'SUCCESS', 'INFO'].map(sev => (
              <button
                key={sev}
                onClick={() => setSelectedSeverity(sev)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                  selectedSeverity === sev
                    ? 'bg-gray-900 text-white shadow'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-gray-600 text-xs font-semibold uppercase">
              <tr>
                <th className="px-6 py-3.5 text-left">Timestamp</th>
                <th className="px-6 py-3.5 text-left">Severity</th>
                <th className="px-6 py-3.5 text-left">Event Type</th>
                <th className="px-6 py-3.5 text-left">Actor</th>
                <th className="px-6 py-3.5 text-left">Summary</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <div className="animate-pulse">Loading immutable audit stream...</div>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No matching audit records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-gray-500">
                      {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getSeverityBadge(log.severity)}`}>
                        {log.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-xs font-semibold text-gray-800">
                      {log.event_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-600 font-medium">
                      {log.actor}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-700 max-w-md truncate">
                      {log.summary}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {log.details ? (
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                        >
                          View Details
                        </button>
                      ) : (
                        <span className="text-xs text-gray-300">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Detail Modal */}
        {selectedLog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 max-h-[80vh] flex flex-col">
              <div className="flex justify-between items-start mb-4 border-b pb-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{selectedLog.event_type}</h3>
                  <p className="text-xs text-gray-500 font-mono mt-0.5">
                    ID #{selectedLog.id} • {selectedLog.timestamp ? new Date(selectedLog.timestamp).toUTCString() : ''}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 mb-4">
                <div className="text-xs bg-gray-50 p-3 rounded border">
                  <strong>Summary:</strong> {selectedLog.summary}
                </div>
                {selectedLog.target && (
                  <div className="text-xs text-gray-600">
                    <strong>Target:</strong> <code>{selectedLog.target}</code>
                  </div>
                )}
              </div>

              <div className="flex-grow overflow-y-auto">
                <label className="text-xs font-semibold text-gray-500 block mb-1">Payload Metadata (JSON)</label>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs font-mono overflow-x-auto">
                  {JSON.stringify(selectedLog.details, null, 2)}
                </pre>
              </div>

              <div className="mt-4 pt-3 border-t flex justify-end">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg text-xs font-semibold hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
