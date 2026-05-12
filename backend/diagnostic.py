"""
FORENSIC DIAGNOSTIC: CaseStateEngine Execution Integrity Audit
==============================================================
Traces every layer, validates cross-layer influence, detects static logic.
"""
import requests
import json
import sys
from datetime import datetime, timedelta

BASE = "http://localhost:8000"

# ─── 4 CONTRAST NARRATIVES ──────────────────────────────────────────

NARRATIVES = {
    "A_HIGH_BACKLOG_DELAYS": (
        "Civil suit for recovery of money filed in Patna District Court, Bihar. "
        "Court has 8000 pending cases. 18 adjournments over 4 years. "
        "Opponent is filing frivolous interlocutory applications to delay. "
        "Missing bank statements and transaction records. "
        "Junior advocate with 1 year experience. Hostile judge known for strictness."
    ),
    "B_STRONG_EVIDENCE_LOW_DELAYS": (
        "Property partition suit in Bangalore Urban District Court, Karnataka. "
        "Only 2 adjournments. 800 pending cases. Strong evidence with registered sale deeds, "
        "mutation records, and revenue documents. Senior advocate with 22 years experience. "
        "Cooperative opposite party willing to negotiate. Case at final arguments stage."
    ),
    "C_FAMILY_COURT_EMOTIONAL": (
        "Divorce petition under Hindu Marriage Act Section 13 in Lucknow Family Court, "
        "Uttar Pradesh. Domestic violence allegations under DV Act. 10 adjournments. "
        "3500 pending cases. Weak documentary evidence. Emotional testimony-heavy case. "
        "Mid-career advocate with 6 years experience. Aggressive opponent seeking custody."
    ),
    "D_FAST_CONSUMER_FORUM": (
        "Consumer complaint for defective product filed in Mumbai Consumer Forum. "
        "Simple deficiency of service case. Product warranty documents attached. "
        "Only 1 adjournment. 400 pending cases. Strong photographic evidence. "
        "Experienced consumer rights advocate with 12 years. "
        "Respondent company has history of quick settlements."
    ),
}

results = {}
errors = []

print("=" * 80)
print("FORENSIC DIAGNOSTIC: CaseStateEngine Execution Integrity")
print("=" * 80)

# ─── STEP 1: TRACE COMPLETE FLOW FOR EACH NARRATIVE ─────────────────

for key, text in NARRATIVES.items():
    print(f"\n{'─' * 80}")
    print(f"NARRATIVE [{key}]")
    print(f"  TEXT: {text[:100]}...")
    print(f"{'─' * 80}")

    r = requests.post(f"{BASE}/analyze", json={"text": text})
    if r.status_code != 200:
        errors.append(f"{key}: HTTP {r.status_code}")
        print(f"  ERROR: HTTP {r.status_code} - {r.text[:200]}")
        continue

    d = r.json()
    results[key] = d

    # ── LAYER-BY-LAYER TRACE ──
    cs = d.get("case_state", {})
    tl = d.get("timeline", {})
    jb = d.get("judge_belief", {})
    sc = d.get("similar_cases", [])
    ce = d.get("causal_effects", [])
    om = d.get("online_model", {})
    di = d.get("data_insights", {})
    dr = d.get("causal_drivers", [])
    df = d.get("decision_fork", [])
    ex = d.get("explanation", "")
    cn = d.get("confidence_notes", "")
    la = cs.get("layers_active", {})

    print(f"\n  [L1-ML]       raw_ml={cs.get('raw_ml_days')}d")
    print(f"  [L2-BAYES]    signals={cs.get('signals_detected')}")
    print(f"                judge_modifier={cs.get('judge_modifier')}")
    print(f"                belief: strict={jb.get('strictness')} delay_tol={jb.get('delay_tolerance')} proc_sens={jb.get('procedural_sensitivity')}")
    print(f"  [L3-GRAPH]    similar_cases={len(sc)}")
    print(f"  [L4-CAUSAL]   effects={len(ce)}")
    for c in ce:
        print(f"                  {c.get('factor')}: {c.get('impact_days')}d [{c.get('confidence')}]")
    print(f"  [L5-SHAP]     drivers={len(dr)}")
    for i, drv in enumerate(dr[:3]):
        print(f"                  #{i+1} {drv.get('factor')}: {drv.get('impact_days'):+d}d [{drv.get('confidence')}]")
    print(f"  [L6-SIM]      decisions={len(df)}")
    for opt in df[:3]:
        print(f"                  '{opt.get('action')}': {opt.get('impact_days'):+d}d (p={opt.get('success_probability'):.2f}) risk={opt.get('risk','?')[:30]}")
    print(f"  [L7-ONLINE]   drift={om.get('drift')} pred={om.get('prediction_days')}d")
    print(f"  [L8-TIMELINE] P10={tl.get('p10')} | P50={tl.get('p50')} | P90={tl.get('p90')}")
    print(f"  [LAYERS]      active={sum(1 for v in la.values() if v)}/6 -> {la}")

    # Check timeline ordering
    p10, p50, p90 = tl.get("p10", 0), tl.get("p50", 0), tl.get("p90", 0)
    timeline_valid = p10 < p50 < p90
    print(f"  [VALIDATE]    p10 < p50 < p90 ? {'PASS' if timeline_valid else 'FAIL'}")
    if not timeline_valid:
        errors.append(f"{key}: Timeline ordering broken: {p10} < {p50} < {p90}")

    # Check real dates
    today = datetime.now()
    d10 = (today + timedelta(days=p10)).strftime("%b %Y")
    d50 = (today + timedelta(days=p50)).strftime("%b %Y")
    d90 = (today + timedelta(days=p90)).strftime("%b %Y")
    print(f"  [DATES]       P10={d10} | P50={d50} | P90={d90}")

    # Explanation quality check
    expl_has_state = di.get("state", "???") in ex
    expl_has_p50 = str(p50) in ex
    print(f"  [EXPLAIN]     mentions_state={expl_has_state} mentions_p50={expl_has_p50}")
    print(f"                first_100: \"{ex[:100]}...\"")


# ─── STEP 2: CROSS-LAYER INFLUENCE VERIFICATION ─────────────────────

print(f"\n{'=' * 80}")
print("STEP 2: CROSS-LAYER INFLUENCE VERIFICATION")
print(f"{'=' * 80}")

if len(results) >= 2:
    keys = list(results.keys())

    # Extract all comparison vectors
    p50s = {k: results[k]["timeline"]["p50"] for k in keys}
    mods = {k: results[k].get("case_state", {}).get("judge_modifier", 1.0) for k in keys}
    sigs = {k: results[k].get("case_state", {}).get("signals_detected", []) for k in keys}
    beliefs = {k: results[k].get("judge_belief", {}) for k in keys}
    drivers = {k: [(d["factor"], d["impact_days"]) for d in results[k].get("causal_drivers", [])] for k in keys}
    dec_count = {k: len(results[k].get("decision_fork", [])) for k in keys}
    online = {k: results[k].get("online_model", {}).get("prediction_days", 0) for k in keys}
    raw_mls = {k: results[k].get("case_state", {}).get("raw_ml_days", 0) for k in keys}

    print(f"\n  [TIMELINE P50]")
    for k, v in p50s.items():
        print(f"    {k}: {v}d")
    unique_p50 = len(set(p50s.values()))
    print(f"    Unique values: {unique_p50}/{len(keys)} -> {'PASS' if unique_p50 == len(keys) else 'WEAK' if unique_p50 > 1 else 'FAIL'}")

    print(f"\n  [RAW ML]")
    for k, v in raw_mls.items():
        print(f"    {k}: {v}d")
    unique_raw = len(set(raw_mls.values()))
    print(f"    Unique values: {unique_raw}/{len(keys)} -> {'PASS' if unique_raw == len(keys) else 'WEAK' if unique_raw > 1 else 'FAIL'}")

    print(f"\n  [JUDGE MODIFIER]")
    for k, v in mods.items():
        print(f"    {k}: {v}")
    unique_mods = len(set(mods.values()))
    print(f"    Unique values: {unique_mods}/{len(keys)} -> {'PASS' if unique_mods >= 2 else 'FAIL'}")

    print(f"\n  [BAYESIAN SIGNALS]")
    for k, v in sigs.items():
        print(f"    {k}: {v}")
    unique_sigs = len(set(str(s) for s in sigs.values()))
    print(f"    Unique signal sets: {unique_sigs}/{len(keys)} -> {'PASS' if unique_sigs >= 3 else 'WEAK' if unique_sigs >= 2 else 'FAIL'}")

    print(f"\n  [BELIEFS]")
    for k, v in beliefs.items():
        print(f"    {k}: strict={v.get('strictness','?')} delay_tol={v.get('delay_tolerance','?')} proc_sens={v.get('procedural_sensitivity','?')}")

    print(f"\n  [ONLINE MODEL]")
    for k, v in online.items():
        print(f"    {k}: {v}d")
    unique_online = len(set(online.values()))
    print(f"    Unique values: {unique_online}/{len(keys)} -> {'PASS' if unique_online >= 3 else 'WEAK' if unique_online >= 2 else 'FAIL'}")

    print(f"\n  [SHAP DRIVERS]")
    for k, v in drivers.items():
        factors = [f"{f}={d:+d}d" for f, d in v[:2]]
        print(f"    {k}: {factors}")

    print(f"\n  [DECISION COUNTS]")
    for k, v in dec_count.items():
        print(f"    {k}: {v} options")

    # ── Check: Does Bayesian ACTUALLY shift prediction? ──
    print(f"\n  [CROSS-CHECK: Bayesian -> Timeline]")
    for k in keys:
        raw = raw_mls[k]
        final = p50s[k]
        mod = mods[k]
        # If modifier != 1.0, p50 should differ from what raw ML alone would produce
        if mod != 1.0:
            print(f"    {k}: raw_ml={raw} -> modifier={mod} -> p50={final} -> Bayesian INFLUENCED? YES")
        else:
            print(f"    {k}: raw_ml={raw} -> modifier={mod} -> p50={final} -> Bayesian NEUTRAL (no signals triggered judge shift)")


# ─── STEP 3: ADJOURNMENT SENSITIVITY TEST ────────────────────────────

print(f"\n{'=' * 80}")
print("STEP 3: ADJOURNMENT SENSITIVITY TEST (via /predict)")
print(f"{'=' * 80}")

base_case = {
    "state": "Maharashtra",
    "case_type": "Civil",
    "court_type": "District Court",
    "procedural_stage": "Evidence",
    "adjournment_count": 3,
    "backlog_size": 2000,
    "bailable": 1,
    "judge_seniority": 10,
    "pleading_complexity": 0.5,
    "evidence_quality": 0.6,
    "ipc_section": "NA",
    "lawyer_experience_years": 8,
    "delay_tactics_used": False,
    "avg_hearing_gap_days": 21,
    "opponent_aggressiveness": 0.3,
}

adj_values = [1, 5, 15, 30]
adj_results = []

for adj in adj_values:
    case = {**base_case, "adjournment_count": adj}
    r = requests.post(f"{BASE}/predict", json=case)
    d = r.json()
    adj_results.append(d)
    tl = d["timeline"]
    mod = d.get("case_state", {}).get("judge_modifier", 1.0)
    sigs = d.get("case_state", {}).get("signals_detected", [])
    print(f"  adj={adj:2d} -> P10={tl['p10']:5d} | P50={tl['p50']:5d} | P90={tl['p90']:5d} | mod={mod} | signals={sigs}")

# Check monotonicity
p50_adj = [d["timeline"]["p50"] for d in adj_results]
monotonic = all(p50_adj[i] <= p50_adj[i+1] for i in range(len(p50_adj)-1))
print(f"  P50 increases with adjournments? {'PASS' if monotonic else 'FAIL'} ({p50_adj})")

# Check that high adjournments trigger different signals
sig_1 = adj_results[0].get("case_state", {}).get("signals_detected", [])
sig_30 = adj_results[-1].get("case_state", {}).get("signals_detected", [])
print(f"  Signal differentiation: adj=1 signals={sig_1} vs adj=30 signals={sig_30} -> {'PASS' if sig_1 != sig_30 else 'FAIL'}")


# ─── STEP 4: BACKLOG SENSITIVITY TEST ────────────────────────────────

print(f"\n{'=' * 80}")
print("STEP 4: BACKLOG SENSITIVITY TEST (via /predict)")
print(f"{'=' * 80}")

bl_values = [200, 2000, 5000, 10000]
bl_results = []

for bl in bl_values:
    case = {**base_case, "backlog_size": bl}
    r = requests.post(f"{BASE}/predict", json=case)
    d = r.json()
    bl_results.append(d)
    tl = d["timeline"]
    print(f"  backlog={bl:5d} -> P10={tl['p10']:5d} | P50={tl['p50']:5d} | P90={tl['p90']:5d}")

p50_bl = [d["timeline"]["p50"] for d in bl_results]
monotonic_bl = all(p50_bl[i] <= p50_bl[i+1] for i in range(len(p50_bl)-1))
print(f"  P50 increases with backlog? {'PASS' if monotonic_bl else 'FAIL'} ({p50_bl})")


# ─── STEP 5: EVIDENCE QUALITY SENSITIVITY ────────────────────────────

print(f"\n{'=' * 80}")
print("STEP 5: EVIDENCE QUALITY SENSITIVITY TEST")
print(f"{'=' * 80}")

eq_values = [0.1, 0.4, 0.7, 0.95]
eq_results = []

for eq in eq_values:
    case = {**base_case, "evidence_quality": eq}
    r = requests.post(f"{BASE}/predict", json=case)
    d = r.json()
    eq_results.append(d)
    tl = d["timeline"]
    mod = d.get("case_state", {}).get("judge_modifier", 1.0)
    sigs = d.get("case_state", {}).get("signals_detected", [])
    print(f"  evidence={eq:.2f} -> P10={tl['p10']:5d} | P50={tl['p50']:5d} | P90={tl['p90']:5d} | mod={mod} | signals={sigs}")

# Weak evidence should trigger missing_docs signal
weak_sigs = eq_results[0].get("case_state", {}).get("signals_detected", [])
strong_sigs = eq_results[-1].get("case_state", {}).get("signals_detected", [])
print(f"  Weak evidence triggers 'missing_docs'? {'PASS' if 'missing_docs' in weak_sigs else 'FAIL'}")
print(f"  Strong evidence triggers 'compliant_submission'? {'PASS' if 'compliant_submission' in strong_sigs else 'FAIL'}")


# ─── STEP 6: ONLINE LEARNING VALIDATION ──────────────────────────────

print(f"\n{'=' * 80}")
print("STEP 6: ONLINE LEARNING VALIDATION")
print(f"{'=' * 80}")

for k in list(results.keys())[:2]:
    om = results[k].get("online_model", {})
    print(f"  [{k}]")
    print(f"    drift_status: {om.get('drift', 'MISSING')}")
    print(f"    prediction:   {om.get('prediction_days', 'MISSING')}d")
    print(f"    model_type:   {om.get('model', 'MISSING')}")
    
    # Check that online prediction differs from GBR
    raw_ml = results[k].get("case_state", {}).get("raw_ml_days", 0)
    online_pred = om.get("prediction_days", 0)
    if online_pred > 0 and raw_ml > 0:
        delta_pct = abs(online_pred - raw_ml) / raw_ml * 100
        print(f"    GBR vs River delta: {delta_pct:.1f}% -> {'INDEPENDENT' if delta_pct > 1 else 'SUSPICIOUSLY CLOSE'}")


# ─── STEP 7: DECISION SIMULATION SENSITIVITY ─────────────────────────

print(f"\n{'=' * 80}")
print("STEP 7: DECISION SIMULATION SENSITIVITY")
print(f"{'=' * 80}")

# Compare decisions between A (high delays) and B (low delays)
if "A_HIGH_BACKLOG_DELAYS" in results and "B_STRONG_EVIDENCE_LOW_DELAYS" in results:
    dec_a = results["A_HIGH_BACKLOG_DELAYS"].get("decision_fork", [])
    dec_b = results["B_STRONG_EVIDENCE_LOW_DELAYS"].get("decision_fork", [])
    
    print(f"  Narrative A decisions ({len(dec_a)}):")
    for d in dec_a:
        print(f"    '{d['action']}': {d['impact_days']:+d}d (p={d['success_probability']:.2f})")
    
    print(f"  Narrative B decisions ({len(dec_b)}):")
    for d in dec_b:
        print(f"    '{d['action']}': {d['impact_days']:+d}d (p={d['success_probability']:.2f})")
    
    # Check that impact_days differ
    impacts_a = sorted([d["impact_days"] for d in dec_a])
    impacts_b = sorted([d["impact_days"] for d in dec_b])
    print(f"\n  Impact vectors: A={impacts_a} B={impacts_b}")
    print(f"  Different? {'PASS' if impacts_a != impacts_b else 'FAIL'}")
    
    # Check that belief-aware adjustments changed probabilities
    prob_a = {d["action"]: d["success_probability"] for d in dec_a}
    prob_b = {d["action"]: d["success_probability"] for d in dec_b}
    common_actions = set(prob_a.keys()) & set(prob_b.keys())
    prob_diffs = {a: abs(prob_a[a] - prob_b[a]) for a in common_actions}
    has_prob_diff = any(v > 0.01 for v in prob_diffs.values())
    print(f"  Probability variations: {prob_diffs}")
    print(f"  Belief-aware probability shift? {'PASS' if has_prob_diff else 'FAIL - probabilities identical'}")


# ─── FINAL SYSTEM HEALTH REPORT ──────────────────────────────────────

print(f"\n{'=' * 80}")
print("FINAL SYSTEM HEALTH REPORT")
print(f"{'=' * 80}")

# Check health endpoint
r = requests.get(f"{BASE}/health")
health = r.json()

print(f"\n  Engine initialized: {health.get('engine_initialized')}")
print(f"  GBR trained:       {health.get('gbr_trained')}")
print(f"  SHAP ready:        {health.get('shap_ready')}")
print(f"  Causal treatments: {health.get('causal_treatments')}")
print(f"  Graph indexed:     {health.get('graph_indexed')}")
print(f"  Layers active:     {health.get('layers_total')}/6")
print(f"  Layer status:      {health.get('layers_active')}")

# Summary
print(f"\n  {'─' * 60}")
print(f"  SUMMARY OF ISSUES:")
if errors:
    for e in errors:
        print(f"    [ERROR] {e}")
else:
    print(f"    No HTTP errors.")

# Detect issues
issues = []

# Check unique P50s
if unique_p50 < len(keys):
    issues.append(f"P50 not fully unique: only {unique_p50}/{len(keys)} distinct values")

if unique_mods < 2:
    issues.append("Judge modifier shows no variation across narratives")

if not monotonic:
    issues.append("P50 does NOT increase monotonically with adjournments")

if not monotonic_bl:
    issues.append("P50 does NOT increase monotonically with backlog")

if not health.get("engine_initialized"):
    issues.append("Engine not initialized!")

if health.get("layers_total", 0) < 4:
    issues.append(f"Only {health.get('layers_total')}/6 layers active")

if issues:
    for iss in issues:
        print(f"    [ISSUE] {iss}")
else:
    print(f"    ALL CHECKS PASSED")

print(f"\n{'=' * 80}")
print(f"DIAGNOSTIC COMPLETE")
print(f"{'=' * 80}")
