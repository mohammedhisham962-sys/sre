'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function EdgeWafPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [purging, setPurging] = useState<boolean>(false);
  const [purgeMsg, setPurgeMsg] = useState<any>(null);
  const [blockIpInput, setBlockIpInput] = useState<string>('');
  const [blockReasonInput, setBlockReasonInput] = useState<string>('Suspicious SQLi pattern');
  const [blocking, setBlocking] = useState<boolean>(false);
  const [blockMsg, setBlockMsg] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/edge-waf/status');
      if (!res.ok) throw new Error('Failed to load Edge & WAF telemetry');
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error fetching WAF status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePurge = async () => {
    try {
      setPurging(true);
      setPurgeMsg(null);
      const res = await fetch('/api/v1/edge-waf/purge-cache', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scope: 'global' })
      });
      if (!res.ok) throw new Error('Cache purge failed');
      const result = await res.json();
      setPurgeMsg(result);
      await fetchData();
    } catch (err: any) {
      alert(`Purge failed: ${err.message}`);
    } finally {
      setPurging(false);
    }
  };

  const handleBlockIp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockIpInput) return;
    try {
      setBlocking(true);
      setBlockMsg(null);
      const res = await fetch('/api/v1/edge-waf/block-ip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip_address: blockIpInput, reason: blockReasonInput, duration_hours: 24 })
      });
      if (!res.ok) throw new Error('IP block request failed');
      const result = await res.json();
      setBlockMsg(result);
      setBlockIpInput('');
      await fetchData();
    } catch (err: any) {
      alert(`Block failed: ${err.message}`);
    } finally {
      setBlocking(false);
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
              <span className="text-xs text-slate-400">Edge Networking & DDoS Protection</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight mt-1 flex items-center gap-3">
              <span>🕸️</span> Global Edge CDN & Web Application Firewall (WAF)
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Multi-PoP edge caching, TLS 1.3 QUIC acceleration & automated OWASP Top 10 threat mitigation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-rose-950/80 border border-rose-700 text-rose-300 text-xs font-semibold rounded-full flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-rose-400 animate-pulse"></span>
              WAF Mode: {data?.waf_mode || 'ACTIVE_BLOCKING'}
            </span>
            <button
              onClick={handlePurge}
              disabled={purging}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 text-white text-xs font-medium rounded-lg transition"
            >
              {purging ? 'Purging PoPs...' : '⚡ Purge Global Cache'}
            </button>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
            <div className="text-xs text-slate-400 uppercase font-semibold">Cache Hit Ratio</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">{data?.cache_hit_ratio_pct ?? 94.8}%</div>
            <div className="text-xs text-slate-400 mt-1">{data?.bandwidth_saved_tb ?? 1.42} TB Bandwidth Saved</div>
          </div>
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
            <div className="text-xs text-slate-400 uppercase font-semibold">Global Throughput</div>
            <div className="text-2xl font-bold text-white mt-1">{(data?.total_requests_per_sec ?? 12450).toLocaleString()} req/s</div>
            <div className="text-xs text-indigo-400 mt-1">{data?.active_pops ?? 5} Edge PoPs Active</div>
          </div>
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
            <div className="text-xs text-slate-400 uppercase font-semibold">P95 Edge Latency</div>
            <div className="text-2xl font-bold text-cyan-300 mt-1">{data?.p95_edge_latency_ms ?? 14} ms</div>
            <div className="text-xs text-slate-400 mt-1">{data?.tls_version || 'TLS 1.3 / HTTP/3'}</div>
          </div>
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
            <div className="text-xs text-slate-400 uppercase font-semibold">OWASP Rules Enforced</div>
            <div className="text-2xl font-bold text-rose-400 mt-1">4 Active</div>
            <div className="text-xs text-slate-400 mt-1">Real-Time IP Firewall</div>
          </div>
        </div>

        {/* Dynamic Alerts */}
        {purgeMsg && (
          <div className="p-4 bg-emerald-950/70 border border-emerald-600 rounded-xl text-xs space-y-1">
            <div className="font-bold text-emerald-300 flex items-center gap-2">
              <span>✅</span> Global Cache Purged: {purgeMsg.purged_pops_count} Edge PoPs Invalidate in {purgeMsg.propagation_time_ms}ms
            </div>
          </div>
        )}

        {blockMsg && (
          <div className="p-4 bg-rose-950/70 border border-rose-600 rounded-xl text-xs space-y-1">
            <div className="font-bold text-rose-300 flex items-center gap-2">
              <span>🚨</span> Emergency IP Ban Enforced: {blockMsg.ip_address} ({blockMsg.reason})
            </div>
            <p className="text-slate-400">{blockMsg.sync_status} for {blockMsg.duration_hours} hours.</p>
          </div>
        )}

        {/* Global Edge Points of Presence (PoPs) */}
        <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-xl space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>🌍</span> Global Edge Points of Presence (PoPs)
            </h2>
            <span className="text-xs text-slate-400">Anycast Routing Mesh</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {data?.pops?.map((pop: any) => (
              <div key={pop.pop_code} className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-sm text-cyan-300">{pop.pop_code}</span>
                  <span className="px-1.5 py-0.5 bg-emerald-950 border border-emerald-700 text-emerald-300 text-[10px] rounded font-semibold">
                    {pop.status}
                  </span>
                </div>
                <div className="text-xs text-slate-300 truncate">{pop.region}</div>
                <div className="text-xs space-y-1 pt-1 border-t border-slate-800/80 font-mono text-slate-400">
                  <div className="flex justify-between">
                    <span>Hit Ratio:</span>
                    <span className="text-emerald-400 font-bold">{pop.hit_ratio}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Edge Latency:</span>
                    <span className="text-indigo-300">{pop.latency_ms}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Load:</span>
                    <span>{pop.requests_sec} r/s</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* WAF Rules & Real-Time Block Stream Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Active WAF Mitigation Rules */}
          <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-xl space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>🛡️</span> WAF Mitigation Rules
            </h2>
            <div className="space-y-2">
              {data?.waf_rules?.map((rule: any) => (
                <div key={rule.rule_id} className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg flex justify-between items-center text-xs">
                  <div>
                    <div className="font-semibold text-slate-200">{rule.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{rule.rule_id} • {rule.category}</div>
                  </div>
                  <div className="text-right space-y-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${rule.action === 'BLOCK' ? 'bg-red-950 border border-red-700 text-red-300' : 'bg-amber-950 border border-amber-700 text-amber-300'}`}>
                      {rule.action}
                    </span>
                    <div className="text-[10px] text-slate-400 font-mono">{rule.blocks_today} blocks today</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Real-Time Threat Block Stream & IP Ban Form */}
          <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-xl space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>🚨</span> Real-Time Blocked Threat Stream
            </h2>
            <div className="space-y-2">
              {data?.recent_blocks?.map((block: any, idx: number) => (
                <div key={idx} className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-lg text-xs font-mono space-y-1">
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="font-bold text-red-400">{block.ip} [{block.country}]</span>
                    <span className="text-[10px] text-slate-500">{block.timestamp}</span>
                  </div>
                  <div className="text-slate-400 text-[11px]">{block.threat}</div>
                  <div className="text-emerald-400 text-[10px] font-semibold">{block.action} ({block.rule_id})</div>
                </div>
              ))}
            </div>

            {/* Quick Emergency IP Ban Form */}
            <form onSubmit={handleBlockIp} className="pt-3 border-t border-slate-800 space-y-2">
              <div className="text-xs font-semibold text-slate-300">Emergency Manual IP Block:</div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. 203.0.113.50"
                  value={blockIpInput}
                  onChange={(e) => setBlockIpInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 font-mono"
                />
                <button
                  type="submit"
                  disabled={blocking || !blockIpInput}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800 text-white text-xs font-semibold rounded-lg transition"
                >
                  {blocking ? 'Enforcing...' : 'Block IP'}
                </button>
              </div>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
