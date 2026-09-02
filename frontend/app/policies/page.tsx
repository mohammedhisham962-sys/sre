'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Policy {
  id: number;
  name: string;
  description?: string;
  trigger_event: string;
  action_type: string;
  approval_level: string;
  conditions_json?: string;
  is_active: boolean;
}

export default function Policies() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    trigger_event: '5XX_DOWNTIME',
    action_type: 'AUTO_TRIGGER_AI_REPAIR',
    approval_level: 'AUTOMATIC'
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchPolicies = () => {
    fetch('/api/v1/policies/')
      .then(res => res.json())
      .then(data => {
        setPolicies(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load policies:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const handleToggle = async (policyId: number) => {
    try {
      const res = await fetch(`/api/v1/policies/${policyId}/toggle`, { method: 'PUT' });
      if (res.ok) {
        fetchPolicies();
      }
    } catch (err) {
      console.error('Failed to toggle policy:', err);
    }
  };

  const handleDelete = async (policyId: number) => {
    if (!confirm('Are you sure you want to delete this policy?')) return;
    try {
      const res = await fetch(`/api/v1/policies/${policyId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchPolicies();
      }
    } catch (err) {
      console.error('Failed to delete policy:', err);
    }
  };

  const handleCreatePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/policies/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsModalOpen(false);
        setFormData({
          name: '',
          description: '',
          trigger_event: '5XX_DOWNTIME',
          action_type: 'AUTO_TRIGGER_AI_REPAIR',
          approval_level: 'AUTOMATIC'
        });
        fetchPolicies();
      }
    } catch (err) {
      console.error('Failed to create policy:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="p-8 md:p-12 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              ⚖️ SRE Policy & Auto-Remediation Engine
            </h1>
            <p className="text-gray-500 mt-1">
              Declarative guardrails governing autonomous AI healing, security gates, and human approval levels.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow transition text-sm flex items-center gap-1.5"
            >
              + Create Policy
            </button>
            <Link href="/" className="text-blue-600 hover:underline font-medium text-sm">← Dashboard</Link>
          </div>
        </div>

        {/* Policies Grid */}
        {loading ? (
          <div className="text-center py-12 text-gray-500 bg-white rounded-xl shadow-sm border p-8">
            <div className="animate-pulse">Loading active SRE policies & guardrails...</div>
          </div>
        ) : policies.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white rounded-xl shadow-sm border p-8">
            No policies defined yet. Click "+ Create Policy" to add one.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {policies.map(policy => (
              <div
                key={policy.id}
                className={`bg-white rounded-xl shadow-sm border p-6 flex flex-col justify-between transition ${
                  policy.is_active ? 'border-gray-200' : 'border-gray-200 opacity-60 bg-gray-50'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      policy.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'
                    }`}>
                      {policy.is_active ? 'Active' : 'Disabled'}
                    </span>
                    <span className="text-xs font-mono bg-purple-50 text-purple-700 px-2 py-0.5 rounded">
                      {policy.approval_level}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2">{policy.name}</h3>
                  <p className="text-xs text-gray-600 mb-4 leading-relaxed">{policy.description || 'No description provided.'}</p>

                  <div className="space-y-2 text-xs font-mono bg-gray-50 p-3 rounded-lg border border-gray-100 mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Trigger:</span>
                      <span className="font-semibold text-gray-800">{policy.trigger_event}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Action:</span>
                      <span className="font-semibold text-blue-600">{policy.action_type}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleToggle(policy.id)}
                    className={`text-xs font-semibold px-3 py-1 rounded transition ${
                      policy.is_active
                        ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                        : 'bg-green-50 text-green-700 hover:bg-green-100'
                    }`}
                  >
                    {policy.is_active ? 'Disable Rule' : 'Activate Rule'}
                  </button>

                  <button
                    onClick={() => handleDelete(policy.id)}
                    className="text-xs text-red-500 hover:text-red-700 font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Policy Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6">
              <div className="flex justify-between items-center mb-4 border-b pb-3">
                <h3 className="text-lg font-bold text-gray-900">Define SRE Policy Guardrail</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreatePolicy} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Policy Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Production Auto-Rollback Gate"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    placeholder="Explain what this policy enforces..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Trigger Event</label>
                    <select
                      value={formData.trigger_event}
                      onChange={e => setFormData({...formData, trigger_event: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="5XX_DOWNTIME">5XX Downtime Failure</option>
                      <option value="HIGH_LATENCY">High Latency Spike</option>
                      <option value="SECURITY_ALERT">Security Secret Alert</option>
                      <option value="PR_OPENED">Pull Request Opened</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Action Type</label>
                    <select
                      value={formData.action_type}
                      onChange={e => setFormData({...formData, action_type: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="AUTO_TRIGGER_AI_REPAIR">Auto-Trigger AI Repair</option>
                      <option value="BLOCK_COMMIT">Block Git Commit</option>
                      <option value="REQUIRE_HUMAN_APPROVAL">Require Human Approval</option>
                      <option value="NOTIFY_SRE">Notify SRE Team</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Approval Level</label>
                  <select
                    value={formData.approval_level}
                    onChange={e => setFormData({...formData, approval_level: e.target.value})}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="AUTOMATIC">AUTOMATIC (Full Autopilot)</option>
                    <option value="HUMAN_IN_THE_LOOP">HUMAN_IN_THE_LOOP (Review Required)</option>
                    <option value="STRICT_BLOCK">STRICT_BLOCK (Zero-Tolerance)</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !formData.name.trim()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold"
                  >
                    {submitting ? 'Saving...' : 'Save Policy'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
