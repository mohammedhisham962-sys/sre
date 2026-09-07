'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DisasterRecoveryPage() {
  const [drData, setDrData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [drillRunning, setDrillRunning] = useState<boolean>(false);
  const [drillResult, setDrillResult] = useState<any>(null);

  const fetchDrData = () => {
    fetch('/api/v1/dr/status')
      .then((res) => res.json())
      .then((data) => {
        setDrData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching DR status:', err);
        setDrData(null);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDrData();
  }, []);

  const handleRunDrill = async () => {
    setDrillRunning(true);
    setDrillResult(null);

    try {
      const res = await fetch('/api/v1/dr/drill', {
        method: 'POST'
      });
      const data = await res.json();
      setDrillResult(data);
    } catch (err) {
      console.error('DR Drill error:', err);
    } finally {
      setDrillRunning(false);
    }
  };

  return (
    <main className="p-8 md:p-12 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">🛡️</span>
            <h1 className="text-3xl font-bold text-gray-900">Disaster Recovery (DR) & RTO/RPO</h1>
          </div>
          <p className="text-gray-600 mt-1">
            Point-in-time recovery compliance, verified snapshot integrity ledger, and automated sandbox recovery drills.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/backup" className="px-4 py-2 border rounded-lg text-gray-700 bg-white hover:bg-gray-100 text-sm font-medium">
            Backup Exports
          </Link>
          <Link href="/" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
            ← Dashboard
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="bg-white p-12 rounded-xl border text-center text-gray-500">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          Verifying disaster recovery scorecards and cryptographic checksums...
        </div>
      ) : !drData ? (
        <div className="bg-white p-12 rounded-xl border text-center text-gray-500">
          Unable to connect to DR verification service.
        </div>
      ) : (
        <div className="space-y-8">
          {/* Top Scorecard Gauges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm text-center">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">RTO (Recovery Time Objective)</div>
              <div className="text-3xl font-black text-green-600 mt-2">
                {drData.scorecard?.rto_actual_minutes} min
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Target: &lt; {drData.scorecard?.rto_target_minutes} min ({drData.scorecard?.rto_compliant ? '✅ Compliant' : '⚠️ Breach'})
              </div>
            </div>

            <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm text-center">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">RPO (Recovery Point Objective)</div>
              <div className="text-3xl font-black text-blue-600 mt-2">
                {drData.scorecard?.rpo_actual_minutes} min
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Target: &lt; {drData.scorecard?.rpo_target_minutes} min ({drData.scorecard?.rpo_compliant ? '✅ Compliant' : '⚠️ Breach'})
              </div>
            </div>

            <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm text-center">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Overall DR Readiness</div>
              <div className="text-3xl font-black text-purple-600 mt-2">
                {drData.overall_dr_readiness}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {drData.scorecard?.last_drill_result}
              </div>
            </div>
          </div>

          {/* Verified Snapshot Ledger */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              🔒 Verified Point-In-Time Recovery Snapshots
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">ID</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Protected Resource</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Snapshot Type</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Size</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">SHA-256 Checksum</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Retention</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {drData.snapshots?.map((snap: any) => (
                    <tr key={snap.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs font-bold text-blue-600">{snap.id}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{snap.resource}</td>
                      <td className="px-4 py-3 text-xs text-gray-600">{snap.snapshot_type}</td>
                      <td className="px-4 py-3 text-xs font-mono text-gray-700">{snap.size_gb} GB</td>
                      <td className="px-4 py-3 text-[11px] font-mono text-gray-400 max-w-xs truncate">
                        {snap.checksum_sha256}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">{snap.retention_days} Days</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                          {snap.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Automated DR Drill Simulator */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">🧪 Automated Non-Destructive DR Drill</h2>
                <p className="text-xs text-gray-500">
                  Spawns an isolated sandbox VPC, mounts WAL snapshots, replays transactions, and verifies zero data loss.
                </p>
              </div>
              <button
                onClick={handleRunDrill}
                disabled={drillRunning}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow flex items-center gap-2 disabled:opacity-50"
              >
                {drillRunning ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Simulating Recovery Sandbox...
                  </>
                ) : (
                  '⚡ Trigger DR Drill Now'
                )}
              </button>
            </div>

            {drillResult && (
              <div className="p-5 bg-gray-900 text-white rounded-xl border border-gray-800 space-y-4 font-mono text-xs">
                <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-green-500 text-black text-xs font-bold rounded">
                      {drillResult.status}
                    </span>
                    <span className="text-gray-300 font-bold">{drillResult.drill_id}</span>
                  </div>
                  <span className="text-green-400">
                    Restoration Time: {drillResult.rto_achieved_minutes}m ({drillResult.total_duration_sec}s) | 0 Data Loss
                  </span>
                </div>

                <div className="space-y-2">
                  {drillResult.steps?.map((st: any) => (
                    <div key={st.step} className="flex justify-between p-2 bg-black/40 rounded border border-gray-800">
                      <div>
                        <span className="text-blue-400 font-bold">STEP {st.step}: {st.phase}</span>
                        <div className="text-gray-400 text-[11px] mt-0.5">{st.output}</div>
                      </div>
                      <span className="text-gray-400 text-[11px] shrink-0">{st.duration_sec}s</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
