'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I am the **AIGRA SRE Operations Assistant**. I can help you analyze incident logs, suggest database connection pool optimizations, write runbooks, and diagnose production crashes. How can I assist your team today?',
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    '🔍 Troubleshoot 502 Bad Gateway error',
    '🗄️ Optimal PostgreSQL connection pool settings',
    '🔒 Defensive security checks before git commit',
    '📝 SRE Incident Post-Mortem runbook template'
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend || input).trim();
    if (!messageContent || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: messageContent,
      timestamp: new Date().toLocaleTimeString()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/v1/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.reply || 'No response returned.',
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages([...newMessages, assistantMessage]);
    } catch (err: any) {
      const errorMessage: Message = {
        role: 'assistant',
        content: `⚠️ Error contacting AI Assistant: ${err.message}. Please verify your network connection or backend configuration.`,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages([...newMessages, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <main className="p-6 md:p-12 bg-gray-50 min-h-screen flex flex-col">
      <div className="max-w-4xl mx-auto w-full flex flex-col flex-grow">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2">
              🤖 AI SRE Assistant
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Conversational Incident Triage, Runbook Generation & SRE Advisory
            </p>
          </div>
          <Link href="/" className="text-blue-600 hover:underline font-medium">← Dashboard</Link>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="flex flex-wrap gap-2 mb-4">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              disabled={loading}
              className="text-xs bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-full shadow-sm hover:bg-gray-100 hover:border-blue-400 transition"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat History Container */}
        <div className="flex-grow bg-white rounded-xl shadow-sm border border-gray-200 p-6 overflow-y-auto mb-4 min-h-[450px] max-h-[600px] flex flex-col space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-gray-500">
                  {msg.role === 'user' ? 'You' : 'AIGRA SRE AI'}
                </span>
                {msg.timestamp && (
                  <span className="text-[10px] text-gray-400">{msg.timestamp}</span>
                )}
              </div>
              <div
                className={`p-4 rounded-2xl max-w-[85%] text-sm leading-relaxed whitespace-pre-wrap font-sans ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none shadow'
                    : 'bg-gray-100 text-gray-800 rounded-bl-none border border-gray-200 font-mono text-xs'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex flex-col items-start">
              <span className="text-xs font-semibold text-gray-500 mb-1">AIGRA SRE AI</span>
              <div className="bg-gray-100 p-4 rounded-2xl rounded-bl-none border border-gray-200 text-xs text-gray-500 flex items-center gap-2">
                <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce"></div>
                <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce delay-100"></div>
                <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce delay-200"></div>
                <span>Analyzing infrastructure telemetry & generating response...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Message Input Box */}
        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything (e.g. 'How do I debug high CPU in FastAPI?' or paste an error stack trace)..."
            rows={2}
            className="flex-grow p-2 resize-none text-sm text-gray-800 placeholder-gray-400 focus:outline-none bg-transparent"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!input.trim() || loading}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg shadow transition flex items-center gap-2 text-sm"
          >
            <span>Send</span>
            <span>➤</span>
          </button>
        </div>
      </div>
    </main>
  );
}
