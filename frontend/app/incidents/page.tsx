'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Incidents() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for AI Repair execution
  const [repairingId, setRepairingId] = useState<number | null>(null);
  const [repairResults, setRepairResults] = useState<Record<number, any>>({});
  const [repairErrors, setRepairErrors] = useState<Record<number, string>>({});

  const fetchIncidents = () => {
    fetch('/api/v1/incidents')
      .then((res) => res.json())
      .then((data) => {
        setIncidents(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching incidents:', error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const triggerRepair = async (incidentId: number) => {
    setRepairingId(incidentId);
    setRepairErrors((prev) => ({ ...prev, [incidentId]: '' }));
    
    try {
      const response = await fetch(`/api/v1/repairs/${incidentId}/execute`, {
        method: 'POST',
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Repair failed');
      }
      
      setRepairResults((prev) => ({ ...prev, [incidentId]: data }));
    } catch (err: any) {
      setRepairErrors((prev) => ({ ...prev, [incidentId]: err.message }));
    } finally {
      setRepairingId(null);
    }
  };

  return (
    <main className="p-12 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Incidents Engine</h1>
        <div className="flex gap-4 items-center">
          <button onClick={fetchIncidents} className="text-sm bg-white border px-3 py-1 rounded shadow-sm hover:bg-gray-50">↻ Refresh</button>
          <Link href="/" className="text-blue-600 hover:underline">← Back to Dashboard</Link>
        </div>
      </div>

      <div className="space-y-6">
        {loading ? (
          <p className="text-gray-500">Loading incidents...</p>
        ) : incidents.length === 0 ? (
          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h2 className="text-green-800 font-bold">No Active Incidents</h2>
            <p className="text-green-700 text-sm mt-2">All monitored services are operating normally.</p>
          </div>
        ) : (
          incidents.map((incident) => (
            <div key={incident.id} className={`p-6 rounded-lg shadow-sm border ${incident.status === 'RESOLVED' ? 'bg-gray-50 border-gray-200' : 'bg-white border-red-200'}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className={`px-2 py-1 text-xs font-bold rounded ${incident.status === 'RESOLVED' ? 'bg-gray-200 text-gray-700' : 'bg-red-100 text-red-700'}`}>
                      {incident.status}
                    </span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {incident.project_name}
                    </span>
                  </div>
                  <h2 className={`text-xl font-bold ${incident.status === 'RESOLVED' ? 'text-gray-600' : 'text-gray-900'}`}>{incident.title}</h2>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Detected: {new Date(incident.detected_at).toLocaleString()}</div>
                  {incident.resolved_at && (
                    <div className="text-sm text-green-600">Resolved: {new Date(incident.resolved_at).toLocaleString()}</div>
                  )}
                </div>
              </div>
              
              <div className="mt-4 border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Automated Incident Timeline:</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto mb-4 border rounded p-2 bg-gray-50">
                  {incident.events.map((event: any, idx: number) => (
                    <div key={idx} className="bg-white p-2 rounded text-sm font-mono flex flex-col gap-1 border border-gray-100 shadow-sm">
                      <div className="text-gray-500 text-xs">[{new Date(event.timestamp).toLocaleTimeString()}]</div>
                      <div className="text-gray-800">{event.message}</div>
                      {event.evidence && (
                        <div className="text-gray-600 text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto whitespace-pre">
                          {event.evidence}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* AI Autopilot Actions */}
                {incident.status !== 'RESOLVED' && (
                  <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                      <span className="text-xl">✨</span> AIGRA Autopilot
                    </h3>
                    
                    {!repairResults[incident.id] ? (
                      <button
                        onClick={() => triggerRepair(incident.id)}
                        disabled={repairingId === incident.id}
                        className={`px-4 py-2 rounded text-white font-semibold transition-all ${
                          repairingId === incident.id 
                            ? 'bg-blue-400 cursor-wait' 
                            : 'bg-blue-600 hover:bg-blue-700 shadow'
                        }`}
                      >
                        {repairingId === incident.id ? 'Analyzing & Repairing...' : 'Trigger AI Repair'}
                      </button>
                    ) : (
                      <div className="bg-white p-4 rounded border border-green-200 mt-2">
                        <h4 className="font-bold text-green-700 flex items-center gap-2 mb-2">
                          <span>✅</span> Repair Branch Created!
                        </h4>
                        <div className="text-sm text-gray-700 font-mono mb-1">
                          <strong>Branch:</strong> {repairResults[incident.id].branch}
                        </div>
                        <div className="text-sm text-gray-700 font-mono mb-3">
                          <strong>Commit:</strong> {repairResults[incident.id].commit}
                        </div>
                        <div className="text-xs text-gray-500 mb-1 font-bold">Generated Patch:</div>
                        <pre className="text-xs bg-gray-900 text-green-400 p-3 rounded overflow-x-auto">
                          {repairResults[incident.id].patch}
                        </pre>
                      </div>
                    )}

                    {repairErrors[incident.id] && (
                      <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
                        <strong>Error:</strong> {repairErrors[incident.id]}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
