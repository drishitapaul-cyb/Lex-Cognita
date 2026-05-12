"""Validate the unified CaseStateEngine with 3 different narratives."""
import requests
import json

NARRATIVES = [
    {
        "label": "FRESH PROPERTY (Jaipur)",
        "text": "New property dispute case just filed in Jaipur District Court. Simple land boundary issue. Cooperative opponent willing to settle. Strong evidence with certified documents. Junior advocate with 2 years experience."
    },
    {
        "label": "CRIMINAL MURDER (Delhi)",
        "text": "Murder case under Section 302 IPC in Delhi Sessions Court. 15 adjournments over 3 years. Hostile opponent filing frivolous applications. Deliberately delaying proceedings. Missing forensic documents. Senior judge with 20 years experience. Aggressive prosecution seeking maximum sentence."
    },
    {
        "label": "HC COMMERCIAL (Mumbai)",
        "text": "Commercial contract dispute in Bombay High Court at final arguments stage. 5000 cases backlog. Expert witness testimony completed. Strong evidence with notarized contracts. Senior counsel with 18 years. Judgment reserved. Opponent willing to negotiate consent terms."
    },
]

print("=" * 80)
print("VALIDATION: 3 DIFFERENT NARRATIVES — UNIFIED ENGINE")
print("=" * 80)

results = []
for n in NARRATIVES:
    r = requests.post("http://localhost:8000/analyze", json={"text": n["text"]})
    d = r.json()
    results.append(d)

    cs = d.get("case_state", {})
    tl = d.get("timeline", {})
    jb = d.get("judge_belief", {})
    sc = d.get("similar_cases", [])
    ce = d.get("causal_effects", [])
    om = d.get("online_model", {})
    layers = cs.get("layers_active", {})

    print(f"\n--- {n['label']} ---")
    print(f"  Timeline: P10={tl.get('p10')} | P50={tl.get('p50')} | P90={tl.get('p90')}")
    print(f"  Judge modifier: {cs.get('judge_modifier', 'N/A')}")
    print(f"  Signals detected: {cs.get('signals_detected', [])}")
    print(f"  Judge belief: strict={jb.get('strictness','?')} delay_tol={jb.get('delay_tolerance','?')} proc_sens={jb.get('procedural_sensitivity','?')}")
    print(f"  Similar cases: {len(sc)}")
    causal_strs = [f"{c.get('factor','?')}={c.get('impact_days',0)}d" for c in ce]
    print(f"  Causal effects ({len(ce)}): {causal_strs}")
    print(f"  Online model: drift={om.get('drift', 'N/A')} pred={om.get('prediction_days', 0)}d")
    print(f"  SHAP drivers: {len(d.get('causal_drivers', []))}")
    print(f"  Decision options: {len(d.get('decision_fork', []))}")
    active = sum(1 for v in layers.values() if v)
    print(f"  Layers active: {active}/6 -> {layers}")

# Differentiation check
print(f"\n{'=' * 80}")
print("DIFFERENTIATION CHECK:")
p50s = [r["timeline"]["p50"] for r in results]
mods = [r.get("case_state", {}).get("judge_modifier", 1.0) for r in results]
sigs = [r.get("case_state", {}).get("signals_detected", []) for r in results]
print(f"  P50 values: {p50s}")
print(f"    All different? {len(set(p50s)) == 3}")
print(f"  Judge modifiers: {mods}")
print(f"    Variation? {len(set(mods)) >= 2}")
print(f"  Signal sets: {sigs}")
print(f"    All different? {sigs[0] != sigs[1] and sigs[1] != sigs[2]}")

all_pass = (
    len(set(p50s)) == 3
    and len(set(mods)) >= 2
    and sigs[0] != sigs[1]
)
print(f"\n{'PASS' if all_pass else 'FAIL'}: Unified engine produces {'differentiated' if all_pass else 'IDENTICAL'} outputs")
