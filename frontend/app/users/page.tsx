'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface UserItem {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export default function UsersManagement() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'ENGINEER'
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = () => {
    fetch('/api/v1/users/')
      .then(res => res.json())
      .then(data => {
        setUsers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load users:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/users/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsModalOpen(false);
        setFormData({ name: '', email: '', role: 'ENGINEER' });
        fetchUsers();
      } else {
        const error = await res.json();
        alert(`Error: ${error.detail || 'Failed to create user'}`);
      }
    } catch (err) {
      console.error('Failed to create user:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;
    try {
      const res = await fetch(`/api/v1/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchUsers();
      }
    } catch (err) {
      console.error('Failed to delete user:', err);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'SRE_LEAD':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'SECURITY_AUDITOR':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <main className="p-8 md:p-12 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              👥 SRE Team & RBAC Management
            </h1>
            <p className="text-gray-500 mt-1">
              Role-Based Access Control (RBAC) directory and operational permission guardrails.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow transition text-sm flex items-center gap-1.5"
            >
              + Add Team Member
            </button>
            <Link href="/" className="text-blue-600 hover:underline font-medium text-sm">← Dashboard</Link>
          </div>
        </div>

        {/* Team Directory Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h2 className="text-sm font-bold text-gray-700 uppercase">Engineering Team Directory</h2>
            <span className="text-xs text-gray-500">{users.length} Active Members</span>
          </div>

          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-white text-gray-500 text-xs font-semibold uppercase">
              <tr>
                <th className="px-6 py-3.5 text-left">Name</th>
                <th className="px-6 py-3.5 text-left">Email</th>
                <th className="px-6 py-3.5 text-left">Assigned Role</th>
                <th className="px-6 py-3.5 text-left">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <div className="animate-pulse">Loading engineering team directory...</div>
                  </td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-bold text-gray-900 whitespace-nowrap">{user.name}</td>
                    <td className="px-6 py-4 text-gray-600 font-mono text-xs whitespace-nowrap">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getRoleBadge(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 text-xs text-green-700 font-medium">
                        <span className="h-2 w-2 bg-green-500 rounded-full"></span>
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-xs text-red-500 hover:text-red-700 font-semibold"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Visual RBAC Permissions Matrix */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-base font-bold text-gray-900 mb-2">🔐 RBAC Operational Permissions Matrix</h3>
          <p className="text-xs text-gray-500 mb-4">
            Defines which roles are authorized to execute specific actions across the autonomous platform.
          </p>

          <div className="overflow-x-auto">
            <table className="min-w-full text-xs divide-y divide-gray-200 text-left">
              <thead className="bg-gray-50 text-gray-700 font-semibold uppercase">
                <tr>
                  <th className="px-4 py-3">Permission / Capability</th>
                  <th className="px-4 py-3 text-center">ADMIN</th>
                  <th className="px-4 py-3 text-center">SRE_LEAD</th>
                  <th className="px-4 py-3 text-center">ENGINEER</th>
                  <th className="px-4 py-3 text-center">SECURITY_AUDITOR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-mono">
                <tr>
                  <td className="px-4 py-3 font-sans font-medium text-gray-800">Trigger Autonomous AI Repair</td>
                  <td className="px-4 py-3 text-center text-green-600 font-bold">✅</td>
                  <td className="px-4 py-3 text-center text-green-600 font-bold">✅</td>
                  <td className="px-4 py-3 text-center text-green-600 font-bold">✅</td>
                  <td className="px-4 py-3 text-center text-gray-300">❌</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-sans font-medium text-gray-800">Approve Production Release / Merge</td>
                  <td className="px-4 py-3 text-center text-green-600 font-bold">✅</td>
                  <td className="px-4 py-3 text-center text-green-600 font-bold">✅</td>
                  <td className="px-4 py-3 text-center text-gray-300">❌</td>
                  <td className="px-4 py-3 text-center text-gray-300">❌</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-sans font-medium text-gray-800">Create & Modify SRE Policies</td>
                  <td className="px-4 py-3 text-center text-green-600 font-bold">✅</td>
                  <td className="px-4 py-3 text-center text-green-600 font-bold">✅</td>
                  <td className="px-4 py-3 text-center text-gray-300">❌</td>
                  <td className="px-4 py-3 text-center text-gray-300">❌</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-sans font-medium text-gray-800">Run On-Demand Security Scans</td>
                  <td className="px-4 py-3 text-center text-green-600 font-bold">✅</td>
                  <td className="px-4 py-3 text-center text-green-600 font-bold">✅</td>
                  <td className="px-4 py-3 text-center text-green-600 font-bold">✅</td>
                  <td className="px-4 py-3 text-center text-green-600 font-bold">✅</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-sans font-medium text-gray-800">Export Immutable Audit Logs</td>
                  <td className="px-4 py-3 text-center text-green-600 font-bold">✅</td>
                  <td className="px-4 py-3 text-center text-green-600 font-bold">✅</td>
                  <td className="px-4 py-3 text-center text-gray-300">❌</td>
                  <td className="px-4 py-3 text-center text-green-600 font-bold">✅</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Add User Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4 border-b pb-3">
                <h3 className="text-lg font-bold text-gray-900">Add Team Member</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Alex Rivera"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. alex@company.com"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Role & Permission Level</label>
                  <select
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ADMIN">ADMIN (Full Control)</option>
                    <option value="SRE_LEAD">SRE_LEAD (Approver & Policy Admin)</option>
                    <option value="ENGINEER">ENGINEER (Operator & Repair Trigger)</option>
                    <option value="SECURITY_AUDITOR">SECURITY_AUDITOR (Security & Audit Viewer)</option>
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
                    disabled={submitting || !formData.name || !formData.email}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold"
                  >
                    {submitting ? 'Adding...' : 'Add Member'}
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
