'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function OnCallConsole() {
  const [schedule, setSchedule] = useState<any | null>(null);
  const [incidentTitle, setIncidentTitle] = useState('Payment Gateway 500 Outage');
  const [incidentId, setIncidentId] = useState(101);
  const [paging, setPaging] = useState(false);
  const [pageResult, setPageResult] = useState<any | null>(null);

  const fetchSchedule = () => {
    fetch('/api/v1/oncall/schedule')
      .then(res => res.json())
      .then(data => setSchedule(data))
      .catch(err => console.error('Failed to load oncall schedule:', err));
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  const triggerPage = async () => {
    setPaging(true);
    setPageResult(null);

    try {
      const res = await fetch('/api/v1/oncall/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incident_id: incidentId,
          title: incidentTitle,
          severity: 'CRITICAL'
        })
      });
      const data = await res.json();
      setPageResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setPaging(false);
    }
  };

  return (
    <main className="p-8 md:p-12 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
              <span className="p-2 bg-rose-600 text-white rounded-lg text-2xl shadow-sm">🚨</span>
              PagerDuty & OpsGenie On-Call Command Center
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              Live SRE rotation rosters, multi-tier escalation policies, and emergency high-urgency paging dispatch.
            </p>
          </div>
          <Link href="/" className="text-sm font-semibold text-blue-600 hover:text-blue-800">
            ← Dashboard
          </Link>
        </div>

        {/* Paged Alert Banner */}
        {pageResult && (
          <div className="mb-8 p-6 bg-rose-50 border border-rose-300 rounded-2xl shadow-sm">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-rose-900 text-lg flex items-center gap-2">
                <span>📢</span> High-Urgency Page Dispatched!
              </h3>
              <button onClick={() => setPageResult(null)} className="text-sm text-rose-700 font-bold hover:underline">Dismiss</button>
            </div>
            <p className="text-rose-800 text-sm mt-2">
              Dispatched emergency <strong>{pageResult.contact_method}</strong> alerts to <strong>{pageResult.recipient}</strong> for Incident #{pageResult.incident_id}.
            </p>
            <p className="text-xs font-mono text-rose-700 mt-1">Deduplication Key: <code>{pageResult.dedup_key}</code></p>
          </div>
        )}

        {/* Roster Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Primary */}
          <div className="bg-white rounded-2xl border-2 border-rose-500 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600">Primary On-Call (Tier-1)</span>
              <span className="px-3 py-1 bg-rose-100 text-rose-800 rounded-full text-xs font-bold animate-pulse">● Active Shift</span>
            </div>
            <h3 className="text-2xl font-extrabold text-gray-900 mb-1">{schedule?.primary?.name || 'Sarah Chen'}</h3>
            <p className="text-xs text-gray-400 mb-4">{schedule?.primary?.role}</p>

            <div className="space-y-2 text-xs bg-gray-50 p-4 rounded-xl border">
              <div className="flex justify-between">
                <span className="text-gray-500">Email:</span>
                <span className="font-mono font-bold text-gray-800">{schedule?.primary?.email || 'sarah.chen@aigra.ops'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">SMS / Voice:</span>
                <span className="font-mono font-bold text-gray-800">{schedule?.primary?.phone || '+1-555-0192'}</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="text-gray-500">Shift End:</span>
                <span className="font-mono text-gray-600">{schedule?.primary?.shift_end || '2026-09-08 00:00 UTC'}</span>
              </div>
            </div>
          </div>

          {/* Secondary */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Secondary Standby (Tier-2)</span>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold">Standby</span>
            </div>
            <h3 className="text-2xl font-extrabold text-gray-900 mb-1">{schedule?.secondary?.name || 'Alex Rivera'}</h3>
            <p className="text-xs text-gray-400 mb-4">{schedule?.secondary?.role}</p>

            <div className="space-y-2 text-xs bg-gray-50 p-4 rounded-xl border">
              <div className="flex justify-between">
                <span className="text-gray-500">Email:</span>
                <span className="font-mono font-bold text-gray-800">{schedule?.secondary?.email || 'alex.rivera@aigra.ops'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">SMS / Voice:</span>
                <span className="font-mono font-bold text-gray-800">{schedule?.secondary?.phone || '+1-555-0144'}</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="text-gray-500">Shift End:</span>
                <span className="font-mono text-gray-600">{schedule?.secondary?.shift_end || '2026-09-08 00:00 UTC'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Escalation Progression & Manual Paging */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4 text-base">📈 Multi-Tier Escalation Progression</h3>
            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-4 p-3 bg-rose-50 border border-rose-200 rounded-xl">
                <span className="px-2 py-1 bg-rose-600 text-white font-bold rounded">Tier 1 (0-5m)</span>
                <div>
                  <p className="font-bold text-rose-900">Push Notification & Instant SMS</p>
                  <p className="text-rose-700 mt-0.5">Alerts Primary SRE via mobile push and SMS. Requires acknowledgement in 5 mins.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <span className="px-2 py-1 bg-amber-600 text-white font-bold rounded">Tier 2 (5-15m)</span>
                <div>
                  <p className="font-bold text-amber-900">Automated Voice Call Escalation</p>
                  <p className="text-amber-700 mt-0.5">Places automated phone call to Secondary Standby engineer if unacknowledged.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-3 bg-purple-50 border border-purple-200 rounded-xl">
                <span className="px-2 py-1 bg-purple-600 text-white font-bold rounded">Tier 3 (&gt;15m)</span>
                <div>
                  <p className="font-bold text-purple-900">Executive & VP Engineering Page</p>
                  <p className="text-purple-700 mt-0.5">Escalates to incident commander and engineering leadership channel.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Manual Dispatch Form */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4 text-base">📢 Emergency Manual Page</h3>
            <div className="space-y-3 text-xs mb-4">
              <div>
                <label className="text-gray-500 font-semibold block mb-1">Incident ID</label>
                <input
                  type="number"
                  value={incidentId}
                  onChange={(e) => setIncidentId(parseInt(e.target.value) || 1)}
                  className="w-full border rounded-lg p-2 font-mono text-gray-800"
                />
              </div>
              <div>
                <label className="text-gray-500 font-semibold block mb-1">Incident Summary</label>
                <input
                  type="text"
                  value={incidentTitle}
                  onChange={(e) => setIncidentTitle(e.target.value)}
                  className="w-full border rounded-lg p-2 text-gray-800"
                />
              </div>
            </div>

            <button
              onClick={triggerPage}
              disabled={paging}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-sm transition disabled:opacity-50"
            >
              {paging ? 'Dispatching Page...' : '🚨 Dispatch Emergency Page'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
