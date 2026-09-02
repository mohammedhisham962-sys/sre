'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString()
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Invalid email or password');
      }

      const data = await res.json();
      localStorage.setItem('aigra_token', data.access_token);
      localStorage.setItem('aigra_user_email', email);
      
      // Redirect to dashboard
      window.location.href = '/';
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAdmin = () => {
    setEmail('admin@aigra.ops');
    setPassword('adminPass123!');
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8 space-y-6">
        <div className="text-center space-y-1">
          <div className="text-3xl mb-2">🛡️</div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">AIGRA Ops Login</h2>
          <p className="text-xs text-gray-500">Sign in with your engineering account or use the demo credentials below.</p>
        </div>

        {/* Demo Credentials Quick Fill Button */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex justify-between items-center text-xs">
          <div>
            <span className="font-bold text-blue-900 block">Demo Admin Account</span>
            <span className="text-blue-700 font-mono">admin@aigra.ops</span>
          </div>
          <button
            type="button"
            onClick={fillDemoAdmin}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs transition"
          >
            Auto-Fill
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-medium">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@aigra.ops"
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

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full py-2.5 px-4 rounded-lg shadow font-semibold text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition flex justify-center items-center gap-2"
          >
            {loading ? 'Authenticating...' : 'Sign In to Platform'}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
          <Link href="/register" className="text-blue-600 hover:underline font-semibold">
            Create an Account →
          </Link>
          <Link href="/" className="text-gray-500 hover:underline">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
