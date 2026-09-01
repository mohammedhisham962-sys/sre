'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function RepairCenter() {
  const [isDeploying, setIsDeploying] = useState(false);
  const [status, setStatus] = useState("READY_FOR_APPROVAL");

  const handleApprove = () => {
    setIsDeploying(true);
    setTimeout(() => {
      setStatus("DEPLOYED");
      setIsDeploying(false);
    }, 2000);
  };

  return (
    <main className="p-12 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">AI Repair Sandbox</h1>
        <Link href="/" className="text-blue-600 hover:underline">← Back to Dashboard</Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6 max-w-4xl mx-auto">
        <div className="border-b pb-4 mb-4">
          <h2 className="text-xl font-bold">Incident #1024 - Database Timeout</h2>
          <p className="text-gray-600 mt-2">The AI Orchestrator has generated a repair patch and completed the mandatory testing pipeline.</p>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-50 p-4 rounded border">
            <h3 className="font-bold mb-2">Patch Details</h3>
            <ul className="text-sm space-y-2">
              <li><strong>Branch:</strong> repair/incident-1024</li>
              <li><strong>Files Modified:</strong> 1</li>
              <li><strong>Lines Added:</strong> 4</li>
              <li><strong>Lines Removed:</strong> 1</li>
            </ul>
            <div className="mt-4 p-2 bg-gray-900 text-green-400 text-xs font-mono rounded">
              + MAX_DB_CONNECTIONS = 100<br/>
              - MAX_DB_CONNECTIONS = 20
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded border">
            <h3 className="font-bold mb-2">Pipeline Status</h3>
            <ul className="text-sm space-y-2">
              <li className="flex items-center text-green-700">✓ AI Patch Review: PASSED</li>
              <li className="flex items-center text-green-700">✓ Security Scan: PASSED</li>
              <li className="flex items-center text-green-700">✓ Syntax Validation: PASSED</li>
              <li className="flex items-center text-green-700">✓ Integration Tests: PASSED (150/150)</li>
              <li className="flex items-center text-green-700">✓ Staging Health: PASSED</li>
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-between mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <div>
            <h4 className="font-bold text-yellow-800">Human Approval Required</h4>
            <p className="text-sm text-yellow-700">Production deployment requires explicit authorization.</p>
          </div>
          <div>
            {status === "READY_FOR_APPROVAL" ? (
              <button 
                onClick={handleApprove}
                disabled={isDeploying}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition"
              >
                {isDeploying ? 'Deploying to Prod...' : 'Approve & Deploy'}
              </button>
            ) : (
              <span className="bg-green-100 text-green-800 font-bold py-2 px-6 rounded border border-green-300">
                Deployment Successful
              </span>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
