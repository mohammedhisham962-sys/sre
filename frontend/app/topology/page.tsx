'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function TopologyPage() {
  const [topology, setTopology] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [drainRegion, setDrainRegion] = useState<string>('us-east-1');
  const [targetRegion, setTargetRegion] = useState<string>('eu-west-1');
  const [failoverRunning, setFailoverRunning] = useState<boolean>(false);
  const [failoverResult, setFailoverResult] = useState<any>(null);

  const fetchTopology = () => {
    fetch('/api/v1/topology/regions')
      .then((res) => res.json())
      .then((data) => {
        setTopology(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching topology:', err);
        setTopology(null);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTopology();
  }, []);

  const handleFailover = async () => {
    setFailoverRunning(true);
    setFailoverResult(null);

    try {
      const res = await fetch(`/api/v1/topology/failover?drain_region=${drainRegion}&target_region=${targetRegion}`, {
        method: 'POST'
      });
      const data = await res.json();
      setFailoverResult(data);
      if (data.regions) {
        setTopology((prev: any) => ({ ...prev, regions: data.regions, global_status: 'FAILOVER_ACTIVE' }));
      }
    } catch (err) {
      console.error('Failover error:', err);
    } finally {
      setFailoverRunning(false);
    }
  };

  return (
    <main className="p-8 md:p-12 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">🗺️</span>
            <h1 className="text-3xl font-bold text-gray-900">Multi-Region Global Topology</h1>
          </div>
          <p className="text-gray-600 mt-1">
            Global distributed mesh, cross-region replication lag monitoring, and zero-downtime DNS traffic steering.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchTopology}
            className="px-4 py-2 border rounded-lg text-gray-700 bg-white hover:bg-gray-100 text-sm font-medium"
          >
            🔄 Refresh Mesh
          </button>
          <Link href="/" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
            ← Dashboard
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="bg-white p-12 rounded-xl border text-center text-gray-500">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          Scanning global regional telemetry...
        </div>
      ) : !topology ? (
        <div className="bg-white p-12 rounded-xl border text-center text-gray-500">
          Unable to connect to multi-region mesh.
        </div>
      ) : (
        <div className="space-y-8">
          {/* Global Mesh KPI Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm text-center">
              <div className="text-xs font-semibold text-gray-500">Global Mesh Health</div>
              <div className="text-2xl font-black text-green-600 mt-1">{topology.global_status}</div>
              <div className="text-xs text-gray-400 mt-0.5">BGP Anycast Routing</div>
            </div>
            <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm text-center">
              <div className="text-xs font-semibold text-gray-500">Active Global Regions</div>
              <div className="text-2xl font-black text-blue-600 mt-1">{topology.active_regions_count} Regions</div>
              <div className="text-xs text-gray-400 mt-0.5">AWS + GCP + Edge</div>
            </div>
            <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm text-center">
              <div className="text-xs font-semibold text-gray-500">Global Connections</div>
              <div className="text-2xl font-black text-purple-600 mt-1">{topology.total_connections?.toLocaleString()}</div>
              <div className="text-xs text-gray-400 mt-0.5">Active WebSocket & HTTP</div>
            </div>
            <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm text-center">
              <div className="text-xs font-semibold text-gray-500">Avg Replication Lag</div>
              <div className="text-2xl font-black text-indigo-600 mt-1">{topology.avg_replication_lag_ms}ms</div>
              <div className="text-xs text-gray-400 mt-0.5">PostgreSQL Raft Cluster</div>
            </div>
          </div>

          {/* Regional Health & Traffic Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {topology.regions?.map((r: any) => (
              <div key={r.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono text-xs font-bold text-gray-500">{r.id}</span>
                    <h3 className="text-base font-bold text-gray-900 mt-0.5">{r.name}</h3>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                    r.status === 'HEALTHY' ? 'bg-green-100 text-green-800' :
                    r.status === 'SURGE_ACTIVE' ? 'bg-purple-100 text-purple-800' :
                    r.status === 'DRAINED' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {r.status}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Traffic Allocation:</span>
                    <span className="font-bold text-blue-600">{r.traffic_pct}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${r.traffic_pct}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t text-xs">
                  <div>
                    <div className="text-gray-400">Latency</div>
                    <div className="font-bold text-gray-800">{r.latency_ms}ms</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Replication Lag</div>
                    <div className="font-bold text-gray-800">{r.replication_lag_ms}ms</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Node Cluster</div>
                    <div className="font-bold text-gray-800">{r.nodes_count} Nodes</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Connections</div>
                    <div className="font-bold text-gray-800">{r.active_connections?.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Regional Failover Simulator */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              ⚡ DNS Traffic Failover Simulator
            </h2>
            <p className="text-xs text-gray-500">
              Instantly drain traffic from an active region to test disaster recovery resilience and verify downstream cluster surge handling.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Region to Drain</label>
                <select
                  value={drainRegion}
                  onChange={(e) => setDrainRegion(e.target.value)}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-xs font-medium text-gray-800"
                >
                  {topology.regions?.map((r: any) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Surge Target Region</label>
                <select
                  value={targetRegion}
                  onChange={(e) => setTargetRegion(e.target.value)}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-xs font-medium text-gray-800"
                >
                  {topology.regions?.filter((r: any) => r.id !== drainRegion).map((r: any) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleFailover}
                  disabled={failoverRunning}
                  className="w-full p-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {failoverRunning ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Steering DNS Routes...
                    </>
                  ) : (
                    '🚀 Execute Traffic Failover'
                  )}
                </button>
              </div>
            </div>

            {failoverResult && (
              <div className="mt-4 p-4 bg-gray-900 text-green-400 font-mono text-xs rounded-lg border border-gray-800 space-y-1">
                <div className="flex justify-between text-white font-bold">
                  <span>✅ {failoverResult.action} COMPLETED</span>
                  <span>{failoverResult.convergence_time_ms}ms Convergence</span>
                </div>
                <div className="text-gray-300">
                  Drained: <span className="text-red-400 font-bold">{failoverResult.drained_region}</span> (0% traffic) → Rerouted <span className="text-green-400 font-bold">{failoverResult.traffic_shifted_pct}%</span> traffic to <span className="text-purple-400 font-bold">{failoverResult.target_region}</span>.
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
