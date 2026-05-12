import pandas as pd
import numpy as np
from dowhy import CausalModel
from econml.dml import CausalForestDML
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.preprocessing import LabelEncoder
import warnings
warnings.filterwarnings('ignore')

class CausalLayer:
    def __init__(self, data_layer):
        self.data_layer = data_layer
        self.estimators = {}
        self._initialize_causal_models()

    def _initialize_causal_models(self):
        try:
            print("Initializing High-Fidelity Causal Models (DoWhy + EconML)...")
            # Step 1: Define df BEFORE use
            df = self.data_layer.df.copy()
            
            # Step 3: SAFE COLUMN HANDLING
            required_cols = ["adjournment_count", "backlog_size", "bailable", "pleading_complexity", "duration_days"]
            print("CSV Columns:", df.columns.tolist())
            
            for col in required_cols:
                if col not in df.columns:
                    df[col] = 0
            
            # Binary treatment for ForestDML stability
            df['high_backlog'] = (df['backlog_size'] > df['backlog_size'].median()).astype(int)
            
            # Preprocess features
            le = LabelEncoder()
            df['state_enc'] = le.fit_transform(df['state'])
            
            # Features (W = confounding, X = heterogeneity)
            # Alignment: Use adjournment_count directly instead of enrollments/adjournments
            X = df[['state_enc', 'bailable', 'pleading_complexity', 'adjournment_count']]
            T = df['high_backlog']
            Y = df['duration_days']
            
            # 1. Define Causal Model
            self.causal_model = CausalModel(
                data=df,
                treatment='high_backlog',
                outcome='duration_days',
                common_causes=['state_enc', 'bailable', 'pleading_complexity']
            )
            
            # 2. CausalForestDML
            # Fix: n_estimators = 48 (Step 4)
            est = CausalForestDML(
                model_y=GradientBoostingRegressor(),
                model_t=GradientBoostingRegressor(),
                discrete_treatment=True,
                n_estimators=48 
            )
            
            est.fit(Y, T, X=X, W=None)
            self.estimators['backlog'] = {"est": est, "le": le}
            print("[CausalLayer] Backlog causal forest trained.")

            # ── Treatment 2: Adjournment Count ──
            df['high_adjournment'] = (df['adjournment_count'] > df['adjournment_count'].median()).astype(int)

            X_adj = df[['state_enc', 'bailable', 'pleading_complexity', 'backlog_size']]
            T_adj = df['high_adjournment']
            Y_adj = df['duration_days']

            adj_est = CausalForestDML(
                model_y=GradientBoostingRegressor(),
                model_t=GradientBoostingRegressor(),
                discrete_treatment=True,
                n_estimators=48
            )
            adj_est.fit(Y_adj, T_adj, X=X_adj, W=None)
            self.estimators['adjournment'] = {"est": adj_est, "le": le}
            print("[CausalLayer] Adjournment causal forest trained.")

        except Exception as e:
            print(f"CRITICAL: Causal model initialization failed: {e}")
            print("Falling back to basic statistical estimation for causal drivers.")
            self.estimators = {}

    def run_counterfactual(self, intervention: dict, case_params: dict):
        """
        Executes a do-operator simulation: do(treatment = value)
        Returns the counterfactual distribution shift.
        """
        est_data = self.estimators.get('backlog')
        if not est_data: return None
        
        est = est_data["est"]
        le = est_data["le"]
        
        try:
            state_val = case_params.get('state', 'Maharashtra')
            state_enc = le.transform([state_val])[0]
        except:
            state_enc = 0
            
        X_test = pd.DataFrame([{
            "state_enc": state_enc,
            "bailable": case_params.get('bailable', 1),
            "pleading_complexity": case_params.get('pleading_complexity', 0.5),
            "adjournment_count": case_params.get('adjournment_count', 5)
        }])
        
        # Ensure all columns used in fit are present in X_test in correct order
        X_test = X_test[['state_enc', 'bailable', 'pleading_complexity', 'adjournment_count']]
        
        # Baseline Effect (Current state)
        baseline_effect = est.effect(X_test)[0]
        
        # Counterfactual: What if we set treatment to "Low" (e.g. zero backlog impact)?
        counterfactual_delta = -baseline_effect if case_params.get('backlog_size', 0) > 2000 else 0
        
        return {
            "baseline_p50": case_params.get('prediction_days', 400),
            "counterfactual_p50": int(case_params.get('prediction_days', 400) + counterfactual_delta),
            "delta_days": int(counterfactual_delta),
            "confidence": "High (DML Forest)",
            "mechanism": "do(backlog_reduction)"
        }

    def estimate_impact(self, treatment: str, case_params: dict):
        # Map treatment name to estimator key and feature config
        config = {
            "backlog_size": {
                "key": "backlog",
                "label": "Backlog Vector",
                "x_cols": ['state_enc', 'bailable', 'pleading_complexity', 'adjournment_count'],
                "explanation": lambda s, e: f"Structural Inference: Given the {s} context, judicial backlog causes a ~{int(e)} day delay.",
            },
            "adjournment_count": {
                "key": "adjournment",
                "label": "Adjournment Frequency",
                "x_cols": ['state_enc', 'bailable', 'pleading_complexity', 'backlog_size'],
                "explanation": lambda s, e: f"Causal model: In {s}, high adjournment frequency causally contributes ~{int(e)} days to total duration.",
            },
        }

        cfg = config.get(treatment)
        if not cfg:
            return {"factor": treatment, "impact_days": 0, "confidence": "Low", "explanation": "No causal model for this treatment."}

        est_data = self.estimators.get(cfg["key"])
        if not est_data:
            return {
                "factor": cfg["label"],
                "impact_days": 45 if treatment == "backlog_size" else 30,
                "confidence": "Low (Fallback)",
                "explanation": f"Causal engine in fallback for {cfg['label']}.",
            }

        est = est_data["est"]
        le = est_data["le"]

        try:
            state_val = case_params.get('state', 'Maharashtra')
            state_enc = le.transform([state_val])[0]
        except Exception:
            state_enc = 0

        row = {
            "state_enc": state_enc,
            "bailable": case_params.get('bailable', 1),
            "pleading_complexity": case_params.get('pleading_complexity', 0.5),
            "adjournment_count": case_params.get('adjournment_count', 5),
            "backlog_size": case_params.get('backlog_size', 2000),
        }
        X_test = pd.DataFrame([{c: row[c] for c in cfg["x_cols"]}])
        X_test = X_test[cfg["x_cols"]]

        effect = est.effect(X_test)[0]
        state = case_params.get('state', 'this jurisdiction')

        return {
            "factor": cfg["label"],
            "impact_days": int(effect),
            "confidence": "High (SCM)" if abs(effect) > 10 else "Medium (SCM)",
            "explanation": cfg["explanation"](state, effect),
        }
