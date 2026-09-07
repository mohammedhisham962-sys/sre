'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function FinOpsPage() {
  const [summary, setSummary] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [appliedIds, setAppliedIds] = useState<string[]>([]);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchFinOpsData = () => {
    Promise.all([
      fetch('/api/v1/finops/summary').then((r) => r.json()),
      fetch('/api/v1/finops/recommendations').then((r) => r.json())
    ])
      .then(([sumData, recData]) => {
        setSummary(sumData);
        setRecommendations(Array.isArray(recData) ? recData : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching FinOps data:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchFinOpsData();
  }, []);

  const handleApply = async (recId: string) => {
    setApplyingId(recId);
    try {
      const res = await fetch(`/api/v1/finops/apply?rec_id=${recId}`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.status === 'SUCCESS') {
        setAppliedIds((prev) => [...prev, recId]);
      }
    } catch (err) {
      console.error('Apply error:', err);
    } finally {
      setApplyingId(null);
    }
  };

  const totalMonthlySavings = recommendations.reduce((acc, r) => acc + (r.monthly_savings_usd || 0), 0);

  return (
    <main className="p-8 md:p-12 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">💰</span>
            <h1 className="text-3xl font-bold text-gray-900">FinOps Cloud Cost Optimizer</h1>
          </div>
          <p className="text-gray-600 mt-1">
            Real-time multi-cloud spend tracking, budget anomaly detection, and automated right-sizing optimizations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/metrics" className="px-4 py-2 border rounded-lg text-gray-700 bg-white hover:bg-gray-100 text-sm font-medium">
            Prometheus Metrics
          </Link>
          <Link href="/" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
            ← Dashboard
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="bg-white p-12 rounded-xl border text-center text-gray-500">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          Aggregating multi-cloud cost matrices...
        </div>
      ) : !summary ? (
        <div className="bg-white p-12 rounded-xl border text-center text-gray-500">
          Unable to retrieve cloud cost telemetry.
        </div>
      ) : (
        <div className="space-y-8">
          {/* Top Spend KPI Gauges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm text-center">
              <div className="text-xs font-semibold text-gray-500">Current Monthly Spend</div>
              <div className="text-2xl font-black text-gray-900 mt-1">${summary.current_spend_usd?.toLocaleString()}</div>
              <div className="text-xs text-gray-400 mt-0.5">USD / Month</div>
            </div>
            <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm text-center">
              <div className="text-xs font-semibold text-gray-500">Monthly Cloud Budget</div>
              <div className="text-2xl font-black text-blue-600 mt-1">${summary.monthly_budget_usd?.toLocaleString()}</div>
              <div className="text-xs text-gray-400 mt-0.5">Budget Ceiling</div>
            </div>
            <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm text-center">
              <div className="text-xs font-semibold text-gray-500">Budget Utilization</div>
              <div className="text-2xl font-black text-emerald-600 mt-1">{summary.budget_utilization_pct}%</div>
              <div className="text-xs text-gray-400 mt-0.5">Within Safe Guardrails</div>
            </div>
            <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm text-center">
              <div className="text-xs font-semibold text-gray-500">Potential Savings</div>
              <div className="text-2xl font-black text-purple-600 mt-1">${totalMonthlySavings?.toLocaleString()}/mo</div>
              <div className="text-xs text-gray-400 mt-0.5">${(totalMonthlySavings * 12)?.toLocaleString()}/year</div>
            </div>
          </div>

          {/* Breakdown and Anomalies Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Category Cost Breakdown */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-gray-900">Cloud Cost Breakdown by Category</h2>
              <div className="space-y-4">
                {summary.breakdown?.map((item: any) => (
                  <div key={item.category} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-gray-800">{item.category}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500 font-normal">${item.spend_usd?.toLocaleString()} ({item.pct_of_total}%)</span>
                        <span className={`font-mono text-[11px] ${item.trend.includes('ANOMALY') ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                          {item.trend}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full ${item.trend.includes('ANOMALY') ? 'bg-red-500' : 'bg-blue-600'}`}
                        style={{ width: `${item.pct_of_total}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cost Spike Anomalies */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                🚨 Cost Spike Anomalies
              </h2>
              <div className="space-y-3">
                {summary.anomalies?.map((anom: any) => (
                  <div key={anom.id} className="p-3.5 bg-red-50 rounded-xl border border-red-200 space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-red-900">{anom.service}</span>
                      <span className="px-2 py-0.5 bg-red-200 text-red-800 text-[10px] font-bold rounded">
                        {anom.severity}
                      </span>
                    </div>
                    <p className="text-xs text-red-800">{anom.description}</p>
                    <div className="flex justify-between text-[11px] text-red-700 font-mono pt-1">
                      <span>Impact: +${anom.impact_usd_per_day}/day</span>
                      <span>{anom.detected_at}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Right-Sizing Recommendations */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-gray-900">AI Right-Sizing & Savings Recommendations</h2>
                <p className="text-xs text-gray-500">Autonomous infrastructure adjustments to eliminate idle spend with zero performance degradation.</p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">
                {recommendations.length} Actions Available
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {recommendations.map((rec) => {
                const isApplied = appliedIds.includes(rec.id);
                const isApplying = applyingId === rec.id;

                return (
                  <div key={rec.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-mono text-xs font-bold text-gray-400">{rec.id}</span>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-[10px] font-bold rounded">
                            {rec.category}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            rec.risk_level === 'ZERO' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            Risk: {rec.risk_level}
                          </span>
                        </div>
                      </div>
                      <h3 className="text-sm font-bold text-gray-900">{rec.title}</h3>
                      <p className="text-xs text-gray-600 mt-1">{rec.description}</p>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                      <div>
                        <div className="text-xs text-gray-400">Projected Savings</div>
                        <div className="text-sm font-black text-green-600">
                          +${rec.monthly_savings_usd}/mo <span className="text-xs text-gray-400 font-normal">(${(rec.monthly_savings_usd * 12)}/yr)</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleApply(rec.id)}
                        disabled={isApplied || isApplying}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold shadow transition ${
                          isApplied
                            ? 'bg-green-600 text-white cursor-default'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        } disabled:opacity-75`}
                      >
                        {isApplying ? (
                          'Applying...'
                        ) : isApplied ? (
                          '✅ Applied'
                        ) : (
                          '⚡ Apply Right-Sizing'
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
