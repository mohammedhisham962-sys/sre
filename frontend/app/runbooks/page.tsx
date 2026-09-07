'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function RunbooksPage() {
  const [runbooks, setRunbooks] = useState<any[]>([]);
  const [selectedRunbook, setSelectedRunbook] = useState<any>(null);
  const [isDryRun, setIsDryRun] = useState<boolean>(true);
  const [executing, setExecuting] = useState<boolean>(false);
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchRunbooks = () => {
    fetch('/api/v1/runbooks/')
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setRunbooks(list);
        if (list.length > 0 && !selectedRunbook) {
          setSelectedRunbook(list[0]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching runbooks:', err);
        setRunbooks([]);
        setLoading(false);
      });
  };

  const fetchHistory = () => {
    fetch('/api/v1/runbooks/history')
      .then((res) => res.json())
      .then((data) => {
        setHistory(Array.isArray(data) ? data : []);
      })
      .catch(() => setHistory([]));
  };

  useEffect(() => {
    fetchRunbooks();
    fetchHistory();
  }, []);

  const handleExecute = async () => {
    if (!selectedRunbook) return;
    setExecuting(true);
    setExecutionResult(null);

    try {
      const res = await fetch(`/api/v1/runbooks/${selectedRunbook.id}/execute?dry_run=${isDryRun}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dry_run: isDryRun, operator: 'SRE Console Operator' })
      });
      const data = await res.json();
      setExecutionResult(data);
      fetchHistory();
    } catch (err) {
      console.error('Execution error:', err);
    } finally {
      setExecuting(false);
    }
  };

  return (
    <main className="p-8 md:p-12 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">⚙️</span>
            <h1 className="text-3xl font-bold text-gray-900">SRE Runbook Automation Engine</h1>
          </div>
          <p className="text-gray-600 mt-1">
            Declarative multi-step remediation playbooks with IAM validation, safe dry-run simulation, and audit logging.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/audit" className="px-4 py-2 border rounded-lg text-gray-700 bg-white hover:bg-gray-100 text-sm font-medium">
            Audit Ledger
          </Link>
          <Link href="/" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
            ← Dashboard
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="bg-white p-12 rounded-xl border text-center text-gray-500">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          Loading automated runbooks catalog...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Runbook Selector Sidebar */}
          <div className="space-y-4">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Remediation Playbooks</h2>
            <div className="space-y-3">
              {runbooks.map((rb) => (
                <button
                  key={rb.id}
                  onClick={() => {
                    setSelectedRunbook(rb);
                    setExecutionResult(null);
                  }}
                  className={`w-full text-left p-4 rounded-xl border transition ${
                    selectedRunbook?.id === rb.id
                      ? 'bg-blue-50 border-blue-500 shadow-sm'
                      : 'bg-white hover:bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className={`px-2 py-0.5 text-xs font-bold rounded ${
                      rb.category === 'DATABASE' ? 'bg-indigo-100 text-indigo-700' :
                      rb.category === 'CACHE' ? 'bg-amber-100 text-amber-700' :
                      rb.category === 'INGRESS' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {rb.category}
                    </span>
                    <span className="text-xs text-gray-400">{rb.steps?.length || 4} Steps</span>
                  </div>
                  <div className="text-sm font-bold text-gray-900 mt-1">{rb.name}</div>
                  <div className="text-xs text-gray-500 mt-1 line-clamp-2">{rb.description}</div>
                </button>
              ))}
            </div>

            {/* Execution Audit History */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 mt-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Recent Executions</h3>
              {history.length === 0 ? (
                <div className="text-xs text-gray-400 text-center py-4">No recent executions</div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {history.slice(0, 5).map((h) => (
                    <div key={h.id} className="p-2 bg-gray-50 rounded border text-xs">
                      <div className="flex justify-between text-gray-700 font-semibold">
                        <span>{h.action}</span>
                        <span className="text-gray-400 font-mono text-[10px]">{h.timestamp.slice(11, 19)}</span>
                      </div>
                      <div className="text-gray-500 text-[11px] mt-0.5 truncate">{h.details}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Execution & Step Detail View */}
          {selectedRunbook && (
            <div className="lg:col-span-2 space-y-6">
              {/* Playbook Overview Card */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4 mb-6">
                  <div>
                    <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-xs font-bold rounded">
                      {selectedRunbook.category} RUNBOOK
                    </span>
                    <h2 className="text-xl font-bold text-gray-900 mt-1">{selectedRunbook.name}</h2>
                    <p className="text-xs text-gray-500 mt-1">{selectedRunbook.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Dry Run Toggle */}
                    <label className="flex items-center gap-2 cursor-pointer bg-gray-100 px-3 py-1.5 rounded-lg border text-xs font-semibold text-gray-700">
                      <input
                        type="checkbox"
                        checked={isDryRun}
                        onChange={(e) => setIsDryRun(e.target.checked)}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span>Dry-Run Simulation</span>
                    </label>
                    <button
                      onClick={handleExecute}
                      disabled={executing}
                      className={`px-4 py-2 rounded-lg text-xs font-bold text-white shadow flex items-center gap-2 transition ${
                        isDryRun
                          ? 'bg-amber-600 hover:bg-amber-700'
                          : 'bg-emerald-600 hover:bg-emerald-700'
                      } disabled:opacity-50`}
                    >
                      {executing ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Executing...
                        </>
                      ) : isDryRun ? (
                        '⚡ Test Dry-Run'
                      ) : (
                        '🚀 Execute Live'
                      )}
                    </button>
                  </div>
                </div>

                {/* Steps Overview */}
                <h3 className="text-sm font-bold text-gray-900 mb-3">Playbook Action Sequence</h3>
                <div className="space-y-3">
                  {selectedRunbook.steps?.map((step: any) => (
                    <div key={step.step} className="p-3 bg-gray-50 rounded-lg border text-xs flex items-start gap-3">
                      <div className="w-6 h-6 rounded bg-gray-200 text-gray-700 font-bold flex items-center justify-center shrink-0">
                        {step.step}
                      </div>
                      <div className="w-full">
                        <div className="font-bold text-gray-800">{step.action}</div>
                        <div className="font-mono bg-gray-900 text-green-400 p-2 rounded mt-1 overflow-x-auto text-[11px]">
                          {step.cmd}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Execution Output Terminal */}
              {executionResult && (
                <div className="bg-gray-900 rounded-xl p-6 text-white shadow-lg space-y-4 border border-gray-800">
                  <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-red-500"></span>
                      <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                      <span className="w-3 h-3 rounded-full bg-green-500"></span>
                      <span className="text-xs font-mono text-gray-400 ml-2">
                        {executionResult.dry_run ? '[DRY-RUN MODE]' : '[LIVE EXECUTION]'} — {executionResult.status} ({executionResult.total_duration_ms}ms)
                      </span>
                    </div>
                    <span className="text-xs text-green-400 font-bold">100% Steps Complete</span>
                  </div>

                  <div className="space-y-2 font-mono text-xs max-h-80 overflow-y-auto">
                    {executionResult.steps?.map((s: any) => (
                      <div key={s.step} className="p-2.5 bg-black/40 rounded border border-gray-800">
                        <div className="flex justify-between text-gray-400 text-[11px] mb-1">
                          <span className="text-blue-400 font-bold">HOP #{s.step}: {s.action}</span>
                          <span>{s.elapsed_ms}ms | {s.timestamp}</span>
                        </div>
                        <div className="text-gray-300 text-[11px] mb-1">{s.command}</div>
                        <div className="text-green-400 font-bold text-[11px]">{s.output}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
