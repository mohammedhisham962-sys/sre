'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CanaryConsole() {
  const [canaryData, setCanaryData] = useState<any | null>(null);
  const [evaluating, setEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState<any | null>(null);
  const [simulatedLatency, setSimulatedLatency] = useState(38.0);
  const [simulatedErrors, setSimulatedErrors] = useState(0.06);

  const fetchCanary = () => {
    fetch('/api/v1/canary/status')
      .then(res => res.json())
      .then(data => setCanaryData(data.active_canary || null))
      .catch(err => console.error('Failed to load canary:', err));
  };

  useEffect(() => {
    fetchCanary();
  }, []);

  const runEvaluation = async (forceRollback = false) => {
    setEvaluating(true);
    setEvalResult(null);

    const payload = {
      canary_version: canaryData?.version || 'v2.14.0-canary.3',
      baseline_latency_ms: 24.5,
      canary_latency_ms: forceRollback ? 45.0 : simulatedLatency,
      baseline_error_rate: 0.001,
      canary_error_rate: forceRollback ? 0.08 : simulatedErrors
    };

    try {
      const res = await fetch('/api/v1/canary/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setEvalResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <main className="p-8 md:p-12 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
              <span className="p-2 bg-amber-500 text-white rounded-lg text-2xl shadow-sm">🔄</span>
              Canary Release & Automated Rollback Guardrails
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              Live traffic split analysis, SLI error budget comparison, and autonomous automated rollback triggers.
            </p>
          </div>
          <Link href="/" className="text-sm font-semibold text-blue-600 hover:text-blue-800">
            ← Dashboard
          </Link>
        </div>

        {/* Evaluation Banner */}
        {evalResult && (
          <div className={`mb-8 p-6 rounded-2xl border shadow-sm ${evalResult.is_degraded ? 'bg-rose-50 border-rose-300' : 'bg-emerald-50 border-emerald-300'}`}>
            <div className="flex justify-between items-center">
              <h3 className={`font-bold text-lg ${evalResult.is_degraded ? 'text-rose-900' : 'text-emerald-900'}`}>
                {evalResult.is_degraded ? '🚨 Automated Rollback Triggered!' : '✅ Canary Promoted to 100%!'}
              </h3>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${evalResult.is_degraded ? 'bg-rose-200 text-rose-900' : 'bg-emerald-200 text-emerald-900'}`}>
                {evalResult.decision}
              </span>
            </div>
            <p className={`text-sm mt-2 ${evalResult.is_degraded ? 'text-rose-800' : 'text-emerald-800'}`}>
              {evalResult.reason}
            </p>
            <div className="grid grid-cols-2 gap-4 mt-4 text-xs font-mono">
              <div className="p-3 bg-white bg-opacity-75 rounded-lg">
                Latency Delta: <span className="font-bold">{evalResult.metrics?.latency_delta_pct > 0 ? `+${evalResult.metrics.latency_delta_pct}%` : `${evalResult.metrics?.latency_delta_pct}%`}</span> (Limit: +15%)
              </div>
              <div className="p-3 bg-white bg-opacity-75 rounded-lg">
                Canary Error Rate: <span className="font-bold">{(evalResult.metrics?.canary_error_rate * 100).toFixed(1)}%</span> (Limit: 5%)
              </div>
            </div>
          </div>
        )}

        {/* Traffic Split Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Baseline Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Baseline Production</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">90% Traffic</span>
            </div>
            <h3 className="text-2xl font-extrabold text-gray-900 mb-1">v2.13.4</h3>
            <p className="text-xs text-gray-400 mb-6">Current stable release deployed to 90% of global edge proxies</p>
            
            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-500">Median Latency</span>
                  <span className="font-mono font-bold text-gray-800">24.5ms</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '25%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-500">Error Rate</span>
                  <span className="font-mono font-bold text-emerald-600">0.01% (Healthy)</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '1%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Canary Card */}
          <div className="bg-white rounded-2xl border-2 border-amber-400 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Canary Target</span>
              <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold">10% Traffic</span>
            </div>
            <h3 className="text-2xl font-extrabold text-gray-900 mb-1">{canaryData?.version || 'v2.14.0-canary.3'}</h3>
            <p className="text-xs text-gray-400 mb-6">Under active AI SLO guardrail evaluation</p>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-500">Canary Latency</span>
                  <span className="font-mono font-bold text-amber-600">{simulatedLatency}ms</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-amber-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-500">Canary Error Rate</span>
                  <span className="font-mono font-bold text-rose-600">{(simulatedErrors * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-rose-500 h-2 rounded-full" style={{ width: `${simulatedErrors * 500}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Controls */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4 text-base">🛠️ Interactive Canary Guardrail Controls</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-2">Simulate Canary Latency: {simulatedLatency}ms</label>
              <input
                type="range"
                min="20"
                max="60"
                value={simulatedLatency}
                onChange={(e) => setSimulatedLatency(parseFloat(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-2">Simulate Error Rate: {(simulatedErrors * 100).toFixed(1)}%</label>
              <input
                type="range"
                min="0.0"
                max="0.10"
                step="0.01"
                value={simulatedErrors}
                onChange={(e) => setSimulatedErrors(parseFloat(e.target.value))}
                className="w-full accent-rose-500"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => runEvaluation(false)}
              disabled={evaluating}
              className="bg-gray-900 hover:bg-black text-white font-bold py-2.5 px-6 rounded-xl text-xs shadow-sm transition disabled:opacity-50"
            >
              {evaluating ? 'Evaluating...' : '⚡ Evaluate Guardrail SLIs'}
            </button>
            <button
              onClick={() => runEvaluation(true)}
              disabled={evaluating}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 px-6 rounded-xl text-xs shadow-sm transition disabled:opacity-50"
            >
              🚨 Trigger Emergency Rollback
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
