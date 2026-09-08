'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SwarmPage() {
  const [swarm, setSwarm] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [missionRunning, setMissionRunning] = useState<boolean>(false);
  const [missionResult, setMissionResult] = useState<any>(null);
  const [missionName, setMissionName] = useState<string>('Full Infrastructure Security & Resilience Audit');

  const fetchSwarm = () => {
    fetch('/api/v1/swarm/agents')
      .then((res) => res.json())
      .then((data) => {
        setSwarm(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching swarm:', err);
        setSwarm(null);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSwarm();
  }, []);

  const handleLaunchMission = async () => {
    setMissionRunning(true);
    setMissionResult(null);

    try {
      const res = await fetch(`/api/v1/swarm/mission?mission_name=${encodeURIComponent(missionName)}`, {
        method: 'POST'
      });
      const data = await res.json();
      setMissionResult(data);
      fetchSwarm();
    } catch (err) {
      console.error('Mission launch error:', err);
    } finally {
      setMissionRunning(false);
    }
  };

  return (
    <main className="p-8 md:p-12 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">🤖</span>
            <h1 className="text-3xl font-bold text-gray-900">AI SRE Agent Swarm Mission Control</h1>
          </div>
          <p className="text-gray-600 mt-1">
            Autonomous multi-agent cooperative mesh: Diagnostic Triage, AST Security, Patch Synthesis, Chaos Probing, and FinOps.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/assistant" className="px-4 py-2 border rounded-lg text-gray-700 bg-white hover:bg-gray-100 text-sm font-medium">
            AI Assistant
          </Link>
          <Link href="/" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
            ← Dashboard
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="bg-white p-12 rounded-xl border text-center text-gray-500">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          Connecting to AI Agent Swarm Mesh...
        </div>
      ) : !swarm ? (
        <div className="bg-white p-12 rounded-xl border text-center text-gray-500">
          Unable to establish connection with swarm coordinator.
        </div>
      ) : (
        <div className="space-y-8">
          {/* Swarm Mesh KPI Gauges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm text-center">
              <div className="text-xs font-semibold text-gray-500">Swarm Mesh Status</div>
              <div className="text-2xl font-black text-green-600 mt-1">{swarm.swarm_status}</div>
              <div className="text-xs text-gray-400 mt-0.5">5 Autonomous Nodes</div>
            </div>
            <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm text-center">
              <div className="text-xs font-semibold text-gray-500">Total Tokens Consumed</div>
              <div className="text-2xl font-black text-blue-600 mt-1">{swarm.total_tokens_consumed?.toLocaleString()}</div>
              <div className="text-xs text-gray-400 mt-0.5">Across All LLM Backends</div>
            </div>
            <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm text-center">
              <div className="text-xs font-semibold text-gray-500">Autonomous Tasks Done</div>
              <div className="text-2xl font-black text-purple-600 mt-1">{swarm.total_tasks_completed} Tasks</div>
              <div className="text-xs text-gray-400 mt-0.5">Self-Healing & Probes</div>
            </div>
            <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm text-center">
              <div className="text-xs font-semibold text-gray-500">Inter-Agent Latency</div>
              <div className="text-2xl font-black text-indigo-600 mt-1">{swarm.swarm_mesh_latency_ms}ms</div>
              <div className="text-xs text-gray-400 mt-0.5">In-Memory IPC Mesh</div>
            </div>
          </div>

          {/* Agent Roster Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {swarm.agents?.map((agent: any) => (
              <div key={agent.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-mono text-xs font-bold text-gray-400">{agent.id}</span>
                      <h3 className="text-base font-bold text-gray-900 mt-0.5">{agent.name}</h3>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      agent.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                      agent.status === 'IDLE' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {agent.status}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-blue-700 mb-2">{agent.role}</div>
                  
                  {/* Thought Stream */}
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-xs text-gray-700 italic space-y-1">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider not-italic">Live Thought Stream</div>
                    "{agent.current_thought}"
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-400">LLM Engine:</span>
                    <div className="font-semibold text-gray-800 truncate">{agent.model}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Tokens / Tasks:</span>
                    <div className="font-semibold text-gray-800">{agent.tokens_consumed?.toLocaleString()} / {agent.tasks_completed}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mission Control Launcher */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">🚀 Autonomous Multi-Agent Mission Launcher</h2>
                <p className="text-xs text-gray-500">
                  Orchestrates coordinated cross-agent workflows to conduct infrastructure audits, vulnerability sweeps, and resilience verification.
                </p>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <select
                  value={missionName}
                  onChange={(e) => setMissionName(e.target.value)}
                  className="p-2.5 bg-white border border-gray-300 rounded-lg text-xs font-medium text-gray-800 w-full sm:w-72"
                >
                  <option value="Full Infrastructure Security & Resilience Audit">Full Infrastructure Security & Resilience Audit</option>
                  <option value="Proactive Zero-Day Dependency & CVE Sweep">Proactive Zero-Day Dependency & CVE Sweep</option>
                  <option value="Multi-Region Chaos & Traffic Surge Drill">Multi-Region Chaos & Traffic Surge Drill</option>
                  <option value="Automated FinOps Cluster Downscaling Sweep">Automated FinOps Cluster Downscaling Sweep</option>
                </select>
                <button
                  onClick={handleLaunchMission}
                  disabled={missionRunning}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow shrink-0 flex items-center gap-2 disabled:opacity-50"
                >
                  {missionRunning ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Executing Swarm...
                    </>
                  ) : (
                    '⚡ Launch Mission'
                  )}
                </button>
              </div>
            </div>

            {missionResult && (
              <div className="p-5 bg-gray-900 text-white rounded-xl border border-gray-800 space-y-4 font-mono text-xs">
                <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-green-500 text-black text-xs font-bold rounded">
                      {missionResult.status}
                    </span>
                    <span className="text-gray-300 font-bold">{missionResult.mission_id}</span>
                  </div>
                  <span className="text-green-400">
                    Duration: {missionResult.total_duration_ms}ms | Scorecard: {missionResult.scorecard}
                  </span>
                </div>

                <div className="space-y-2">
                  {missionResult.steps?.map((st: any, idx: number) => (
                    <div key={idx} className="flex justify-between p-2.5 bg-black/40 rounded border border-gray-800">
                      <div>
                        <span className="text-blue-400 font-bold">[{st.agent}]</span> <span className="text-gray-300 font-semibold">{st.action}</span>
                        <div className="text-gray-400 text-[11px] mt-0.5">{st.output}</div>
                      </div>
                      <span className="text-gray-400 text-[11px] shrink-0">{st.elapsed_ms}ms</span>
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
