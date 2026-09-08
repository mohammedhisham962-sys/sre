'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function EbpfPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchEbpfData = () => {
    Promise.all([
      fetch('/api/v1/ebpf/metrics').then((r) => r.json()),
      fetch('/api/v1/ebpf/probes').then((r) => r.json())
    ])
      .then(([metricsData, probesData]) => {
        setMetrics(metricsData);
        setPrograms(Array.isArray(probesData) ? probesData : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading eBPF data:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchEbpfData();
  }, []);

  return (
    <main className="p-8 md:p-12 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">⚡</span>
            <h1 className="text-3xl font-bold text-gray-900">eBPF Kernel Observability</h1>
          </div>
          <p className="text-gray-600 mt-1">
            Zero-overhead Linux kernel socket telemetry, TCP retransmits, system call profiling, and cgroup OOM interception.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchEbpfData}
            className="px-4 py-2 border rounded-lg text-gray-700 bg-white hover:bg-gray-100 text-sm font-medium"
          >
            🔄 Refresh Ring Buffer
          </button>
          <Link href="/" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
            ← Dashboard
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="bg-white p-12 rounded-xl border text-center text-gray-500">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          Streaming eBPF kernel ring buffer telemetry...
        </div>
      ) : !metrics ? (
        <div className="bg-white p-12 rounded-xl border text-center text-gray-500">
          Unable to establish connection with eBPF subsystem.
        </div>
      ) : (
        <div className="space-y-8">
          {/* Kernel Socket KPI Gauges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm text-center">
              <div className="text-xs font-semibold text-gray-500">TCP Retransmit Rate</div>
              <div className="text-2xl font-black text-green-600 mt-1">{metrics.telemetry?.tcp_retransmit_rate_pct}%</div>
              <div className="text-xs text-gray-400 mt-0.5">Threshold: &lt; 0.5% (Optimal)</div>
            </div>
            <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm text-center">
              <div className="text-xs font-semibold text-gray-500">Packet Drop Rate</div>
              <div className="text-2xl font-black text-blue-600 mt-1">{metrics.telemetry?.packet_drop_rate_pct}%</div>
              <div className="text-xs text-gray-400 mt-0.5">NIC Ring Buffer Zero Loss</div>
            </div>
            <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm text-center">
              <div className="text-xs font-semibold text-gray-500">Syscall Connect Latency</div>
              <div className="text-2xl font-black text-purple-600 mt-1">{metrics.telemetry?.sys_enter_connect_latency_us} µs</div>
              <div className="text-xs text-gray-400 mt-0.5">sys_enter_connect Profiler</div>
            </div>
            <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm text-center">
              <div className="text-xs font-semibold text-gray-500">Active TCP Sockets</div>
              <div className="text-2xl font-black text-indigo-600 mt-1">{metrics.telemetry?.active_tcp_sockets?.toLocaleString()}</div>
              <div className="text-xs text-gray-400 mt-0.5">FD Saturation: {metrics.telemetry?.fd_saturation_pct}%</div>
            </div>
          </div>

          {/* Active eBPF Programs Matrix */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Loaded Kernel eBPF Probes & Tracepoints</h2>
                <p className="text-xs text-gray-500">Kernel: {metrics.kernel_version}</p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">
                {programs.length} Probes Active
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Probe ID</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Program Name</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Type</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Kernel Hook Point</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Events/Sec</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Memory</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {programs.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs font-bold text-gray-500">{p.id}</td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-gray-900">{p.name}</div>
                        <div className="text-xs text-gray-500">{p.description}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-bold rounded">
                          {p.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-purple-700 font-semibold">{p.hook_point}</td>
                      <td className="px-4 py-3 font-mono text-xs font-bold text-gray-700">{p.events_per_sec?.toLocaleString()} /s</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.memory_footprint_kb} KB</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Real-time Kernel Ring Buffer Event Log */}
          <div className="bg-gray-900 rounded-xl p-6 text-white shadow-lg space-y-4 border border-gray-800 font-mono text-xs">
            <div className="flex justify-between items-center border-b border-gray-800 pb-3">
              <span className="text-green-400 font-bold">📡 Kernel Ring Buffer Real-Time Stream</span>
              <span className="text-gray-400 text-xs">Updated: {metrics.updated_at}</span>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {metrics.recent_kernel_events?.map((ev: any, idx: number) => (
                <div key={idx} className="p-2 bg-black/40 rounded border border-gray-800 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500">{ev.timestamp}</span>
                    <span className="text-yellow-400 font-bold">[{ev.event}]</span>
                    <span className="text-gray-300">{ev.src || ev.cgroup}</span>
                    {ev.dst && <span className="text-gray-500">→ {ev.dst}</span>}
                  </div>
                  <span className="text-blue-400">{ev.latency_us ? `${ev.latency_us}µs` : ev.reason || `${ev.used_mb}MB / ${ev.limit_mb}MB`}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
