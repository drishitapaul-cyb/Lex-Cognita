import numpy as np
from typing import Dict, Optional, Any

class BayesianLayer:
    """
    Bayesian judge belief model.

    Priors are not constant 0.5 — they are anchored to the real
    historical distribution of the dataset per state.

    Belief dimensions (0–1):
      strictness            — tendency to enforce procedural rules strictly
      delay_tolerance       — tolerance for repeated adjournments
      procedural_sensitivity — reaction to missing documents / non-compliance
    """

    def __init__(self, data_layer=None):
        self.beliefs: Dict[str, Dict[str, float]] = {}
        self.state_priors: Dict[str, Dict[str, float]] = {}
        self._default_prior = {"strictness": 0.5, "delay_tolerance": 0.5, "procedural_sensitivity": 0.5}

        if data_layer is not None:
            self._compute_state_priors(data_layer)

    def _compute_state_priors(self, data_layer) -> None:
        """
        Derive per-state behavioral priors from the dataset.

        Logic:
          strictness            = fraction of cases in state with adj_count < national median
                                  (low adjournments → judge not tolerating delays → strict)
          delay_tolerance       = mean(adj_count) / max(adj_count) for the state
                                  (higher ratio → more delays are 'normal' for this court)
          procedural_sensitivity = fraction of cases above national median duration
                                   high fraction → systemic sensitivity to procedural delays
        """
        try:
            df = data_layer.df.copy()

            if "adjournment_count" not in df.columns or "state" not in df.columns:
                return

            national_adj_median = df["adjournment_count"].median()
            national_dur_median = df["duration_days"].median() if "duration_days" in df.columns else None
            adj_global_max = max(1.0, df["adjournment_count"].max())

            for state, group in df.groupby("state"):
                if len(group) < 10:
                    continue

                adj = group["adjournment_count"].dropna()

                strictness = float((adj < national_adj_median).mean())
                delay_tolerance = float(adj.mean() / adj_global_max)

                if national_dur_median is not None and "duration_days" in group.columns:
                    dur = group["duration_days"].dropna()
                    procedural_sensitivity = float((dur > national_dur_median).mean()) if len(dur) > 0 else 0.5
                else:
                    procedural_sensitivity = 0.5

                self.state_priors[str(state)] = {
                    "strictness": round(min(1.0, max(0.0, strictness)), 3),
                    "delay_tolerance": round(min(1.0, max(0.0, delay_tolerance)), 3),
                    "procedural_sensitivity": round(min(1.0, max(0.0, procedural_sensitivity)), 3),
                }

            print(f"[BayesianLayer] Priors computed for {len(self.state_priors)} states.")
        except Exception as e:
            print(f"[BayesianLayer] Prior computation failed: {e}")

    def get_judge_belief(self, judge_id: str, state: Optional[str] = None) -> Dict[str, Any]:
        """
        Return current belief vector for judge_id, seeded from data-derived
        state priors if not yet seen.
        """
        if judge_id not in self.beliefs:
            prior = self.state_priors.get(state or "", self._default_prior).copy()
            self.beliefs[judge_id] = prior

        belief = self.beliefs[judge_id].copy()
        belief["state_prior_used"] = state or "default"
        belief["data_anchored"] = bool(self.state_priors)
        return belief

    def update_beliefs(self, judge_id: str, signals: list, state: Optional[str] = None) -> Dict[str, float]:
        """
        Bayesian-style update: signals shift beliefs from the STATE PRIOR.

        IMPORTANT: Each analysis starts from the data-derived state prior,
        NOT from previously accumulated beliefs. This ensures each case
        gets independent, signal-driven beliefs.
        """
        # Always start from state prior (not accumulated beliefs)
        prior = self.state_priors.get(state or "", self._default_prior).copy()
        current = {k: v for k, v in prior.items()
                   if k in ("strictness", "delay_tolerance", "procedural_sensitivity")}

        signal_weights = {
            "irritation":             {"strictness": +0.12, "procedural_sensitivity": +0.18},
            "repeated_adjournments":  {"delay_tolerance": +0.10, "strictness": -0.05},
            "missing_docs":           {"procedural_sensitivity": +0.20, "strictness": +0.08},
            "compliant_submission":   {"procedural_sensitivity": -0.10, "delay_tolerance": -0.05},
            "settlement_attempt":     {"strictness": -0.06, "delay_tolerance": +0.05},
        }

        for signal in signals:
            weights = signal_weights.get(signal, {})
            for dim, delta in weights.items():
                old = current.get(dim, 0.5)
                # Logistic damping: update is smaller when already near 0 or 1
                damped = delta * (1 - abs(2 * old - 1))
                current[dim] = round(min(1.0, max(0.0, old + damped)), 3)

        return current


# Singleton — created in main.py with data_layer injected
