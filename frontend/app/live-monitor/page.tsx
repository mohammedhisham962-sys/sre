'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function LiveMonitor() {
  const [logs, setLogs] = useState<string[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Connect to the WebSocket
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/stream`;
    
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      setIsConnected(true);
      setLogs((prev) => [...prev, '🟢 SYSTEM: Real-time WebSocket connection established.']);
    };

    wsRef.current.onmessage = (event) => {
      setLogs((prev) => [...prev, `🔥 SERVER: ${event.data}`]);
    };

    wsRef.current.onclose = () => {
      setIsConnected(false);
      setLogs((prev) => [...prev, '🔴 SYSTEM: Connection closed.']);
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom of logs
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim() && wsRef.current && isConnected) {
      setLogs((prev) => [...prev, `📤 YOU: ${inputMessage}`]);
      wsRef.current.send(inputMessage);
      setInputMessage('');
    }
  };

  return (
    <main className="p-8 bg-gray-900 min-h-screen text-gray-100 font-mono">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <span className="text-blue-500">⚡</span> Live Stream Monitor
            </h1>
            <p className="text-gray-400 mt-2 text-sm">Real-time WebSocket connection to Python Backend</p>
          </div>
          <div className="flex items-center gap-4">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${isConnected ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-red-500/20 text-red-400 border border-red-500/50'}`}>
              {isConnected ? '● CONNECTED' : '○ DISCONNECTED'}
            </span>
            <Link href="/" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-md text-sm border border-gray-700 transition-colors">
              ← Dashboard
            </Link>
          </div>
        </div>

        {/* Terminal Window */}
        <div className="bg-black border border-gray-800 rounded-lg shadow-2xl overflow-hidden flex flex-col h-[60vh]">
          {/* Terminal Header */}
          <div className="bg-gray-800 px-4 py-2 flex items-center gap-2 border-b border-gray-700">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="ml-2 text-xs text-gray-400 font-sans">wss://sre-4vhw.onrender.com/ws/stream</span>
          </div>
          
          {/* Log Output */}
          <div className="flex-1 p-4 overflow-y-auto font-mono text-sm space-y-2">
            {logs.map((log, index) => (
              <div 
                key={index} 
                className={`${log.startsWith('🟢') ? 'text-green-400' : log.startsWith('🔴') ? 'text-red-400' : log.startsWith('📤') ? 'text-blue-400' : 'text-yellow-400'}`}
              >
                <span className="opacity-50 mr-2">[{new Date().toLocaleTimeString()}]</span>
                {log}
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={sendMessage} className="p-4 bg-gray-900 border-t border-gray-800 flex gap-2">
            <span className="text-green-500 font-bold self-center">❯</span>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Send a real-time event or diagnostic ping to backend..."
              disabled={!isConnected}
              className="flex-1 bg-transparent border-none outline-none text-white focus:ring-0 placeholder-gray-600"
            />
            <button 
              type="submit" 
              disabled={!isConnected || !inputMessage.trim()}
              className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded transition-colors disabled:opacity-50"
            >
              SEND
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
