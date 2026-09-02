'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ApprovalItem {
  id: number;
  title: string;
  description: string;
  action_type: string;
  target_environment: string;
  requested_by: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  created_at: string;
  reviewed_at?: string;
  reviewer_name?: string;
  reviewer_notes?: string;
  metadata_json?: string;
}

export default function Approvals() {
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [reviewNotes, setReviewNotes] = useState<{ [key: number]: string }>({});
  const [processingId, setProcessingId] = useState<number | null>(null);

  const fetchApprovals = () => {
    fetch('/api/v1/approvals/')
      .then(res => res.json())
      .then(data => {
        setApprovals(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load approvals:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleDecision = async (id: number, decision: 'approve' | 'reject') => {
    setProcessingId(id);
    const notes = reviewNotes[id] || (decision === 'approve' ? 'Authorized for deployment.' : 'Rejected by human operator.');

    try {
      const res = await fetch(`/api/v1/approvals/${id}/${decision}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewer_name: 'SRE Lead',
          notes: notes
        })
      });
      if (res.ok) {
        fetchApprovals();
      }
    } catch (err) {
      console.error(`Failed to ${decision} request:`, err);
    } finally {
      setProcessingId(null);
    }
  };

  const pendingItems = approvals.filter(a => a.status === 'PENDING');
  const historyItems = approvals.filter(a => a.status !== 'PENDING');

  return (
    <main className="p-8 md:p-12 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              🛡️ Human-in-the-Loop Approval Gateway
            </h1>
            <p className="text-gray-500 mt-1">
              Production authorization sign-offs for AI auto-repairs, elevated access, and critical releases.
            </p>
          </div>
          <Link href="/" className="text-blue-600 hover:underline font-medium text-sm">← Dashboard</Link>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('pending')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 transition ${
              activeTab === 'pending'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Pending Authorization
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              pendingItems.length > 0 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
            }`}>
              {pendingItems.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 transition ${
              activeTab === 'history'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Decision History
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
              {historyItems.length}
            </span>
          </button>
        </div>

        {/* Content Body */}
        {loading ? (
          <div className="text-center py-12 text-gray-500 bg-white rounded-xl shadow-sm border p-8">
            <div className="animate-pulse">Loading approval sign-off queue...</div>
          </div>
        ) : activeTab === 'pending' ? (
          /* Pending Queue */
          pendingItems.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-white rounded-xl shadow-sm border p-8">
              <span className="text-3xl block mb-2">🎉</span>
              <p className="font-bold text-gray-800">All Queues Clear!</p>
              <p className="text-xs text-gray-400 mt-1">No pending operational changes currently require authorization.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {pendingItems.map(item => {
                let metadata = null;
                if (item.metadata_json) {
                  try { metadata = JSON.parse(item.metadata_json); } catch (e) {}
                }

                return (
                  <div key={item.id} className="bg-white rounded-xl shadow-sm border border-yellow-200 p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-300">
                          Awaiting Sign-off
                        </span>
                        <span className="text-xs font-mono uppercase bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                          {item.action_type}
                        </span>
                        <span className="text-xs font-semibold text-gray-500">
                          Env: <strong className="text-gray-800">{item.target_environment}</strong>
                        </span>
                      </div>
                      <span className="text-xs text-gray-400 font-mono">
                        Requested: {item.created_at ? new Date(item.created_at).toLocaleString() : ''}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-700 mb-4">{item.description}</p>

                    {/* Metadata Inspector if available */}
                    {metadata && (
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-xs font-mono space-y-1 mb-4">
                        {Object.entries(metadata).map(([k, v]) => (
                          <div key={k} className="flex justify-between">
                            <span className="text-gray-500 capitalize">{k.replace('_', ' ')}:</span>
                            <span className="font-semibold text-gray-800">{String(v)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Decision Input & Action Buttons */}
                    <div className="pt-4 border-t border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <input
                        type="text"
                        placeholder="Optional review justification / approval notes..."
                        value={reviewNotes[item.id] || ''}
                        onChange={(e) => setReviewNotes({ ...reviewNotes, [item.id]: e.target.value })}
                        className="w-full md:w-96 px-3 py-1.5 text-xs border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      />

                      <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                        <button
                          onClick={() => handleDecision(item.id, 'reject')}
                          disabled={processingId === item.id}
                          className="px-4 py-2 bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 rounded-lg text-xs font-bold transition disabled:opacity-50"
                        >
                          Reject & Block
                        </button>
                        <button
                          onClick={() => handleDecision(item.id, 'approve')}
                          disabled={processingId === item.id}
                          className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold shadow transition disabled:opacity-50"
                        >
                          {processingId === item.id ? 'Authorizing...' : 'Approve & Execute'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          /* Decision History */
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-gray-600 text-xs font-semibold uppercase">
                <tr>
                  <th className="px-6 py-3.5 text-left">ID</th>
                  <th className="px-6 py-3.5 text-left">Title</th>
                  <th className="px-6 py-3.5 text-left">Status</th>
                  <th className="px-6 py-3.5 text-left">Reviewer</th>
                  <th className="px-6 py-3.5 text-left">Notes</th>
                  <th className="px-6 py-3.5 text-right">Decision Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {historyItems.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-mono text-gray-400">#{item.id}</td>
                    <td className="px-6 py-4 font-bold text-gray-900 max-w-xs truncate">{item.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        item.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700 font-medium">{item.reviewer_name || 'Operator'}</td>
                    <td className="px-6 py-4 text-gray-600 max-w-sm truncate">{item.reviewer_notes || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-mono text-gray-500">
                      {item.reviewed_at ? new Date(item.reviewed_at).toLocaleString() : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
