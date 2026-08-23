/*
# Create tables for signal decisions, audit entries, and meeting drafts

1. New Tables
- `signal_decisions`: Tracks human decisions on AI-generated friction signals.
  - `id` (text, primary key) — the signal ID (e.g. SIG-024)
  - `decision` (text) — one of 'Approved', 'Rejected', 'Modified', 'Pending'
  - `decided_by` (text) — the role/person who made the decision
  - `decided_at` (timestamptz) — when the decision was made
  - `risk_tier` (text) — risk tier at time of decision
  - `engagement` (text) — engagement name
  - `suggestion` (text) — the AI suggestion text
  - `created_at` (timestamptz)

- `audit_entries`: Governance audit log of all AI suggestions and human decisions.
  - `id` (uuid, primary key)
  - `signal_id` (text) — linked signal ID
  - `suggestion` (text) — the AI suggestion
  - `risk_tier` (text) — Low/Medium/High/Critical
  - `decision` (text) — Approved/Rejected/Modified/Pending
  - `decided_by` (text) — person/role
  - `engagement` (text) — engagement name
  - `created_at` (timestamptz)

- `meeting_drafts`: Saved meeting minutes drafts.
  - `id` (uuid, primary key)
  - `subject` (text) — email subject line
  - `body` (text) — email body content
  - `engagement` (text) — engagement name
  - `meeting_date` (text) — date of the meeting
  - `sent` (boolean, default false) — whether the draft was sent
  - `created_at` (timestamptz)

- `blueprint_adoptions`: Tracks which transformation blueprints have been adopted.
  - `id` (uuid, primary key)
  - `action_name` (text) — the portfolio action name
  - `adopted` (boolean, default false)
  - `adopted_by` (text) — role/person
  - `created_at` (timestamptz)

2. Security
- All tables are single-tenant (no sign-in). RLS enabled with anon+authenticated CRUD.
- USING (true) is acceptable because the data is intentionally shared/public in this demo workspace.
*/

CREATE TABLE IF NOT EXISTS signal_decisions (
  id text PRIMARY KEY,
  decision text NOT NULL DEFAULT 'Pending',
  decided_by text,
  decided_at timestamptz,
  risk_tier text,
  engagement text,
  suggestion text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE signal_decisions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_signal_decisions" ON signal_decisions;
CREATE POLICY "anon_select_signal_decisions" ON signal_decisions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_signal_decisions" ON signal_decisions;
CREATE POLICY "anon_insert_signal_decisions" ON signal_decisions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_signal_decisions" ON signal_decisions;
CREATE POLICY "anon_update_signal_decisions" ON signal_decisions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_signal_decisions" ON signal_decisions;
CREATE POLICY "anon_delete_signal_decisions" ON signal_decisions FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS audit_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_id text,
  suggestion text NOT NULL,
  risk_tier text NOT NULL,
  decision text NOT NULL DEFAULT 'Pending',
  decided_by text,
  engagement text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE audit_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_audit_entries" ON audit_entries;
CREATE POLICY "anon_select_audit_entries" ON audit_entries FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_audit_entries" ON audit_entries;
CREATE POLICY "anon_insert_audit_entries" ON audit_entries FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_audit_entries" ON audit_entries;
CREATE POLICY "anon_update_audit_entries" ON audit_entries FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_audit_entries" ON audit_entries;
CREATE POLICY "anon_delete_audit_entries" ON audit_entries FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS meeting_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject text NOT NULL,
  body text NOT NULL,
  engagement text,
  meeting_date text,
  sent boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE meeting_drafts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_meeting_drafts" ON meeting_drafts;
CREATE POLICY "anon_select_meeting_drafts" ON meeting_drafts FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_meeting_drafts" ON meeting_drafts;
CREATE POLICY "anon_insert_meeting_drafts" ON meeting_drafts FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_meeting_drafts" ON meeting_drafts;
CREATE POLICY "anon_update_meeting_drafts" ON meeting_drafts FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_meeting_drafts" ON meeting_drafts;
CREATE POLICY "anon_delete_meeting_drafts" ON meeting_drafts FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS blueprint_adoptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action_name text NOT NULL UNIQUE,
  adopted boolean NOT NULL DEFAULT false,
  adopted_by text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE blueprint_adoptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_blueprint_adoptions" ON blueprint_adoptions;
CREATE POLICY "anon_select_blueprint_adoptions" ON blueprint_adoptions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_blueprint_adoptions" ON blueprint_adoptions;
CREATE POLICY "anon_insert_blueprint_adoptions" ON blueprint_adoptions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_blueprint_adoptions" ON blueprint_adoptions;
CREATE POLICY "anon_update_blueprint_adoptions" ON blueprint_adoptions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_blueprint_adoptions" ON blueprint_adoptions;
CREATE POLICY "anon_delete_blueprint_adoptions" ON blueprint_adoptions FOR DELETE
  TO anon, authenticated USING (true);
