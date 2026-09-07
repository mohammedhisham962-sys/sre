'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PostMortemsPage() {
  const [postmortems, setPostmortems] = useState<any[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    fetch('/api/v1/incidents/postmortems/all')
      .then((res) => res.json())
      .then((data) => {
        setPostmortems(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching postmortems:', err);
        setPostmortems([]);
        setLoading(false);
      });
  }, []);

  const activePM = postmortems[selectedIdx] || null;

  const handleCopyMarkdown = () => {
    if (!activePM?.markdown_report) return;
    navigator.clipboard.writeText(activePM.markdown_report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadMarkdown = () => {
    if (!activePM?.markdown_report) return;
    const blob = new Blob([activePM.markdown_report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `postmortem-INC-${activePM.incident_id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="p-8 md:p-12 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">📝</span>
            <h1 className="text-3xl font-bold text-gray-900">Incident Post-Mortems & RCA</h1>
          </div>
          <p className="text-gray-600 mt-1">
            Autonomous retrospective synthesis, blameless 5-Whys, MTTA/MTTR metrics, and preventive action items.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/incidents" className="px-4 py-2 border rounded-lg text-gray-700 bg-white hover:bg-gray-100 text-sm font-medium">
            Active Incidents
          </Link>
          <Link href="/" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
            ← Dashboard
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="bg-white p-12 rounded-xl border text-center text-gray-500">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          Synthesizing incident retrospectives...
        </div>
      ) : postmortems.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border text-center text-gray-500">
          No incident post-mortems available.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Incident List */}
          <div className="lg:col-span-1 space-y-3">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Incidents List</h2>
            {postmortems.map((pm, idx) => (
              <button
                key={pm.incident_id || idx}
                onClick={() => setSelectedIdx(idx)}
                className={`w-full text-left p-4 rounded-xl border transition ${
                  selectedIdx === idx
                    ? 'bg-blue-50 border-blue-500 shadow-sm'
                    : 'bg-white hover:bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-mono text-xs font-bold text-blue-700">INC-{pm.incident_id}</span>
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded ${
                    pm.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                    pm.severity === 'HIGH' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {pm.severity}
                  </span>
                </div>
                <div className="text-sm font-medium text-gray-900 line-clamp-2">{pm.title}</div>
                <div className="text-xs text-gray-500 mt-2 flex items-center justify-between">
                  <span>{pm.project_name}</span>
                  <span className="text-green-600 font-semibold">{pm.status}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Main Post-Mortem Report View */}
          {activePM && (
            <div className="lg:col-span-3 space-y-6">
              {/* Report Header Card */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4 mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm font-bold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded">
                        INC-{activePM.incident_id}
                      </span>
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {activePM.category}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">{activePM.title}</h2>
                    <p className="text-xs text-gray-500 mt-1">
                      Target System: <span className="font-semibold text-gray-700">{activePM.project_name}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyMarkdown}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-1.5"
                    >
                      {copied ? '✅ Copied!' : '📋 Copy Markdown'}
                    </button>
                    <button
                      onClick={handleDownloadMarkdown}
                      className="px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-medium hover:bg-black flex items-center gap-1.5"
                    >
                      ⬇️ Export .md
                    </button>
                  </div>
                </div>

                {/* SRE Metrics Gauges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg border text-center">
                    <div className="text-xs text-gray-500 font-medium">Time to Detect (TTD)</div>
                    <div className="text-2xl font-black text-blue-600 mt-1">{activePM.metrics?.ttd_seconds}s</div>
                    <div className="text-xs text-gray-400 mt-0.5">Automated Alert</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border text-center">
                    <div className="text-xs text-gray-500 font-medium">Time to Ack (TTA)</div>
                    <div className="text-2xl font-black text-purple-600 mt-1">{activePM.metrics?.tta_seconds}s</div>
                    <div className="text-xs text-gray-400 mt-0.5">Sentinel AI Engaged</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border text-center">
                    <div className="text-xs text-gray-500 font-medium">Time to Mitigate (TTM)</div>
                    <div className="text-2xl font-black text-green-600 mt-1">
                      {Math.floor((activePM.metrics?.ttm_seconds || 0) / 60)}m {(activePM.metrics?.ttm_seconds || 0) % 60}s
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">Resolved & Probed</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border text-center">
                    <div className="text-xs text-gray-500 font-medium">Availability SLI Impact</div>
                    <div className="text-2xl font-black text-indigo-600 mt-1">99.94%</div>
                    <div className="text-xs text-gray-400 mt-0.5">SLO Budget: Normal</div>
                  </div>
                </div>
              </div>

              {/* Root Cause & 5 Whys */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  🔍 Root Cause Analysis & The 5 Whys
                </h3>
                <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg text-sm text-red-900">
                  <span className="font-semibold">Summary: </span>{activePM.root_cause_summary}
                </div>
                <div className="space-y-2 mt-4">
                  {activePM.five_whys?.map((why: string, i: number) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg text-sm">
                      <span className="px-2 py-0.5 bg-gray-200 text-gray-800 font-mono font-bold text-xs rounded">
                        Why #{i + 1}
                      </span>
                      <span className="text-gray-800 font-medium">{why}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chronological Timeline */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  ⏱️ Chronological Incident Timeline
                </h3>
                <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-gray-200">
                  {activePM.timeline?.map((entry: any, i: number) => (
                    <div key={i} className="flex items-start gap-4 relative">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 z-10 ${
                        entry.phase === 'DETECTION' ? 'bg-red-500 text-white' :
                        entry.phase === 'INVESTIGATION' ? 'bg-yellow-500 text-white' :
                        entry.phase === 'ACKNOWLEDGEMENT' ? 'bg-purple-500 text-white' : 'bg-green-500 text-white'
                      }`}>
                        {i + 1}
                      </div>
                      <div className="bg-gray-50 p-3.5 rounded-lg border w-full">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-sm text-gray-900">{entry.event}</span>
                          <span className="font-mono text-xs text-gray-500">{entry.timestamp}</span>
                        </div>
                        <p className="text-xs text-gray-600">{entry.details}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Items */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  🛡️ Preventive SMART Action Items
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">ID</th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Priority</th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Preventive Action</th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Owner</th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {activePM.action_items?.map((item: any) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-mono text-xs font-bold text-gray-700">{item.id}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                              item.priority === 'P0' ? 'bg-red-100 text-red-700' :
                              item.priority === 'P1' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                              {item.priority}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-900 font-medium">{item.title}</td>
                          <td className="px-4 py-3 text-gray-600 text-xs">{item.owner}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                              item.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                              item.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
