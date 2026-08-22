"""
PrasuFlow AI - Synthetic Data Generator
Generates one realistic project ("Analytics Transformation Platform")
with connected evidence: requirements, stories, changes, defects,
approvals, stakeholders, effort and an evidence timeline.

Relationship structure (per build plan) is the priority, not volume:
SOW -> REQ -> STORY -> CHANGE
REQ -> STORY -> UAT DEFECT
"""
import json
import random
from datetime import datetime, timedelta

random.seed(42)  # deterministic seed so demo data is stable every run

OUT = "seeded"

PROJECT = {
    "project_id": "PROJ-001",
    "name": "Analytics Transformation Platform",
    "client": "Meridian Retail Group",
    "start_date": "2026-06-01",
    "planned_end_date": "2026-09-15",
    "sow_ids": ["SOW-01", "SOW-02", "SOW-03"],
    "budget_hours": 3200,
}

OWNERS = [
    {"owner_id": "BA-01", "name": "Ritika Shah", "role": "Business Analyst"},
    {"owner_id": "BA-02", "name": "Ananya Rao", "role": "Business Analyst"},
    {"owner_id": "BA-03", "name": "Devika Nair", "role": "Business Analyst"},
    {"owner_id": "PM-01", "name": "Karan Mehta", "role": "Project Manager"},
    {"owner_id": "PM-02", "name": "Sanjay Iyer", "role": "Delivery Lead"},
    {"owner_id": "DEV-01", "name": "Arjun Verma", "role": "Tech Lead"},
    {"owner_id": "DEV-02", "name": "Priya Menon", "role": "Frontend Lead"},
    {"owner_id": "QA-01", "name": "Neha Kapoor", "role": "QA Lead"},
    {"owner_id": "QA-02", "name": "Rahul Bose", "role": "QA Engineer"},
    {"owner_id": "EXEC-01", "name": "Meera Kulkarni", "role": "Executive Sponsor"},
    {"owner_id": "CLIENT-01", "name": "Vikram Malhotra", "role": "Client Sponsor"},
    {"owner_id": "FIN-01", "name": "Alok Desai", "role": "Finance"},
]

STATUSES = ["Committed", "In Development", "Delivered", "Blocked"]

REQ_TITLES = [
    ("Build a fast and seamless analytics dashboard with flexible filtering",
     True),  # ambiguous
    ("Implement role-based access control for finance reports", False),
    ("Provide a simple and intuitive onboarding wizard for new users", True),
    ("Enable CSV export for all standard reports", False),
    ("Support real-time inventory sync across all store locations", False),
    ("Deliver an easy-to-use mobile view for regional managers", True),
    ("Integrate with the existing SAP finance ledger for reconciliation", False),
    ("Provide robust and scalable data pipeline for daily sales ingestion", True),
    ("Enable multi-currency reporting for APAC and EU regions", False),
    ("Build a user-friendly alerting system for stock-out risk", True),
    ("Implement audit logging for all report access", False),
    ("Provide a clean and modern UI for the executive summary screen", True),
    ("Support scheduled email delivery of weekly KPI reports", False),
    ("Enable drill-down from region to store to SKU level", False),
    ("Deliver a smart search feature across all product catalogues", True),
    ("Support SSO login via Azure AD", False),
    ("Provide configurable data retention policy per client", False),
    ("Build an efficient and streamlined return-processing workflow", True),
    ("Enable comparison view between current and prior fiscal year", False),
    ("Support offline data capture for warehouse staff", False),
    ("Provide a flexible dashboard layout that adapts to any device", True),
    ("Implement data quality validation on ingestion", False),
    ("Enable bulk upload of vendor master data via template", False),
    ("Deliver a comprehensive and easy reporting experience for finance", True),
]

CHANGE_TITLES = [
    "Add predictive forecasting module to dashboard",
    "Add Excel export in addition to CSV",
    "Extend SSO to support Okta as second IdP",
    "Add region-level approval workflow for finance reports",
    "Support importing vendor data from a third format (XML)",
    "Add dark mode to the executive dashboard",
    "Extend alerting to SMS channel",
    "Add year-over-3-year comparison view",
    "Support custom branding per client tenant",
    "Add offline sync conflict-resolution screen",
    "Add anomaly detection to inventory sync",
]

DEFECT_TITLES = [
    "Forecasting calculation incorrect for negative growth periods",
    "Dashboard load time exceeds 8 seconds on filtered view",
    "Onboarding wizard skips mandatory step on mobile",
    "CSV export drops last row for large datasets",
    "Inventory sync duplicates records on retry",
    "Mobile view breaks on tablet resolution",
    "SAP reconciliation mismatches on multi-currency entries",
    "Data pipeline fails silently on malformed source rows",
    "Currency rounding inconsistent between screens",
    "Stock-out alert fires with 12-hour delay",
    "Audit log missing entries for bulk actions",
    "Executive summary screen shows stale cache after refresh",
    "Scheduled report email sent with broken chart images",
    "Drill-down loses filter state when navigating back",
]


def dstr(base, offset_days):
    return (base + timedelta(days=offset_days)).strftime("%Y-%m-%d")


def build():
    base = datetime(2026, 6, 1)

    # ---- Requirements ----
    requirements = []
    for i, (title, ambiguous) in enumerate(REQ_TITLES, start=1):
        req_id = f"REQ-{100 + i}"
        created_offset = random.randint(0, 20)
        edited_after_commit = ambiguous and random.random() < 0.6
        requirements.append({
            "requirement_id": req_id,
            "project_id": "PROJ-001",
            "sow_id": random.choice(PROJECT["sow_ids"]),
            "title": title,
            "description": title + ".",
            "owner": random.choice([o["owner_id"] for o in OWNERS if o["role"] == "Business Analyst"]),
            "status": random.choice(STATUSES),
            "has_acceptance_criteria": not ambiguous or random.random() < 0.3,
            "created_date": dstr(base, created_offset),
            "edited_after_commitment": edited_after_commit,
            "edit_count": random.randint(2, 4) if edited_after_commit else random.randint(0, 1),
            "ambiguous_flag": ambiguous,
        })

    # ---- Stories (68) linked to requirements ----
    stories = []
    story_seq = 4500
    for req in requirements:
        n_stories = random.randint(2, 4)
        for _ in range(n_stories):
            story_seq += 1
            reopen_count = 0
            # REQ-114 (our featured ambiguous req) gets a reopened story to support root-cause demo
            created_offset = random.randint(5, 40)
            stories.append({
                "story_id": f"STORY-{story_seq}",
                "requirement_id": req["requirement_id"],
                "project_id": "PROJ-001",
                "title": f"Implement: {req['title'][:60]}",
                "status": random.choice(["To Do", "In Progress", "In QA", "Done", "Reopened"]),
                "reopen_count": reopen_count,
                "owner": random.choice([o["owner_id"] for o in OWNERS if o["role"] in ("Tech Lead", "Frontend Lead")]),
                "created_date": dstr(base, created_offset),
                "effort_planned_hrs": random.choice([8, 16, 24, 32, 40]),
                "effort_actual_hrs": None,
            })
    # backfill actual effort + occasional overruns (for friction: post-planning effort shifts)
    for s in stories:
        shift = random.random() < 0.22
        base_actual = s["effort_planned_hrs"] * (1.4 if shift else random.uniform(0.85, 1.15))
        s["effort_actual_hrs"] = round(base_actual, 1)
        s["effort_shift_flag"] = shift

    # Make sure the featured requirement (ambiguous, e.g. dashboard) has a reopened story
    dashboard_req = next(r for r in requirements if "fast and seamless analytics dashboard" in r["title"])
    dashboard_stories = [s for s in stories if s["requirement_id"] == dashboard_req["requirement_id"]]
    if dashboard_stories:
        dashboard_stories[0]["reopen_count"] = 3
        dashboard_stories[0]["status"] = "Reopened"
        featured_story_id = dashboard_stories[0]["story_id"]
    else:
        featured_story_id = stories[0]["story_id"]

    # ---- Change Requests (11) ----
    changes = []
    # These two titles are the featured hero-scenario request (predictive forecasting +
    # Excel export) and must NOT already be approved/linked, so Scope Intelligence
    # correctly flags the live demo request as new/unapproved scope.
    force_unapproved = {"Add predictive forecasting module to dashboard", "Add Excel export in addition to CSV"}
    for i, title in enumerate(CHANGE_TITLES, start=1):
        if title in force_unapproved:
            linked_req = None
            status = "Pending"
        else:
            linked_req = random.choice(requirements)["requirement_id"] if random.random() < 0.4 else None
            status = random.choice(["Approved", "Pending", "Rejected"])
        changes.append({
            "change_id": f"CR-{18 + i}",
            "project_id": "PROJ-001",
            "title": title,
            "requested_date": dstr(base, random.randint(15, 70)),
            "linked_requirement_id": linked_req,  # None => informal/unapproved request pattern
            "status": status,
            "effort_hrs": random.choice([16, 24, 40, 56, 74, 90]),
            "risk": random.choice(["LOW", "MEDIUM", "HIGH"]) if title not in force_unapproved else "HIGH",
        })

    # ---- UAT Defects (14) ----
    defects = []
    for i, title in enumerate(DEFECT_TITLES, start=1):
        # first defect intentionally traces to the featured reopened story -> ambiguous requirement
        if i == 1:
            story_id = featured_story_id
        else:
            story_id = random.choice(stories)["story_id"]
        story = next(s for s in stories if s["story_id"] == story_id)
        defects.append({
            "defect_id": f"UAT-{100 + i}",
            "project_id": "PROJ-001",
            "title": title,
            "story_id": story_id,
            "requirement_id": story["requirement_id"],
            "severity": random.choice(["Low", "Medium", "High", "Critical"]),
            "found_date": dstr(base, random.randint(30, 80)),
            "status": random.choice(["Open", "In Progress", "Fixed", "Closed"]),
        })

    # ---- Approvals (7) ----
    approvals = []
    approval_subjects = [
        "SOW-01 sign-off", "REQ batch 1 sign-off", "CR-19 approval",
        "UAT exit criteria approval", "Go-live readiness approval",
        "CR-24 approval", "Budget variance approval",
    ]
    for i, subject in enumerate(approval_subjects, start=1):
        requested = random.randint(10, 75)
        sla_days = 3
        actual_days = random.choice([2, 3, 4, 6, 9, 11])
        approvals.append({
            "approval_id": f"APR-{i:02d}",
            "project_id": "PROJ-001",
            "subject": subject,
            "requested_date": dstr(base, requested),
            "decided_date": dstr(base, requested + actual_days),
            "sla_days": sla_days,
            "actual_days": actual_days,
            "breached_sla": actual_days > sla_days,
            "decided_by": random.choice([o["owner_id"] for o in OWNERS if o["role"] in ("Project Manager", "Executive Sponsor", "Client Sponsor")]),
        })

    # ---- Evidence timeline (illustrative connected evidence log) ----
    timeline = [
        {"date": dstr(base, 11), "event": "SOW-01 signed", "type": "SOW"},
        {"date": dstr(base, 12), "event": f"{dashboard_req['requirement_id']} requirement created", "type": "Requirement"},
        {"date": dstr(base, 14), "event": "Client meeting - scope walkthrough", "type": "Meeting"},
        {"date": dstr(base, 15), "event": f"{dashboard_req['requirement_id']} requirement modified", "type": "Requirement"},
        {"date": dstr(base, 16), "event": f"{featured_story_id} story created", "type": "Story"},
        {"date": dstr(base, 18), "event": "Development started", "type": "Story"},
        {"date": dstr(base, 22), "event": "CR-29: Excel export change requested", "type": "Change"},
        {"date": dstr(base, 25), "event": "UAT-101 defect logged", "type": "Defect"},
        {"date": dstr(base, 34), "event": "CR-19 approved", "type": "Approval"},
        {"date": dstr(base, 41), "event": "Story reopened (3rd time)", "type": "Story"},
    ]

    # ---- SOW / baseline scope text (for Scope Intelligence comparison) ----
    baseline_scope = {
        "sow_ids": PROJECT["sow_ids"],
        "in_scope_summary": [
            "Analytics dashboard with standard filtering (region, store, SKU, date range)",
            "CSV export for standard reports",
            "Role-based access control",
            "SAP finance ledger integration for reconciliation",
            "Mobile-responsive view for regional managers",
            "SSO login via Azure AD",
            "Real-time inventory sync across store locations",
            "Weekly scheduled KPI email reports",
        ],
        "explicit_exclusions": [
            "Predictive forecasting or ML-based projections",
            "Excel (.xlsx) export format",
            "Multi-IdP SSO beyond Azure AD",
            "SMS-based alerting",
            "Custom per-client branding/white-labelling",
        ],
    }

    data = {
        "project": PROJECT,
        "owners": OWNERS,
        "requirements": requirements,
        "stories": stories,
        "changes": changes,
        "defects": defects,
        "approvals": approvals,
        "timeline": timeline,
        "baseline_scope": baseline_scope,
        "featured": {
            "requirement_id": dashboard_req["requirement_id"],
            "story_id": featured_story_id,
            "defect_id": "UAT-101",
        },
    }
    return data


if __name__ == "__main__":
    data = build()
    with open("data/project_data.json", "w") as f:
        json.dump(data, f, indent=2)
    print(f"Requirements: {len(data['requirements'])}")
    print(f"Stories: {len(data['stories'])}")
    print(f"Changes: {len(data['changes'])}")
    print(f"Defects: {len(data['defects'])}")
    print(f"Approvals: {len(data['approvals'])}")
    print(f"Featured requirement: {data['featured']}")
