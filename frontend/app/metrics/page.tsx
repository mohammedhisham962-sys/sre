'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function MetricsDashboard() {
  const [sloData, setSloData] = useState<any>(null);
  const [prometheusRaw, setPrometheusRaw] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMetrics = () => {
    setRefreshing(true);
    Promise.all([
      fetch('/api/v1/metrics/slo').then(r => r.json()),
      fetch('/api/v1/metrics/').then(r => r.text())
    ])
      .then(([slo, prom]) => {
        setSloData(slo);
        setPrometheusRaw(prom);
        setLoading(false);
        setRefreshing(false);
      })
      .catch(err => {
        console.error('Failed to load metrics:', err);
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 20000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="p-8 md:p-12 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              📊 Prometheus Metrics & SLO Compliance
            </h1>
            <p className="text-gray-500 mt-1">
              Real-time Service Level Objectives (SLO), Error Budget burn rates, and Prometheus exporter endpoints.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchMetrics}
              disabled={refreshing}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg shadow-sm hover:bg-gray-50 transition text-sm flex items-center gap-1.5"
            >
              <span className={refreshing ? 'animate-spin inline-block' : ''}>🔄</span>
              {refreshing ? 'Refreshing...' : 'Refresh Metrics'}
            </button>
            <Link href="/" className="text-blue-600 hover:underline font-medium text-sm">← Dashboard</Link>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500 bg-white rounded-xl shadow-sm border p-8">
            <div className="animate-pulse">Calculating SLO compliance & scraping Prometheus telemetry...</div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Top 4 SLO Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Uptime SLO Card */}
              <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
                <span className="text-xs font-bold uppercase text-gray-400">Target Uptime SLO</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-extrabold text-gray-900">
                    {sloData?.actual_uptime_percentage}%
                  </span>
                  <span className="text-xs text-gray-500">/ {sloData?.target_slo_percentage}% Target</span>
                </div>
                <span className={`inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold ${
                  sloData?.is_slo_met ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {sloData?.is_slo_met ? '✓ SLO Compliant' : '🚨 SLO Breached'}
                </span>
              </div>

              {/* Error Budget Card */}
              <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
                <span className="text-xs font-bold uppercase text-gray-400">Error Budget Remaining</span>
                <p className="text-3xl font-extrabold text-blue-600 mt-1">
                  {sloData?.error_budget_remaining_percentage}%
                </p>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-3">
                  <div
                    className="bg-blue-600 h-1.5 rounded-full"
                    style={{ width: `${Math.min(100, Math.max(0, sloData?.error_budget_remaining_percentage || 0))}%` }}
                  ></div>
                </div>
              </div>

              {/* p95 Latency Card */}
              <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
                <span className="text-xs font-bold uppercase text-gray-400">p95 Latency</span>
                <p className="text-3xl font-extrabold text-purple-600 mt-1">
                  {sloData?.latency?.p95_ms} <span className="text-sm font-normal text-gray-500">ms</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">Avg: {sloData?.latency?.average_ms} ms</p>
              </div>

              {/* Prometheus Endpoint Card */}
              <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-orange-500">
                <span className="text-xs font-bold uppercase text-gray-400">Scrape Endpoint</span>
                <p className="text-xs font-mono font-bold text-gray-800 mt-2 truncate">
                  /api/v1/metrics/
                </p>
                <a
                  href="/api/v1/metrics/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-3 px-3 py-1 bg-gray-900 text-white text-[11px] font-semibold rounded hover:bg-gray-800"
                >
                  Raw Scrape ↗
                </a>
              </div>
            </div>

            {/* Latency Percentiles & Breakdown */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-base font-bold text-gray-900 mb-4">⏱️ Response Time Percentiles (SLI)</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <span className="text-xs text-gray-500 font-semibold block">Average Latency</span>
                  <span className="text-xl font-bold text-gray-900 mt-1 block">{sloData?.latency?.average_ms} ms</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <span className="text-xs text-gray-500 font-semibold block">50th Percentile (p50)</span>
                  <span className="text-xl font-bold text-gray-900 mt-1 block">{sloData?.latency?.p50_ms} ms</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <span className="text-xs text-gray-500 font-semibold block">95th Percentile (p95)</span>
                  <span className="text-xl font-bold text-purple-600 mt-1 block">{sloData?.latency?.p95_ms} ms</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <span className="text-xs text-gray-500 font-semibold block">99th Percentile (p99)</span>
                  <span className="text-xl font-bold text-red-600 mt-1 block">{sloData?.latency?.p99_ms} ms</span>
                </div>
              </div>

              {/* Evaluation Window Details */}
              <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
                <span>Sample Window: <strong>{sloData?.total_checks_evaluated} recent HTTP pings</strong></span>
                <span>Successful: <strong className="text-green-600">{sloData?.successful_pings}</strong> • Failed: <strong className="text-red-600">{sloData?.failed_pings}</strong></span>
              </div>
            </div>

            {/* Prometheus Raw Plain-Text Exporter Box */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  🔌 Prometheus Exposition Format (Plain Text)
                </h2>
                <span className="text-xs text-gray-400 font-mono">Compatible with Grafana & Prometheus Server</span>
              </div>
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs font-mono overflow-x-auto max-h-64">
                {prometheusRaw || '# Loading metrics...'}
              </pre>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
