"""
PrasuFlow AI - Core Intelligence Engines
All scoring/classification is deterministic and rule-based (auditable).
The AI layer (ai_service.py) is used only to EXPLAIN these outputs in
natural language - it never invents the numbers or the classification.
"""
import re
from datetime import datetime

AMBIGUOUS_TERMS = [
    "fast", "seamless", "simple", "intuitive", "flexible", "easy", "easy-to-use",
    "robust", "scalable", "friendly", "modern", "clean", "efficient", "streamlined",
    "smart", "comprehensive", "user-friendly", "adaptable", "adapts",
]


def check_requirement_quality(requirement: dict) -> dict:
    """FR-02: Requirement Quality Gate - deterministic 0-100 score."""
    text = f"{requirement['title']} {requirement.get('description', '')}".lower()
    issues = []
    score = 100

    found_terms = [t for t in AMBIGUOUS_TERMS if re.search(rf"\b{re.escape(t)}\b", text)]
    for term in found_terms:
        issues.append(f'"{term.capitalize()}" is undefined')
        score -= 12

    if not requirement.get("has_acceptance_criteria", False):
        issues.append("Acceptance criteria missing")
        score -= 20

    if "filter" in text and "specif" not in text and found_terms:
        issues.append("Filters/parameters are not specified")
        score -= 8

    if not requirement.get("owner"):
        issues.append("Owner not assigned")
        score -= 10

    if requirement.get("edited_after_commitment"):
        issues.append(f"Requirement edited {requirement.get('edit_count', 0)}x after commitment")
        score -= 10

    if "success" not in text and "outcome" not in text and found_terms:
        issues.append("Success outcome/definition of done missing")
        score -= 8

    score = max(0, min(100, score))

    # Deterministic clarification questions tied to detected issues
    questions = []
    for term in found_terms[:2]:
        if term in ("fast", "efficient", "streamlined"):
            questions.append("What is the maximum acceptable response time?")
        elif term in ("seamless", "intuitive", "user-friendly", "friendly", "simple", "clean", "modern"):
            questions.append("What specific user experience benchmark defines success here?")
        elif term in ("flexible", "adaptable", "adapts"):
            questions.append("Which specific filters/parameters are mandatory vs optional?")
        elif term in ("robust", "scalable", "comprehensive"):
            questions.append("What load/scale threshold must this support (e.g. peak users, data volume)?")
    if not requirement.get("has_acceptance_criteria", False):
        questions.append("What constitutes successful completion (acceptance criteria)?")
    # de-dup, keep order
    seen = set()
    questions = [q for q in questions if not (q in seen or seen.add(q))][:4]

    status = "READY" if score >= 80 else "NEEDS CLARIFICATION"

    return {
        "requirement_id": requirement["requirement_id"],
        "score": score,
        "issues": issues,
        "questions": questions,
        "status": status,
    }


# ---------------- Scope Intelligence ----------------

STOPWORDS = {"the", "a", "an", "and", "or", "to", "of", "for", "on", "in", "with",
             "can", "we", "add", "please", "is", "are", "this", "that", "as", "at", "our"}


def _keywords(text: str):
    words = re.findall(r"[a-zA-Z]+", text.lower())
    return {w for w in words if w not in STOPWORDS and len(w) > 2}


def classify_scope_request(request_text: str, baseline: dict, requirements: list, changes: list, timeline: list) -> dict:
    """FR-03: Scope Intelligence Engine.
    Compares an incoming request against SOW in-scope items, explicit
    exclusions, approved requirements, and approved changes.
    Returns GREEN / AMBER / RED with supporting evidence.
    """
    req_kw = _keywords(request_text)

    def overlap(item_text):
        return len(req_kw & _keywords(item_text))

    # Score against exclusions (strong negative signal)
    excl_hits = [(x, overlap(x)) for x in baseline["explicit_exclusions"]]
    excl_hits = [h for h in excl_hits if h[1] >= 2]

    # Score against in-scope summary (positive signal)
    scope_hits = [(x, overlap(x)) for x in baseline["in_scope_summary"]]
    scope_hits = [h for h in scope_hits if h[1] >= 2]

    # Score against approved requirements (positive signal)
    req_hits = [(r, overlap(r["title"])) for r in requirements]
    req_hits = [h for h in req_hits if h[1] >= 2]

    # Score against already-approved AND already-linked changes (means it's genuinely
    # already handled through formal governance, not just a same-named pending request)
    change_hits = [(c, overlap(c["title"])) for c in changes
                   if c["status"] == "Approved" and c.get("linked_requirement_id")]
    change_hits = [h for h in change_hits if h[1] >= 2]

    evidence = []
    for x, _ in excl_hits:
        evidence.append({"type": "SOW Exclusion", "ref": baseline["sow_ids"][0], "detail": x})
    for r, _ in req_hits:
        evidence.append({"type": "Approved Requirement", "ref": r["requirement_id"], "detail": r["title"]})
    for x, _ in scope_hits:
        evidence.append({"type": "SOW In-Scope Item", "ref": baseline["sow_ids"][0], "detail": x})
    for c, _ in change_hits:
        evidence.append({"type": "Approved Change", "ref": c["change_id"], "detail": c["title"]})

    if excl_hits and not req_hits and not change_hits:
        classification = "RED"
        reason = ("No approved requirement or change corresponding to this request was found, "
                   "and it matches an item explicitly excluded from the SOW baseline.")
    elif req_hits or change_hits:
        classification = "GREEN"
        reason = "This request maps directly to an already-approved requirement or change."
    elif scope_hits and not excl_hits:
        classification = "AMBER"
        reason = ("This request partially overlaps with in-scope items but is not explicitly "
                   "defined at this level of detail. Interpretation is ambiguous.")
    else:
        classification = "RED"
        reason = ("No approved requirement corresponding to this request was found in the "
                   "SOW, approved requirements, or approved changes.")

    # Impact estimate (deterministic heuristic tied to classification + text length/keywords)
    if classification == "RED":
        effort = 60 + len(req_kw) * 3
        teams = 3
        timeline_days = 4
        risk = "HIGH"
        action = "Create Change Request"
    elif classification == "AMBER":
        effort = 24 + len(req_kw) * 2
        teams = 2
        timeline_days = 2
        risk = "MEDIUM"
        action = "Clarify with client, then log Change Request if confirmed"
    else:
        effort = 8 + len(req_kw)
        teams = 1
        timeline_days = 0
        risk = "LOW"
        action = "Proceed under existing approved scope"

    return {
        "classification": classification,
        "reason": reason,
        "evidence": evidence if evidence else [{"type": "Note", "ref": "-", "detail": "No matching baseline evidence found."}],
        "impact": {
            "effort_hrs": effort,
            "teams_affected": teams,
            "timeline_days": timeline_days,
            "risk": risk,
        },
        "recommended_action": action,
    }


# ---------------- Friction Detection ----------------

def detect_friction(data: dict) -> list:
    """FR-05: 7 deterministic friction rules."""
    findings = []

    # 1. Missing acceptance criteria
    for r in data["requirements"]:
        if not r.get("has_acceptance_criteria", False):
            findings.append({
                "rule": "Missing acceptance criteria",
                "severity": "HIGH",
                "entity": r["requirement_id"],
                "evidence": f"{r['requirement_id']} ({r['title'][:50]}...) has no recorded acceptance criteria.",
            })

    # 2. Requirement edited after commitment
    for r in data["requirements"]:
        if r.get("edited_after_commitment"):
            findings.append({
                "rule": "Requirement edited after commitment",
                "severity": "MEDIUM",
                "entity": r["requirement_id"],
                "evidence": f"{r['requirement_id']} was edited {r.get('edit_count', 0)} times after being committed.",
            })

    # 3. New request without change request (informal scope change)
    for c in data["changes"]:
        if c["linked_requirement_id"] is None:
            findings.append({
                "rule": "New request without formal change record",
                "severity": "HIGH",
                "entity": c["change_id"],
                "evidence": f"{c['change_id']} ({c['title']}) has no linked originating requirement.",
            })

    # 4. Repeated story reopening
    for s in data["stories"]:
        if s.get("reopen_count", 0) >= 2:
            findings.append({
                "rule": "Repeated story reopening",
                "severity": "HIGH",
                "entity": s["story_id"],
                "evidence": f"{s['story_id']} was reopened {s['reopen_count']} times (linked to {s['requirement_id']}).",
            })

    # 5. Post-planning effort shift
    for s in data["stories"]:
        if s.get("effort_shift_flag"):
            findings.append({
                "rule": "Post-planning effort shift",
                "severity": "MEDIUM",
                "entity": s["story_id"],
                "evidence": f"{s['story_id']} actual effort ({s['effort_actual_hrs']}h) exceeded plan ({s['effort_planned_hrs']}h) by >30%.",
            })

    # 6. Late dependency / high-risk unapproved change
    for c in data["changes"]:
        if c["status"] == "Pending" and c["risk"] == "HIGH":
            findings.append({
                "rule": "Late dependency / unresolved high-risk change",
                "severity": "HIGH",
                "entity": c["change_id"],
                "evidence": f"{c['change_id']} ({c['title']}) is still Pending with HIGH risk rating.",
            })

    # 7. Approval SLA breach
    for a in data["approvals"]:
        if a["breached_sla"]:
            findings.append({
                "rule": "Approval latency above SLA",
                "severity": "MEDIUM",
                "entity": a["approval_id"],
                "evidence": f"{a['approval_id']} ({a['subject']}) took {a['actual_days']}d vs {a['sla_days']}d SLA.",
            })

    sev_order = {"HIGH": 0, "MEDIUM": 1, "LOW": 2}
    findings.sort(key=lambda f: sev_order.get(f["severity"], 3))
    return findings


# ---------------- Root Cause Tracing ----------------

def trace_root_cause(defect_id: str, data: dict) -> dict:
    """FR-06: Trace UAT defect -> story -> requirement, build hypothesis."""
    defect = next((d for d in data["defects"] if d["defect_id"] == defect_id), None)
    if not defect:
        return {"error": "Defect not found"}
    story = next((s for s in data["stories"] if s["story_id"] == defect["story_id"]), None)
    req = next((r for r in data["requirements"] if r["requirement_id"] == defect["requirement_id"]), None)

    supporting = []
    hypothesis_parts = []
    if req and not req.get("has_acceptance_criteria", False):
        supporting.append("Acceptance criteria missing on originating requirement")
        hypothesis_parts.append("incomplete acceptance criteria")
    if req and req.get("edited_after_commitment"):
        supporting.append(f"Requirement edited {req.get('edit_count', 0)}x after commitment")
        hypothesis_parts.append("requirement instability")
    if req and req.get("ambiguous_flag"):
        supporting.append("Requirement flagged with ambiguous language at quality gate")
        hypothesis_parts.append("requirement ambiguity")
    if story and story.get("reopen_count", 0) >= 2:
        supporting.append(f"Story reopened {story['reopen_count']} times")
    supporting.append(f"Related UAT defect exists: {defect['defect_id']}")

    if hypothesis_parts:
        hypothesis = f"Likely root cause: {', '.join(hypothesis_parts)} in {req['requirement_id']}."
    else:
        hypothesis = "Likely root cause: implementation defect, no clear requirement-quality signal found."

    return {
        "defect": defect,
        "story": story,
        "requirement": req,
        "trace": [defect["defect_id"], story["story_id"] if story else "-", req["requirement_id"] if req else "-"],
        "hypothesis": hypothesis,
        "supporting_evidence": supporting,
        "validation_state": "HYPOTHESIS - PENDING HUMAN VALIDATION",
    }


# ---------------- Prioritisation ----------------

def prioritise(friction_findings: list, scope_result: dict = None) -> list:
    """FR-07: Priority Score = (Impact x Frequency x Urgency x Confidence) / Effort"""
    # Aggregate by rule type (frequency = count of that rule across findings)
    from collections import Counter
    rule_counts = Counter(f["rule"] for f in friction_findings)

    severity_impact = {"HIGH": 9, "MEDIUM": 6, "LOW": 3}
    rule_effort = {
        "Missing acceptance criteria": 3,
        "Requirement edited after commitment": 4,
        "New request without formal change record": 5,
        "Repeated story reopening": 6,
        "Post-planning effort shift": 4,
        "Late dependency / unresolved high-risk change": 7,
        "Approval latency above SLA": 3,
    }

    scored = []
    for rule, count in rule_counts.items():
        sample = next(f for f in friction_findings if f["rule"] == rule)
        impact = severity_impact.get(sample["severity"], 5)
        frequency = count
        urgency = 8 if sample["severity"] == "HIGH" else 5
        confidence = 0.9
        effort = rule_effort.get(rule, 5)
        score = round((impact * frequency * urgency * confidence) / effort, 1)
        scored.append({
            "problem": rule,
            "severity": sample["severity"],
            "occurrences": count,
            "impact": impact,
            "frequency": frequency,
            "urgency": urgency,
            "confidence": confidence,
            "effort": effort,
            "score": score,
        })

    scored.sort(key=lambda x: -x["score"])
    for i, s in enumerate(scored, start=1):
        s["rank"] = i
    return scored
