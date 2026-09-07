'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SyntheticsPage() {
  const [suites, setSuites] = useState<any[]>([]);
  const [selectedSuiteId, setSelectedSuiteId] = useState<number>(1);
  const [probeResult, setProbeResult] = useState<any>(null);
  const [probing, setProbing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch('/api/v1/synthetics/suites')
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setSuites(list);
        if (list.length > 0) {
          setSelectedSuiteId(list[0].id);
          // Initial trigger
          runProbe(list[0].id);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading synthetic suites:', err);
        setSuites([]);
        setLoading(false);
      });
  }, []);

  const runProbe = async (suiteId: number) => {
    setProbing(true);
    try {
      const res = await fetch(`/api/v1/synthetics/run?suite_id=${suiteId}`, {
        method: 'POST'
      });
      const data = await res.json();
      setProbeResult(data);
    } catch (err) {
      console.error('Probe execution error:', err);
    } finally {
      setProbing(false);
    }
  };

  const activeSuite = suites.find((s) => s.id === selectedSuiteId) || suites[0];

  return (
    <main className="p-8 md:p-12 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">🌐</span>
            <h1 className="text-3xl font-bold text-gray-900">Synthetic Journey & Latency Waterfall</h1>
          </div>
          <p className="text-gray-600 mt-1">
            Multi-step synthetic user transaction simulations, per-hop latency waterfalls, and proactive SLA guardrails.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/metrics" className="px-4 py-2 border rounded-lg text-gray-700 bg-white hover:bg-gray-100 text-sm font-medium">
            SLO Dashboard
          </Link>
          <Link href="/" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
            ← Dashboard
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="bg-white p-12 rounded-xl border text-center text-gray-500">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          Configuring synthetic transaction probes...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Suite Catalog Sidebar */}
          <div className="space-y-4">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Transaction Suites</h2>
            <div className="space-y-3">
              {suites.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setSelectedSuiteId(s.id);
                    runProbe(s.id);
                  }}
                  className={`w-full text-left p-4 rounded-xl border transition ${
                    selectedSuiteId === s.id
                      ? 'bg-blue-50 border-blue-500 shadow-sm'
                      : 'bg-white hover:bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-mono text-xs font-bold text-blue-700">{s.steps?.length || 5} Hops</span>
                    <span className="px-2 py-0.5 text-xs font-semibold rounded bg-green-100 text-green-700">
                      SLO: {s.slo_target_ms}ms
                    </span>
                  </div>
                  <div className="text-sm font-bold text-gray-900 mt-1">{s.name}</div>
                  <div className="text-xs text-gray-500 mt-1 flex justify-between">
                    <span>Interval: {s.interval_sec}s</span>
                    <span className="font-mono text-[11px] text-gray-400 truncate max-w-[140px]">{s.target}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Quick Metrics Card */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Probe Engine Health</h3>
              <div className="flex justify-between text-xs py-1 border-b">
                <span className="text-gray-500">Global Prober Availability</span>
                <span className="font-bold text-green-600">100.0%</span>
              </div>
              <div className="flex justify-between text-xs py-1 border-b">
                <span className="text-gray-500">Synthetic Scrape Target</span>
                <span className="font-mono text-gray-700">sre-4vhw.onrender.com</span>
              </div>
              <div className="flex justify-between text-xs py-1">
                <span className="text-gray-500">Total Probed Journeys</span>
                <span className="font-bold text-blue-600">{suites.length} Suites</span>
              </div>
            </div>
          </div>

          {/* Latency Waterfall View */}
          {probeResult && (
            <div className="lg:col-span-2 space-y-6">
              {/* Probe Result Header Card */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4 mb-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                        probeResult.status === 'HEALTHY' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {probeResult.status}
                      </span>
                      <span className="text-xs text-gray-500">Last Probed: {probeResult.executed_at}</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mt-1">{probeResult.suite_name}</h2>
                  </div>
                  <button
                    onClick={() => runProbe(selectedSuiteId)}
                    disabled={probing}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 shadow flex items-center gap-2 disabled:opacity-50"
                  >
                    {probing ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Simulating Hops...
                      </>
                    ) : (
                      '⚡ Run Probe Now'
                    )}
                  </button>
                </div>

                {/* Total Latency vs SLO Gauge */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-gray-50 rounded-lg border text-center">
                    <div className="text-xs text-gray-500">Total Transaction Latency</div>
                    <div className="text-2xl font-black text-blue-600 mt-1">{probeResult.total_latency_ms}ms</div>
                    <div className="text-xs text-gray-400 mt-0.5">End-to-End Hop Sum</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border text-center">
                    <div className="text-xs text-gray-500">Target SLO Budget</div>
                    <div className="text-2xl font-black text-purple-600 mt-1">{probeResult.slo_target_ms}ms</div>
                    <div className="text-xs text-gray-400 mt-0.5">Max Permissible</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border text-center">
                    <div className="text-xs text-gray-500">SLO Compliance</div>
                    <div className="text-2xl font-black text-green-600 mt-1">
                      {probeResult.slo_met ? '✅ PASS' : '⚠️ BREACH'}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">Under Latency Budget</div>
                  </div>
                </div>

                {/* Latency Waterfall Breakdown */}
                <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                  📊 Per-Hop Latency Waterfall Breakdown
                </h3>
                <div className="space-y-4">
                  {probeResult.steps?.map((step: any) => {
                    const pct = Math.min(100, Math.round((step.latency_ms / probeResult.total_latency_ms) * 100));
                    return (
                      <div key={step.step} className="p-3.5 bg-gray-50 rounded-lg border space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 bg-blue-600 text-white font-bold rounded-full flex items-center justify-center text-[10px]">
                              {step.step}
                            </span>
                            <span className="font-bold text-gray-900">{step.name}</span>
                            <span className="font-mono bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded text-[10px]">
                              {step.method} {step.target_url}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 font-mono">
                            <span className="text-green-600 font-bold">HTTP {step.status_code}</span>
                            <span className="text-blue-600 font-black text-sm">{step.latency_ms}ms</span>
                          </div>
                        </div>

                        {/* Visual Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                          <div
                            className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                            style={{ width: `${Math.max(8, pct)}%` }}
                          ></div>
                        </div>

                        <div className="flex justify-between text-[11px] text-gray-400 font-mono">
                          <span>Payload: {step.response_size_bytes} bytes</span>
                          <span>Cumulative: {step.cumulative_latency_ms}ms ({pct}% of total)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
