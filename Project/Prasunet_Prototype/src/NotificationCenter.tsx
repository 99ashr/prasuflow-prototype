import { useState } from 'react';
import { Bell, X, AlertCircle, CheckCircle2, Clock, Mail } from 'lucide-react';
import { notifications as initialNotifications } from '@/data';
import type { Notification, Screen } from '@/types';

export function NotificationCenter({ open, onClose, onNavigate }: { open: boolean; onClose: () => void; onNavigate: (screen: Screen) => void }) {
  const [items, setItems] = useState<Notification[]>(initialNotifications);

  function markRead(id: string) {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }

  function markAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  if (!open) return null;
  const unread = items.filter((n) => !n.read).length;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="fixed right-8 top-20 z-50 w-96 rounded-xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 p-4">
          <div className="flex items-center gap-2">
            <Bell size={16} className="text-slate-600" />
            <span className="text-sm font-semibold text-slate-900">Notifications</span>
            {unread > 0 && <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-[9px] font-bold text-white">{unread}</span>}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={markAllRead} className="text-[10px] font-bold text-blue-600 hover:underline">Mark all read</button>
            <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"><X size={16} /></button>
          </div>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {items.map((n) => {
            const icon = n.type === 'signal' ? <AlertCircle size={15} className="text-rose-500" /> :
              n.type === 'approval' ? <Clock size={15} className="text-amber-500" /> :
              n.type === 'sla' ? <AlertCircle size={15} className="text-amber-500" /> :
              <Mail size={15} className="text-blue-500" />;
            return (
              <button
                key={n.id}
                onClick={() => markRead(n.id)}
                className={`flex w-full items-start gap-3 border-b border-slate-50 p-4 text-left transition hover:bg-slate-50 ${!n.read ? 'bg-blue-50/30' : ''}`}
              >
                <div className={`mt-0.5 ${!n.read ? '' : 'opacity-50'}`}>{icon}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-800">{n.title}</span>
                    {!n.read && <span className="h-2 w-2 rounded-full bg-blue-500" />}
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">{n.detail}</p>
                  <span className="mt-1 text-[10px] text-slate-400">{n.time}</span>
                </div>
              </button>
            );
          })}
        </div>
        <div className="border-t border-slate-100 p-3 text-center">
          <button onClick={() => { onClose(); onNavigate('governance'); }} className="flex w-full items-center justify-center gap-1 text-[11px] font-bold text-slate-500 hover:text-blue-600">
            <CheckCircle2 size={13} /> View all in governance log
          </button>
        </div>
      </div>
    </>
  );
}
