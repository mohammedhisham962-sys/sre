'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Incidents() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
  }, []);

  return (
    <main className="p-12 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Incidents Engine</h1>
        <Link href="/" className="text-blue-600 hover:underline">← Back to Dashboard</Link>
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
                <div className="space-y-3">
                  {incident.events.map((event: any, idx: number) => (
                    <div key={idx} className="bg-gray-100 p-3 rounded text-sm font-mono flex flex-col gap-1">
                      <div className="text-gray-500 text-xs">[{new Date(event.timestamp).toLocaleTimeString()}]</div>
                      <div className="text-gray-800">{event.message}</div>
                      {event.evidence && (
                        <div className="text-gray-600 text-xs bg-gray-200 p-2 rounded mt-1 overflow-x-auto">
                          EVIDENCE: {event.evidence}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
