"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function PoliciesPage() {
  const [data, setData] = useState<any>(null);
  const [manifest, setManifest] = useState<string>("apiVersion: v1\nkind: Pod\nmetadata:\n  name: nginx\nspec:\n  containers:\n  - name: nginx\n    image: nginx\n    securityContext:\n      privileged: true");
  const [evalResult, setEvalResult] = useState<any>(null);

  useEffect(() => {
    fetch("http://localhost:8000/api/v1/policies/overview")
      .then(res => res.json())
      .then(d => setData(d))
      .catch(e => console.error(e));
  }, []);

  const evaluateManifest = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/policies/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ manifest_yaml: manifest })
      });
      const result = await res.json();
      setEvalResult(result);
    } catch (e) {
      console.error(e);
    }
  };

  if (!data) return <div className="p-8 text-slate-400">Loading Policies Data...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-purple-500/30">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/" className="p-2 rounded-full hover:bg-slate-800 transition-colors">
              <span className="text-xl">⬅️</span>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">DevSecOps Shift-Left Policies</h1>
              <p className="text-slate-400 mt-1">OPA Gatekeeper rules and IaC evaluation.</p>
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl px-6 py-2 shadow-sm flex items-center">
             <span className="text-sm font-medium text-slate-400 mr-4">Compliance Score</span>
             <span className="text-2xl font-bold text-emerald-400">{data.compliance_score}%</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-800 bg-slate-900">
              <h2 className="text-lg font-semibold text-white">Active OPA Policies</h2>
            </div>
            <div className="p-0">
              <table className="w-full text-left border-collapse">
                <tbody className="divide-y divide-slate-800">
                  {data.policies.map((pol: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-white">{pol.name}</div>
                        <div className="text-xs text-slate-500 font-mono mt-1">{pol.id} • {pol.framework}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`px-3 py-1 rounded text-xs font-medium ${pol.enforcement === 'Block' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30' : 'bg-slate-800 text-slate-300'}`}>
                          {pol.enforcement}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-800 bg-slate-900">
              <h2 className="text-lg font-semibold text-white">Recent Pipeline Evaluations</h2>
            </div>
            <div className="p-0">
              <table className="w-full text-left border-collapse">
                <tbody className="divide-y divide-slate-800">
                  {data.evaluations.map((ev: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm font-medium text-white mb-1">
                          <span className="mr-2">🔄</span>
                          {ev.pipeline_id}
                        </div>
                        <div className="text-xs text-slate-400 font-mono">{ev.resource}</div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">{ev.policy_id}</td>
                      <td className="px-6 py-4 text-right">
                        {ev.result === "PASS" ? (
                          <div className="inline-flex flex-col items-end">
                            <span className="text-emerald-400 font-bold flex items-center"><span className="mr-1">✅</span> PASS</span>
                            <span className="text-xs text-slate-500">{ev.message}</span>
                          </div>
                        ) : (
                          <div className="inline-flex flex-col items-end">
                            <span className="text-rose-400 font-bold flex items-center"><span className="mr-1">🚨</span> DENY</span>
                            <span className="text-xs text-slate-500">{ev.message}</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Live Evaluation Playground */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <span className="mr-2">📄</span>
              Live IaC Policy Evaluator
            </h2>
            <button 
              onClick={evaluateManifest}
              className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors"
            >
              <span className="mr-2">▶️</span> Evaluate Manifest
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="p-0 border-r border-slate-800">
              <textarea
                value={manifest}
                onChange={(e) => setManifest(e.target.value)}
                className="w-full h-64 bg-slate-950 text-slate-300 font-mono text-sm p-4 focus:outline-none resize-none"
                spellCheck="false"
              />
            </div>
            <div className="p-6 bg-slate-900 flex flex-col justify-center">
              {!evalResult ? (
                <div className="text-center text-slate-500">
                  Click 'Evaluate Manifest' to run OPA Gatekeeper rules.
                </div>
              ) : evalResult.status === "PASS" ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl text-emerald-400">✅</span>
                  </div>
                  <h3 className="text-xl font-bold text-emerald-400 mb-2">Evaluation Passed</h3>
                  <p className="text-slate-400 text-sm">No policy violations detected.</p>
                </div>
              ) : (
                <div className="text-left">
                  <div className="flex items-center mb-4 text-rose-400">
                    <span className="text-3xl mr-3">🚨</span>
                    <h3 className="text-xl font-bold">Evaluation Failed (DENY)</h3>
                  </div>
                  <div className="space-y-3">
                    {evalResult.violations.map((v: any, idx: number) => (
                      <div key={idx} className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-sm text-rose-300">
                        <strong>{v.policy}:</strong> {v.message}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
