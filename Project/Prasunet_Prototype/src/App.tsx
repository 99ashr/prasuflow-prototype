import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Bell,
  Bot,
  BrainCircuit,
  ChevronDown,
  ChevronRight,
  Command,
  Database,
  FileText,
  GitBranch,
  Goal,
  LayoutDashboard,
  Network,
  Settings2,
  ShieldCheck,
  Sparkles,
  Target,
  ClipboardCheck,
  BookOpen,
  Grid3x3,
  Users,
  RotateCcw,
} from 'lucide-react';
import type { Screen, Signal } from './types';
import { StoreProvider, useStore } from './store';
import { Overview } from './screens/Overview';
import { Intelligence, EvidenceModal } from './screens/Intelligence';
import { Portfolio, Blueprint } from './screens/Portfolio';
import { Value } from './screens/Value';
import { Governance } from './screens/Governance';
import { Setup, MapScreen } from './screens/SetupMap';
import { Meeting } from './screens/Meeting';
import { Legacy } from './screens/Legacy';
import { Impact } from './screens/Impact';
import { Readiness } from './screens/Readiness';
import { CaseStudy } from './screens/CaseStudy';
import { RiskHeatmap } from './screens/RiskHeatmap';
import { TeamPerformance } from './screens/TeamPerformance';
import { Assistant } from './Assistant';
import { NotificationCenter } from './NotificationCenter';
import { ToastContainer } from './Toast';

type LucideIcon = typeof Activity;
type NavItem = [Screen, string, LucideIcon];

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: 'Command center',
    items: [
      ['overview', 'Executive overview', LayoutDashboard],
      ['intelligence', 'Friction intelligence', BrainCircuit],
      ['portfolio', 'Opportunity portfolio', Target],
      ['value', 'Value & client trust', Goal],
    ],
  },
  {
    label: 'Delivery workspace',
    items: [
      ['setup', 'Process setup', Settings2],
      ['map', 'Current-state map', Network],
      ['meeting', 'Meeting intelligence', FileText],
      ['legacy', 'Legacy knowledge base', Database],
    ],
  },
  {
    label: 'Tools',
    items: [
      ['impact', 'Change Impact Simulator', GitBranch],
      ['readiness', 'Upgrade Readiness', ClipboardCheck],
      ['casestudy', 'Case Study Generator', BookOpen],
      ['heatmap', 'Risk Heatmap', Grid3x3],
      ['team', 'Team Performance', Users],
      ['blueprint', 'Transformation Blueprint', Sparkles],
    ],
  },
  {
    label: 'Control plane',
    items: [['governance', 'Governance & audit', ShieldCheck]],
  },
];

const titles: Record<Screen, [string, string]> = {
  overview: ['Executive overview', 'Delivery performance at a glance'],
  intelligence: ['Friction intelligence', 'Evidence-backed signals across active engagements'],
  portfolio: ['Opportunity portfolio', 'Ranked interventions with transparent scoring'],
  blueprint: ['Transformation blueprint', 'From recommended action to adopted process'],
  value: ['Value & client trust', 'Measured outcomes, ready for the client conversation'],
  governance: ['Governance & audit', 'Human decisions behind every AI suggestion'],
  setup: ['Process setup', 'Configure the delivery process being monitored'],
  map: ['Current-state delivery map', 'Reconstructed from synthetic event evidence'],
  meeting: ['Meeting intelligence', 'Turn fragmented notes into governed minutes'],
  legacy: ['Legacy knowledge base', 'Developer-ready system references, grounded in source material'],
  impact: ['Change Impact Simulator', 'Model delivery impact before committing a change'],
  readiness: ['System Upgrade Readiness', 'Generate a pre-upgrade checklist from a description'],
  casestudy: ['Case Study Generator', 'Turn engagement outcomes into a client-ready story'],
  heatmap: ['Risk Heatmap', 'Plot signals by likelihood and impact to prioritize mitigation'],
  team: ['Team Performance', 'Track decision velocity and on-time rate across the delivery team'],
};

function Sidebar({ screen, setScreen }: { screen: Screen; setScreen: (s: Screen) => void }) {
  const { signals } = useStore();
  const openSignalCount = signals.filter((s) => !s.approved).length;
  return (
    <aside className="flex w-[252px] shrink-0 flex-col bg-[#0b1e3d] text-white">
      <div className="flex h-[76px] items-center gap-3 border-b border-white/10 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2e9bef] shadow-lg shadow-blue-900/30">
          <Activity size={20} strokeWidth={2.5} />
        </div>
        <div>
          <div className="text-[15px] font-bold tracking-tight">
            PrasuFlow<span className="text-[#5bb5ff]"> AI</span>
          </div>
          <div className="mt-0.5 text-[9px] font-semibold uppercase tracking-[.18em] text-slate-400">
            Delivery intelligence
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-5">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-5">
            <div className="mb-2 px-3 text-[9px] font-bold uppercase tracking-[.2em] text-slate-500">
              {group.label}
            </div>
            {group.items.map(([id, label, IconComponent]) => (
              <button
                key={id}
                onClick={() => setScreen(id)}
                className={`group mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs font-medium transition ${
                  screen === id
                    ? 'bg-white/10 text-white shadow-inner'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <IconComponent
                  size={16}
                  className={screen === id ? 'text-[#5bb5ff]' : 'text-slate-500 group-hover:text-slate-300'}
                />
                <span>{label}</span>
                {id === 'intelligence' && openSignalCount > 0 && (
                  <span className="ml-auto rounded bg-rose-400/15 px-1.5 py-0.5 text-[9px] font-bold text-rose-300">
                    {openSignalCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        ))}
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-300">
            <ShieldCheck size={14} className="text-emerald-400" /> Governed AI
          </div>
          <p className="mt-2 text-[11px] leading-5 text-slate-500">
            Every suggestion is traceable to evidence and routed to a named human.
          </p>
        </div>
      </div>
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Prasunethon 2.0</span>
          <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px]">DEMO</span>
        </div>
        <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-500">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Workspace connected
        </div>
      </div>
    </aside>
  );
}

function Header({
  screen,
  onAssistant,
  onNotifications,
  onReset,
  unreadCount,
}: {
  screen: Screen;
  onAssistant: () => void;
  onNotifications: () => void;
  onReset: () => void;
  unreadCount: number;
}) {
  const { role, setRole } = useStore();
  return (
    <header className="flex min-h-[76px] items-center justify-between border-b border-slate-200 bg-white px-8">
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>PrasuFlow workspace</span>
          <ChevronRight size={13} />
          <span className="text-slate-600">{titles[screen][0]}</span>
        </div>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
          {titles[screen][1]}
        </h1>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onAssistant}
          className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:text-blue-700 lg:flex"
        >
          <Command size={14} /> Ask Root-Cause Assistant{' '}
          <span className="rounded bg-white px-1.5 py-0.5 text-[10px] text-slate-400">⌘ K</span>
        </button>
        <button onClick={onReset} title="Reset demo workspace" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
          <RotateCcw size={17} />
        </button>
        <button onClick={onNotifications} className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100">
          <Bell size={18} />
          {unreadCount > 0 && <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-rose-500" />}
        </button>
        <div className="h-8 w-px bg-slate-200" />
        <div className="relative">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-8 text-xs font-semibold text-slate-700 outline-none"
          >
            <option>PM</option>
            <option>Developer</option>
            <option>Client Sponsor</option>
            <option>Governance Authority</option>
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute right-2 top-2.5 text-slate-400" />
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0b1e3d] text-xs font-bold text-white">
          {role === 'PM' ? 'PM' : role === 'Developer' ? 'DV' : role === 'Client Sponsor' ? 'CS' : 'GA'}
        </div>
      </div>
    </header>
  );
}

function AppInner() {
  const [screen, setScreen] = useState<Screen>('overview');
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);
  const [assistant, setAssistant] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { signals, resetDemoState, engineResult } = useStore();

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setAssistant((a) => !a);
      }
      if (e.key === 'Escape') {
        setAssistant(false);
        setNotifOpen(false);
      }
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const unreadCount = useMemo(() => signals.filter((s) => !s.approved).length, [signals]);

  const render = useMemo(() => {
    switch (screen) {
      case 'overview':
        return <Overview setScreen={setScreen} onSignal={setSelectedSignal} />;
      case 'intelligence':
        return <Intelligence onSignal={setSelectedSignal} onNavigate={setScreen} />;
      case 'portfolio':
        return <Portfolio setScreen={setScreen} />;
      case 'blueprint':
        return <Blueprint setScreen={setScreen} />;
      case 'value':
        return <Value setScreen={setScreen} />;
      case 'governance':
        return <Governance />;
      case 'setup':
        return <Setup setScreen={setScreen} />;
      case 'map':
        return <MapScreen />;
      case 'meeting':
        return <Meeting setScreen={setScreen} />;
      case 'legacy':
        return <Legacy />;
      case 'impact':
        return <Impact />;
      case 'readiness':
        return <Readiness />;
      case 'casestudy':
        return <CaseStudy />;
      case 'heatmap':
        return <RiskHeatmap setScreen={setScreen} onSignal={setSelectedSignal} />;
      case 'team':
        return <TeamPerformance setScreen={setScreen} />;
      default:
        return <Overview setScreen={setScreen} onSignal={setSelectedSignal} />;
    }
  }, [screen]);

  return (
    <div className="flex min-h-screen bg-[#f5f7fa]">
      <Sidebar screen={screen} setScreen={setScreen} />
      <main className="min-w-0 flex-1">
        <Header
          screen={screen}
          onAssistant={() => setAssistant(true)}
          onNotifications={() => setNotifOpen((o) => !o)}
          onReset={() => {
            if (window.confirm('Reset all demo decisions, drafts, and adopted actions?')) void resetDemoState();
          }}
          unreadCount={unreadCount}
        />
        <div className="flex items-center justify-end gap-2 border-b border-slate-100 bg-white px-8 py-2 text-[10px] text-slate-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Intelligence engine active · {engineResult.ruleCount} rules · {engineResult.evidence.length} evidence records · {engineResult.signalCount} detected signals
        </div>
        {render}
      </main>
      {selectedSignal && (
        <EvidenceModal
          signal={selectedSignal}
          close={() => setSelectedSignal(null)}
          onNavigate={setScreen}
        />
      )}
      {assistant && <Assistant onClose={() => setAssistant(false)} onNavigate={setScreen} />}
      <NotificationCenter open={notifOpen} onClose={() => setNotifOpen(false)} onNavigate={setScreen} />
      <ToastContainer />
      <button
        onClick={() => setAssistant(true)}
        className="fixed bottom-6 right-6 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-[#0b1e3d] text-[#5bb5ff] shadow-xl shadow-slate-900/20 transition hover:scale-105"
      >
        <Bot size={20} />
      </button>
    </div>
  );
}

function App() {
  return (
    <StoreProvider>
      <AppInner />
    </StoreProvider>
  );
}

export default App;
