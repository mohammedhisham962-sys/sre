'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function RepairCenter() {
  const [prs, setPrs] = useState<any[]>([]);
  const [repo, setRepo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/repairs/pull-requests')
      .then(res => res.json())
      .then(data => {
        setPrs(data.prs || []);
        setRepo(data.repo);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch PRs:", err);
        setLoading(false);
      });
  }, []);

  return (
    <main className="p-12 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">AI Repair Sandbox</h1>
        <Link href="/" className="text-blue-600 hover:underline">← Back to Dashboard</Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6 max-w-4xl mx-auto">
        <div className="border-b pb-4 mb-4">
          <h2 className="text-xl font-bold">Pending Pull Requests</h2>
          <p className="text-gray-600 mt-2">
            These are real Pull Requests opened by the AI Orchestrator on your GitHub repository.
            Review the code and check the CI/CD pipeline results on GitHub before merging.
          </p>
          {repo && <p className="text-sm font-mono mt-2 bg-gray-100 p-2 rounded inline-block">Repository: {repo}</p>}
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading live Pull Requests from GitHub API...</div>
        ) : prs.length === 0 ? (
          <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
            No active Pull Requests found on this repository.
          </div>
        ) : (
          <div className="space-y-6">
            {prs.map((pr: any) => (
              <div key={pr.id} className="border border-gray-200 rounded-lg p-6 bg-gray-50 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{pr.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Opened by <span className="font-semibold">{pr.user?.login || 'AIGRA'}</span> • Branch: <code>{pr.head?.ref}</code>
                    </p>
                  </div>
                  <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full border border-blue-200">
                    Needs Human Review
                  </span>
                </div>
                
                <div className="bg-gray-900 text-gray-300 text-xs font-mono p-4 rounded mb-4 whitespace-pre-wrap">
                  {pr.body || "No description provided."}
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    <span className="font-bold text-gray-800">Status:</span> GitHub Actions CI pipeline running...
                  </div>
                  <a 
                    href={pr.html_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-gray-900 hover:bg-gray-800 text-white font-bold py-2 px-6 rounded transition flex items-center gap-2"
                  >
                    View on GitHub ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
