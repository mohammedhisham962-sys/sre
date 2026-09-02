'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SettingsDiagnostics() {
  const [data, setData] = useState<any>(null);
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'telemetry' | 'webhooks' | 'backup'>('telemetry');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Webhook Form State
  const [webhookName, setWebhookName] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookChannel, setWebhookChannel] = useState('SLACK');
  const [submittingWebhook, setSubmittingWebhook] = useState(false);

  const fetchDiagnostics = () => {
    setRefreshing(true);
    Promise.all([
      fetch('/api/v1/system/health').then(r => r.json()),
      fetch('/api/v1/webhooks/').then(r => r.json())
    ])
      .then(([diag, wh]) => {
        setData(diag);
        setWebhooks(Array.isArray(wh) ? wh : []);
        setLoading(false);
        setRefreshing(false);
      })
      .catch(err => {
        console.error('Failed to load settings data:', err);
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    fetchDiagnostics();
  }, []);

  const handleCreateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingWebhook(true);
    try {
      const res = await fetch('/api/v1/webhooks/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: webhookName,
          url: webhookUrl,
          channel_type: webhookChannel
        })
      });
      if (res.ok) {
        setWebhookName('');
        setWebhookUrl('');
        fetchDiagnostics();
      }
    } catch (err) {
      console.error('Failed to create webhook:', err);
    } finally {
      setSubmittingWebhook(false);
    }
  };

  const handleDeleteWebhook = async (id: number) => {
    if (!confirm('Are you sure you want to delete this alert webhook?')) return;
    try {
      const res = await fetch(`/api/v1/webhooks/${id}`, { method: 'DELETE' });
      if (res.ok) fetchDiagnostics();
    } catch (err) {
      console.error('Failed to delete webhook:', err);
    }
  };

  const handleTestWebhook = async (id: number) => {
    try {
      const res = await fetch(`/api/v1/webhooks/${id}/test`, { method: 'POST' });
      if (res.ok) alert('✅ Test alert dispatched to webhook!');
    } catch (err) {
      alert('⚠️ Failed to dispatch test alert');
    }
  };

  const handleDownloadSnapshot = () => {
    window.location.href = '/api/v1/backup/export';
  };

  return (
    <main className="p-8 md:p-12 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">System Settings & Operations</h1>
            <p className="text-gray-500 mt-1">Live infrastructure diagnostics, Slack/Discord alerting, and disaster recovery.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchDiagnostics}
              disabled={refreshing}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg shadow-sm hover:bg-gray-50 flex items-center gap-2 transition text-sm"
            >
              <span className={refreshing ? 'animate-spin inline-block' : ''}>🔄</span>
              {refreshing ? 'Refreshing...' : 'Re-check Diagnostics'}
            </button>
            <Link href="/" className="text-blue-600 hover:underline font-medium text-sm">← Dashboard</Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('telemetry')}
            className={`pb-3 text-sm font-bold transition ${
              activeTab === 'telemetry'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            System Diagnostics
          </button>
          <button
            onClick={() => setActiveTab('webhooks')}
            className={`pb-3 text-sm font-bold transition flex items-center gap-2 ${
              activeTab === 'webhooks'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Alert Webhooks (Slack/Discord)
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
              {webhooks.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`pb-3 text-sm font-bold transition ${
              activeTab === 'backup'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Disaster Recovery Backup
          </button>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl shadow p-12 text-center text-gray-500">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-8 w-8 bg-blue-500 rounded-full mb-4 animate-ping"></div>
              <p>Scanning production integrations & database connectivity...</p>
            </div>
          </div>
        ) : activeTab === 'telemetry' ? (
          /* System Diagnostics Tab */
          <div className="space-y-8">
            {/* Status Banner */}
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
                Checked: {new Date().toLocaleTimeString()}
              </span>
            </div>

            {/* Diagnostic 4-Grid Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Database */}
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

              {/* GitHub */}
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
                </div>
              </div>

              {/* AI Engine */}
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
                </div>
              </div>

              {/* Scheduler */}
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
                    <span className="text-gray-500">Cycle:</span>
                    <span className="font-semibold text-gray-800">Every {data?.scheduler?.interval_seconds}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Active Jobs:</span>
                    <span className="font-semibold text-blue-600">{data?.scheduler?.active_jobs}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'webhooks' ? (
          /* Multi-Channel Alert Webhooks Tab */
          <div className="space-y-8">
            {/* Create Webhook Box */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-base font-bold text-gray-900 mb-2">📢 Add Alerting Webhook Channel</h2>
              <p className="text-xs text-gray-500 mb-4">
                Dispatches real-time incident, security block, and AI repair events to your team's Slack or Discord channels.
              </p>

              <form onSubmit={handleCreateWebhook} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Channel Name *</label>
                    <input
                      type="text"
                      required
                      value={webhookName}
                      onChange={(e) => setWebhookName(e.target.value)}
                      placeholder="e.g. SRE Critical Alerts"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Platform Type</label>
                    <select
                      value={webhookChannel}
                      onChange={(e) => setWebhookChannel(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="SLACK">Slack Incoming Webhook</option>
                      <option value="DISCORD">Discord Webhook</option>
                      <option value="CUSTOM_HTTP">Custom HTTP Endpoint (JSON)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Webhook URL *</label>
                    <input
                      type="url"
                      required
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      placeholder="https://hooks.slack.com/services/..."
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submittingWebhook || !webhookName || !webhookUrl}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow text-xs transition disabled:opacity-50"
                  >
                    {submittingWebhook ? 'Saving...' : 'Register Webhook'}
                  </button>
                </div>
              </form>
            </div>

            {/* Active Webhooks List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase text-gray-700">Configured Alert Channels</h3>
                <span className="text-xs text-gray-500">{webhooks.length} Active</span>
              </div>

              {webhooks.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-xs">
                  No webhooks configured. Add your Slack or Discord webhook above.
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {webhooks.map(wh => (
                    <div key={wh.id} className="p-6 hover:bg-gray-50 transition flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-gray-900">{wh.name}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-100 text-purple-800">
                            {wh.channel_type}
                          </span>
                        </div>
                        <p className="text-xs font-mono text-gray-400 mt-1 max-w-lg truncate">{wh.url}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleTestWebhook(wh.id)}
                          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition"
                        >
                          Send Test Ping
                        </button>
                        <button
                          onClick={() => handleDeleteWebhook(wh.id)}
                          className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-lg transition"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Disaster Recovery Backup Tab */
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                💾 Disaster Recovery Snapshot & Full Database Export
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Generates a complete immutable JSON export containing all projects, monitors, incidents, audit records, policies, approvals, and team profiles for disaster recovery.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="font-bold text-gray-800 block text-sm">Download Full Platform Snapshot (.json)</span>
                <span className="text-xs text-gray-500">Includes all database models and operational audit trails.</span>
              </div>
              <button
                onClick={handleDownloadSnapshot}
                className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl shadow transition text-xs flex items-center gap-2"
              >
                <span>📥 Export Snapshot JSON</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
