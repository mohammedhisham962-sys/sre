'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface PodItem {
  name: string;
  deployment: string;
  namespace: string;
  status: string;
  restarts: number;
  cpu_usage: string;
  memory_usage: string;
  healthy: boolean;
  recommended_heal?: string;
}

interface HealHistoryItem {
  id: number;
  pod_name: string;
  namespace: string;
  issue_type: string;
  action_taken: string;
  status: string;
  created_at: string;
}

export default function KubernetesConsole() {
  const [pods, setPods] = useState<PodItem[]>([]);
  const [history, setHistory] = useState<HealHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [healingPod, setHealingPod] = useState<string | null>(null);
  const [healResult, setHealResult] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchK8sData = () => {
    fetch('/api/v1/k8s/pods')
      .then(res => res.json())
      .then(data => {
        setPods(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load K8s pods:', err);
        setLoading(false);
      });

    fetch('/api/v1/k8s/history')
      .then(res => res.json())
      .then(data => {
        setHistory(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error('Failed to load history:', err));
  };

  useEffect(() => {
    fetchK8sData();
  }, []);

  const triggerHeal = async (pod: PodItem) => {
    setHealingPod(pod.name);
    setErrorMsg('');
    setHealResult(null);

    try {
      const res = await fetch('/api/v1/k8s/heal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: jsonBody({
          deployment_name: pod.deployment,
          namespace: pod.namespace,
          issue_type: pod.status
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Healing failed');
      setHealResult(data);
      fetchK8sData();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setHealingPod(null);
    }
  };

  function jsonBody(obj: any) {
    return JSON.stringify(obj);
  }

  return (
    <main className="p-8 md:p-12 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
              <span className="p-2 bg-blue-600 text-white rounded-lg text-2xl shadow-sm">☸️</span>
              Kubernetes Cluster Diagnostics & Auto-Healer
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              Real-time cluster pod telemetry, automated OOMKilled / CrashLoop detection, and dynamic declarative YAML patching.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchK8sData} className="text-xs bg-white border border-gray-300 font-semibold px-3 py-2 rounded-lg shadow-sm hover:bg-gray-50">
              ↻ Refresh Cluster
            </button>
            <Link href="/" className="text-sm font-semibold text-blue-600 hover:text-blue-800">
              ← Dashboard
            </Link>
          </div>
        </div>

        {/* Healing Result Modal / Banner */}
        {healResult && (
          <div className="mb-8 p-6 bg-emerald-50 border border-emerald-300 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-emerald-900 text-lg flex items-center gap-2">
                <span>✅</span> Pod Auto-Healing Successful!
              </h3>
              <button onClick={() => setHealResult(null)} className="text-sm text-emerald-700 font-bold hover:underline">Dismiss</button>
            </div>
            <p className="text-emerald-800 text-sm mt-1">
              Applied <strong>{healResult.action_taken}</strong> to deployment <code>{healResult.namespace}/{healResult.deployment}</code>.
            </p>
            <pre className="mt-3 p-3 bg-gray-900 text-emerald-400 font-mono text-xs rounded-lg overflow-x-auto">
              {healResult.patch_yaml}
            </pre>
          </div>
        )}

        {errorMsg && (
          <div className="mb-8 p-4 bg-red-50 border border-red-300 text-red-800 rounded-xl text-sm font-semibold">
            ❌ {errorMsg}
          </div>
        )}

        {/* Pods Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {loading ? (
            <div className="col-span-3 text-center py-12 text-gray-500 font-semibold">Scanning Kubernetes cluster...</div>
          ) : (
            pods.map((pod) => (
              <div key={pod.name} className={`bg-white rounded-2xl border p-6 shadow-sm flex flex-col justify-between ${pod.healthy ? 'border-gray-200' : 'border-rose-300 ring-2 ring-rose-100'}`}>
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-mono bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {pod.namespace}
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${pod.healthy ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800 animate-pulse'}`}>
                      {pod.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-base break-all mb-1">{pod.name}</h3>
                  <p className="text-xs text-gray-500 mb-4">Deployment: <span className="font-semibold text-gray-800">{pod.deployment}</span></p>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 p-3 rounded-lg border mb-4">
                    <div>
                      <span className="text-gray-400 block">CPU Usage</span>
                      <span className="font-mono font-bold text-gray-800">{pod.cpu_usage}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Memory</span>
                      <span className="font-mono font-bold text-gray-800">{pod.memory_usage}</span>
                    </div>
                    <div className="col-span-2 pt-1 border-t">
                      <span className="text-gray-400 block">Restarts</span>
                      <span className="font-mono font-bold text-gray-800">{pod.restarts} crashes</span>
                    </div>
                  </div>

                  {pod.recommended_heal && (
                    <div className="text-xs text-amber-900 bg-amber-50 p-2.5 rounded-lg border border-amber-200 mb-4">
                      💡 <strong>Recommended:</strong> {pod.recommended_heal}
                    </div>
                  )}
                </div>

                {!pod.healthy ? (
                  <button
                    onClick={() => triggerHeal(pod)}
                    disabled={healingPod === pod.name}
                    className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {healingPod === pod.name ? '⚡ Synthesizing Patch...' : '⚡ Auto-Heal Pod'}
                  </button>
                ) : (
                  <div className="w-full text-center py-2 text-xs font-bold text-emerald-700 bg-emerald-50 rounded-xl border border-emerald-200">
                    ✓ Operational
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Auto-Healing History */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>📜</span> Autonomous Pod Remediation Ledger
          </h2>
          {history.length === 0 ? (
            <p className="text-sm text-gray-500">No healing actions triggered yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="bg-gray-50 uppercase text-gray-500 border-b">
                  <tr>
                    <th className="p-3">ID</th>
                    <th className="p-3">Pod / Deployment</th>
                    <th className="p-3">Namespace</th>
                    <th className="p-3">Issue Type</th>
                    <th className="p-3">Remediation</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {history.map((h) => (
                    <tr key={h.id} className="hover:bg-gray-50">
                      <td className="p-3 font-mono font-bold">#{h.id}</td>
                      <td className="p-3 font-bold text-gray-900">{h.pod_name}</td>
                      <td className="p-3 font-mono">{h.namespace}</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold">{h.issue_type}</span></td>
                      <td className="p-3 font-mono text-gray-800">{h.action_taken}</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">{h.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
