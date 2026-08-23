import { useState } from 'react';
import { FileText, Mail, ChevronRight, Sparkles, ClipboardCheck, AlertCircle, CheckCircle2, Send, Trash2 } from 'lucide-react';
import { Card, Badge, SectionHeader, AITag } from '@/components';
import { generateMeetingMinutes, type MeetingMinutes } from '@/ai';
import { engagements } from '@/data';
import { useStore } from '@/store';
import type { Screen } from '@/types';

export function Meeting({ setScreen }: { setScreen: (s: Screen) => void }) {
  const { drafts, addDraft, sendDraft, deleteDraft } = useStore();
  const [rawText, setRawText] = useState(
    'Priya: UAT is on track for the core checkout flow.\n\nClient asked if regional admins can export bulk orders. This was not in the original scope.\n\nRavi to confirm effort by Thursday. Sarah to share the negative-path test evidence.\n\nNext sync: 14 Aug.'
  );
  const [date, setDate] = useState('08 Aug 2025');
  const [attendees, setAttendees] = useState('Priya, Ravi, Sarah, Northstar team');
  const [engagement, setEngagement] = useState(engagements[0].name);
  const [minutes, setMinutes] = useState<MeetingMinutes | null>(null);
  const [loading, setLoading] = useState(false);
  const [openDraftId, setOpenDraftId] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    const attendeeList = attendees.split(',').map((a) => a.trim());
    const result = await generateMeetingMinutes(rawText, date, attendeeList, engagement);
    setMinutes(result);
    setLoading(false);
  }

  function saveDraft() {
    if (!minutes) return;
    const subject = `Meeting Minutes — ${engagement} — ${date}`;
    const body = `Hi all,\n\nSharing the standardized minutes from our sync.\n\nPurpose: ${minutes.purpose}\n\nDecisions:\n${minutes.decisions.map((d) => `- ${d}`).join('\n')}\n\nAction items:\n${minutes.actionItems.map((a) => `- ${a.owner}: ${a.task} (due: ${a.due}, priority: ${a.priority})`).join('\n')}\n\nNext steps: ${minutes.nextSteps}`;
    const draft = addDraft({ subject, body, engagement, meetingDate: date });
    setOpenDraftId(draft.id);
  }

  function attendeeListToEmails(attendees: string): string {
    return attendees
      .split(',')
      .map((a) => {
        const name = a.trim().toLowerCase().replace(/\s+/g, '.');
        return name.includes('@') ? name : `${name}@prasunet.com`;
      })
      .join(', ');
  }

  const openDraft = drafts.find((d) => d.id === openDraftId) || null;

  return (
    <div className="space-y-6 p-8">
      <div className="grid grid-cols-[.85fr_1.15fr] gap-5">
        <Card className="p-5">
          <SectionHeader icon={<FileText size={16} className="text-blue-600" />} title="Meeting input" subtitle="Paste raw notes. The AI will normalize them into a governed template." />
          <div className="mt-5 grid grid-cols-2 gap-3">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Meeting date
              <input
                className="mt-2 w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-700 outline-none focus:border-blue-400"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Engagement
              <select
                className="mt-2 w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-700 outline-none"
                value={engagement}
                onChange={(e) => setEngagement(e.target.value)}
              >
                {engagements.map((e) => <option key={e.code}>{e.name}</option>)}
              </select>
            </label>
          </div>
          <label className="mt-4 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Attendees
            <input
              className="mt-2 w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-700 outline-none focus:border-blue-400"
              value={attendees}
              onChange={(e) => setAttendees(e.target.value)}
            />
          </label>
          <label className="mt-4 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Raw notes / transcript
            <textarea
              className="mt-2 h-48 w-full resize-none rounded-lg border border-slate-200 p-3 text-xs leading-5 text-slate-600 outline-none focus:border-blue-400"
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
            />
          </label>
          <button
            onClick={generate}
            disabled={loading}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[#0b1e3d] py-3 text-xs font-bold text-white disabled:opacity-50"
          >
            <Sparkles size={14} /> {loading ? 'Generating...' : minutes ? 'Regenerate minutes' : 'Generate standardized minutes'}
          </button>
        </Card>

        <Card className="p-5">
          <SectionHeader
            icon={<Mail size={16} className="text-blue-600" />}
            title="Drafts folder"
            right={<Badge tone="blue">{drafts.length} draft{drafts.length !== 1 ? 's' : ''}</Badge>}
          />
          {openDraft ? (
            <div className="mt-5">
              <div className="rounded-lg bg-slate-50 p-3 text-xs">
                <div className="font-semibold text-slate-800">{openDraft.subject}</div>
                <div className="mt-1 text-slate-400">Engagement: {openDraft.engagement} · Date: {openDraft.meetingDate}</div>
              </div>
              <div className="mt-4 rounded-lg border border-slate-200 p-4 text-xs leading-5 text-slate-600 whitespace-pre-wrap">
                {openDraft.body}
              </div>
              {openDraft.sent && (
                <div className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 p-2.5 text-[11px] text-emerald-700">
                  <CheckCircle2 size={14} /> Sent
                </div>
              )}
              <div className="mt-4 flex gap-2">
                <button onClick={() => setOpenDraftId(null)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">Back to drafts</button>
                {!openDraft.sent && (
                  <button onClick={() => sendDraft(openDraft.id)} className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700">
                    <Send size={13} /> Send
                  </button>
                )}
                <button onClick={() => { deleteDraft(openDraft.id); setOpenDraftId(null); }} className="flex items-center gap-2 rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50">
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {drafts.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400">
                  Your saved minutes will appear here. Generate minutes and click "Save to Email Draft".
                </div>
              ) : (
                drafts.map((d) => (
                  <div
                    key={d.id}
                    className="flex w-full items-center gap-3 rounded-lg border border-blue-100 bg-blue-50/60 p-3 transition hover:bg-blue-50"
                  >
                    <button onClick={() => setOpenDraftId(d.id)} className="flex flex-1 items-center gap-3 text-left">
                      <div className="rounded bg-blue-600 p-2 text-white"><Mail size={14} /></div>
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-slate-800">{d.subject}</div>
                        <div className="mt-1 text-[10px] text-slate-500">{d.engagement} · {d.meetingDate}</div>
                      </div>
                      {d.sent && <Badge tone="green"><CheckCircle2 size={10} /> Sent</Badge>}
                      <ChevronRight size={14} className="text-blue-500" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </Card>
      </div>

      {minutes && (
        <Card className="p-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <SectionHeader
              icon={<ClipboardCheck size={16} className="text-emerald-600" />}
              title="Standardized meeting minutes"
              subtitle="Editable preview · source-grounded output"
            />
            <div className="flex items-center gap-2">
              <AITag approved={false} />
              <button
                onClick={saveDraft}
                className="flex items-center gap-2 rounded-lg bg-[#0b1e3d] px-3 py-2 text-xs font-bold text-white"
              >
                <Send size={13} /> Save to Email Draft
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 pt-5 text-xs">
            <div className="space-y-6">
              <div>
                <div className="mb-2 text-[9px] font-bold uppercase tracking-widest text-slate-400">Meeting metadata</div>
                <div className="space-y-1.5 text-slate-600">
                  <div><b className="text-slate-800">Date</b> · {minutes.date}</div>
                  <div><b className="text-slate-800">Attendees</b> · {minutes.attendees.join(', ')}</div>
                  <div><b className="text-slate-800">Engagement</b> · {minutes.engagement}</div>
                  <div><b className="text-slate-800">Purpose</b> · {minutes.purpose}</div>
                </div>
              </div>
              <div>
                <div className="mb-2 text-[9px] font-bold uppercase tracking-widest text-slate-400">Key discussion points</div>
                <ul className="list-disc space-y-1.5 pl-4 leading-5 text-slate-600">
                  {minutes.discussionPoints.map((p, i) => <li key={i}>{p}</li>)}
                </ul>
              </div>
              <div>
                <div className="mb-2 text-[9px] font-bold uppercase tracking-widest text-slate-400">Decisions made</div>
                <div className="space-y-1.5">
                  {minutes.decisions.map((d, i) => (
                    <div key={i} className="rounded-lg bg-emerald-50 p-2.5 leading-5 text-emerald-800">{d}</div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <div className="mb-2 text-[9px] font-bold uppercase tracking-widest text-slate-400">Action items</div>
                <div className="space-y-2">
                  {minutes.actionItems.map((a, i) => (
                    <div key={i} className="flex gap-2 rounded-lg border border-slate-200 p-3">
                      <CheckCircle2 size={14} className={`mt-0.5 ${a.priority === 'High' ? 'text-amber-500' : 'text-blue-500'}`} />
                      <span className="leading-5 text-slate-600">
                        <b className="text-slate-800">{a.owner}</b> · {a.task} ·{' '}
                        <span className={a.priority === 'High' ? 'text-amber-700' : 'text-slate-500'}>{a.due}, priority {a.priority}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              {minutes.risks.length > 0 && (
                <div>
                  <div className="mb-2 text-[9px] font-bold uppercase tracking-widest text-slate-400">Risks / blockers</div>
                  <div className="space-y-1.5">
                    {minutes.risks.map((r, i) => (
                      <div key={i} className="flex items-center gap-2 rounded-lg border border-amber-100 bg-amber-50 p-2.5 text-[11px] text-amber-700">
                        <AlertCircle size={13} /> {r}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {minutes.newRequests.length > 0 && (
                <div>
                  <div className="mb-2 text-[9px] font-bold uppercase tracking-widest text-slate-400">New requests (scope-adjacent)</div>
                  <div className="space-y-1.5">
                    {minutes.newRequests.map((r, i) => (
                      <div key={i} className="flex items-center gap-2 rounded-lg border border-rose-100 bg-rose-50 p-2.5 text-[11px] text-rose-700">
                        <AlertCircle size={13} /> {r}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setScreen('intelligence')}
                    className="mt-3 flex items-center gap-1 text-xs font-bold text-blue-600"
                  >
                    Open linked evidence card <ChevronRight size={13} />
                  </button>
                </div>
              )}
              <div>
                <div className="mb-2 text-[9px] font-bold uppercase tracking-widest text-slate-400">Next steps</div>
                <div className="rounded-lg bg-slate-50 p-3 text-slate-700">{minutes.nextSteps}</div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
