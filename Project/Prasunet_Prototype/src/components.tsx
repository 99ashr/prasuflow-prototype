import type { ReactNode } from 'react';
import { Check, ChevronDown, ChevronRight, Database, Sparkles, X } from 'lucide-react';
import { useState } from 'react';

export function Badge({
  children,
  tone = 'slate',
}: {
  children: ReactNode;
  tone?: 'slate' | 'blue' | 'green' | 'amber' | 'red';
}) {
  const styles: Record<string, string> = {
    slate: 'bg-slate-100 text-slate-600',
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    red: 'bg-rose-50 text-rose-700',
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-[.08em] ${styles[tone]}`}
    >
      {children}
    </span>
  );
}

export function AITag({ approved, approver }: { approved: boolean; approver?: string }) {
  if (approved) {
    return (
      <Badge tone="green">
        <Check size={11} /> Approved by {approver || 'PM'}
      </Badge>
    );
  }
  return (
    <Badge tone="blue">
      <Sparkles size={11} /> AI-drafted — review required
    </Badge>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white ${className}`}>{children}</div>
  );
}

export function SectionHeader({
  icon,
  title,
  subtitle,
  right,
}: {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          {icon} {title}
        </div>
        {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

export function TraceableNumber({
  value,
  label,
  formula,
}: {
  value: string | number;
  label: string;
  formula?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="group flex items-center gap-1 text-left"
      >
        <span className="text-3xl font-semibold tracking-tight text-slate-900">{value}</span>
        <ChevronDown size={14} className="text-slate-300 group-hover:text-blue-500" />
      </button>
      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</div>
      {open && formula && (
        <div className="absolute z-20 mt-2 w-64 rounded-lg border border-slate-200 bg-white p-3 text-[11px] leading-5 text-slate-600 shadow-lg">
          <div className="mb-1 flex items-center gap-1 font-bold text-slate-700">
            <Database size={12} className="text-blue-600" /> How this was calculated
          </div>
          {formula}
        </div>
      )}
    </div>
  );
}

export function ExpandableNote({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 p-2">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-blue-600"
      >
        <ChevronRight
          size={12}
          className={`transition ${open ? 'rotate-90' : ''}`}
        />
        How this was generated
      </button>
      {open && <div className="mt-2 text-[11px] leading-5 text-slate-500">{children}</div>}
    </div>
  );
}

export function Modal({
  children,
  onClose,
  maxWidth = 'max-w-2xl',
}: {
  children: ReactNode;
  onClose: () => void;
  maxWidth?: string;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#07152d]/50 p-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`max-h-[90vh] w-full ${maxWidth} overflow-y-auto rounded-2xl bg-white shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export function ModalHeader({ title, subtitle, onClose }: { title: string; subtitle?: string; onClose: () => void }) {
  return (
    <div className="flex items-start justify-between border-b border-slate-100 p-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">{title}</h2>
        {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
      </div>
      <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
        <X size={18} />
      </button>
    </div>
  );
}

export function ScoreRing({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 42;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? '#16a34a' : score >= 60 ? '#1685d8' : '#e11d48';
  return (
    <div className="relative h-32 w-32">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r="42" fill="none" stroke="#e8eef4" strokeWidth="8" />
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-semibold tracking-tight text-slate-900">{score}</span>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">of 100</span>
      </div>
    </div>
  );
}

export function Sparkline({ color = '#1e88e5', height = 54 }: { color?: string; height?: number }) {
  return (
    <svg viewBox="0 0 260 64" className="w-full" style={{ height }} preserveAspectRatio="none">
      <path
        d="M0 50 C18 48, 24 39, 42 43 S70 53, 83 37 S110 29, 126 35 S151 30, 164 25 S189 40, 202 24 S222 17, 236 22 S249 10, 260 8"
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M0 50 C18 48, 24 39, 42 43 S70 53, 83 37 S110 29, 126 35 S151 30, 164 25 S189 40, 202 24 S222 17, 236 22 S249 10, 260 8 L260 64 L0 64Z"
        fill={color}
        opacity=".08"
      />
    </svg>
  );
}
