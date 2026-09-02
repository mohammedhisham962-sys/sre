'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface WorkflowRun {
  id: number;
  name: string;
  event: string;
  status: string;
  conclusion: string | null;
  branch: string;
  commit_sha: string;
  commit_message: string;
  author: string;
  created_at: string;
  html_url: string;
}

export default function Deployments() {
  const [data, setData] = useState<{ repository: string | null; has_token: boolean; runs: WorkflowRun[] }>({
    repository: null,
    has_token: false,
    runs: []
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDeployments = () => {
    setRefreshing(true);
    fetch('/api/v1/deployments/')
      .then(res => res.json())
      .then(resData => {
        setData({
          repository: resData.repository || null,
          has_token: resData.has_token || false,
          runs: Array.isArray(resData.runs) ? resData.runs : []
        });
        setLoading(false);
        setRefreshing(false);
      })
      .catch(err => {
        console.error('Failed to load deployments telemetry:', err);
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    fetchDeployments();
    const interval = setInterval(fetchDeployments, 20000); // 20s poll
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status: string, conclusion: string | null) => {
    if (status === 'in_progress') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-200 animate-pulse flex items-center gap-1">
          <span className="h-1.5 w-1.5 bg-yellow-500 rounded-full animate-ping"></span>
          Running
        </span>
      );
    }
    if (conclusion === 'success') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200">
          ✓ Passed
        </span>
      );
    }
    if (conclusion === 'failure') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
          ✕ Failed
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
        {status}
      </span>
    );
  };

  return (
    <main className="p-8 md:p-12 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              🚀 CI/CD Deployments & Release Pipeline
            </h1>
            <p className="text-gray-500 mt-1">
              Real-time build execution logs and release telemetry from GitHub Actions.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchDeployments}
              disabled={refreshing}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg shadow-sm hover:bg-gray-50 transition text-sm flex items-center gap-1.5"
            >
              <span className={refreshing ? 'animate-spin inline-block' : ''}>🔄</span>
              {refreshing ? 'Refreshing...' : 'Refresh Builds'}
            </button>
            <Link href="/" className="text-blue-600 hover:underline font-medium text-sm">← Dashboard</Link>
          </div>
        </div>

        {/* Repository Integration Banner */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-xs font-bold uppercase text-gray-400">Target Repository</span>
            <h2 className="text-base font-bold font-mono text-gray-900 mt-0.5">
              {data.repository || 'No GitHub repository URL configured on active project'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              data.has_token ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {data.has_token ? 'GitHub Actions API Connected' : 'Public Telemetry Mode'}
            </span>
            {data.repository && (
              <a
                href={`${data.repository}/actions`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 bg-gray-900 hover:bg-gray-800 text-white rounded text-xs font-semibold flex items-center gap-1"
              >
                GitHub Actions ↗
              </a>
            )}
          </div>
        </div>

        {/* Workflow Runs List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <h2 className="text-sm font-bold text-gray-700 uppercase">Recent CI/CD Pipeline Runs</h2>
            <span className="text-xs text-gray-400 font-mono">Auto-polling every 20s</span>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-500">
              <div className="animate-pulse">Fetching latest pipeline executions from GitHub Actions...</div>
            </div>
          ) : data.runs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="font-medium">No recent workflow runs detected.</p>
              <p className="text-xs text-gray-400 mt-1">
                Pushing commits to <code>main</code> or opening AI Auto-Repair Pull Requests will trigger new workflow runs.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {data.runs.map(run => (
                <div key={run.id} className="p-6 hover:bg-gray-50 transition flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(run.status, run.conclusion)}
                      <span className="font-bold text-gray-900 text-sm">{run.name || 'AIGRA Ops CI Pipeline'}</span>
                      <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                        {run.branch}
                      </span>
                    </div>

                    <p className="text-xs text-gray-700 font-medium">{run.commit_message}</p>

                    <div className="flex items-center gap-3 text-xs text-gray-400 font-mono">
                      <span>Commit: <code>{run.commit_sha}</code></span>
                      <span>•</span>
                      <span>Trigger: {run.event}</span>
                      <span>•</span>
                      <span>Time: {run.created_at ? new Date(run.created_at).toLocaleString() : ''}</span>
                    </div>
                  </div>

                  <div>
                    {run.html_url && (
                      <a
                        href={run.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5"
                      >
                        View Logs ↗
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
