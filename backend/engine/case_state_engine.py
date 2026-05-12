"""
CaseStateEngine — Unified Litigation Intelligence Orchestrator.

Replaces fragmented function calls in main.py with a single pipeline
where every layer influences every other layer:

  Narrative → Features → ML → Bayesian → Graph → Simulation → Explainability → Response
"""

import numpy as np
from typing import Dict, List, Any, Optional, Callable


class CaseStateEngine:
    """
    Single entry point for all intelligence computation.
    Every layer reads from and writes to the same evolving case state.
    """

    def __init__(
        self,
        *,
        ml_layer=None,
        causal_layer=None,
        bayesian_layer=None,
        simulation_engine=None,
        graph_layer=None,
        # Core functions from main.py (depend on global state there)
        extract_features_fn: Callable = None,
        gbr_predict_fn: Callable = None,
        indian_adjust_fn: Callable = None,
        compute_ci_fn: Callable = None,
        shap_drivers_fn: Callable = None,
        simulate_decisions_fn: Callable = None,
        build_insights_fn: Callable = None,
    ):
        self.ml = ml_layer
        self.causal = causal_layer
        self.bayes = bayesian_layer
        self.sim = simulation_engine
        self.graph = graph_layer

        self._extract_features = extract_features_fn
        self._gbr_predict = gbr_predict_fn
        self._indian_adjust = indian_adjust_fn
        self._compute_ci = compute_ci_fn
        self._shap_drivers = shap_drivers_fn
        self._simulate_decisions = simulate_decisions_fn
        self._build_insights = build_insights_fn

    # ── Public API ──────────────────────────────────────────────────

    def analyze(self, narrative_text: str) -> Dict[str, Any]:
        """Full pipeline from free-text narrative."""
        features = self._extract_features(narrative_text)
        return self._run_pipeline(features, narrative=narrative_text)

    def analyze_structured(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """Full pipeline from structured form input."""
        return self._run_pipeline(features)

    # ── Unified Pipeline ────────────────────────────────────────────

    def _run_pipeline(self, features: Dict[str, Any], narrative: str = None) -> Dict[str, Any]:
        print(f"[ENGINE] Pipeline START | state={features.get('state')} type={features.get('case_type')} court={features.get('court_type')} stage={features.get('procedural_stage')}")

        # ── LAYER 1: ML Backbone ──
        raw_ml = self._gbr_predict(features)
        adj_result = self._indian_adjust(raw_ml, features)
        ci = self._compute_ci(features)
        print(f"[ENGINE] L1-ML: raw={raw_ml:.0f} adjusted={adj_result['adjusted_days']:.0f} ci_p50={ci['p50']}")

        # ── LAYER 2: Bayesian Judge Beliefs ──
        signals = self._extract_signals(features)
        judge_belief = {}
        judge_modifier = 1.0

        if self.bayes:
            judge_belief = self.bayes.update_beliefs(
                "default", signals, features.get("state")
            )
            judge_modifier = self._compute_judge_modifier(judge_belief, features)

            # Beliefs SHIFT the prediction
            ci["p10"] = max(30, int(ci["p10"] * judge_modifier))
            ci["p50"] = max(30, int(ci["p50"] * judge_modifier))
            ci["p90"] = max(60, int(ci["p90"] * judge_modifier))
            ci["judge_modifier"] = judge_modifier
            print(f"[ENGINE] L2-BAYES: signals={signals} modifier={judge_modifier} new_p50={ci['p50']} belief={judge_belief}")

        # ── LAYER 3: Graph Similarity Calibration ──
        similar_cases = []
        if self.graph and self.graph.index is not None:
            try:
                similar_cases = self.graph.get_similar_cases(features, top_k=5) or []
                if similar_cases:
                    ci = self._calibrate_from_precedents(ci, similar_cases)
                    print(f"[ENGINE] L3-GRAPH: {len(similar_cases)} similar cases found, p50_calibrated={ci['p50']}")
            except Exception as e:
                print(f"[ENGINE] L3-GRAPH error: {e}")

        # ── LAYER 4: Multi-Factor Causal ──
        causal_effects = []
        if self.causal:
            for factor in ["backlog_size", "adjournment_count"]:
                try:
                    effect = self.causal.estimate_impact(factor, features)
                    causal_effects.append(effect)
                    print(f"[ENGINE] L4-CAUSAL: {factor} → {effect.get('impact_days', 0)}d ({effect.get('confidence', 'N/A')})")
                except Exception as e:
                    print(f"[ENGINE] L4-CAUSAL {factor} error: {e}")

        # ── LAYER 5: SHAP Drivers ──
        drivers = self._shap_drivers(features)
        print(f"[ENGINE] L5-SHAP: {len(drivers)} drivers")

        # ── LAYER 6: Belief-Aware Decision Simulation ──
        decisions = self._simulate_decisions(features, ci["p50"])
        if self.sim and judge_belief:
            decisions = self._apply_belief_adjustments(decisions, judge_belief, features)
        print(f"[ENGINE] L6-SIM: {len(decisions)} decision options")

        # ── LAYER 7: Online Learning ──
        online_status = {"drift": "INACTIVE", "prediction_days": 0}
        if self.ml:
            try:
                ml_feats = self._build_river_features(features)
                online_pred = self.ml.predict(ml_feats)
                online_status = {
                    "drift": online_pred.get("drift_status", "STABLE"),
                    "prediction_days": online_pred.get("prediction_days", 0),
                    "model": online_pred.get("model_type", "River"),
                }
                print(f"[ENGINE] L7-ONLINE: pred={online_status['prediction_days']}d drift={online_status['drift']}")
            except Exception as e:
                print(f"[ENGINE] L7-ONLINE error: {e}")

        # ── LAYER 8: Monte Carlo Simulation ──
        mc_result = None
        if self.sim:
            try:
                mc_result = self.sim.run_monte_carlo(ci["p50"])
                print(f"[ENGINE] L8-MC: p10={mc_result['p10']} p50={mc_result['p50']} p90={mc_result['p90']}")
            except Exception as e:
                print(f"[ENGINE] L8-MC error: {e}")

        # ── Build Unified Response ──
        insights = self._build_insights(features, ci)
        explanation = self._build_explanation(
            features, ci, drivers, adj_result, causal_effects,
            similar_cases, judge_belief, online_status
        )
        confidence_notes = self._build_confidence_notes(
            features, ci, adj_result, insights, judge_belief, online_status
        )

        response = {
            "data_insights": insights,
            "causal_drivers": [d.dict() if hasattr(d, "dict") else d for d in drivers],
            "timeline": ci,
            "decision_fork": [d.dict() if hasattr(d, "dict") else d for d in decisions],
            "explanation": explanation,
            "confidence_notes": confidence_notes,
            # ── NEW unified fields ──
            "similar_cases": similar_cases,
            "judge_belief": {
                k: v for k, v in judge_belief.items()
                if k in ("strictness", "delay_tolerance", "procedural_sensitivity")
            } if judge_belief else {},
            "causal_effects": causal_effects,
            "online_model": online_status,
            "case_state": {
                "raw_ml_days": int(raw_ml),
                "judge_modifier": round(judge_modifier, 3),
                "signals_detected": signals,
                "layers_active": {
                    "ml_gbr": True,
                    "bayesian": self.bayes is not None,
                    "causal": self.causal is not None and bool(getattr(self.causal, "estimators", {})),
                    "graph": self.graph is not None and getattr(self.graph, "index", None) is not None,
                    "online": self.ml is not None,
                    "simulation": self.sim is not None,
                },
            },
        }

        print(f"[ENGINE] Pipeline COMPLETE | p50={ci['p50']} drivers={len(drivers)} decisions={len(decisions)} similar={len(similar_cases)} layers={sum(response['case_state']['layers_active'].values())}/6")
        return response

    # ── Signal Extraction ───────────────────────────────────────────

    def _extract_signals(self, features: Dict[str, Any]) -> List[str]:
        """Derive Bayesian update signals from case features."""
        signals = []
        adj = float(features.get("adjournment_count", 5))
        eq = float(features.get("evidence_quality", 0.55))
        delay = features.get("delay_tactics_used", False)
        opp = float(features.get("opponent_aggressiveness", 0.5))
        stage = features.get("procedural_stage", "Evidence")

        if adj >= 10:
            signals.append("repeated_adjournments")
        if eq < 0.4:
            signals.append("missing_docs")
        if delay:
            signals.append("irritation")
        if opp > 0.7:
            signals.append("irritation")
        if opp <= 0.35 and eq >= 0.65:
            signals.append("compliant_submission")
        if stage in ("Arguments", "Judgment"):
            signals.append("settlement_attempt")

        return signals

    # ── Judge Modifier ──────────────────────────────────────────────

    def _compute_judge_modifier(self, belief: Dict, features: Dict) -> float:
        """
        Convert judge belief vector into a prediction multiplier.
        < 1.0 = faster disposal, > 1.0 = slower disposal.
        """
        strictness = belief.get("strictness", 0.5)
        delay_tol = belief.get("delay_tolerance", 0.5)
        proc_sens = belief.get("procedural_sensitivity", 0.5)

        modifier = 1.0
        adj = float(features.get("adjournment_count", 5))
        backlog = float(features.get("backlog_size", 2000))
        eq = float(features.get("evidence_quality", 0.55))

        # Strict judge + many adjournments → pushes faster disposal
        if strictness > 0.65 and adj > 8:
            modifier *= max(0.82, 1.0 - (strictness - 0.5) * 0.25)

        # Tolerant judge + congested court → slower
        if delay_tol > 0.6 and backlog > 3000:
            modifier *= min(1.18, 1.0 + (delay_tol - 0.5) * 0.22)

        # Procedurally sensitive + weak evidence → penalty
        if proc_sens > 0.65 and eq < 0.4:
            modifier *= min(1.22, 1.0 + (proc_sens - 0.5) * 0.30)

        return round(modifier, 3)

    # ── Precedent Calibration ───────────────────────────────────────

    def _calibrate_from_precedents(self, ci: Dict, similar_cases: List[Dict]) -> Dict:
        """Blend ML prediction with precedent outcomes for calibration."""
        if not similar_cases or len(similar_cases) < 2:
            return ci

        durations = [c.get("duration", 0) for c in similar_cases if c.get("duration")]
        if not durations:
            return ci

        precedent_median = float(np.median(durations))
        precedent_std = float(np.std(durations)) if len(durations) >= 3 else ci["p50"] * 0.3

        # Blend: 80% ML, 20% precedent (capped at 30% for 5+ matches)
        blend = min(0.30, 0.08 * len(similar_cases))
        calibrated_p50 = int(ci["p50"] * (1 - blend) + precedent_median * blend)

        # Tighten CI if precedents are consistent
        ml_spread = ci["p90"] - ci["p10"]
        if precedent_std < ml_spread * 0.4:
            ci["p10"] = max(30, int(ci["p10"] * 1.03))
            ci["p90"] = int(ci["p90"] * 0.97)
            ci["calibration"] = "Precedent-tightened"
        else:
            ci["calibration"] = "Precedent-validated"

        ci["p50"] = max(30, calibrated_p50)
        ci["precedent_median"] = int(precedent_median)
        ci["precedent_count"] = len(similar_cases)
        return ci

    # ── Belief-Aware Decision Adjustment ────────────────────────────

    def _apply_belief_adjustments(self, decisions, judge_belief: Dict, features: Dict):
        """
        Modify decision success probabilities based on judge behavioral model.
        Strict judges boost 'discipline' actions, tolerant judges boost 'settlement'.
        """
        strictness = judge_belief.get("strictness", 0.5)
        delay_tol = judge_belief.get("delay_tolerance", 0.5)

        adjusted = []
        for d in decisions:
            d_dict = d.dict() if hasattr(d, "dict") else dict(d)
            action = d_dict.get("action", "").lower()

            # Strict judge → adjournment discipline is more effective
            if "adjournment" in action or "discipline" in action:
                if strictness > 0.6:
                    d_dict["success_probability"] = min(0.95, d_dict["success_probability"] * (1 + (strictness - 0.5) * 0.4))
                    d_dict["reasoning"] += f" Judge behavioral model (strictness={strictness:.2f}) amplifies this strategy's effectiveness."

            # Tolerant judge → settlement has better window
            if "settlement" in action or "lok adalat" in action.lower():
                if delay_tol > 0.6:
                    d_dict["success_probability"] = min(0.90, d_dict["success_probability"] * (1 + (delay_tol - 0.5) * 0.3))
                    d_dict["reasoning"] += f" Court's delay tolerance ({delay_tol:.2f}) creates favorable settlement conditions."

            # Early hearing less likely with tolerant judge
            if "early hearing" in action or "expedite" in action.lower():
                if delay_tol > 0.6:
                    d_dict["success_probability"] = max(0.10, d_dict["success_probability"] * (1 - (delay_tol - 0.5) * 0.2))

            adjusted.append(d_dict)

        return sorted(adjusted, key=lambda d: d.get("impact_days", 0))

    # ── River Model Features ────────────────────────────────────────

    def _build_river_features(self, features: Dict) -> Dict:
        return {
            "state": features.get("state", "Maharashtra"),
            "case_type": features.get("case_type", "Civil"),
            "ipc_section": str(features.get("ipc_section", "NA")),
            "bailable": float(features.get("bailable", 1)),
            "judge_seniority": float(features.get("judge_seniority", 10)),
            "pleading_complexity": float(features.get("pleading_complexity", 0.5)),
            "backlog_size": float(features.get("backlog_size", 2000)),
            "adjournment_count": float(features.get("adjournment_count", 5)),
        }

    # ── Explanation Builder ─────────────────────────────────────────

    def _build_explanation(self, features, ci, drivers, adj_result, causal_effects, similar_cases, judge_belief, online_status):
        state = features.get("state", "India")
        case_type = features.get("case_type", "Civil")
        court_type = features.get("court_type", "District Court")
        stage = features.get("procedural_stage", "Evidence")
        raw_ml = adj_result.get("adjusted_days", ci["p50"])

        parts = [
            f"Based on {ci.get('n_cases', 0):,} real case outcomes in {state} "
            f"({case_type}, {court_type}), the system projects approximately "
            f"{ci['p50']} days (~{round(ci['p50']/365, 1)} years) to resolution."
        ]

        # Adjustment notes
        notes = adj_result.get("notes", [])[:2]
        if notes:
            parts.append(" ".join(notes) + ".")

        # Primary driver
        if drivers:
            d0 = drivers[0] if not hasattr(drivers[0], "dict") else drivers[0].dict()
            parts.append(
                f"Primary driver: '{d0.get('factor', 'unknown')}' "
                f"({d0.get('impact_days', 0):+d} days)."
            )

        # Causal effects
        for ce in causal_effects[:1]:
            if ce.get("impact_days"):
                parts.append(
                    f"Causal analysis: {ce.get('factor', 'unknown')} contributes "
                    f"~{ce['impact_days']} days ({ce.get('confidence', 'N/A')})."
                )

        # Similar cases
        if similar_cases:
            parts.append(
                f"Validated against {len(similar_cases)} structurally similar precedents "
                f"(median outcome: {ci.get('precedent_median', 'N/A')} days)."
            )

        # Judge belief
        if judge_belief and judge_belief.get("strictness"):
            jmod = ci.get("judge_modifier", 1.0)
            if jmod != 1.0:
                direction = "accelerating" if jmod < 1 else "extending"
                parts.append(
                    f"Judge behavioral model is {direction} the projection "
                    f"by {abs(int((1 - jmod) * 100))}%."
                )

        # Online model
        if online_status.get("drift") == "RECALIBRATED":
            parts.append("Note: Distribution drift detected — model has self-recalibrated.")

        return " ".join(parts)

    def _build_confidence_notes(self, features, ci, adj_result, insights, judge_belief, online_status):
        jmod = ci.get("judge_modifier", 1.0)
        return (
            f"GBR: {insights.get('raw_ml_days', 0)}d → Adjusted: {ci['p50']}d. "
            f"Court: {features.get('court_type', 'N/A')} ({adj_result.get('court_factor_applied', 1.0)}x). "
            f"Stage: {features.get('procedural_stage', 'N/A')} ({int(adj_result.get('stage_mult', 0.6)*100)}% remaining). "
            f"Cohort: {insights.get('n_cases_analyzed', 0):,} cases. "
            f"Spread: P10={ci['p10']}d — P90={ci['p90']}d. "
            f"Judge modifier: {jmod}x. "
            f"Precedents: {ci.get('precedent_count', 0)}. "
            f"Online drift: {online_status.get('drift', 'N/A')}. "
            f"Layers active: {sum(1 for v in self._get_active_layers().values() if v)}/6."
        )

    def _get_active_layers(self):
        return {
            "ml_gbr": True,
            "bayesian": self.bayes is not None,
            "causal": self.causal is not None and bool(getattr(self.causal, "estimators", {})),
            "graph": self.graph is not None and getattr(self.graph, "index", None) is not None,
            "online": self.ml is not None,
            "simulation": self.sim is not None,
        }
