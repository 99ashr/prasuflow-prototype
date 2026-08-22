# PrasuFlow AI — Round 2 Prototype

A working, single-command prototype of PrasuFlow AI: an evidence-first
delivery intelligence platform that connects fragmented project evidence
into one management decision loop.

**Connect → Detect → Diagnose → Prioritise → Intervene → Measure**

Built as the buildable MVP slice of the full 9-engine platform described
in Round 1: **Evidence Foundation, Requirement Quality Gate, Scope
Intelligence (hero feature), Evidence Card, Friction Detection, Root
Cause tracing, Prioritisation, and Human Governance**, with an optional
Modeled Value Proof screen.

## Run locally

```bash
pip install -r requirements.txt
streamlit run app.py
```

Opens at `http://localhost:8501`. No API key required — the app runs
entirely on seeded synthetic data with deterministic rule engines.

## Optional: live AI explanations

Every "AI explanation" panel works out of the box using grounded,
deterministic fallback text (so a missing key or rate limit can never
break a live demo). To get live LLM explanations instead, set **either**
of these free-tier environment variables before running:

```bash
export GROQ_API_KEY=...      # https://console.groq.com — free tier
# or
export GOOGLE_API_KEY=...    # https://aistudio.google.com — free tier
```

The AI is used **only** to explain outputs already computed by the
deterministic engines (`services/engine.py`) — it never invents scores,
classifications, or evidence.

## What's in this prototype

| Screen | Demonstrates |
|---|---|
| Command Centre | Delivery Health Score, top risks, recommended intervention |
| Evidence | Connected Evidence Foundation + timeline (24 requirements, 72 stories, 11 changes, 14 defects, 7 approvals) |
| Requirements | Requirement Quality Gate — 0–100 score, ambiguity detection, AI clarification questions |
| Scope Intelligence | **Hero feature** — GREEN/AMBER/RED classifier vs. approved baseline, Evidence Card, impact estimate, human Approve/Reject/Modify |
| Friction & Root Cause | 7 deterministic friction rules + defect → story → requirement root-cause tracing |
| Opportunities | Transparent priority scoring (Impact × Frequency × Urgency × Confidence / Effort) |
| Value Proof | Modeled/Simulated before-after KPIs, clearly labelled as such |
| Governance / Audit Log | Every human decision recorded with actor, timestamp, reason |

## Demo script (matches the build plan's recommended flow)

1. Start on **Command Centre** — show fragmented delivery evidence, top risks.
2. Open **Requirements**, select REQ-101 (the featured ambiguous requirement) → show quality score 38/100 and clarification questions.
3. Go to **Scope Intelligence**, use the default request ("Can we add predictive forecasting and Excel export to the dashboard?") → click **Analyse Request** → 🔴 RED, evidence, impact (75 hrs / 3 teams / +4 days).
4. Approve/Reject the scope decision as the named PM.
5. Go to **Friction & Root Cause**, trace UAT-101 → STORY-4501 → REQ-101 → root-cause hypothesis.
6. Go to **Opportunities** → show "Missing acceptance criteria" ranks #1 → approve the intervention.
7. Go to **Value Proof** → show modeled before/after KPIs.
8. Close on **Governance / Audit Log** → every decision, decision-maker, and timestamp recorded.

## What is deliberately NOT built (say this out loud to judges)

Live Jira/CRM/ServiceNow integration, autonomous approval, full contract
analysis, finance-system-verified savings, multi-tenant auth, full
process mining, agentic remediation. This is intentional scope
discipline for a Round 2 MVP, not an oversight.

## Deploy — fastest path

**1. Push to GitHub**
```bash
git init
git add .
git commit -m "PrasuFlow AI prototype"
git branch -M main
git remote add origin https://github.com/<you>/prasuflow-prototype.git
git push -u origin main
```

**2. Streamlit Community Cloud (recommended — free forever, ~2 min)**
Go to https://share.streamlit.io → New app → pick your repo → main file
`app.py` → Deploy.

**3. Railway (if you specifically need it)**
Go to https://railway.app → New Project → Deploy from GitHub repo.
Railway auto-detects Python and uses the included `railway.json` /
`Procfile`. Note: Railway's free tier is a one-time trial credit, not
unlimited — fine for a demo window, don't leave it running idle for days
beforehand. If it runs out, Hugging Face Spaces is a free-forever backup.

## Project structure

```
prasuflow-prototype/
├── app.py                    # Streamlit app — all 8 screens
├── data/
│   ├── generate_data.py      # regenerates the seeded dataset (seeded, deterministic)
│   └── project_data.json     # the seeded synthetic project
├── services/
│   ├── engine.py             # deterministic rule engines (quality, scope, friction, root cause, priority)
│   └── ai_service.py         # optional AI explanation layer with grounded fallbacks
├── requirements.txt
├── Procfile                  # Railway/Heroku-style start command
└── railway.json
```
