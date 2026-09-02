'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AIAnalysis() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [selectedIncidentId, setSelectedIncidentId] = useState<number | ''>('');
  const [customLogs, setCustomLogs] = useState('');
  const [mode, setMode] = useState<'incident' | 'custom'>('incident');
  const [generating, setGenerating] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [reportTitle, setReportTitle] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/analysis/incidents')
      .then(res => res.json())
      .then(data => {
        const incList = Array.isArray(data) ? data : [];
        setIncidents(incList);
        if (incList.length > 0) {
          setSelectedIncidentId(incList[0].id);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load incidents for analysis:', err);
        setLoading(false);
      });
  }, []);

  const handleGeneratePostMortem = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    setReport(null);

    const payload: any = {};
    if (mode === 'incident' && selectedIncidentId) {
      payload.incident_id = Number(selectedIncidentId);
    } else {
      payload.custom_logs = customLogs;
      payload.title = 'Manual Stack Trace Forensic Post-Mortem';
    }

    try {
      const res = await fetch('/api/v1/analysis/post-mortem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setReport(data.report_markdown);
      setReportTitle(data.title);
    } catch (err: any) {
      console.error('Failed to generate post-mortem:', err);
      setReport(`⚠️ Failed to generate report: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const downloadReport = () => {
    if (!report) return;
    const blob = new Blob([report], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${reportTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = () => {
    if (!report) return;
    navigator.clipboard.writeText(report);
    alert('Post-Mortem Markdown copied to clipboard!');
  };

  return (
    <main className="p-8 md:p-12 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              🔬 AI Forensic Analysis & Post-Mortem Generator
            </h1>
            <p className="text-gray-500 mt-1">
              Automated Root-Cause Analysis (RCA), 5-Whys decomposition, and SRE post-mortem generation via Groq LLaMA-3.
            </p>
          </div>
          <Link href="/" className="text-blue-600 hover:underline font-medium text-sm">← Dashboard</Link>
        </div>

        {/* Input Configuration Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex gap-4 border-b border-gray-200 pb-3 mb-4">
            <button
              onClick={() => setMode('incident')}
              className={`text-sm font-bold pb-1 transition ${
                mode === 'incident' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Analyze Recorded Incident
            </button>
            <button
              onClick={() => setMode('custom')}
              className={`text-sm font-bold pb-1 transition ${
                mode === 'custom' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Paste Custom Stack Trace / Logs
            </button>
          </div>

          <form onSubmit={handleGeneratePostMortem} className="space-y-4">
            {mode === 'incident' ? (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Select Incident from Telemetry</label>
                {loading ? (
                  <div className="text-xs text-gray-400">Loading incidents...</div>
                ) : incidents.length === 0 ? (
                  <div className="text-xs text-yellow-700 bg-yellow-50 p-3 rounded">
                    No incidents recorded yet. Switch to 'Paste Custom Stack Trace' to test the AI post-mortem generator.
                  </div>
                ) : (
                  <select
                    value={selectedIncidentId}
                    onChange={(e) => setSelectedIncidentId(Number(e.target.value))}
                    className="w-full p-2.5 text-sm border border-gray-300 rounded-lg text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {incidents.map(inc => (
                      <option key={inc.id} value={inc.id}>
                        Incident #{inc.id}: {inc.title} [{inc.project_name}] — {inc.status} ({inc.events_count} forensic events)
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-gray-700">Raw Logs / Crash Stack Trace</label>
                  <button
                    type="button"
                    onClick={() => setCustomLogs("Traceback (most recent call last):\n  File \"app/database.py\", line 45, in connect\n    raise TimeoutError('QueuePool limit of size 5 overflow 10 reached, connection timed out')\nTimeoutError: QueuePool limit exceeded in production cluster worker-4")}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Insert Sample PostgreSQL Pool Exhaustion Crash
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={customLogs}
                  onChange={(e) => setCustomLogs(e.target.value)}
                  placeholder="Paste Python/Node traceback, Nginx 502 error logs, or container OOMKilled events..."
                  className="w-full p-3 font-mono text-xs border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={generating || (mode === 'incident' && !selectedIncidentId) || (mode === 'custom' && !customLogs.trim())}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-lg shadow transition flex items-center gap-2 text-sm"
              >
                {generating ? (
                  <>
                    <span className="animate-spin">🔄</span>
                    <span>Synthesizing Post-Mortem with AI...</span>
                  </>
                ) : (
                  <>
                    <span>⚡ Generate AI Post-Mortem Report</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Generated Report Viewer */}
        {report && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-200 pb-4 gap-4">
              <div>
                <span className="text-xs font-bold uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  Generated SRE Post-Mortem
                </span>
                <h2 className="text-xl font-extrabold text-gray-900 mt-1">{reportTitle}</h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={copyToClipboard}
                  className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-50 transition"
                >
                  📋 Copy Markdown
                </button>
                <button
                  onClick={downloadReport}
                  className="px-3 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-lg hover:bg-gray-800 transition"
                >
                  📥 Download (.md)
                </button>
              </div>
            </div>

            {/* Markdown Body Viewer */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 text-sm leading-relaxed text-gray-800 font-sans whitespace-pre-wrap">
              {report}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
