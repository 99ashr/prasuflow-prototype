import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { signals as seedSignals, auditEntries as seedAudit, portfolioActions, requirements, uatDefects, changeRequests, meetingNotes, kpis } from '@/data';
import type { Signal, AuditEntry } from '@/types';
import { runDetectionEngine, type EngineResult } from '@/engine';
import { supabase } from '@/lib/supabase';

type Toast = { id: string; message: string; tone: 'success' | 'error' | 'info' };

type DraftEmail = {
  id: string;
  subject: string;
  body: string;
  engagement: string;
  meetingDate: string;
  sent: boolean;
  createdAt: string;
};

type Store = {
  signals: Signal[];
  auditEntries: AuditEntry[];
  drafts: DraftEmail[];
  adoptedActions: Record<string, boolean>;
  role: string;
  setRole: (r: string) => void;
  decideSignal: (signalId: string, decision: 'Approved' | 'Rejected' | 'Modified', by: string) => void;
  addDraft: (draft: Omit<DraftEmail, 'id' | 'createdAt' | 'sent'>) => DraftEmail;
  sendDraft: (id: string) => void;
  deleteDraft: (id: string) => void;
  toggleAdopted: (actionName: string, by: string) => void;
  toasts: Toast[];
  pushToast: (message: string, tone?: Toast['tone']) => void;
  dismissToast: (id: string) => void;
  resetDemoState: () => Promise<void>;
  engineResult: EngineResult;
};

const Ctx = createContext<Store | null>(null);

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [signals, setSignals] = useState<Signal[]>(seedSignals);
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>(seedAudit);
  const [drafts, setDrafts] = useState<DraftEmail[]>([]);
  const [adoptedActions, setAdoptedActions] = useState<Record<string, boolean>>({});
  const [role, setRole] = useState('PM');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const engineResult = useMemo(
    () => runDetectionEngine({ requirements, uatDefects, changeRequests, meetingNotes, kpis, signals }),
    [signals]
  );

  // Load persisted state from Supabase on mount
  useEffect(() => {
    (async () => {
      try {
        const [{ data: dbSignals }, { data: dbAudit }, { data: dbDrafts }, { data: dbAdopted }] = await Promise.all([
          supabase.from('signal_decisions').select('*'),
          supabase.from('audit_entries').select('*').order('created_at', { ascending: false }),
          supabase.from('meeting_drafts').select('*').order('created_at', { ascending: false }),
          supabase.from('blueprint_adoptions').select('*'),
        ]);

        if (dbSignals && dbSignals.length > 0) {
          setSignals((prev) =>
            prev.map((s) => {
              const dbRow = dbSignals.find((r: { id: string }) => r.id === s.id);
              if (dbRow) {
                return {
                  ...s,
                  approved: dbRow.decision === 'Approved',
                  approvedBy: dbRow.decided_by,
                };
              }
              return s;
            })
          );
        }

        if (dbAudit && dbAudit.length > 0) {
          const mapped: AuditEntry[] = dbAudit.map((r: {
            id: string;
            signal_id: string;
            suggestion: string;
            risk_tier: AuditEntry['riskTier'];
            decision: AuditEntry['decision'];
            decided_by: string;
            engagement: string;
            created_at: string;
          }) => ({
            id: r.signal_id || r.id,
            suggestion: r.suggestion,
            riskTier: r.risk_tier,
            decision: r.decision,
            by: r.decided_by || 'Unknown',
            timestamp: new Date(r.created_at).toLocaleString(),
            engagement: r.engagement,
          }));
          setAuditEntries(mapped);
        }

        if (dbDrafts) {
          setDrafts(
            dbDrafts.map((r: {
              id: string;
              subject: string;
              body: string;
              engagement: string;
              meeting_date: string;
              sent: boolean;
              created_at: string;
            }) => ({
              id: r.id,
              subject: r.subject,
              body: r.body,
              engagement: r.engagement,
              meetingDate: r.meeting_date,
              sent: r.sent,
              createdAt: r.created_at,
            }))
          );
        }

        if (dbAdopted) {
          const map: Record<string, boolean> = {};
          dbAdopted.forEach((r: { action_name: string; adopted: boolean }) => {
            map[r.action_name] = r.adopted;
          });
          setAdoptedActions(map);
        }
      } catch {
        pushToast('Could not load saved workspace data; showing demo data', 'error');
      }
    })();
  }, []);

  const pushToast = useCallback((message: string, tone: Toast['tone'] = 'success') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((t) => [...t, { id, message, tone }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 3500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const decideSignal = useCallback(
    (signalId: string, decision: 'Approved' | 'Rejected' | 'Modified', by: string) => {
      const signal = signals.find((s) => s.id === signalId);
      if (!signal) return;

      setSignals((prev) =>
        prev.map((s) =>
          s.id === signalId
            ? { ...s, approved: decision === 'Approved', approvedBy: by }
            : s
        )
      );

      const newEntry: AuditEntry = {
        id: signalId,
        suggestion: signal.action,
        riskTier: signal.risk,
        decision,
        by,
        timestamp: new Date().toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', month: 'short', day: 'numeric' }),
        engagement: signal.caseId.split('·')[1]?.trim() || 'Unknown',
      };
      setAuditEntries((prev) => [newEntry, ...prev]);

      pushToast(`Signal ${signalId} ${decision.toLowerCase()} by ${by}`, decision === 'Approved' ? 'success' : 'info');

      // Persist to Supabase
      (async () => {
        try {
          await supabase.from('signal_decisions').upsert({
            id: signalId,
            decision,
            decided_by: by,
            decided_at: new Date().toISOString(),
            risk_tier: signal.risk,
            engagement: newEntry.engagement,
            suggestion: signal.action,
          });
          await supabase.from('audit_entries').insert({
            signal_id: signalId,
            suggestion: signal.action,
            risk_tier: signal.risk,
            decision,
            decided_by: by,
            engagement: newEntry.engagement,
          });
        } catch {
          // offline mode — state is still in memory
        }
      })();
    },
    [signals, pushToast]
  );

  const addDraft = useCallback(
    (draft: Omit<DraftEmail, 'id' | 'createdAt' | 'sent'>) => {
      const id = crypto.randomUUID();
      const createdAt = new Date().toISOString();
      const fullDraft: DraftEmail = { ...draft, id, createdAt, sent: false };
      setDrafts((prev) => [fullDraft, ...prev]);
      pushToast('Draft saved to email folder', 'success');
      (async () => {
        try {
          await supabase.from('meeting_drafts').insert({
            id,
            subject: draft.subject,
            body: draft.body,
            engagement: draft.engagement,
            meeting_date: draft.meetingDate,
            sent: false,
          });
        } catch {
          // offline mode
        }
      })();
      return fullDraft;
    },
    [pushToast]
  );

  const sendDraft = useCallback(
    (id: string) => {
      setDrafts((prev) => prev.map((d) => (d.id === id ? { ...d, sent: true } : d)));
      pushToast('Email draft sent', 'success');
      (async () => {
        try {
          await supabase.from('meeting_drafts').update({ sent: true }).eq('id', id);
        } catch {
          // offline mode
        }
      })();
    },
    [pushToast]
  );

  const deleteDraft = useCallback(
    (id: string) => {
      setDrafts((prev) => prev.filter((d) => d.id !== id));
      pushToast('Draft deleted', 'info');
      (async () => {
        try {
          await supabase.from('meeting_drafts').delete().eq('id', id);
        } catch {
          // offline mode
        }
      })();
    },
    [pushToast]
  );

  const resetDemoState = useCallback(async () => {
    setSignals(seedSignals);
    setAuditEntries(seedAudit);
    setDrafts([]);
    setAdoptedActions({});
    try {
      const results = await Promise.all([
        supabase.from('signal_decisions').delete().neq('id', ''),
        supabase.from('audit_entries').delete().not('id', 'is', null),
        supabase.from('meeting_drafts').delete().not('id', 'is', null),
        supabase.from('blueprint_adoptions').delete().not('id', 'is', null),
      ]);
      const failed = results.find((result) => result.error);
      if (failed?.error) throw failed.error;
      pushToast('Demo workspace reset to clean state', 'success');
    } catch {
      pushToast('Reset locally, but saved workspace data could not be cleared', 'error');
    }
  }, [pushToast]);

  const toggleAdopted = useCallback(
    (actionName: string, by: string) => {
      setAdoptedActions((prev) => {
        const newAdopted = !prev[actionName];
        pushToast(
          newAdopted ? `"${actionName}" marked as adopted` : `"${actionName}" unmarked`,
          newAdopted ? 'success' : 'info'
        );
        (async () => {
          try {
            await supabase.from('blueprint_adoptions').upsert({
              action_name: actionName,
              adopted: newAdopted,
              adopted_by: by,
            });
          } catch {
            // offline mode
          }
        })();
        return { ...prev, [actionName]: newAdopted };
      });
    },
    [pushToast]
  );

  return (
    <Ctx.Provider
      value={{
        signals,
        auditEntries,
        drafts,
        adoptedActions,
        role,
        setRole,
        decideSignal,
        addDraft,
        sendDraft,
        deleteDraft,
        toggleAdopted,
        toasts,
        pushToast,
        dismissToast,
        resetDemoState,
        engineResult,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export { portfolioActions };
