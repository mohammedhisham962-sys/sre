'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function GitOpsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncingApp, setSyncingApp] = useState<string | null>(null);
  const [syncResult, setSyncResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/gitops/apps');
      if (!res.ok) throw new Error('Failed to load GitOps applications');
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error fetching GitOps telemetry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSync = async (appName: string) => {
    try {
      setSyncingApp(appName);
      setSyncResult(null);
      const res = await fetch('/api/v1/gitops/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ app_name: appName, prune: true, dry_run: false })
      });
      if (!res.ok) throw new Error('GitOps sync failed');
      const result = await res.json();
      setSyncResult(result);
      // Refresh applications list
      await fetchData();
    } catch (err: any) {
      alert(`Sync error: ${err.message}`);
    } finally {
      setSyncingApp(null);
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
              <span className="text-xs text-slate-400">Continuous Deployment</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight mt-1 flex items-center gap-3">
              <span>🚀</span> GitOps Progressive Delivery & Drift Controller
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Declarative ArgoCD & Flux cluster reconciliation, live vs desired diffs & multi-wave progressive sync.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-cyan-950/80 border border-cyan-700 text-cyan-300 text-xs font-semibold rounded-full flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span>
              Auto-Sync: {data?.auto_sync_enabled ? 'ENABLED' : 'MANUAL'}
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
            <div className="text-xs text-slate-400 uppercase font-semibold">Total Applications</div>
            <div className="text-2xl font-bold text-white mt-1">{data?.total_applications ?? 4}</div>
            <div className="text-xs text-slate-400 mt-1">{data?.git_repository ? 'Git-Driven State' : 'Loading...'}</div>
          </div>
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
            <div className="text-xs text-slate-400 uppercase font-semibold">In Sync</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">{data?.synced_count ?? 3}</div>
            <div className="text-xs text-emerald-400 mt-1">Zero Configuration Drift</div>
          </div>
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
            <div className="text-xs text-slate-400 uppercase font-semibold">Out of Sync / Drift</div>
            <div className="text-2xl font-bold text-amber-400 mt-1">{data?.out_of_sync_count ?? 1}</div>
            <div className="text-xs text-amber-400 mt-1">Action Required</div>
          </div>
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
            <div className="text-xs text-slate-400 uppercase font-semibold">Engine Engine</div>
            <div className="text-lg font-bold text-cyan-300 mt-1">ArgoCD v2.11</div>
            <div className="text-xs text-slate-400 mt-1">Kustomize & Helm v3</div>
          </div>
        </div>

        {/* Live Sync Progress Notification */}
        {syncResult && (
          <div className="p-4 bg-slate-900/90 border border-cyan-600 rounded-xl space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-cyan-300 flex items-center gap-2">
                <span>⚡</span> Sync Wave In-Progress: {syncResult.application} ({syncResult.revision})
              </span>
              <span className="text-slate-400">Phase: {syncResult.phase}</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {syncResult.sync_wave_execution?.map((wave: any) => (
                <div key={wave.wave} className="p-2 bg-slate-950/70 border border-slate-800 rounded text-center">
                  <div className="text-[10px] text-slate-400 uppercase">Wave {wave.wave}</div>
                  <div className={`text-xs font-semibold mt-0.5 ${wave.status === 'COMPLETED' ? 'text-emerald-400' : wave.status === 'APPLYING_RESOURCES' ? 'text-amber-400 animate-pulse' : 'text-slate-500'}`}>
                    {wave.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* GitOps Applications List */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>📦</span> Managed GitOps Applications
            </h2>
            <span className="text-xs text-slate-400">Reconciled via Git Repository</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {data?.applications?.map((app: any) => (
              <div key={app.name} className="p-6 bg-slate-900/80 border border-slate-800 rounded-xl space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-base font-bold text-white">{app.name}</h3>
                      <span className="px-2 py-0.5 bg-slate-800 text-slate-300 text-xs font-mono rounded">
                        ns: {app.namespace}
                      </span>
                      <span className="px-2 py-0.5 bg-slate-800 text-cyan-300 text-xs font-mono rounded">
                        {app.tool}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1 font-mono">
                      Path: {app.source_path} | Target: {app.target_revision}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-md border ${app.sync_status === 'Synced' ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300' : 'bg-amber-950/60 border-amber-700 text-amber-300'}`}>
                      {app.sync_status}
                    </span>
                    <span className="px-2.5 py-1 bg-slate-800 text-slate-300 text-xs font-semibold rounded-md border border-slate-700">
                      {app.health_status}
                    </span>
                    <button
                      onClick={() => handleSync(app.name)}
                      disabled={syncingApp === app.name}
                      className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 text-white text-xs font-semibold rounded transition"
                    >
                      {syncingApp === app.name ? 'Syncing...' : 'Sync App'}
                    </button>
                  </div>
                </div>

                {/* State Drift Diff Explorer (if OutOfSync) */}
                {app.diffs && app.diffs.length > 0 && (
                  <div className="p-4 bg-slate-950/80 border border-amber-800/60 rounded-lg space-y-2">
                    <div className="text-xs font-bold text-amber-400 flex items-center gap-2">
                      <span>⚠️</span> Detected Configuration Drifts ({app.diffs.length}):
                    </div>
                    <div className="space-y-2">
                      {app.diffs.map((diff: any, idx: number) => (
                        <div key={idx} className="p-2.5 bg-slate-900/90 rounded border border-slate-800 text-xs font-mono space-y-1">
                          <div className="flex justify-between text-slate-400 text-[11px]">
                            <span>{diff.kind}: <span className="text-slate-200">{diff.name}</span> ({diff.field})</span>
                            <span className="text-amber-400 font-semibold">{diff.diff_type}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-800/80">
                            <div className="text-red-400">
                              - Live Cluster: <span className="font-bold">{String(diff.live_value)}</span>
                            </div>
                            <div className="text-emerald-400">
                              + Git Desired: <span className="font-bold">{String(diff.desired_git_value)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
