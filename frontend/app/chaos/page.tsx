'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ChaosEngineering() {
  const [monitors, setMonitors] = useState<any[]>([]);
  const [targetUrl, setTargetUrl] = useState('https://httpstat.us/503');
  const [faultType, setFaultType] = useState('HTTP_ERROR');
  const [statusCode, setStatusCode] = useState(503);
  const [latencyMs, setLatencyMs] = useState(2000);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/v1/monitoring/')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setMonitors(data);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleInjectFault = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [
      `[${timestamp}] ⚡ Initiating Chaos Experiment: ${faultType} on ${targetUrl}...`,
      ...prev
    ]);

    try {
      const res = await fetch('/api/v1/chaos/inject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fault_type: faultType,
          target_url: targetUrl,
          http_status_code: Number(statusCode),
          latency_ms: Number(latencyMs)
        })
      });

      const data = await res.json();
      const endTimestamp = new Date().toLocaleTimeString();
      setLogs((prev) => [
        `[${endTimestamp}] ✅ Result: ${data.result_message} (Completed in ${data.duration_ms}ms)`,
        ...prev
      ]);
    } catch (err: any) {
      setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ❌ Execution Error: ${err.message}`, ...prev]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-8 md:p-12 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              💥 SRE Chaos Engineering & Fault Injection
            </h1>
            <p className="text-gray-500 mt-1">
              Inject synthetic latency, HTTP errors, and network timeouts to validate autonomous self-healing guardrails.
            </p>
          </div>
          <Link href="/" className="text-blue-600 hover:underline font-medium text-sm">← Dashboard</Link>
        </div>

        {/* Experiment Configuration Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-6">
          <h2 className="text-base font-bold text-gray-900">🔬 Configure Fault Injection Experiment</h2>

          <form onSubmit={handleInjectFault} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Fault Type */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Fault Type</label>
                <select
                  value={faultType}
                  onChange={(e) => setFaultType(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="HTTP_ERROR">HTTP Error Injection (5xx Downtime)</option>
                  <option value="LATENCY_SPIKE">Synthetic Latency Spike (Degraded SLI)</option>
                  <option value="CONNECTION_TIMEOUT">Connection Timeout / Packet Loss</option>
                </select>
              </div>

              {/* Target URL */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Target Endpoint</label>
                <input
                  type="text"
                  required
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Conditional: HTTP Status Code */}
              {faultType === 'HTTP_ERROR' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">HTTP Error Status Code</label>
                  <select
                    value={statusCode}
                    onChange={(e) => setStatusCode(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value={500}>500 Internal Server Error</option>
                    <option value={502}>502 Bad Gateway</option>
                    <option value={503}>503 Service Unavailable</option>
                    <option value={504}>504 Gateway Timeout</option>
                  </select>
                </div>
              )}

              {/* Conditional: Latency Ms */}
              {faultType === 'LATENCY_SPIKE' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Latency Delay: {latencyMs} ms
                  </label>
                  <input
                    type="range"
                    min="500"
                    max="5000"
                    step="250"
                    value={latencyMs}
                    onChange={(e) => setLatencyMs(Number(e.target.value))}
                    className="w-full accent-red-600"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow transition text-xs flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? '⚡ Injecting Fault Condition...' : '🚀 Execute Chaos Test'}
              </button>
            </div>
          </form>
        </div>

        {/* Live Execution Logs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              📋 Experiment Telemetry & Audit Logs
            </h3>
            <button
              onClick={() => setLogs([])}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              Clear Logs
            </button>
          </div>

          <div className="bg-gray-900 text-gray-200 p-4 rounded-xl font-mono text-xs space-y-2 min-h-[140px] max-h-72 overflow-y-auto">
            {logs.length === 0 ? (
              <span className="text-gray-500">Ready. Execute a chaos experiment above to observe platform responses.</span>
            ) : (
              logs.map((log, index) => (
                <div key={index} className={log.includes('❌') ? 'text-red-400' : log.includes('✅') ? 'text-green-400' : 'text-yellow-300'}>
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
