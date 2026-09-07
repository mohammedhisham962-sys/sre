'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function IntegrationsConsole() {
  const [forwarders, setForwarders] = useState<any[]>([]);
  const [pushing, setPushing] = useState<string | null>(null);
  const [pushResult, setPushResult] = useState<any | null>(null);

  const fetchForwarders = () => {
    fetch('/api/v1/integrations/forwarders')
      .then(res => res.json())
      .then(data => setForwarders(Array.isArray(data) ? data : []))
      .catch(err => console.error('Failed to load forwarders:', err));
  };

  useEffect(() => {
    fetchForwarders();
  }, []);

  const triggerPush = async (dest: string) => {
    setPushing(dest);
    setPushResult(null);

    try {
      const res = await fetch('/api/v1/integrations/forward', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination: dest })
      });
      const data = await res.json();
      setPushResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setPushing(null);
    }
  };

  return (
    <main className="p-8 md:p-12 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
              <span className="p-2 bg-purple-600 text-white rounded-lg text-2xl shadow-sm">📊</span>
              Multi-Cloud Metrics & Telemetry Forwarders
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              Live telemetry streaming to Datadog API v1 and Grafana Cloud Prometheus push endpoints.
            </p>
          </div>
          <Link href="/" className="text-sm font-semibold text-blue-600 hover:text-blue-800">
            ← Dashboard
          </Link>
        </div>

        {/* Push Result Banner */}
        {pushResult && (
          <div className="mb-8 p-6 bg-purple-50 border border-purple-300 rounded-2xl shadow-sm">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-purple-900 text-lg flex items-center gap-2">
                <span>⚡</span> Telemetry Dispatched to {pushResult.destination}!
              </h3>
              <button onClick={() => setPushResult(null)} className="text-sm text-purple-700 font-bold hover:underline">Dismiss</button>
            </div>
            <p className="text-purple-800 text-sm mt-2">
              Status: <strong>{pushResult.status}</strong> | Pushed live latency percentiles and error budget burn rates.
            </p>
            <pre className="mt-3 p-3 bg-gray-900 text-purple-300 font-mono text-xs rounded-lg overflow-x-auto">
              {JSON.stringify(pushResult.metrics, null, 2)}
            </pre>
          </div>
        )}

        {/* Forwarders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Datadog Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-2xl">🐕</span>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">● Active Ready</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Datadog Cloud Metrics</h3>
              <p className="text-xs text-gray-500 mb-4">Streams gauges and latency histograms via Datadog API v1 series.</p>
              
              <div className="p-3 bg-gray-50 rounded-xl border mb-6 text-xs font-mono text-gray-700 space-y-1">
                <div>Endpoint: <code>https://api.datadoghq.com/api/v1/series</code></div>
                <div>Payload: <code>JSON Series [gauge, percentiles]</code></div>
              </div>
            </div>

            <button
              onClick={() => triggerPush('DATADOG')}
              disabled={pushing === 'DATADOG'}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-sm transition disabled:opacity-50"
            >
              {pushing === 'DATADOG' ? 'Pushing...' : '⚡ Push Metrics to Datadog'}
            </button>
          </div>

          {/* Grafana Cloud Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-2xl">📈</span>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">● Active Ready</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Grafana Cloud Prometheus</h3>
              <p className="text-xs text-gray-500 mb-4">Pushes standard Prometheus text exposition to Grafana Push Gateway.</p>
              
              <div className="p-3 bg-gray-50 rounded-xl border mb-6 text-xs font-mono text-gray-700 space-y-1">
                <div>Endpoint: <code>https://prometheus-prod-us-central1.grafana.net/api/v1/push</code></div>
                <div>Format: <code>Prometheus Plain-Text Exposition</code></div>
              </div>
            </div>

            <button
              onClick={() => triggerPush('GRAFANA_CLOUD')}
              disabled={pushing === 'GRAFANA_CLOUD'}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-sm transition disabled:opacity-50"
            >
              {pushing === 'GRAFANA_CLOUD' ? 'Pushing...' : '⚡ Push Metrics to Grafana'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
