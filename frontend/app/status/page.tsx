'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PublicStatusPage() {
  const [statusData, setStatusData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = () => {
    fetch('/api/v1/status/public')
      .then((res) => res.json())
      .then((data) => {
        setStatusData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load status:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-16">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center pb-6 border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              🛡️ AIGRA Ops Platform Status
            </h1>
            <p className="text-xs text-gray-500 mt-1">Live service availability and incident history.</p>
          </div>
          <Link
            href="/"
            className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-50 transition"
          >
            ← Operator Dashboard
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500 bg-white rounded-2xl shadow-sm border animate-pulse">
            Checking live service health...
          </div>
        ) : (
          <div className="space-y-8">
            {/* Main Status Hero Banner */}
            <div
              className={`p-6 rounded-2xl shadow-sm border flex items-center justify-between ${
                statusData?.status === 'OPERATIONAL'
                  ? 'bg-emerald-500 text-white border-emerald-600'
                  : statusData?.status === 'DEGRADED_PERFORMANCE'
                  ? 'bg-amber-500 text-white border-amber-600'
                  : 'bg-rose-600 text-white border-rose-700'
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="text-4xl">
                  {statusData?.status === 'OPERATIONAL' ? '✓' : '⚠️'}
                </span>
                <div>
                  <h2 className="text-xl font-bold">
                    {statusData?.status === 'OPERATIONAL'
                      ? 'All Systems Operational'
                      : statusData?.status === 'DEGRADED_PERFORMANCE'
                      ? 'Degraded Performance'
                      : 'Major Outage Detected'}
                  </h2>
                  <p className="text-xs opacity-90 mt-0.5">
                    Continuous HTTP checks evaluated across all registered infrastructure endpoints.
                  </p>
                </div>
              </div>
              <span className="text-xs opacity-75 font-mono">
                {new Date().toLocaleTimeString()}
              </span>
            </div>

            {/* Monitored Services & Uptime Bars */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="text-sm font-bold text-gray-900">Services & Infrastructure</h3>
                <span className="text-xs text-gray-500">Uptime (Recent Checks)</span>
              </div>

              <div className="divide-y divide-gray-100">
                {statusData?.services?.map((svc: any) => (
                  <div key={svc.id} className="p-6 space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-gray-900">{svc.name}</span>
                        {svc.last_check_ms && (
                          <span className="text-[11px] font-mono text-gray-400">({svc.last_check_ms}ms)</span>
                        )}
                      </div>
                      <span className={`text-xs font-bold ${
                        svc.status === 'OPERATIONAL' ? 'text-emerald-600' : 'text-amber-600'
                      }`}>
                        {svc.status === 'OPERATIONAL' ? 'Operational' : 'Degraded'}
                      </span>
                    </div>

                    {/* 30-Check Sparkline History Bar */}
                    <div className="flex items-center gap-1">
                      {svc.history.map((h: string, idx: number) => (
                        <div
                          key={idx}
                          title={h === 'UP' ? 'Operational' : 'Check Failed'}
                          className={`flex-1 h-8 rounded-sm transition ${
                            h === 'UP' ? 'bg-emerald-400 hover:bg-emerald-500' : 'bg-rose-500 hover:bg-rose-600'
                          }`}
                        />
                      ))}
                    </div>

                    <div className="flex justify-between text-[11px] text-gray-400 font-mono">
                      <span>30 checks ago</span>
                      <span className="font-bold text-gray-700">{svc.uptime_percentage}% uptime</span>
                      <span>Today</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Past Incidents Feed */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
              <h3 className="text-sm font-bold text-gray-900">Past Incidents & Resolutions</h3>
              
              {statusData?.incidents?.length === 0 ? (
                <p className="text-xs text-gray-500">No incidents reported in the last 90 days.</p>
              ) : (
                <div className="space-y-4">
                  {statusData?.incidents?.map((inc: any) => (
                    <div key={inc.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-bold text-xs text-gray-900 block">{inc.title}</span>
                          <span className="text-[10px] text-gray-400 font-mono">
                            {new Date(inc.created_at).toLocaleString()}
                          </span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          inc.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {inc.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 font-sans">{inc.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
