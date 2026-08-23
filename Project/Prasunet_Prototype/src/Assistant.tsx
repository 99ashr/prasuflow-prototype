import { useEffect, useRef, useState } from 'react';
import { Bot, FileCheck2, Send, Sparkles, X } from 'lucide-react';
import { callAI, getChatSources } from '@/ai';
import type { ChatMessage, Screen } from '@/types';

const SUGGESTED = [
  'Why is UAT recurrence high this sprint?',
  'What scope drift signals are open?',
  'Show me the late-change signals',
  'What is the delivery health score?',
  'Recommend an intervention',
  'What is happening with Northstar?',
];

export function Assistant({ onClose, onNavigate }: { onClose: () => void; onNavigate: (screen: Screen) => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        'I am the Root-Cause Assistant. I answer questions about delivery friction by pulling from the actual workspace data — signals, requirements, UAT defects, and change requests. I always cite my sources. What would you like to investigate?',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  async function send(text: string) {
    const userMsg: ChatMessage = {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await callAI(text);
      const sources = getChatSources(text);
      const aiMsg: ChatMessage = {
        role: 'assistant',
        content: response,
        sources,
        timestamp: new Date().toISOString(),
      };
      setMessages((m) => [...m, aiMsg]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: 'I could not process that request. Please try again.', timestamp: new Date().toISOString() },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed right-6 top-6 z-40 flex h-[calc(100vh-48px)] w-[400px] flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20">
      <div className="flex items-center justify-between border-b border-slate-100 p-5">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-[#0b1e3d] p-2 text-[#5bb5ff]">
            <Bot size={18} />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900">Root-Cause Assistant</div>
            <div className="mt-0.5 flex items-center gap-1 text-[10px] text-emerald-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Grounded in workspace evidence
            </div>
          </div>
        </div>
        <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
          <X size={17} />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-5">
        {messages.map((msg, i) => (
          <div key={i} className={msg.role === 'user' ? 'flex justify-end' : ''}>
            <div
              className={
                msg.role === 'user'
                  ? 'max-w-[85%] rounded-xl rounded-br-sm bg-[#0b1e3d] p-3 text-xs leading-5 text-white'
                  : 'max-w-[90%]'
              }
            >
              {msg.role === 'assistant' && (
                <div className="mb-1 flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  <Sparkles size={10} /> AI-drafted
                </div>
              )}
              <p className={msg.role === 'user' ? '' : 'rounded-xl rounded-tl-sm bg-slate-50 p-3 text-xs leading-5 text-slate-700'}>
                {msg.content}
              </p>
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-2 rounded-lg border border-slate-200 bg-white p-2.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-700">
                    <FileCheck2 size={12} className="text-blue-600" /> Sources used
                  </div>
                  <div className="mt-1.5 space-y-1">
                    {msg.sources.map((src, j) => (
                      <button
                        key={j}
                        onClick={() => onNavigate('intelligence')}
                        className="block w-full text-left text-[10px] text-blue-600 hover:underline"
                      >
                        • {src}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <div className="flex gap-1">
              <span className="h-2 w-2 animate-bounce rounded-full bg-blue-400 [animation-delay:-0.3s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-blue-400 [animation-delay:-0.15s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-blue-400" />
            </div>
            Analyzing workspace evidence...
          </div>
        )}
      </div>

      <div className="border-t border-slate-100 p-4">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {SUGGESTED.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              disabled={loading}
              className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-medium text-slate-500 transition hover:border-blue-200 hover:text-blue-600 disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex gap-2 rounded-lg border border-slate-200 p-2">
          <input
            className="flex-1 bg-transparent px-2 text-xs outline-none"
            placeholder="Ask about delivery evidence..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && input.trim() && !loading) send(input.trim());
            }}
          />
          <button
            onClick={() => input.trim() && !loading && send(input.trim())}
            disabled={loading || !input.trim()}
            className="rounded-md bg-blue-600 p-2 text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            <Send size={13} />
          </button>
        </div>
        <div className="mt-2 text-center text-[9px] text-slate-400">
          Answers are grounded in synthetic workspace evidence
        </div>
      </div>
    </div>
  );
}
