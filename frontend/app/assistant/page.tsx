"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function AssistantPage() {
  const [context, setContext] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("http://localhost:8000/api/v1/assistant/context")
      .then(res => res.json())
      .then(d => setContext(d))
      .catch(e => console.error(e));
  }, []);

  const analyzeIncident = async (id: string) => {
    setAnalyzingId(id);
    setAnalysis(null);
    try {
      const res = await fetch(`http://localhost:8000/api/v1/assistant/analyze/${id}`);
      const data = await res.json();
      setAnalysis(data);
    } catch (e) {
      console.error(e);
    }
    setAnalyzingId(null);
  };

  if (!context) return <div className="p-8 text-slate-400">Initializing AIOps Assistant...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/" className="p-2 rounded-full hover:bg-slate-800 transition-colors">
              <span className="text-xl">⬅️</span>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight flex items-center">
                AIOps Assistant <span className="ml-3">🤖</span>
              </h1>
              <p className="text-slate-400 mt-1">LLM-powered incident root-cause analysis.</p>
            </div>
          </div>
          <div className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-mono rounded-full flex items-center">
            <span className="mr-2">🧠</span>
            {context.model}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Incidents List */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Active Incidents</h2>
            {context.active_incidents.map((inc: any, idx: number) => (
              <div 
                key={idx} 
                onClick={() => analyzeIncident(inc.id)}
                className={`p-4 border rounded-xl cursor-pointer transition-all ${analysis?.incident_id === inc.id ? 'bg-indigo-900/20 border-indigo-500/50' : 'bg-slate-900 border-slate-800 hover:border-slate-600'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${inc.severity === 'SEV-1' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    {inc.severity}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">{inc.id}</span>
                </div>
                <h3 className="text-sm font-medium text-white mb-2">{inc.title}</h3>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center"><span className="mr-1">📈</span> {inc.status}</span>
                  <span>{inc.logs_analyzed.toLocaleString()} logs</span>
                </div>
              </div>
            ))}
          </div>

          {/* Analysis View */}
          <div className="lg:col-span-2">
            {analyzingId ? (
              <div className="h-full min-h-[400px] bg-slate-900 border border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-400">
                <span className="text-4xl animate-pulse mb-4">🧠</span>
                <p>Correlating telemetry, logs, and topology for {analyzingId}...</p>
              </div>
            ) : analysis ? (
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-white flex items-center">
                    Root Cause Analysis: {analysis.incident_id}
                  </h2>
                  <div className="flex items-center">
                    <span className="text-xs text-slate-400 mr-2">Confidence:</span>
                    <span className={`text-sm font-bold ${analysis.confidence_score > 0.8 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {(analysis.confidence_score * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">AI Summary</h3>
                    <p className="text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-lg border border-slate-800">
                      {analysis.root_cause_summary}
                    </p>
                  </div>
                  
                  {analysis.suggested_remediation.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Suggested Remediation</h3>
                      <div className="space-y-3">
                        {analysis.suggested_remediation.map((rem: any, idx: number) => (
                          <div key={idx} className="bg-slate-950 border border-slate-800 rounded-lg p-4">
                            <div className="text-sm font-medium text-indigo-400 mb-2 flex items-center">
                              <span className="mr-2">💻</span>
                              {rem.action}
                            </div>
                            <code className="block bg-black text-emerald-400 p-3 rounded text-sm font-mono overflow-x-auto border border-slate-800">
                              {rem.command}
                            </code>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[400px] bg-slate-900 border border-slate-800 border-dashed rounded-xl flex flex-col items-center justify-center text-slate-500">
                <span className="text-5xl mb-4 opacity-50">🤖</span>
                <p>Select an active incident to generate an AI root-cause analysis.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
