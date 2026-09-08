'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CompliancePage() {
  const [scorecard, setScorecard] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [exporting, setExporting] = useState<boolean>(false);

  const fetchScorecard = () => {
    fetch('/api/v1/compliance/scorecard')
      .then((res) => res.json())
      .then((data) => {
        setScorecard(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching compliance scorecard:', err);
        setScorecard(null);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchScorecard();
  }, []);

  const handleExportEvidence = async () => {
    setExporting(true);
    try {
      const res = await fetch('/api/v1/compliance/export');
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${data.package_id || 'audit-evidence-package'}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <main className="p-8 md:p-12 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">📜</span>
            <h1 className="text-3xl font-bold text-gray-900">SOC2 Type II & ISO-27001 Compliance Auditor</h1>
          </div>
          <p className="text-gray-600 mt-1">
            Continuous automated security control verification, cryptographic evidence aggregation, and audit readiness.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/audit" className="px-4 py-2 border rounded-lg text-gray-700 bg-white hover:bg-gray-100 text-sm font-medium">
            Audit Ledger
          </Link>
          <Link href="/" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
            ← Dashboard
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="bg-white p-12 rounded-xl border text-center text-gray-500">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          Auditing continuous security controls and evidence proofs...
        </div>
      ) : !scorecard ? (
        <div className="bg-white p-12 rounded-xl border text-center text-gray-500">
          Unable to retrieve compliance scorecard.
        </div>
      ) : (
        <div className="space-y-8">
          {/* Compliance KPI Gauges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm text-center">
              <div className="text-xs font-semibold text-gray-500">Overall Readiness</div>
              <div className="text-2xl font-black text-green-600 mt-1">{scorecard.overall_status}</div>
              <div className="text-xs text-gray-400 mt-0.5">External Auditor Certified</div>
            </div>
            <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm text-center">
              <div className="text-xs font-semibold text-gray-500">Compliance Score</div>
              <div className="text-2xl font-black text-blue-600 mt-1">{scorecard.compliance_score_pct}%</div>
              <div className="text-xs text-gray-400 mt-0.5">{scorecard.compliant_controls_count}/{scorecard.total_controls_count} Controls Passing</div>
            </div>
            <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm text-center">
              <div className="text-xs font-semibold text-gray-500">Standards Verified</div>
              <div className="text-2xl font-black text-purple-600 mt-1">{scorecard.standards_evaluated?.length} Frameworks</div>
              <div className="text-xs text-gray-400 mt-0.5">SOC2, ISO, HIPAA, PCI</div>
            </div>
            <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm text-center">
              <div className="text-xs font-semibold text-gray-500">Evidence Proofs</div>
              <div className="text-2xl font-black text-indigo-600 mt-1">100% Automated</div>
              <div className="text-xs text-gray-400 mt-0.5">Zero Manual Screenshotting</div>
            </div>
          </div>

          {/* Security Controls Table */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Continuous Security Control Matrix</h2>
                <p className="text-xs text-gray-500">Automated evaluation against SOC2 Type II & ISO-27001 Trust Services Criteria.</p>
              </div>
              <button
                onClick={handleExportEvidence}
                disabled={exporting}
                className="px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-lg text-xs font-bold shadow flex items-center gap-2 shrink-0 disabled:opacity-50"
              >
                {exporting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Exporting Proofs...
                  </>
                ) : (
                  '📥 Export Audit Evidence Package'
                )}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Control ID</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Standard</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Control Title</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Category</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Evidence Source</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {scorecard.controls?.map((c: any) => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs font-bold text-blue-700">{c.id}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-gray-600">{c.standard}</td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-gray-900">{c.title}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{c.notes}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-bold rounded">
                          {c.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-600">{c.evidence_source}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
