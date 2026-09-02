'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const email = localStorage.getItem('aigra_user_email');
    setUserEmail(email);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('aigra_token');
    localStorage.removeItem('aigra_user_email');
    setUserEmail(null);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8 md:p-16 bg-gray-50">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        {/* Top Navbar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-4 border-b border-gray-200 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">AIGRA Ops Platform</h1>
            <p className="text-xs text-gray-500 font-sans mt-0.5">Autonomous SRE, DevOps, Testing & Defensive Security</p>
          </div>

          <div className="flex items-center gap-3">
            {userEmail ? (
              <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-sans">
                <span className="h-2 w-2 bg-green-500 rounded-full"></span>
                <span className="font-semibold text-gray-700">{userEmail}</span>
                <button
                  onClick={handleLogout}
                  className="text-red-500 hover:text-red-700 font-bold ml-1"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-sans">
                <Link
                  href="/login"
                  className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-3 py-1.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                >
                  Register
                </Link>
              </div>
            )}

            <Link href="/live-monitor" className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow transition-colors flex items-center gap-2 text-xs font-sans">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400"></span>
              </span>
              Live Monitor
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Projects Card */}
          <Link href="/projects" className="block p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 transition-colors">
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">Projects</h5>
            <p className="font-normal text-gray-700">Manage your monitored websites, APIs, and servers.</p>
          </Link>

          {/* Incidents Card */}
          <Link href="/incidents" className="block p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 transition-colors">
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">Incidents</h5>
            <p className="font-normal text-gray-700">View active alerts and AI root cause analysis.</p>
            <span className="inline-flex items-center justify-center px-2 py-0.5 ms-3 text-xs font-medium text-red-800 bg-red-100 rounded mt-4">View Dashboard</span>
          </Link>

          {/* AI Repair Center Card */}
          <Link href="/repair" className="block p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 transition-colors">
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">AI Repair Sandbox</h5>
            <p className="font-normal text-gray-700">Autonomous repair logs and patch approvals.</p>
            <span className="inline-block mt-4 text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded">Action Required</span>
          </Link>
          
          {/* Security Center Card */}
          <Link href="/security" className="block p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 transition-colors">
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">Security Operations</h5>
            <p className="font-normal text-gray-700">Defensive security scanning and secret detection.</p>
          </Link>

          {/* AI Admin Assistant Card */}
          <Link href="/assistant" className="block p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 transition-colors">
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">AI SRE Assistant</h5>
            <p className="font-normal text-gray-700">Chat with LLaMA-3 for incident triage & runbooks.</p>
            <span className="inline-block mt-4 text-xs font-semibold bg-purple-100 text-purple-800 px-2 py-1 rounded">Interactive Chat</span>
          </Link>

          {/* Settings & System Health Card */}
          <Link href="/settings" className="block p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 transition-colors">
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">System Diagnostics</h5>
            <p className="font-normal text-gray-700">Live PostgreSQL, GitHub, AI, & Worker telemetry.</p>
            <span className="inline-block mt-4 text-xs font-semibold bg-green-100 text-green-800 px-2 py-1 rounded">Live Telemetry</span>
          </Link>

          {/* Forensic Analysis Card */}
          <Link href="/analysis" className="block p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 transition-colors">
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">AI Forensics & Post-Mortems</h5>
            <p className="font-normal text-gray-700">Root-cause analysis and automated SRE incident reports.</p>
            <span className="inline-block mt-4 text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded">RCA Engine</span>
          </Link>

          {/* SRE Team & RBAC Card */}
          <Link href="/users" className="block p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 transition-colors">
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">Team & RBAC Matrix</h5>
            <p className="font-normal text-gray-700">Role-based access control and engineering directory.</p>
            <span className="inline-block mt-4 text-xs font-semibold bg-orange-100 text-orange-800 px-2 py-1 rounded">RBAC Center</span>
          </Link>

          {/* SRE Policy Engine Card */}
          <Link href="/policies" className="block p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 transition-colors">
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">Policy Engine</h5>
            <p className="font-normal text-gray-700">Autonomous healing guardrails & trigger thresholds.</p>
            <span className="inline-block mt-4 text-xs font-semibold bg-indigo-100 text-indigo-800 px-2 py-1 rounded">Guardrails</span>
          </Link>

          {/* Audit Logs Card */}
          <Link href="/audit" className="block p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 transition-colors">
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">Audit Trail</h5>
            <p className="font-normal text-gray-700">Immutable operational event ledger & compliance export.</p>
            <span className="inline-block mt-4 text-xs font-semibold bg-gray-100 text-gray-800 px-2 py-1 rounded">Immutable Stream</span>
          </Link>

          {/* Deployments Card */}
          <Link href="/deployments" className="block p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 transition-colors">
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">Deployments</h5>
            <p className="font-normal text-gray-700">Live GitHub Actions CI/CD pipeline telemetry.</p>
            <span className="inline-block mt-4 text-xs font-semibold bg-teal-100 text-teal-800 px-2 py-1 rounded">CI/CD Tracker</span>
          </Link>

          {/* Human Approvals Card */}
          <Link href="/approvals" className="block p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 transition-colors">
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">Approvals Gateway</h5>
            <p className="font-normal text-gray-700">Human-in-the-loop authorization for production merges.</p>
            <span className="inline-block mt-4 text-xs font-semibold bg-red-100 text-red-800 px-2 py-1 rounded">Human Gateway</span>
          </Link>

          {/* Prometheus & SLO Card */}
          <Link href="/metrics" className="block p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 transition-colors">
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">Prometheus & SLOs</h5>
            <p className="font-normal text-gray-700">Service Level Objectives, Error Budget & Prometheus scrape.</p>
            <span className="inline-block mt-4 text-xs font-semibold bg-green-100 text-green-800 px-2 py-1 rounded">Prometheus Exporter</span>
          </Link>

          {/* Chaos Engineering Card */}
          <Link href="/chaos" className="block p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 transition-colors">
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">Chaos Engineering</h5>
            <p className="font-normal text-gray-700">Inject synthetic latency & 5xx faults to verify resilience.</p>
            <span className="inline-block mt-4 text-xs font-semibold bg-red-100 text-red-800 px-2 py-1 rounded">Fault Injection</span>
          </Link>

          {/* Public Status Page Card */}
          <Link href="/status" className="block p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 transition-colors">
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">Public Status Page</h5>
            <p className="font-normal text-gray-700">Customer-facing uptime bars and incident announcements.</p>
            <span className="inline-block mt-4 text-xs font-semibold bg-emerald-100 text-emerald-800 px-2 py-1 rounded">Customer Facing</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
