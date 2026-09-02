'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SecurityCenter() {
  const [rules, setRules] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [scanContent, setScanContent] = useState('');
  const [scanResult, setScanResult] = useState<any>(null);
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchSecurityData = () => {
    Promise.all([
      fetch('/api/v1/security/rules').then(r => r.json()),
      fetch('/api/v1/security/events').then(r => r.json())
    ])
      .then(([rulesData, eventsData]) => {
        setRules(Array.isArray(rulesData) ? rulesData : []);
        setEvents(Array.isArray(eventsData) ? eventsData : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load security data:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const handleRunScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanContent.trim()) return;

    setScanning(true);
    setScanResult(null);

    try {
      const res = await fetch('/api/v1/security/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: scanContent,
          target_name: 'Manual Web Console'
        })
      });
      const data = await res.json();
      setScanResult(data);
      fetchSecurityData(); // Refresh event stream
    } catch (err: any) {
      console.error('Scan error:', err);
    } finally {
      setScanning(false);
    }
  };

  const blockedCount = events.filter(e => e.severity === 'CRITICAL' || e.event_type.includes('BLOCK')).length;
  const passedCount = events.filter(e => e.event_type.includes('PASSED')).length;

  return (
    <main className="p-8 md:p-12 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              🛡️ Defensive Security Operations Center
            </h1>
            <p className="text-gray-500 mt-1">
              Automated secret interception, regex guardrails, and pre-commit security verification.
            </p>
          </div>
          <Link href="/" className="text-blue-600 hover:underline font-medium text-sm">← Dashboard</Link>
        </div>

        {/* Top 3 Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-red-500">
            <h3 className="text-xs font-bold uppercase text-gray-500">Intercepted Threats</h3>
            <p className="text-3xl font-extrabold text-gray-900 mt-2">{blockedCount}</p>
            <p className="text-xs text-red-600 font-medium mt-1">Exposed secrets blocked before commit</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
            <h3 className="text-xs font-bold uppercase text-gray-500">Clean Scans Verified</h3>
            <p className="text-3xl font-extrabold text-gray-900 mt-2">{passedCount}</p>
            <p className="text-xs text-green-600 font-medium mt-1">Patches passed defensive pipeline</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
            <h3 className="text-xs font-bold uppercase text-gray-500">Active Defense Rules</h3>
            <p className="text-3xl font-extrabold text-gray-900 mt-2">{rules.length}</p>
            <p className="text-xs text-blue-600 font-medium mt-1">AWS, GitHub, Key & Secret patterns</p>
          </div>
        </div>

        {/* Live On-Demand Scanner Sandbox */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                ⚡ On-Demand Secret & Diff Scanner
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Paste code, a git diff (+ lines), or environment config to test our Defensive Security regex engine.
              </p>
            </div>
            <button
              onClick={() => setScanContent("+ AWS_KEY = 'AKIA1234567890ABCDEF'\n+ DB_PASS = 'password12345'") }
              className="text-xs text-blue-600 hover:text-blue-800 font-medium bg-blue-50 px-2.5 py-1 rounded"
            >
              Insert Test Diff with Secrets
            </button>
          </div>

          <form onSubmit={handleRunScan} className="space-y-4">
            <textarea
              rows={4}
              value={scanContent}
              onChange={(e) => setScanContent(e.target.value)}
              placeholder="Paste code or diff here (e.g. + API_TOKEN = 'ghp_xxxxxxxxxxxxxxxxxxxx')..."
              className="w-full p-3 font-mono text-xs border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <div className="flex justify-between items-center">
              <button
                type="submit"
                disabled={scanning || !scanContent.trim()}
                className="px-5 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 transition flex items-center gap-2"
              >
                {scanning ? 'Scanning...' : 'Run Defensive Scan'}
              </button>
              {scanContent && (
                <button
                  type="button"
                  onClick={() => { setScanContent(''); setScanResult(null); }}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Clear
                </button>
              )}
            </div>
          </form>

          {/* Scan Results Box */}
          {scanResult && (
            <div className={`mt-4 p-4 rounded-lg border text-sm ${
              scanResult.is_clean ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <div className="font-bold flex items-center gap-2">
                {scanResult.is_clean ? '✅ DEFENSIVE SCAN PASSED' : `🚨 SECURITY ALERT: ${scanResult.findings_count} VIOLATION(S) DETECTED`}
              </div>
              <p className="text-xs mt-1">
                {scanResult.is_clean
                  ? 'No hardcoded credentials, AWS keys, or tokens detected in the submitted content.'
                  : 'The AI/Commit pipeline would automatically block this patch from being committed to GitHub.'}
              </p>
              
              {scanResult.findings?.length > 0 && (
                <ul className="mt-3 space-y-2 text-xs font-mono">
                  {scanResult.findings.map((f: any, idx: number) => (
                    <li key={idx} className="bg-white p-2 rounded border border-red-200">
                      <span className="font-bold text-red-700">[{f.rule}]</span> {f.description} — Matched: <code className="bg-gray-100 px-1 py-0.5 rounded">{f.match_snippet}</code>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Two-Column Grid: Active Rules & Recent Security Events */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Active Rules */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              🔒 Active Scanner Rule Set
            </h3>
            <div className="space-y-3">
              {rules.map((rule, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold font-mono text-gray-800">{rule.name}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      rule.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {rule.severity}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-2">{rule.description}</p>
                  <code className="text-[11px] text-gray-500 bg-gray-200 px-1.5 py-0.5 rounded font-mono break-all block">
                    {rule.pattern}
                  </code>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Security Events */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              📋 Live Security Incident Feed
            </h3>
            {loading ? (
              <div className="text-center py-8 text-gray-400 text-xs">Loading telemetry...</div>
            ) : events.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-xs">No recent security events logged.</div>
            ) : (
              <div className="space-y-3 max-h-[380px] overflow-y-auto">
                {events.map((ev, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-xs flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-[10px] text-gray-400">
                        {ev.timestamp ? new Date(ev.timestamp).toLocaleTimeString() : ''}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        ev.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' : 
                        ev.severity === 'WARNING' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {ev.event_type}
                      </span>
                    </div>
                    <p className="text-gray-800 font-medium">{ev.summary}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
