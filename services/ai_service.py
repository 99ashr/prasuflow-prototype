"""
PrasuFlow AI - AI Explanation Layer

IMPORTANT DESIGN RULE (per build spec):
The LLM never makes numerical/classification decisions. It only explains
outputs already computed deterministically by services/engine.py. If no
API key is set, or the call fails, every function falls back to a
specific, grounded, evidence-based sentence - so a missing key or a rate
limit can never break the live demo.

Supports either GROQ_API_KEY (Groq, free tier) or GOOGLE_API_KEY
(Gemini, free tier) as environment variables. Neither is required.
"""
import os

GROQ_KEY = os.environ.get("GROQ_API_KEY")
GOOGLE_KEY = os.environ.get("GOOGLE_API_KEY")


def _call_groq(prompt: str) -> str | None:
    try:
        import requests
        resp = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={"Authorization": f"Bearer {GROQ_KEY}", "Content-Type": "application/json"},
            json={
                "model": "llama-3.1-8b-instant",
                "messages": [
                    {"role": "system", "content": "You are an evidence-grounded delivery management assistant. "
                                                   "Only explain the facts given to you. Never invent numbers, "
                                                   "requirements, or evidence not provided. Be concise (2-4 sentences)."},
                    {"role": "user", "content": prompt},
                ],
                "temperature": 0.3,
                "max_tokens": 220,
            },
            timeout=12,
        )
        if resp.status_code == 200:
            return resp.json()["choices"][0]["message"]["content"].strip()
    except Exception:
        return None
    return None


def _call_gemini(prompt: str) -> str | None:
    try:
        import requests
        url = ("https://generativelanguage.googleapis.com/v1beta/models/"
               f"gemini-1.5-flash:generateContent?key={GOOGLE_KEY}")
        sys_prefix = ("You are an evidence-grounded delivery management assistant. "
                      "Only explain the facts given to you. Never invent numbers, "
                      "requirements, or evidence not provided. Be concise (2-4 sentences).\n\n")
        resp = requests.post(
            url,
            json={"contents": [{"parts": [{"text": sys_prefix + prompt}]}]},
            timeout=12,
        )
        if resp.status_code == 200:
            return resp.json()["candidates"][0]["content"]["parts"][0]["text"].strip()
    except Exception:
        return None
    return None


def explain(prompt: str, fallback: str) -> dict:
    """Returns {"text": ..., "source": "AI" | "Deterministic fallback"}"""
    if GROQ_KEY:
        out = _call_groq(prompt)
        if out:
            return {"text": out, "source": "AI (Groq/Llama)"}
    if GOOGLE_KEY:
        out = _call_gemini(prompt)
        if out:
            return {"text": out, "source": "AI (Gemini)"}
    return {"text": fallback, "source": "Deterministic fallback (no AI key set / AI unavailable)"}


def explain_requirement_quality(req: dict, quality: dict) -> dict:
    fallback = (
        f"{req['requirement_id']} scores {quality['score']}/100 because it uses "
        f"{len(quality['issues'])} undefined or unmeasurable terms and is missing "
        f"{'acceptance criteria' if not req.get('has_acceptance_criteria') else 'no acceptance criteria issue'}. "
        f"Clarifying the flagged terms with measurable targets would raise the score."
    )
    prompt = (f"Requirement: '{req['title']}'. Quality score: {quality['score']}/100. "
              f"Issues found: {quality['issues']}. Explain in plain business language why this "
              f"requirement needs clarification before development, in 2-3 sentences.")
    return explain(prompt, fallback)


def explain_scope_decision(request_text: str, result: dict) -> dict:
    ev_summary = "; ".join(f"{e['type']}: {e['detail']}" for e in result["evidence"][:3])
    fallback = (
        f"This request was classified {result['classification']} because {result['reason']} "
        f"Supporting evidence: {ev_summary}."
    )
    prompt = (f"A client requested: '{request_text}'. This was classified {result['classification']} "
              f"against the approved SOW baseline. Reason: {result['reason']} "
              f"Evidence: {ev_summary}. Explain this decision to a non-technical client sponsor in "
              f"2-3 sentences, without making up any new facts.")
    return explain(prompt, fallback)


def explain_root_cause(trace: dict) -> dict:
    fallback = trace["hypothesis"] + " Supporting evidence: " + "; ".join(trace["supporting_evidence"]) + "."
    prompt = (f"Defect: {trace['defect']['title']}. Trace: {' -> '.join(trace['trace'])}. "
              f"Hypothesis: {trace['hypothesis']}. Supporting evidence: {trace['supporting_evidence']}. "
              f"Explain this root-cause chain to a delivery lead in 2-3 sentences.")
    return explain(prompt, fallback)


def explain_priority_recommendation(top: dict) -> dict:
    fallback = (
        f"'{top['problem']}' ranks #1 with a priority score of {top['score']} because it combines "
        f"high impact ({top['impact']}/10), {top['occurrences']} occurrences, and relatively low "
        f"intervention effort ({top['effort']}). Fixing this addresses the most recurring, highest-leverage "
        f"issue in the project."
    )
    prompt = (f"Top-ranked problem: '{top['problem']}' with score {top['score']} "
              f"(impact={top['impact']}, frequency={top['occurrences']}, urgency={top['urgency']}, "
              f"effort={top['effort']}). Explain in 2-3 sentences why this should be fixed first, "
              f"for a PM audience.")
    return explain(prompt, fallback)
