'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function TracesPage() {
  const [traces, setTraces] = useState<any[]>([]);
  const [selectedTraceId, setSelectedTraceId] = useState<string>('trc-4982-checkout');
  const [activeTrace, setActiveTrace] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchTraces = () => {
    fetch('/api/v1/traces/recent')
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setTraces(list);
        if (list.length > 0) {
          setSelectedTraceId(list[0].trace_id);
          setActiveTrace(list[0]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching traces:', err);
        setTraces([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTraces();
  }, []);

  const handleSelectTrace = (traceId: string) => {
    setSelectedTraceId(traceId);
    fetch(`/api/v1/traces/${traceId}`)
      .then((res) => res.json())
      .then((data) => setActiveTrace(data))
      .catch((err) => console.error('Error loading trace details:', err));
  };

  return (
    <main className="p-8 md:p-12 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">🔍</span>
            <h1 className="text-3xl font-bold text-gray-900">OpenTelemetry Distributed Tracing</h1>
          </div>
          <p className="text-gray-600 mt-1">
            End-to-end microservice span waterfalls, parent-child trace propagation, and P99 latency bottleneck isolation.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/metrics" className="px-4 py-2 border rounded-lg text-gray-700 bg-white hover:bg-gray-100 text-sm font-medium">
            SLO Dashboard
          </Link>
          <Link href="/" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
            ← Dashboard
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="bg-white p-12 rounded-xl border text-center text-gray-500">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          Ingesting OpenTelemetry trace spans...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Trace Session Selector Sidebar */}
          <div className="space-y-4">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Recent Trace Sessions</h2>
            <div className="space-y-3">
              {traces.map((t) => (
                <button
                  key={t.trace_id}
                  onClick={() => handleSelectTrace(t.trace_id)}
                  className={`w-full text-left p-4 rounded-xl border transition ${
                    selectedTraceId === t.trace_id
                      ? 'bg-blue-50 border-blue-500 shadow-sm'
                      : 'bg-white hover:bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-mono text-xs font-bold text-blue-700">{t.trace_id}</span>
                    <span className={`px-2 py-0.5 text-xs font-bold rounded ${
                      t.bottleneck_detected ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {t.total_duration_ms}ms
                    </span>
                  </div>
                  <div className="text-sm font-bold text-gray-900 mt-1">{t.operation}</div>
                  <div className="text-xs text-gray-500 mt-1 flex justify-between">
                    <span>{t.service}</span>
                    <span>{t.span_count} Spans</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Bottleneck Callout */}
            {activeTrace?.bottleneck_detected && (
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs space-y-1">
                <div className="font-bold text-amber-900 flex items-center gap-1.5">
                  ⚠️ P99 Latency Bottleneck Detected
                </div>
                <p className="text-amber-800">
                  Span <span className="font-mono font-bold text-amber-950">{activeTrace.bottleneck_span}</span> consumed 48% of total transaction duration.
                </p>
              </div>
            )}
          </div>

          {/* Trace Span Waterfall Visualizer */}
          {activeTrace && (
            <div className="lg:col-span-2 space-y-6">
              {/* Trace Overview Card */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4 mb-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded font-bold">
                        {activeTrace.trace_id}
                      </span>
                      <span className="text-xs font-semibold text-gray-500">{activeTrace.timestamp}</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mt-1">{activeTrace.operation}</h2>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-400">Total Duration</div>
                    <div className="text-2xl font-black text-blue-600">{activeTrace.total_duration_ms}ms</div>
                  </div>
                </div>

                {/* Span Waterfall Tree */}
                <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                  📊 Span Waterfall & Execution Timeline
                </h3>
                <div className="space-y-3">
                  {activeTrace.spans?.map((span: any) => {
                    const pctDuration = Math.min(100, Math.round((span.duration_ms / activeTrace.total_duration_ms) * 100));
                    const pctOffset = Math.min(95, Math.round((span.start_offset_ms / activeTrace.total_duration_ms) * 100));

                    return (
                      <div key={span.span_id} className="p-3.5 bg-gray-50 rounded-xl border space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded font-bold">
                              {span.span_id}
                            </span>
                            <span className="font-bold text-gray-900">{span.service}</span>
                            <span className="text-gray-500 font-medium truncate max-w-xs">{span.name}</span>
                          </div>
                          <div className="flex items-center gap-3 font-mono">
                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                              span.status === 'SLOW_QUERY' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {span.status}
                            </span>
                            <span className="font-black text-gray-900">{span.duration_ms}ms</span>
                          </div>
                        </div>

                        {/* Relative Waterfall Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-2 relative overflow-hidden">
                          <div
                            className={`h-2 rounded-full absolute ${span.status === 'SLOW_QUERY' ? 'bg-red-500' : 'bg-blue-600'}`}
                            style={{
                              left: `${pctOffset}%`,
                              width: `${Math.max(6, pctDuration)}%`
                            }}
                          ></div>
                        </div>

                        {/* Attributes Drawer */}
                        {span.attributes && (
                          <div className="font-mono text-[11px] bg-gray-900 text-green-400 p-2 rounded overflow-x-auto">
                            {JSON.stringify(span.attributes)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
