'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function WorkloadIdentityPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [rotatingId, setRotatingId] = useState<string | null>(null);
  const [rotationMsg, setRotationMsg] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/workload-identity/status');
      if (!res.ok) throw new Error('Failed to load workload identity status');
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error fetching identity telemetry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRotate = async (secretId: string) => {
    try {
      setRotatingId(secretId);
      setRotationMsg(null);
      const res = await fetch('/api/v1/workload-identity/rotate-secret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret_id: secretId })
      });
      if (!res.ok) throw new Error('Secret rotation request failed');
      const result = await res.json();
      setRotationMsg(result);
      // Refresh status after rotation
      await fetchData();
    } catch (err: any) {
      alert(`Rotation failed: ${err.message}`);
    } finally {
      setRotatingId(null);
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
              <span className="text-xs text-slate-400">Zero-Trust & Workload Security</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight mt-1 flex items-center gap-3">
              <span>🔐</span> Zero-Trust Workload Identity & Secret Rotation
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Short-lived OIDC federations, multi-cloud IAM roles & automated zero-downtime key rollover.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs font-semibold rounded-full flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Enforcement: {data?.enforcement_mode || 'STRICT_ZERO_TRUST'}
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
            <div className="text-xs text-slate-400 uppercase font-semibold">Federated Workloads</div>
            <div className="text-2xl font-bold text-white mt-1">{data?.total_federated_workloads ?? 4}</div>
            <div className="text-xs text-emerald-400 mt-1">100% Short-Lived OIDC</div>
          </div>
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
            <div className="text-xs text-slate-400 uppercase font-semibold">Managed Secrets</div>
            <div className="text-2xl font-bold text-white mt-1">{data?.secrets_managed ?? 5}</div>
            <div className="text-xs text-indigo-400 mt-1">Automated TTL Watch</div>
          </div>
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
            <div className="text-xs text-slate-400 uppercase font-semibold">Zero-Trust Compliance</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">{data?.overall_compliance || '100%'}</div>
            <div className="text-xs text-slate-400 mt-1">No Static Access Keys</div>
          </div>
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
            <div className="text-xs text-slate-400 uppercase font-semibold">Dual-Phase Rollover</div>
            <div className="text-2xl font-bold text-cyan-400 mt-1">Active</div>
            <div className="text-xs text-slate-400 mt-1">&lt;500ms Propagation</div>
          </div>
        </div>

        {/* Live Rotation Alert Notification */}
        {rotationMsg && (
          <div className="p-4 bg-emerald-950/70 border border-emerald-600 rounded-xl text-xs space-y-1">
            <div className="font-bold text-emerald-300 flex items-center gap-2">
              <span>✅</span> Secret Successfully Rotated: {rotationMsg.secret_id}
            </div>
            <p className="text-slate-300">
              New Version: <code className="text-cyan-300">{rotationMsg.new_version}</code> | Phase: {rotationMsg.phase} | Propagation: {rotationMsg.propagation_time_ms}ms
            </p>
          </div>
        )}

        {/* Multi-Cloud Workload Identity Federations */}
        <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-xl space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>🌐</span> Multi-Cloud Workload Identity Federations (OIDC)
            </h2>
            <span className="text-xs text-slate-400">Zero Static Credentials Enforced</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data?.federations?.map((fed: any) => {
              const pctRemaining = Math.max(0, Math.min(100, Math.round((fed.expires_in_sec / fed.token_lifespan_sec) * 100)));
              return (
                <div key={fed.id} className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-lg space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold text-slate-200 text-sm">{fed.provider}</div>
                      <div className="text-xs text-slate-400">{fed.cloud}</div>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-900/50 border border-emerald-600 text-emerald-300 text-xs font-mono rounded">
                      {fed.status}
                    </span>
                  </div>

                  <div className="text-xs space-y-1 font-mono text-slate-400 bg-slate-900/80 p-2 rounded border border-slate-800">
                    <div className="truncate"><span className="text-slate-500">Subject:</span> {fed.subject}</div>
                    <div className="truncate"><span className="text-slate-500">Target Role:</span> <span className="text-indigo-300">{fed.target_role_arn}</span></div>
                  </div>

                  {/* Token TTL Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Token TTL Remaining</span>
                      <span className="font-mono text-slate-200">{Math.round(fed.expires_in_sec / 60)} min ({pctRemaining}%)</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full transition-all ${pctRemaining > 30 ? 'bg-indigo-500' : 'bg-amber-500'}`}
                        style={{ width: `${pctRemaining}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Automated Secret Rotation Management Table */}
        <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-xl space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>🔄</span> Automated Secret Rotation & Blast Radius Audit
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Automated dual-phase key rollover with zero downstream interruption.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Secret Name / ID</th>
                  <th className="py-3 px-4">Key Vault Engine</th>
                  <th className="py-3 px-4">Rotation Schedule</th>
                  <th className="py-3 px-4">Next Rotation</th>
                  <th className="py-3 px-4">Blast Radius Services</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {data?.secrets?.map((sec: any) => (
                  <tr key={sec.secret_id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-200">{sec.name}</div>
                      <div className="text-[11px] font-mono text-slate-400">{sec.secret_id}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-slate-800 rounded text-slate-300 font-mono text-[11px]">
                        {sec.engine}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">
                      Every {sec.rotation_interval_days} days
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-semibold ${sec.next_rotation_in_days <= 7 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        In {sec.next_rotation_in_days} days
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {sec.blast_radius_services?.map((svc: string) => (
                          <span key={svc} className="px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded text-[10px] font-mono">
                            {svc}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleRotate(sec.secret_id)}
                        disabled={rotatingId === sec.secret_id}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white text-xs font-medium rounded transition"
                      >
                        {rotatingId === sec.secret_id ? 'Rotating...' : 'Rotate Now'}
                      </button>
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
