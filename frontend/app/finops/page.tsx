"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function FinOpsPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("http://localhost:8000/api/v1/finops/status")
      .then(res => res.json())
      .then(d => setData(d))
      .catch(e => console.error(e));
  }, []);

  const cullResource = async (id: string) => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/finops/cull", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resource_id: id })
      });
      const result = await res.json();
      if (result.status === "success") {
        setData((prev: any) => ({
          ...prev,
          idle_resources: prev.idle_resources.map((r: any) => r.id === id ? { ...r, status: "Terminated" } : r),
          summary: {
            ...prev.summary,
            projected_spend: prev.summary.projected_spend - result.savings,
            total_savings_opportunity: prev.summary.total_savings_opportunity - result.savings
          }
        }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!data) return <div className="p-8 text-slate-400">Loading FinOps Telemetry...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-emerald-500/30">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center space-x-4 mb-8">
          <Link href="/" className="p-2 rounded-full hover:bg-slate-800 transition-colors">
            <span className="text-xl">⬅️</span>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">FinOps Auto-Remediation</h1>
            <p className="text-slate-400 mt-1">Cloud cost tracking and automated idle resource culling.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-400">Daily Budget</span>
              <span>💲</span>
            </div>
            <div className="text-2xl font-bold text-white">${data.summary.daily_budget.toFixed(2)}</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-400">Current Spend</span>
              <span>📈</span>
            </div>
            <div className="text-2xl font-bold text-white">${data.summary.current_spend.toFixed(2)}</div>
          </div>
          <div className={`bg-slate-900 border rounded-xl p-6 shadow-sm ${data.summary.status === 'OVER_BUDGET' ? 'border-rose-500/50' : 'border-slate-800'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-400">Projected Spend</span>
              {data.summary.status === 'OVER_BUDGET' ? <span>⚠️</span> : <span>🛡️</span>}
            </div>
            <div className={`text-2xl font-bold ${data.summary.status === 'OVER_BUDGET' ? 'text-rose-400' : 'text-white'}`}>
              ${data.summary.projected_spend.toFixed(2)}
            </div>
          </div>
          <div className="bg-emerald-950/30 border border-emerald-900/50 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-emerald-400">Savings Opportunity</span>
              <span>💲</span>
            </div>
            <div className="text-2xl font-bold text-emerald-400">${data.summary.total_savings_opportunity.toFixed(2)} / mo</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-800 bg-slate-900">
              <h2 className="text-lg font-semibold text-white flex items-center">
                <span className="mr-2">⚡</span> Idle Resource Culling
              </h2>
            </div>
            <div className="p-0">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/50 text-slate-400 text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 font-medium">Resource</th>
                    <th className="px-6 py-4 font-medium">Idle Days</th>
                    <th className="px-6 py-4 font-medium">Cost / mo</th>
                    <th className="px-6 py-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {data.idle_resources.map((res: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {res.type.includes("Volume") ? <span className="mr-2">💽</span> : <span className="mr-2">🖥️</span>}
                          <div>
                            <div className="text-sm font-medium text-white">{res.id}</div>
                            <div className="text-xs text-slate-500">{res.type} • {res.region}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-amber-400">
                        {res.idle_days} days
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        ${res.monthly_cost.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {res.status === "Idle" ? (
                          <button onClick={() => cullResource(res.id)} className="px-3 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded text-xs transition-colors">
                            Cull Resource
                          </button>
                        ) : (
                          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded text-xs">
                            Terminated
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-800 bg-slate-900">
              <h2 className="text-lg font-semibold text-white flex items-center">
                <span className="mr-2">⚠️</span> Spend Anomalies
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {data.anomalies.map((ano: any, idx: number) => (
                <div key={idx} className="p-4 bg-slate-950 border border-slate-800 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-rose-400 flex items-center">
                      {ano.service} Spike 
                      <span className="ml-2 px-2 py-0.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-full">
                        +{ano.spike_percent}%
                      </span>
                    </span>
                    <span className="text-xs text-slate-500">{new Date(ano.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-sm text-slate-300">
                    <span className="text-slate-500">Root Cause:</span> {ano.root_cause}
                  </p>
                </div>
              ))}
              {data.anomalies.length === 0 && (
                <div className="text-center py-8 text-slate-500 text-sm">
                  No spend anomalies detected.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
