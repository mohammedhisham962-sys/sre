'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ErrorBudgetsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchBudgets = () => {
    fetch('/api/v1/error-budgets/status')
      .then((res) => res.json())
      .then((resData) => {
        setData(resData);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching error budgets:', err);
        setData(null);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const handleToggleFreeze = async (serviceId: string, currentFrozen: boolean) => {
    setTogglingId(serviceId);
    try {
      const res = await fetch(`/api/v1/error-budgets/freeze-toggle?service_id=${serviceId}&freeze=${!currentFrozen}`, {
        method: 'POST'
      });
      const result = await res.json();
      if (result.service_id) {
        setData((prev: any) => ({
          ...prev,
          services: prev.services.map((s: any) =>
            s.id === serviceId ? { ...s, deployment_frozen: !currentFrozen, status: !currentFrozen ? 'DEPLOYMENT_LOCKED' : 'HEALTHY' } : s
          )
        }));
      }
    } catch (err) {
      console.error('Freeze toggle error:', err);
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <main className="p-8 md:p-12 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">🔥</span>
            <h1 className="text-3xl font-bold text-gray-900">Multi-Window Error Budget Burn Engine</h1>
          </div>
          <p className="text-gray-600 mt-1">
            Google SRE multi-window multi-burn-rate alerting, budget depletion forecasting, and automated CI/CD deployment freezing.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/metrics" className="px-4 py-2 border rounded-lg text-gray-700 bg-white hover:bg-gray-100 text-sm font-medium">
            Prometheus SLOs
          </Link>
          <Link href="/" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
            ← Dashboard
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="bg-white p-12 rounded-xl border text-center text-gray-500">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          Calculating multi-window burn rate telemetry...
        </div>
      ) : !data ? (
        <div className="bg-white p-12 rounded-xl border text-center text-gray-500">
          Unable to retrieve error budget telemetry.
        </div>
      ) : (
        <div className="space-y-8">
          {/* Multi-Window Burn Rate Gauges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.burn_windows?.map((bw: any) => (
              <div key={bw.window} className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-gray-700">{bw.window}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    bw.status === 'NORMAL' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                  }`}>
                    {bw.status}
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-black text-gray-900">{bw.current_burn_rate}x</span>
                  <span className="text-xs text-gray-400">/ {bw.burn_rate_threshold}x alert limit</span>
                </div>
                <div className="text-xs text-gray-500">
                  Budget consumed: <span className="font-semibold text-blue-600">{bw.budget_consumed_pct}%</span>
                </div>
              </div>
            ))}
          </div>

          {/* Service Error Budget Reserve Table */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Production Service Error Budgets & CI/CD Freeze Guard</h2>
                <p className="text-xs text-gray-500">Automatic deployment freeze recommendation when error budget hits 0%.</p>
              </div>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">
                {data.services?.length} Services Monitored
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Service</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Target SLO</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Current Availability</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Budget Remaining</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Burn Rate</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Depletion Forecast</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">CI/CD Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.services?.map((svc: any) => (
                    <tr key={svc.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-bold text-gray-900">{svc.name}</div>
                        <div className="font-mono text-xs text-gray-400">{svc.id}</div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-700">{svc.slo_target_pct}%</td>
                      <td className="px-4 py-3 font-mono text-xs font-bold text-green-600">{svc.current_availability_pct}%</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${svc.error_budget_remaining_pct < 70 ? 'bg-amber-500' : 'bg-green-600'}`}
                              style={{ width: `${svc.error_budget_remaining_pct}%` }}
                            ></div>
                          </div>
                          <span className="font-mono text-xs font-bold text-gray-800">{svc.error_budget_remaining_pct}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs font-bold text-gray-700">{svc.burn_rate}x</td>
                      <td className="px-4 py-3 text-xs font-semibold text-gray-600">{svc.days_to_depletion} Days</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleFreeze(svc.id, svc.deployment_frozen)}
                          disabled={togglingId === svc.id}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow transition ${
                            svc.deployment_frozen
                              ? 'bg-red-600 hover:bg-red-700 text-white'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                          } disabled:opacity-50`}
                        >
                          {togglingId === svc.id ? (
                            'Updating...'
                          ) : svc.deployment_frozen ? (
                            '❄️ Deployment Frozen'
                          ) : (
                            '🔓 Normal (Unfrozen)'
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
