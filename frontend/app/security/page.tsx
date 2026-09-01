'use client';

import Link from 'next/link';

export default function SecurityCenter() {
  return (
    <main className="p-12 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Security Operations</h1>
        <Link href="/" className="text-blue-600 hover:underline">← Back to Dashboard</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border-t-4 border-green-500">
          <h3 className="text-lg font-bold text-gray-700">Dependency Scans</h3>
          <p className="text-3xl font-bold mt-2">0</p>
          <p className="text-sm text-gray-500 mt-1">Critical vulnerabilities</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-t-4 border-green-500">
          <h3 className="text-lg font-bold text-gray-700">Secret Detection</h3>
          <p className="text-3xl font-bold mt-2">0</p>
          <p className="text-sm text-gray-500 mt-1">Exposed secrets found</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-t-4 border-yellow-500">
          <h3 className="text-lg font-bold text-gray-700">SAST Findings</h3>
          <p className="text-3xl font-bold mt-2">2</p>
          <p className="text-sm text-gray-500 mt-1">Low-risk warnings (Review needed)</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold">Recent Security Events</h2>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Target</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Result</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2 mins ago</td>
              <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">Pre-deploy Scan</td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-500">repair/incident-1024</td>
              <td className="px-6 py-4 whitespace-nowrap"><span className="text-green-600 font-bold">PASSED</span></td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">1 hour ago</td>
              <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">Daily Dependency Audit</td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-500">Project Alpha</td>
              <td className="px-6 py-4 whitespace-nowrap"><span className="text-green-600 font-bold">CLEAN</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  );
}
