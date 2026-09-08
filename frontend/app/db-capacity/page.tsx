'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DbCapacityPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [autoscaling, setAutoscaling] = useState<boolean>(false);
  const [autoscaleMsg, setAutoscaleMsg] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/db-capacity/metrics');
      if (!res.ok) throw new Error('Failed to load database capacity metrics');
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error fetching capacity data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAutoscale = async () => {
    try {
      setAutoscaling(true);
      setAutoscaleMsg(null);
      const res = await fetch('/api/v1/db-capacity/autoscale-iops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_iops: 6000, burst_duration_minutes: 60 })
      });
      if (!res.ok) throw new Error('IOPS scaling request failed');
      const result = await res.json();
      setAutoscaleMsg(result);
      await fetchData();
    } catch (err: any) {
      alert(`Scaling error: ${err.message}`);
    } finally {
      setAutoscaling(false);
    }
  };

  const connPct = data?.connections?.utilization_pct ?? 42.7;
  const storagePct = data?.storage_forecast?.used_pct ?? 68.4;
  const iopsPct = data?.performance?.iops_utilization_pct ?? 61.6;

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
              <span className="text-xs text-slate-400">Database SRE & Capacity Planning</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight mt-1 flex items-center gap-3">
              <span>📈</span> Database Capacity Planner & IOPS Autoscaler
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Connection pool depth, buffer cache hit ratios, storage depletion forecasting & IOPS headroom scaling.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs font-semibold rounded-full flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {data?.cluster_name || 'postgres-primary-prod-cluster'}
            </span>
            <button
              onClick={handleAutoscale}
              disabled={autoscaling}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white text-xs font-medium rounded-lg transition"
            >
              {autoscaling ? 'Scaling Storage...' : '⚡ Autoscale IOPS (6,000)'}
            </button>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2">
            <div className="text-xs text-slate-400 uppercase font-semibold">Connection Pool</div>
            <div className="text-2xl font-bold text-white mt-1">
              {data?.connections?.active ?? 64} / {data?.connections?.max_limit ?? 150}
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${connPct}%` }}></div>
            </div>
            <div className="text-xs text-slate-400">{connPct}% Pool Utilization</div>
          </div>

          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2">
            <div className="text-xs text-slate-400 uppercase font-semibold">Buffer Cache Hit Ratio</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">
              {data?.performance?.buffer_cache_hit_ratio_pct ?? 99.4}%
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '99.4%' }}></div>
            </div>
            <div className="text-xs text-emerald-400">Optimal In-Memory Reads</div>
          </div>

          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2">
            <div className="text-xs text-slate-400 uppercase font-semibold">Storage Capacity</div>
            <div className="text-2xl font-bold text-cyan-300 mt-1">
              {data?.storage_forecast?.used_disk_gb ?? 342} / {data?.storage_forecast?.total_disk_gb ?? 500} GB
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div className="bg-cyan-500 h-1.5 rounded-full" style={{ width: `${storagePct}%` }}></div>
            </div>
            <div className="text-xs text-slate-400">{storagePct}% Disk Allocated</div>
          </div>

          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2">
            <div className="text-xs text-slate-400 uppercase font-semibold">IOPS Throughput</div>
            <div className="text-2xl font-bold text-white mt-1">
              {data?.performance?.current_iops ?? 1850} / {data?.performance?.max_provisioned_iops ?? 3000}
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${iopsPct}%` }}></div>
            </div>
            <div className="text-xs text-slate-400">{iopsPct}% IOPS Headroom Used</div>
          </div>
        </div>

        {/* Dynamic IOPS Autoscale Alert */}
        {autoscaleMsg && (
          <div className="p-4 bg-emerald-950/70 border border-emerald-600 rounded-xl text-xs space-y-1">
            <div className="font-bold text-emerald-300 flex items-center gap-2">
              <span>✅</span> IOPS Autoscaled Successfully: {autoscaleMsg.previous_iops} → {autoscaleMsg.target_iops} IOPS
            </div>
            <p className="text-slate-300">
              {autoscaleMsg.volume_status} | Burst Window: {autoscaleMsg.burst_duration_minutes} min | Zero Downtime ({autoscaleMsg.downtime_ms}ms)
            </p>
          </div>
        )}

        {/* Predictive Storage Depletion Forecast */}
        <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-xl space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>🔮</span> Predictive Storage Depletion Forecast
            </h2>
            <span className="px-2.5 py-0.5 bg-emerald-950 border border-emerald-700 text-emerald-300 text-xs font-semibold rounded">
              {data?.storage_forecast?.forecast_verdict || 'ADEQUATE_HEADROOM'}
            </span>
          </div>

          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs font-mono">
            <div>
              <div className="text-slate-400">Monthly Organic Ingestion Rate:</div>
              <div className="text-base font-bold text-white mt-0.5">+{data?.storage_forecast?.growth_rate_gb_per_month ?? 18.5} GB / month</div>
            </div>
            <div>
              <div className="text-slate-400">Days Until 85% Warning Threshold:</div>
              <div className="text-base font-bold text-emerald-400 mt-0.5">
                ~{data?.storage_forecast?.days_until_85_pct_threshold ?? 84} Days Remaining
              </div>
            </div>
            <div>
              <div className="text-slate-400">Free Volume Space:</div>
              <div className="text-base font-bold text-cyan-300 mt-0.5">
                {data?.storage_forecast?.free_disk_gb ?? 158} GB Available
              </div>
            </div>
          </div>
        </div>

        {/* Table Bloat & Autovacuum Matrix */}
        <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-xl space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>🧹</span> Table Bloat & Autovacuum Schedule
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Dead tuple cleanup and heap vacuuming metrics.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Relation / Table Name</th>
                  <th className="py-3 px-4">Size on Disk</th>
                  <th className="py-3 px-4">Estimated Bloat %</th>
                  <th className="py-3 px-4">Last Autovacuum</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {data?.table_bloat?.map((t: any) => (
                  <tr key={t.table} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4 font-semibold text-slate-200 font-mono">
                      {t.table}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">
                      {(t.size_mb / 1024).toFixed(2)} GB ({t.size_mb.toLocaleString()} MB)
                    </td>
                    <td className="py-3 px-4 font-mono font-bold">
                      <span className={t.bloat_pct > 10 ? 'text-amber-400' : 'text-emerald-400'}>
                        {t.bloat_pct}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {t.last_autovacuum}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${t.status === 'OPTIMAL' ? 'bg-emerald-950 border border-emerald-700 text-emerald-300' : 'bg-amber-950 border border-amber-700 text-amber-300'}`}>
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
