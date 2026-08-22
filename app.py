import json
import os
import sys
from datetime import datetime

import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import streamlit as st

sys.path.insert(0, os.path.dirname(__file__))
from services import engine, ai_service

st.set_page_config(page_title="PrasuFlow AI", page_icon="🧭", layout="wide")

DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "project_data.json")


@st.cache_data
def load_data():
    with open(DATA_PATH) as f:
        return json.load(f)


def init_state(data):
    if "audit_log" not in st.session_state:
        st.session_state.audit_log = []
    if "scope_history" not in st.session_state:
        st.session_state.scope_history = []
    if "last_scope_result" not in st.session_state:
        st.session_state.last_scope_result = None


def record_decision(item, decision, actor, reason=""):
    st.session_state.audit_log.append({
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "item": item,
        "decision": decision,
        "actor": actor,
        "reason": reason,
    })


def badge(text, color):
    return f'<span style="background-color:{color};color:white;padding:3px 10px;border-radius:12px;font-size:0.85em;font-weight:600;">{text}</span>'


COLORS = {"RED": "#D64545", "AMBER": "#E0A100", "GREEN": "#3F9142",
          "HIGH": "#D64545", "MEDIUM": "#E0A100", "LOW": "#3F9142"}


def main():
    data = load_data()
    init_state(data)

    st.sidebar.markdown("## 🧭 PrasuFlow AI")
    st.sidebar.caption("Evidence-first delivery intelligence")
    st.sidebar.markdown(f"**Project:** {data['project']['name']}")
    st.sidebar.markdown(f"**Client:** {data['project']['client']}")

    ai_status = "🟢 Live AI connected" if (os.environ.get("GROQ_API_KEY") or os.environ.get("GOOGLE_API_KEY")) else "⚪ Deterministic fallback mode (no AI key set)"
    st.sidebar.caption(ai_status)

    page = st.sidebar.radio("Navigate", [
        "Command Centre", "Evidence", "Requirements", "Scope Intelligence",
        "Friction & Root Cause", "Opportunities", "Value Proof", "Governance / Audit Log",
    ])

    st.sidebar.markdown("---")
    st.sidebar.caption("Not built (explicitly deferred): live Jira/CRM integration, "
                        "autonomous approval, multi-tenant auth. Synthetic data only.")

    if page == "Command Centre":
        page_command_centre(data)
    elif page == "Evidence":
        page_evidence(data)
    elif page == "Requirements":
        page_requirements(data)
    elif page == "Scope Intelligence":
        page_scope(data)
    elif page == "Friction & Root Cause":
        page_friction(data)
    elif page == "Opportunities":
        page_opportunities(data)
    elif page == "Value Proof":
        page_value(data)
    elif page == "Governance / Audit Log":
        page_governance(data)


# ---------------- Command Centre ----------------
def page_command_centre(data):
    st.title("Command Centre")
    st.caption(f"{data['project']['name']} · {data['project']['client']}")

    friction = engine.detect_friction(data)
    priorities = engine.prioritise(friction)
    high = sum(1 for f in friction if f["severity"] == "HIGH")

    quality_scores = [engine.check_requirement_quality(r)["score"] for r in data["requirements"]]
    avg_quality = round(sum(quality_scores) / len(quality_scores))
    health = round(100 - (high * 4) - max(0, 70 - avg_quality) * 0.3)
    health = max(0, min(100, health))

    c1, c2, c3, c4 = st.columns(4)
    c1.metric("Delivery Health", f"{health}/100")
    c2.metric("Requirement Risk", "MEDIUM" if avg_quality >= 65 else "HIGH")
    c3.metric("Scope Risk", "HIGH" if any(c["linked_requirement_id"] is None for c in data["changes"]) else "MEDIUM")
    c4.metric("Rework Risk", "HIGH" if high >= 5 else "MEDIUM")

    st.markdown("---")
    col1, col2 = st.columns([1.2, 1])
    with col1:
        st.subheader("Top Issues")
        for f in friction[:5]:
            sev_color = COLORS.get(f["severity"], "#888")
            st.markdown(f"{badge(f['severity'], sev_color)} &nbsp; **{f['rule']}** — {f['entity']}", unsafe_allow_html=True)
            st.caption(f["evidence"])

    with col2:
        st.subheader("Recommended Intervention")
        if priorities:
            top = priorities[0]
            st.success(f"**{top['problem']}**")
            st.write(f"Priority score: **{top['score']}** (rank #1 of {len(priorities)})")
            st.caption(f"Impact {top['impact']}/10 · Occurrences {top['occurrences']} · Effort {top['effort']}")
            with st.expander("Why this first? (AI explanation)"):
                exp = ai_service.explain_priority_recommendation(top)
                st.write(exp["text"])
                st.caption(f"Source: {exp['source']}")

    st.markdown("---")
    st.subheader("Friction by severity")
    fdf = pd.DataFrame(friction)
    if not fdf.empty:
        counts = fdf["severity"].value_counts().reindex(["HIGH", "MEDIUM", "LOW"]).fillna(0)
        fig = px.bar(x=counts.index, y=counts.values, color=counts.index,
                     color_discrete_map=COLORS, labels={"x": "Severity", "y": "Count"})
        fig.update_layout(showlegend=False, height=320)
        st.plotly_chart(fig, use_container_width=True)


# ---------------- Evidence ----------------
def page_evidence(data):
    st.title("Connected Project Evidence")
    st.caption("Fragmented delivery evidence, unified into one traceable foundation.")

    counts = {
        "SOW Documents": len(data["project"]["sow_ids"]),
        "Requirements": len(data["requirements"]),
        "Stories": len(data["stories"]),
        "Change Requests": len(data["changes"]),
        "UAT Defects": len(data["defects"]),
        "Approvals": len(data["approvals"]),
        "Stakeholders": len(data["owners"]),
    }
    cols = st.columns(len(counts))
    for col, (label, val) in zip(cols, counts.items()):
        col.metric(label, val)

    st.markdown("---")
    st.subheader("Evidence Timeline")
    for ev in data["timeline"]:
        st.markdown(f"**{ev['date']}** — {ev['event']}  \n:gray[{ev['type']}]")

    st.markdown("---")
    st.subheader("Browse raw evidence")
    tab1, tab2, tab3, tab4 = st.tabs(["Requirements", "Stories", "Changes", "Defects"])
    with tab1:
        st.dataframe(pd.DataFrame(data["requirements"])[["requirement_id", "title", "status", "owner", "ambiguous_flag"]], use_container_width=True, hide_index=True)
    with tab2:
        st.dataframe(pd.DataFrame(data["stories"])[["story_id", "requirement_id", "title", "status", "reopen_count"]], use_container_width=True, hide_index=True)
    with tab3:
        st.dataframe(pd.DataFrame(data["changes"])[["change_id", "title", "status", "risk", "linked_requirement_id"]], use_container_width=True, hide_index=True)
    with tab4:
        st.dataframe(pd.DataFrame(data["defects"])[["defect_id", "title", "story_id", "requirement_id", "severity", "status"]], use_container_width=True, hide_index=True)


# ---------------- Requirements ----------------
def page_requirements(data):
    st.title("Requirement Quality Gate")
    st.caption("Every requirement is scored for ambiguity and completeness before it enters delivery.")

    req_options = {f"{r['requirement_id']} — {r['title'][:55]}...": r for r in data["requirements"]}
    default_idx = 0
    featured_id = data["featured"]["requirement_id"]
    for i, r in enumerate(data["requirements"]):
        if r["requirement_id"] == featured_id:
            default_idx = i
            break

    choice = st.selectbox("Select a requirement", list(req_options.keys()), index=default_idx)
    req = req_options[choice]

    st.markdown(f"> {req['description']}")
    quality = engine.check_requirement_quality(req)

    col1, col2 = st.columns([1, 2])
    with col1:
        score_color = "#3F9142" if quality["score"] >= 80 else ("#E0A100" if quality["score"] >= 60 else "#D64545")
        st.markdown(f"### Requirement Quality Score")
        st.markdown(f"<h1 style='color:{score_color}'>{quality['score']}/100</h1>", unsafe_allow_html=True)
        status_color = "#3F9142" if quality["status"] == "READY" else "#D64545"
        st.markdown(badge(("🟢 " if quality['status']=='READY' else "🔴 ") + quality["status"], status_color), unsafe_allow_html=True)

    with col2:
        st.markdown("### Issues detected")
        if quality["issues"]:
            for i in quality["issues"]:
                st.markdown(f"- {i}")
        else:
            st.success("No issues detected.")

        if quality["questions"]:
            st.markdown("### AI Clarification Questions")
            for i, q in enumerate(quality["questions"], 1):
                st.markdown(f"{i}. {q}")

    with st.expander("AI explanation (grounded in the issues above)"):
        exp = ai_service.explain_requirement_quality(req, quality)
        st.write(exp["text"])
        st.caption(f"Source: {exp['source']}")

    st.markdown("---")
    st.subheader("All requirements — quality overview")
    rows = []
    for r in data["requirements"]:
        q = engine.check_requirement_quality(r)
        rows.append({"ID": r["requirement_id"], "Title": r["title"][:60], "Score": q["score"], "Status": q["status"]})
    df = pd.DataFrame(rows).sort_values("Score")
    st.dataframe(df, use_container_width=True, hide_index=True)


# ---------------- Scope Intelligence ----------------
def page_scope(data):
    st.title("Scope Intelligence")
    st.caption("Hero feature: compares every new request against the approved baseline before it becomes silent scope creep.")

    with st.expander("Approved baseline (SOW summary)", expanded=False):
        st.markdown("**In scope:**")
        for i in data["baseline_scope"]["in_scope_summary"]:
            st.markdown(f"- {i}")
        st.markdown("**Explicitly excluded:**")
        for i in data["baseline_scope"]["explicit_exclusions"]:
            st.markdown(f"- {i}")

    default_text = "Can we add predictive forecasting and Excel export to the dashboard?"
    request_text = st.text_area("New Client Request", value=default_text, height=80)

    if st.button("🔍 Analyse Request", type="primary"):
        result = engine.classify_scope_request(
            request_text, data["baseline_scope"], data["requirements"], data["changes"], data["timeline"]
        )
        st.session_state.last_scope_result = {"text": request_text, "result": result}

    if st.session_state.last_scope_result:
        text = st.session_state.last_scope_result["text"]
        result = st.session_state.last_scope_result["result"]
        cls = result["classification"]
        icon = {"RED": "🔴", "AMBER": "🟠", "GREEN": "🟢"}[cls]
        label = {"RED": "LIKELY NEW SCOPE", "AMBER": "AMBIGUOUS — NEEDS CLARIFICATION", "GREEN": "IN SCOPE"}[cls]

        st.markdown(f"## {icon} {label}")
        st.markdown(badge(cls, COLORS[cls]), unsafe_allow_html=True)

        col1, col2 = st.columns([1.3, 1])
        with col1:
            st.markdown("### Evidence")
            for e in result["evidence"]:
                st.markdown(f"- **{e['type']}** ({e['ref']}): {e['detail']}")
            st.markdown("### Reason")
            st.write(result["reason"])

            with st.expander("Client-safe AI explanation"):
                exp = ai_service.explain_scope_decision(text, result)
                st.write(exp["text"])
                st.caption(f"Source: {exp['source']}")

        with col2:
            st.markdown("### Estimated Impact")
            imp = result["impact"]
            st.metric("Effort", f"{imp['effort_hrs']} hrs")
            st.metric("Teams affected", imp["teams_affected"])
            st.metric("Timeline impact", f"+{imp['timeline_days']} days")
            st.markdown(f"**Risk:** {badge(imp['risk'], COLORS.get(imp['risk'], '#888'))}", unsafe_allow_html=True)
            st.markdown("### Recommended Action")
            st.info(result["recommended_action"])

        if cls in ("RED", "AMBER"):
            st.markdown("---")
            st.subheader("Human Governance — Decision Required")
            st.caption("High-risk / ambiguous scope changes cannot be auto-approved. A named human decides.")
            actor = st.selectbox("Decision maker", [f"{o['name']} ({o['role']})" for o in data["owners"] if o["role"] in ("Project Manager", "Executive Sponsor", "Delivery Lead")])
            decision = st.radio("Decision", ["Approve", "Reject", "Modify"], horizontal=True)
            reason = st.text_input("Reason / notes", value="")
            if st.button("Submit Decision"):
                record_decision(f"Scope request: {text[:60]}", decision, actor, reason)
                st.success(f"Decision recorded: {decision} by {actor}. See Governance / Audit Log.")


# ---------------- Friction & Root Cause ----------------
def page_friction(data):
    st.title("Friction Detection & Root Cause")

    st.subheader("Detected Friction Signals")
    findings = engine.detect_friction(data)
    st.caption(f"{len(findings)} findings across 7 deterministic detection rules.")
    for f in findings:
        with st.container(border=True):
            c1, c2 = st.columns([1, 5])
            c1.markdown(badge(f["severity"], COLORS.get(f["severity"], "#888")), unsafe_allow_html=True)
            c2.markdown(f"**{f['rule']}** — `{f['entity']}`")
            c2.caption(f["evidence"])

    st.markdown("---")
    st.subheader("Root Cause Tracing")
    defect_options = {f"{d['defect_id']} — {d['title'][:50]}": d["defect_id"] for d in data["defects"]}
    default_idx = list(defect_options.values()).index(data["featured"]["defect_id"]) if data["featured"]["defect_id"] in defect_options.values() else 0
    choice = st.selectbox("Select a UAT defect to trace", list(defect_options.keys()), index=default_idx)
    defect_id = defect_options[choice]

    trace = engine.trace_root_cause(defect_id, data)

    st.markdown("### Trace")
    st.markdown(" → ".join(f"`{t}`" for t in trace["trace"]))

    col1, col2 = st.columns(2)
    with col1:
        st.markdown("### Hypothesis")
        st.warning(trace["hypothesis"])
        st.caption(trace["validation_state"])
    with col2:
        st.markdown("### Supporting Evidence")
        for e in trace["supporting_evidence"]:
            st.markdown(f"- {e}")

    with st.expander("AI explanation"):
        exp = ai_service.explain_root_cause(trace)
        st.write(exp["text"])
        st.caption(f"Source: {exp['source']}")

    if st.button("✅ Validate this hypothesis (QA / Delivery Lead)"):
        record_decision(f"Root cause hypothesis for {defect_id}", "Validated", "QA / Delivery Lead", trace["hypothesis"])
        st.success("Hypothesis validated and logged to audit trail.")


# ---------------- Opportunities ----------------
def page_opportunities(data):
    st.title("Opportunity / Prioritisation")
    st.caption("Priority Score = (Impact × Frequency × Urgency × Confidence) / Effort")

    findings = engine.detect_friction(data)
    priorities = engine.prioritise(findings)

    df = pd.DataFrame(priorities)[["rank", "problem", "severity", "occurrences", "impact", "frequency", "urgency", "effort", "score"]]
    st.dataframe(df, use_container_width=True, hide_index=True)

    if priorities:
        top = priorities[0]
        st.markdown("---")
        st.subheader("PrasuFlow Recommendation")
        st.success(f"**Fix: {top['problem']}**")
        st.write(f"Why: high recurrence ({top['occurrences']} occurrences) + high impact ({top['impact']}/10) "
                 f"+ relatively low intervention effort ({top['effort']}) → score {top['score']}.")

        with st.expander("AI explanation"):
            exp = ai_service.explain_priority_recommendation(top)
            st.write(exp["text"])
            st.caption(f"Source: {exp['source']}")

        st.markdown("---")
        actor = st.selectbox("Approve as", [f"{o['name']} ({o['role']})" for o in data["owners"] if o["role"] in ("Executive Sponsor", "Project Manager")])
        if st.button("Approve Recommended Intervention"):
            record_decision(f"Intervention: {top['problem']}", "Approved", actor)
            st.success("Intervention approved and logged. See Governance / Audit Log and Value Proof.")

    fig = px.bar(df, x="problem", y="score", color="severity", color_discrete_map=COLORS)
    fig.update_layout(height=350, xaxis_title="", yaxis_title="Priority Score")
    st.plotly_chart(fig, use_container_width=True)


# ---------------- Value Proof ----------------
def page_value(data):
    st.title("Value Proof")
    st.warning("⚠️ All figures below are **MODELED / SIMULATED** — not validated actuals. "
               "They illustrate expected impact if the recommended intervention (Requirement Quality Gate) is adopted.")

    approved = any(a["item"].startswith("Intervention") and a["decision"] == "Approved" for a in st.session_state.audit_log)

    metrics = [
        ("Requirement clarity (avg score)", 61, 84),
        ("Rework rate", "18%", "11%"),
        ("Cycle time (days)", 31, 25),
        ("Approval SLA breach rate", "43%", "20%"),
    ]

    col1, col2 = st.columns(2)
    with col1:
        st.subheader("Before Intervention (Observed baseline)")
        for label, before, _ in metrics:
            st.metric(label, before)
    with col2:
        st.subheader("After Intervention (Modeled)")
        for label, _, after in metrics:
            st.metric(label, after)

    if not approved:
        st.info("No intervention has been approved yet. Approve one on the Opportunities page to anchor this projection to a real decision.")
    else:
        st.success("An intervention has been approved. The modeled values above represent the projected effect of that decision.")

    fig = go.Figure()
    fig.add_trace(go.Bar(name="Before", x=["Requirement clarity", "Rework rate %", "Cycle time (days)"], y=[61, 18, 31]))
    fig.add_trace(go.Bar(name="After (modeled)", x=["Requirement clarity", "Rework rate %", "Cycle time (days)"], y=[84, 11, 25]))
    fig.update_layout(barmode="group", height=350)
    st.plotly_chart(fig, use_container_width=True)

    st.caption("Labelling convention: Observed = from seeded evidence · Modeled = projected via intervention assumptions · "
               "Directional = order-of-magnitude estimate only. No modeled figure here is presented as a validated business result.")


# ---------------- Governance ----------------
def page_governance(data):
    st.title("Governance / Audit Log")
    st.caption('"Analytics calculates facts, retrieval finds evidence, the LLM explains/drafts, and a named human decides." '
               "No AI output on this platform auto-executes a high-risk action.")

    if not st.session_state.audit_log:
        st.info("No decisions recorded yet in this session. Approve/reject a scope request or intervention to populate this log.")
    else:
        df = pd.DataFrame(st.session_state.audit_log)
        st.dataframe(df, use_container_width=True, hide_index=True)

    st.markdown("---")
    st.subheader("Governance principles enforced in this prototype")
    st.markdown("""
- High-risk scope changes (RED/AMBER classification) require explicit human Approve/Reject/Modify.
- Every AI explanation is generated from pre-computed deterministic facts — the model never invents scores, classifications, or evidence.
- Root-cause hypotheses remain labelled **HYPOTHESIS** until a QA/Delivery Lead validates them.
- Value Proof figures are labelled **Modeled/Simulated** and never presented as validated actuals.
- Decision, decision-maker, and timestamp are recorded for every governed action.
""")


if __name__ == "__main__":
    main()
