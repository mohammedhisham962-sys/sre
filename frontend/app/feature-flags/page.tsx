'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function FeatureFlagsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [togglingKey, setTogglingKey] = useState<string | null>(null);
  const [killingKey, setKillingKey] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/feature-flags/flags');
      if (!res.ok) throw new Error('Failed to load feature flags');
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error fetching flags');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggle = async (flagKey: string, currentEnabled: boolean, ring: string, pct: number) => {
    try {
      setTogglingKey(flagKey);
      setActionMsg(null);
      const res = await fetch('/api/v1/feature-flags/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flag_key: flagKey,
          enabled: !currentEnabled,
          ring: ring,
          rollout_pct: !currentEnabled ? (pct > 0 ? pct : 50) : 0
        })
      });
      if (!res.ok) throw new Error('Flag toggle failed');
      const result = await res.json();
      setActionMsg(result);
      await fetchData();
    } catch (err: any) {
      alert(`Toggle failed: ${err.message}`);
    } finally {
      setTogglingKey(null);
    }
  };

  const handleKillSwitch = async (flagKey: string) => {
    if (!confirm(`Engage Emergency Kill-Switch for ${flagKey}? This will immediately turn OFF the feature globally.`)) return;
    try {
      setKillingKey(flagKey);
      setActionMsg(null);
      const res = await fetch('/api/v1/feature-flags/kill-switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flag_key: flagKey, reason: 'Manual SRE Kill-Switch Trigger' })
      });
      if (!res.ok) throw new Error('Kill switch activation failed');
      const result = await res.json();
      setActionMsg(result);
      await fetchData();
    } catch (err: any) {
      alert(`Kill-switch error: ${err.message}`);
    } finally {
      setKillingKey(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-slate-800 gap-4">
          <div>
            <div className="flex items-center gap-3">
              <Link href="/" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                ← Back to Ops Command
              </Link>
              <span className="text-slate-600">/</span>
              <span className="text-xs text-slate-400">Continuous Delivery & Rollouts</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight mt-1 flex items-center gap-3">
              <span>⚡</span> Dynamic Feature Flags & Progressive Ring Deployments
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Zero-downtime feature toggles, multi-ring staged canary rollouts & automated error-budget kill-switches.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs font-semibold rounded-full flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Kill-Switch Guard: {data?.automated_kill_switch_guard || 'ACTIVE'}
            </span>
            <button
              onClick={fetchData}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium rounded-lg transition border border-slate-700"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
            <div className="text-xs text-slate-400 uppercase font-semibold">Total Feature Flags</div>
            <div className="text-2xl font-bold text-white mt-1">{data?.total_flags ?? 4}</div>
            <div className="text-xs text-slate-400 mt-1">In-Memory AST Rule Engine</div>
          </div>
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
            <div className="text-xs text-slate-400 uppercase font-semibold">Active in Production</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">{data?.active_flags ?? 3}</div>
            <div className="text-xs text-emerald-400 mt-1">Live Segment Targeting</div>
          </div>
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
            <div className="text-xs text-slate-400 uppercase font-semibold">Evaluation Latency</div>
            <div className="text-2xl font-bold text-cyan-300 mt-1">&lt; 2 ms</div>
            <div className="text-xs text-slate-400 mt-1">Zero Database Queries</div>
          </div>
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
            <div className="text-xs text-slate-400 uppercase font-semibold">Automated Anomaly Tripping</div>
            <div className="text-2xl font-bold text-indigo-400 mt-1">500ms SRE Trip</div>
            <div className="text-xs text-slate-400 mt-1">Error Budget Protection</div>
          </div>
        </div>

        {/* Dynamic Action Notification */}
        {actionMsg && (
          <div className="p-4 bg-slate-900/90 border border-indigo-600 rounded-xl text-xs space-y-1">
            <div className="font-bold text-indigo-300 flex items-center gap-2">
              <span>⚡</span> Action Executed: {actionMsg.action} ({actionMsg.flag_key})
            </div>
            <p className="text-slate-300">
              State: <code className="text-cyan-300">{actionMsg.enabled ? 'ENABLED' : 'DISABLED'}</code> | Status: {actionMsg.status}
            </p>
          </div>
        )}

        {/* Feature Flags Inventory & Progressive Ring Matrix */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>🚩</span> Feature Flags & Ring Rollout Matrix
            </h2>
            <span className="text-xs text-slate-400">Real-Time Rule Propagation</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {data?.flags?.map((flag: any) => (
              <div key={flag.key} className="p-6 bg-slate-900/80 border border-slate-800 rounded-xl space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-base font-bold text-white">{flag.name}</h3>
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded ${flag.enabled ? 'bg-emerald-950 border border-emerald-700 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
                        {flag.enabled ? 'ENABLED' : 'DISABLED'}
                      </span>
                      <span className="px-2 py-0.5 bg-slate-800 text-indigo-300 text-xs font-mono rounded">
                        {flag.ring}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{flag.description}</p>
                    <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                      Key: <code className="text-slate-300">{flag.key}</code> | Owner: {flag.created_by}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggle(flag.key, flag.enabled, flag.ring, flag.rollout_pct)}
                      disabled={togglingKey === flag.key}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${flag.enabled ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700' : 'bg-emerald-600 hover:bg-emerald-500 text-white'}`}
                    >
                      {togglingKey === flag.key ? 'Updating...' : flag.enabled ? 'Disable Flag' : 'Enable Flag'}
                    </button>
                    <button
                      onClick={() => handleKillSwitch(flag.key)}
                      disabled={killingKey === flag.key || !flag.enabled}
                      className="px-3 py-1.5 bg-rose-600/80 hover:bg-rose-600 disabled:bg-slate-800 text-white text-xs font-semibold rounded-lg transition border border-rose-500/50"
                    >
                      {killingKey === flag.key ? 'Tripping...' : '🚨 Kill Switch'}
                    </button>
                  </div>
                </div>

                {/* Progressive Rollout Ring Bar */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Progressive Delivery Ring: <span className="text-indigo-300 font-semibold">{flag.ring}</span></span>
                    <span className="font-mono text-slate-200">{flag.rollout_pct}% Audience</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className={`h-2 rounded-full transition-all ${flag.enabled ? (flag.rollout_pct === 100 ? 'bg-emerald-500' : 'bg-indigo-500') : 'bg-slate-700'}`}
                      style={{ width: `${flag.rollout_pct}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
