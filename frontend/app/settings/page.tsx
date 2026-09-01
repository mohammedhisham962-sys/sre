'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SettingsDiagnostics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDiagnostics = () => {
    setRefreshing(true);
    fetch('/api/v1/system/health')
      .then((res) => res.json())
      .then((resData) => {
        setData(resData);
        setLoading(false);
        setRefreshing(false);
      })
      .catch((err) => {
        console.error('Failed to fetch system diagnostics:', err);
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    fetchDiagnostics();
    const interval = setInterval(fetchDiagnostics, 30000); // auto-poll every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="p-8 md:p-12 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">System Health & Settings</h1>
            <p className="text-gray-500 mt-1">Live integration diagnostics across Database, GitHub, AI Engine, and SRE Workers.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchDiagnostics}
              disabled={refreshing}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg shadow-sm hover:bg-gray-50 flex items-center gap-2 transition"
            >
              <span className={refreshing ? 'animate-spin inline-block' : ''}>🔄</span>
              {refreshing ? 'Refreshing...' : 'Re-check Diagnostics'}
            </button>
            <Link href="/" className="text-blue-600 hover:underline font-medium">← Dashboard</Link>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl shadow p-12 text-center text-gray-500">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-8 w-8 bg-blue-500 rounded-full mb-4 animate-ping"></div>
              <p>Scanning production integrations & database connectivity...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Overall Health Status Banner */}
            <div className={`p-6 rounded-xl shadow-sm border flex items-center justify-between ${
              data?.status === 'operational' ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="flex items-center gap-4">
                <span className="text-3xl">
                  {data?.status === 'operational' ? '🟢' : '🟡'}
                </span>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Platform Status: {data?.status === 'operational' ? 'All Systems Operational' : 'Degraded State'}
                  </h2>
                  <p className="text-sm text-gray-600">
                    Background HTTP workers and autonomous repair pipelines are active.
                  </p>
                </div>
              </div>
              <span className="text-xs text-gray-400 font-mono">
                Last checked: {new Date().toLocaleTimeString()}
              </span>
            </div>

            {/* Diagnostic 4-Grid Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 1. Database Integration */}
              <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      🗄️ Database Backend
                    </h3>
                    <p className="text-sm text-gray-500">Persistence layer</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    data?.database?.healthy ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {data?.database?.healthy ? 'Connected' : 'Error'}
                  </span>
                </div>
                <div className="space-y-2 text-sm bg-gray-50 p-4 rounded-lg font-mono">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Engine:</span>
                    <span className="font-semibold text-gray-800">{data?.database?.engine}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Ping Latency:</span>
                    <span className="font-semibold text-green-600">{data?.database?.latency_ms} ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Dialect:</span>
                    <span className="text-gray-700">{data?.database?.dialect}</span>
                  </div>
                </div>
              </div>

              {/* 2. GitHub REST API Integration */}
              <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      🐙 GitHub API Integration
                    </h3>
                    <p className="text-sm text-gray-500">Pull Request & Repository Bot</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    data?.github?.configured ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {data?.github?.configured ? 'Token Active' : 'Mock Mode'}
                  </span>
                </div>
                <div className="space-y-2 text-sm bg-gray-50 p-4 rounded-lg font-mono">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status:</span>
                    <span className="font-semibold text-gray-800">{data?.github?.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Auth Method:</span>
                    <span className="text-gray-700">{data?.github?.auth_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Auto Pull Request:</span>
                    <span className={data?.github?.configured ? 'text-green-600 font-semibold' : 'text-yellow-600'}>
                      {data?.github?.configured ? 'Enabled (Direct GitHub PRs)' : 'Simulated (Add GITHUB_TOKEN)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 3. AI Cloud Provider Engine */}
              <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      ⚡ AI Engine (Groq Cloud)
                    </h3>
                    <p className="text-sm text-gray-500">LLM Root Cause & Automated Code Repair</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    data?.ai_engine?.configured ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {data?.ai_engine?.configured ? 'Groq Active' : 'Zero-Cost Standby'}
                  </span>
                </div>
                <div className="space-y-2 text-sm bg-gray-50 p-4 rounded-lg font-mono">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Provider:</span>
                    <span className="font-semibold text-gray-800">{data?.ai_engine?.provider}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Model:</span>
                    <span className="text-purple-600 font-semibold">{data?.ai_engine?.model}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Patch Generation:</span>
                    <span className="text-gray-700">{data?.ai_engine?.status}</span>
                  </div>
                </div>
              </div>

              {/* 4. Background Monitoring Worker */}
              <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      ⏱️ Autonomous Worker (APScheduler)
                    </h3>
                    <p className="text-sm text-gray-500">Zero-cost HTTP uptime monitor</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    data?.scheduler?.running ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {data?.scheduler?.running ? 'Worker Running' : 'Offline'}
                  </span>
                </div>
                <div className="space-y-2 text-sm bg-gray-50 p-4 rounded-lg font-mono">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Cycle Interval:</span>
                    <span className="font-semibold text-gray-800">Every {data?.scheduler?.interval_seconds}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Active Monitor Jobs:</span>
                    <span className="font-semibold text-blue-600">{data?.scheduler?.active_jobs}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">False-Positive Protection:</span>
                    <span className="text-green-600 font-semibold">Active (Double Confirmation Ping)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Setup Environment Guide */}
            <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-2">⚙️ Environment Variables Reference</h3>
              <p className="text-sm text-gray-600 mb-4">
                You can configure these optional variables in your Render Dashboard to enable full production capabilities:
              </p>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm divide-y divide-gray-200 font-mono">
                  <thead className="bg-gray-50 text-gray-500">
                    <tr>
                      <th className="px-4 py-2 text-left">Variable</th>
                      <th className="px-4 py-2 text-left">Purpose</th>
                      <th className="px-4 py-2 text-left">Current Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="px-4 py-3 font-semibold text-blue-600">DATABASE_URL</td>
                      <td className="px-4 py-3 text-gray-600 font-sans">Connects PostgreSQL on Render for persistent data.</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-800">{data?.database?.engine}</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-semibold text-blue-600">GITHUB_TOKEN</td>
                      <td className="px-4 py-3 text-gray-600 font-sans">GitHub Personal Access Token (`repo` scope) to open real Pull Requests.</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-xs ${data?.github?.configured ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {data?.github?.configured ? 'Active' : 'Not Set'}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-semibold text-blue-600">GROQ_API_KEY</td>
                      <td className="px-4 py-3 text-gray-600 font-sans">Free API key from console.groq.com for LLaMA-3 AI repair patches.</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-xs ${data?.ai_engine?.configured ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {data?.ai_engine?.configured ? 'Active' : 'Not Set'}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
