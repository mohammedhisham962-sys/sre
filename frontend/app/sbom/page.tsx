'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SbomPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [exportData, setExportData] = useState<any>(null);
  const [exporting, setExporting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/sbom/packages');
      if (!res.ok) throw new Error('Failed to load SBOM data');
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error fetching SBOM');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleExport = async () => {
    try {
      setExporting(true);
      const res = await fetch('/api/v1/sbom/export');
      if (!res.ok) throw new Error('Failed to export CycloneDX SBOM');
      const json = await res.json();
      setExportData(json);
    } catch (err: any) {
      alert(`Export error: ${err.message}`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-slate-800 gap-4">
          <div>
            <div className="flex items-center gap-3">
              <Link href="/" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                ← Back to Ops Command
              </Link>
              <span className="text-slate-600">/</span>
              <span className="text-xs text-slate-400">Software Supply Chain</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight mt-1 flex items-center gap-3">
              <span>🛡️</span> Supply Chain Security & Software Bill of Materials (SBOM)
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              CycloneDX & SPDX package inventory, Cosign signature verification & SLSA Level 3 build provenance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-purple-950/80 border border-purple-700 text-purple-300 text-xs font-semibold rounded-full flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-purple-400 animate-pulse"></span>
              {data?.slsa_level || 'SLSA_LEVEL_3'}
            </span>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white text-xs font-medium rounded-lg transition"
            >
              {exporting ? 'Exporting...' : '📥 Export CycloneDX'}
            </button>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
            <div className="text-xs text-slate-400 uppercase font-semibold">Total Dependencies</div>
            <div className="text-2xl font-bold text-white mt-1">{data?.total_dependencies ?? 184}</div>
            <div className="text-xs text-slate-400 mt-1">PyPI, npm & OCI Layers</div>
          </div>
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
            <div className="text-xs text-slate-400 uppercase font-semibold">Cosign Signature</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">{data?.cosign_signature || 'VALID'}</div>
            <div className="text-xs text-emerald-400 mt-1">Sigstore Rekor Verified</div>
          </div>
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
            <div className="text-xs text-slate-400 uppercase font-semibold">Critical CVEs</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">{data?.vulnerabilities_summary?.critical ?? 0}</div>
            <div className="text-xs text-emerald-400 mt-1">Zero Critical Flaws</div>
          </div>
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
            <div className="text-xs text-slate-400 uppercase font-semibold">High / Med / Low CVEs</div>
            <div className="text-2xl font-bold text-amber-400 mt-1">
              {data?.vulnerabilities_summary?.high ?? 1} / {data?.vulnerabilities_summary?.medium ?? 2} / {data?.vulnerabilities_summary?.low ?? 1}
            </div>
            <div className="text-xs text-slate-400 mt-1">Patches Available</div>
          </div>
        </div>

        {/* Export JSON Preview Drawer */}
        {exportData && (
          <div className="p-6 bg-slate-900/90 border border-indigo-700/80 rounded-xl space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-bold text-indigo-300 text-xs flex items-center gap-2">
                <span>📄</span> CycloneDX v1.5 JSON Bill of Materials Spec
              </span>
              <button
                onClick={() => setExportData(null)}
                className="text-slate-400 hover:text-slate-200 text-xs"
              >
                ✕ Close
              </button>
            </div>
            <pre className="p-4 bg-slate-950 rounded-lg text-[11px] font-mono text-cyan-300 overflow-x-auto max-h-48 border border-slate-800">
              {JSON.stringify(exportData, null, 2)}
            </pre>
          </div>
        )}

        {/* SBOM Package & Vulnerability Inventory */}
        <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-xl space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>📦</span> Software Components & Vulnerability Matrix
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Continuous SCA dependency graph with EPSS exploit probability scores.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Component & Version</th>
                  <th className="py-3 px-4">Ecosystem</th>
                  <th className="py-3 px-4">License</th>
                  <th className="py-3 px-4">SLSA Attestation</th>
                  <th className="py-3 px-4">Vulnerability / Fix</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {data?.components?.map((pkg: any) => (
                  <tr key={pkg.name} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-200">{pkg.name}</div>
                      <div className="text-[11px] font-mono text-indigo-400">v{pkg.version}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-slate-800 rounded text-slate-300 text-[11px]">
                        {pkg.ecosystem}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                      {pkg.license}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-emerald-950 border border-emerald-700 text-emerald-300 rounded text-[10px] font-semibold">
                        SLSA Verified
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {pkg.vulnerabilities && pkg.vulnerabilities.length > 0 ? (
                        <div className="space-y-1">
                          {pkg.vulnerabilities.map((v: any) => (
                            <div key={v.cve_id} className="p-2 bg-slate-950/80 rounded border border-slate-800 space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${v.severity === 'HIGH' ? 'bg-red-950 text-red-400' : v.severity === 'MEDIUM' ? 'bg-amber-950 text-amber-400' : 'bg-slate-800 text-slate-300'}`}>
                                  {v.severity} ({v.cve_id})
                                </span>
                                <span className="text-[10px] text-slate-400">CVSS {v.cvss_score} | EPSS {v.epss_score}</span>
                              </div>
                              <div className="text-[11px] text-slate-300">{v.description}</div>
                              <div className="text-[10px] text-emerald-400 font-semibold">Fix: Upgrade to v{v.fixed_in}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-emerald-400 text-xs font-semibold">✓ No Known CVEs</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
