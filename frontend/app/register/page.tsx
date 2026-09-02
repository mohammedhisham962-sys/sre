'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('ENGINEER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Register
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          is_active: true
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Registration failed');
      }

      // 2. Auto-login
      const loginData = new URLSearchParams();
      loginData.append('username', email);
      loginData.append('password', password);

      const loginRes = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: loginData.toString()
      });

      if (loginRes.ok) {
        const tokenData = await loginRes.json();
        localStorage.setItem('aigra_token', tokenData.access_token);
        localStorage.setItem('aigra_user_email', email);
        window.location.href = '/';
      } else {
        window.location.href = '/login';
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8 space-y-6">
        <div className="text-center space-y-1">
          <div className="text-3xl mb-2">🚀</div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Create SRE Account</h2>
          <p className="text-xs text-gray-500">Register a new engineer profile on the AIGRA Ops platform.</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-medium">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jordan Lee"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jordan@company.com"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Role & Permissions</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ENGINEER">ENGINEER (Operator & Repair Trigger)</option>
              <option value="SRE_LEAD">SRE_LEAD (Approver & Policy Admin)</option>
              <option value="SECURITY_AUDITOR">SECURITY_AUDITOR (Security & Audit Viewer)</option>
              <option value="ADMIN">ADMIN (Full Platform Control)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading || !name || !email || !password}
            className="w-full py-2.5 px-4 rounded-lg shadow font-semibold text-sm text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 transition flex justify-center items-center gap-2"
          >
            {loading ? 'Creating Profile...' : 'Register & Launch'}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
          <Link href="/login" className="text-blue-600 hover:underline font-semibold">
            Already have an account? Sign In →
          </Link>
          <Link href="/" className="text-gray-500 hover:underline">
            ← Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
