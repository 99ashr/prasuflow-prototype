# PrasuFlow AI — Delivery Intelligence Platform

[![Open in Bolt](https://bolt.new/static/open-in-bolt.svg)](https://bolt.new/~/sb1-3yqfqvl4)

A prototype delivery intelligence platform that ingests fragmented project artifacts — requirement registers, change requests, UAT defect logs, meeting notes, and SOP documents — and surfaces evidence-backed friction signals with human-in-the-loop governance. Every AI suggestion is traceable to source evidence and routed to a named person for approval before any action is taken.

---

## Table of Contents

1. [What This App Does](#what-this-app-does)
2. [Architecture Overview](#architecture-overview)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Getting Started](#getting-started)
6. [User Guide — Screen by Screen](#user-guide--screen-by-screen)
7. [Role-Based Access](#role-based-access)
8. [The Intelligence Engine](#the-intelligence-engine)
9. [Data Persistence](#data-persistence)
10. [Running Tests](#running-tests)
11. [Resetting the Demo](#resetting-the-demo)
12. [Troubleshooting](#troubleshooting)

---

## What This App Does

PrasuFlow AI monitors a consulting delivery engagement and answers four questions:

| Question | Answered by |
|---|---|
| **Where is delivery friction happening?** | Friction Intelligence screen with evidence-backed signals |
| **What should we do about it?** | Opportunity Portfolio with ranked, transparently-scored interventions |
| **Did it work?** | Value & Client Trust screen with observed vs modeled KPIs |
| **Who approved what, and why?** | Governance & Audit screen with a complete decision ledger |

The platform is built around a non-negotiable principle: **AI never makes a decision.** Every signal is a suggestion, and every suggestion requires a named human to approve, reject, or modify it. The audit trail records who decided what, when, and on what evidence.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    React Frontend                      │
│  (Vite + TypeScript + Tailwind CSS + Lucide icons)    │
│                                                       │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────┐   │
│  │  Screens  │  │  Store   │  │  Intelligence    │   │
│  │  (14)     │──│  (React  │──│  Engine          │   │
│  │           │  │  Context)│  │  (deterministic) │   │
│  └──────────┘  └────┬─────┘  └───────────────────┘   │
│                     │                                 │
│                     ▼                                 │
│              ┌──────────────┐                         │
│              │  Supabase    │  (Postgres + RLS)       │
│              │  persistence │                         │
│              └──────────────┘                         │
└─────────────────────────────────────────────────────┘
```

### Key design decisions

- **Independent intelligence engine** (`src/engine.ts`): Seven deterministic detection rules evaluate normalized data and produce signals with linked evidence records. The engine is pure and testable — it has no UI dependencies and can be run in isolation.
- **Shared store** (`src/store.tsx`): React Context holds signals, audit entries, email drafts, and adopted actions. State is loaded from Supabase on mount and persisted on every mutation.
- **Evidence-first**: Every signal carries an `evidence` string, a `source` citation, and a `confidence` score. The engine's `collectEvidence()` function assembles a traceable evidence ledger from all source types.
- **Human governance**: No signal is auto-actioned. The `decideSignal()` function requires a human role label, creates an audit entry, and persists both the decision and the audit trail.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Build tool | Vite 5 |
| Framework | React 18 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3 |
| Icons | Lucide React |
| Database | Supabase (Postgres with RLS) |
| Tests | Vitest |

---

## Project Structure

```
src/
├── App.tsx                 # Root component, navigation, routing, header, sidebar
├── main.tsx                # Vite entry point
├── index.css              # Tailwind directives and global styles
├── types.ts               # All TypeScript types (Signal, Requirement, KPI, etc.)
├── data.ts                # Seed data (engagements, signals, requirements, KPIs)
├── engine.ts              # Independent intelligence/evidence engine (7 detection rules)
├── engine.test.ts         # Automated tests for the engine
├── ai.ts                  # AI assistant logic (mocked LLM responses)
├── store.tsx              # React Context store (signals, audit, drafts, persistence)
├── Assistant.tsx          # Root-cause AI assistant modal
├── NotificationCenter.tsx # Notification dropdown
├── Toast.tsx              # Toast notification system
├── components.tsx         # Shared UI components (Card, Badge, Modal, ScoreRing, etc.)
├── lib/
│   └── supabase.ts        # Supabase client initialization
└── screens/
    ├── Overview.tsx        # Executive overview dashboard
    ├── Intelligence.tsx    # Friction intelligence (signals + evidence modals)
    ├── Portfolio.tsx       # Opportunity portfolio + transformation blueprint
    ├── Value.tsx           # Value & client trust (KPIs, digest, export)
    ├── Governance.tsx      # Governance & audit ledger
    ├── SetupMap.tsx        # Process setup wizard + current-state map
    ├── Meeting.tsx         # Meeting intelligence (minutes generation + drafts)
    ├── Legacy.tsx          # Legacy knowledge base (system documentation)
    ├── Impact.tsx          # Change impact simulator
    ├── Readiness.tsx       # System upgrade readiness checklist
    ├── CaseStudy.tsx       # Case study generator
    ├── RiskHeatmap.tsx     # Risk likelihood vs impact matrix
    └── TeamPerformance.tsx # Team decision velocity and on-time tracking
```

---

## Getting Started

The dev server runs automatically in the Bolt environment. If you are running locally:

```bash
npm install
npm run dev
```

The app opens to the **Executive Overview** screen with three seeded engagements:

- **Northstar Retail** (NSR-24) — UAT → Go-live phase
- **Meridian Health** (MDH-18) — Sprint 08
- **Atlas Finance** (ATF-31) — Discovery

---

## User Guide — Screen by Screen

### 1. Executive Overview

**What it shows:** A dashboard with delivery health scores, active signal counts, and a governance activity feed.

**What you can do:**
- Click any signal card to open its evidence modal and approve, reject, or modify it.
- Click any engagement card to jump to its details.
- The governance activity feed updates live as decisions are made on other screens.

### 2. Friction Intelligence

**What it shows:** All detected friction signals across every engagement, with confidence scores, risk tiers, and evidence excerpts.

**What you can do:**
- Filter signals by risk tier (Low, Medium, High, Critical) or by signal type (Scope drift, Late change, Rework, etc.).
- Search signals by keyword.
- Click any signal to open the evidence modal showing the source, evidence excerpt, and recommended action.
- **Approve**, **Reject**, or **Modify** any signal. Your decision is recorded in the audit trail with your name and timestamp.
- The stats bar at the top shows live counts of approved, rejected, pending, and total signals.

### 3. Opportunity Portfolio

**What it shows:** Ranked intervention actions plotted on an impact-vs-feasibility chart, with transparent multi-dimensional scoring.

**What you can do:**
- Click any action in the chart or table to see its scoring breakdown across six dimensions (business impact, feasibility, AI/automation fit, data readiness, risk, time-to-value).
- Mark an action as **Adopted** — this is persisted and reflected on the Transformation Blueprint screen.

### 4. Transformation Blueprint

**What it shows:** Before/after process flow showing the current state and the target state after adopting recommended interventions.

**What you can do:**
- Toggle adoption status for each action (synced with the Portfolio screen).
- See which role is responsible for approving each transformation step.

### 5. Value & Client Trust

**What it shows:** KPI table with baseline, target, observed, and status for each metric, plus a client trust digest.

**What you can do:**
- Click any KPI row to open a detail modal with the formula, evidence source, and movement direction.
- Generate an AI client trust digest summarizing all KPIs.
- Export the digest as a downloadable file.
- Save the digest to the email drafts folder.

### 6. Governance & Audit

**What it shows:** A complete audit ledger of every AI suggestion and the human decision made on it.

**What you can do:**
- Search the audit log by keyword.
- Filter by risk tier or decision type.
- Export the filtered audit log as a CSV file.

### 7. Process Setup

**What it shows:** A four-step ingestion wizard (connect sources, map process, validate signals, activate workspace).

**What you do:**
- Click through each step to see how data sources are connected and normalized.
- Step 3 (Signal Validation) includes a **Requirement Quality Gate** that lists every requirement blocked from sprint commitment due to missing acceptance criteria or low clarity scores. Click any blocked requirement to see its details and jump to related signals.

### 8. Current-State Map

**What it shows:** A visual process graph reconstructed from event log data, with nodes sized by case volume and edges colored by wait time.

**What you can do:**
- Click any process node (Requirement sign-off, Sprint execution, UAT, Change review, Go-live, Support handover) to see its volume, average wait time, risk level, and description.

### 9. Meeting Intelligence

**What it shows:** Raw meeting notes and AI-generated standardized minutes.

**What you can do:**
- Select a meeting note from the list.
- Generate standardized minutes (purpose, discussion points, decisions, action items, risks, new requests, next steps).
- Save the minutes as an email draft.
- Send or delete saved drafts.
- All drafts are persisted to Supabase.

### 10. Legacy Knowledge Base

**What it shows:** Developer-ready reference cards for legacy systems, with authentication methods, endpoints, environments, and known quirks.

**What you can do:**
- Search and filter system cards.
- Click any system to see its full reference view.
- Generate AI documentation from raw notes.
- Export documentation as markdown.

### 11. Change Impact Simulator

**What it shows:** A deterministic simulation of how a proposed change affects downstream requirements, stories, and UAT items.

**What you do:**
- Select a requirement to change.
- The simulator calculates risk score, identifies downstream impacts, and generates recommendations.

### 12. Upgrade Readiness

**What it shows:** A pre-upgrade checklist generator.

**What you do:**
- Enter a description of the planned upgrade.
- The system generates a checklist across five sections (Dependencies, Rollback Plan, Security Review, Stakeholder Sign-offs, Testing Scope).
- Check off items interactively — the readiness score ring updates live.

### 13. Case Study Generator

**What it shows:** A post-engagement case study generator.

**What you do:**
- Select an engagement.
- Generate a structured case study (Executive Summary, Challenge, Solution, Results, Client Quote).
- Export the case study as text.

### 14. Risk Heatmap

**What it shows:** A 5x5 matrix plotting every signal by likelihood vs impact.

**What you can do:**
- Filter by engagement.
- Click any cell to see the signals in that risk band.
- Click a signal to open its evidence modal and make a governance decision.
- Summary cards show critical, elevated, and managed risk counts.

### 15. Team Performance

**What it shows:** Team member dashboard with decision velocity, on-time rate, and signal resolution counts.

**What you can do:**
- View the team summary cards (team size, signals resolved, signals open, average on-time rate).
- See the top performer card for the week.
- Click any team member to drill into their individual performance view, showing their recent audit decisions and open signals on their engagement.

---

## Role-Based Access

Use the role selector in the top-right header to switch between four roles. The role you select is recorded as the decision-maker on every signal you approve, reject, or modify.

| Role | Label | Typical Actions |
|---|---|---|
| **PM** (Project Manager) | PM | Approves medium-risk signals, flags for review |
| **Developer** | DV | Reviews technical signals, runs impact simulations |
| **Client Sponsor** | CS | Approves high-risk scope changes, reviews value digest |
| **Governance Authority** | GA | Oversees audit trail, reviews all decisions |

All roles can view all screens. The role affects how your name appears in the audit trail.

---

## The Intelligence Engine

The engine (`src/engine.ts`) is an independent, deterministic module that:

1. **Collects evidence** from every source type (requirements, UAT defects, change requests, meeting notes, KPIs) into a structured evidence ledger.
2. **Runs detection rules** — seven rules that evaluate the data and produce signals:

| Rule ID | Name | Friction Type | What It Detects |
|---|---|---|---|
| RQ-001 | Missing acceptance criteria | Requirement quality | Stories in development without AC |
| RQ-002 | Low clarity score | Requirement quality | Requirements with clarity below 50% |
| SD-001 | Scope drift from meeting notes | Scope drift | New requests in notes without a linked CR |
| SD-002 | Dependency added after sprint lock | Scope drift | Dependencies added after sprint plan locked |
| LC-001 | Late requirement change | Late change | Requirements edited after sprint commitment |
| RW-001 | UAT defect recurrence | Rework | UAT defects reopened more than once |
| SLA-001 | Approval SLA breach | SLA breach | Pending change requests exceeding SOP target |

3. **Links evidence to signals** so every detected signal has a traceable evidence chain.

The engine status is displayed in a thin bar below the header: `Intelligence engine active · 7 rules · N evidence records · M detected signals`.

---

## Data Persistence

The app uses Supabase (Postgres) to persist four types of state:

| Table | What It Stores |
|---|---|
| `signal_decisions` | Every signal's current decision status and who decided |
| `audit_entries` | A complete governance audit log of all decisions |
| `meeting_drafts` | Saved meeting minutes email drafts |
| `blueprint_adoptions` | Which transformation actions have been adopted |

On startup, the app loads all four tables and merges them with seed data. Every decision, draft, and adoption is persisted in real time. If Supabase is unreachable, the app continues with in-memory state and shows an error toast.

---

## Running Tests

```bash
npm test
```

The test suite (`src/engine.test.ts`) verifies:

- Evidence is collected from every source type (requirements, UAT defects, change requests, meeting notes, KPIs).
- The engine detects missing acceptance criteria and recurring defects.
- Evidence is linked to detected signals for traceability.
- Pending change requests are flagged as SLA breaches.

---

## Resetting the Demo

Click the **circular arrow icon** in the top-right header to reset the demo workspace. After confirmation, this will:

- Restore all signals to their initial seed state (no decisions).
- Clear all audit entries.
- Delete all saved email drafts.
- Clear all blueprint adoptions.
- Wipe the Supabase tables so the reset persists across reloads.

A toast confirms whether the reset succeeded locally and in the database.

---

## Troubleshooting

| Problem | Cause | Fix |
|---|---|---|
| App loads with seed data and an error toast | Supabase is unreachable | The app works offline with in-memory state; decisions will not persist across reloads |
| Reset shows "could not be cleared" toast | Supabase tables could not be wiped | Local state is still reset; the database will clear when connectivity returns |
| Signals don't update after approving | The store may not have loaded persisted state yet | Wait a moment for the Supabase load to complete on mount |
| Lint warnings about unused imports | Pre-existing in some screen files | Does not affect the build; run `npm run lint` to see them |
