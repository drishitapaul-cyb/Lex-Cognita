import os
import sys
import logging
from typing import Optional

# Path configuration for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from engine.llm_client import llm_client
from data_layer import data_layer
from ml_layer import MLLayer
from causal_layer import CausalLayer
from bayesian_layer import bayesian_layer
from graph_layer import GraphLayer
from simulation_engine import SimulationEngine

# Initialize standard engine layers
# These are shared singletons or instances
ml_layer = MLLayer(data_layer)
graph_layer = GraphLayer(data_layer)
causal_layer = CausalLayer(data_layer)
sim_engine = SimulationEngine(data_layer)

async def run_pipeline(narrative: str):
    print(f"Conducting Pipeline for Narrative: {narrative[:50]}...")
    
    # 1. PARSE: Narrative -> Signals (LLM)
    parsed = await llm_client.parse_narrative(narrative)
    
    # 2. CONTEXT PREP: Use parsed stage/signals to find case parameters
    # Fallback to realistic defaults if LLM is vague
    case_params = {
        "state": "Maharashtra", # Default or extract from narrative
        "case_type": "Civil",    # Default or extract
        "backlog_size": 2500,    # Generic context
        "adjournment_count": 5,
        "current_stage": parsed.get("case_stage", "Filing"),
        "judge_signals": parsed.get("judge_signals", [])
    }
    
    # 3. ENGINE PROCESSING (Deterministic)
    ml_res = ml_layer.predict(case_params)
    
    # Causal heterogeneity (EconML)
    causal_res = [causal_layer.estimate_impact('backlog_size', case_params)]
    
    # Graph Similarity search (FAISS)
    precedents = graph_layer.get_similar_cases(case_params)
    
    # Bayesian Judge Update
    judge_id = "JDG-DEFAULT"
    bayesian_layer.update_beliefs(judge_id, case_params["judge_signals"])
    
    # Simulation (Monte Carlo)
    timeline = sim_engine.run_monte_carlo(ml_res["prediction_days"])
    
    # Decision fork
    fork = [sim_engine.simulate_decision(case_params["current_stage"], "expedite")]

    # 4. EXPLAIN: Engine Result -> Narrated Strategy (LLM)
    engine_data = {
        "stats": timeline,
        "causal": causal_res,
        "precedents": precedents,
        "decision": fork[0]
    }
    
    explanation = await llm_client.explain_results(engine_data)
    
    # 5. SYNTHESIZE: Final Unified JSON
    return {
        "timeline": timeline,
        "causal_drivers": causal_res,
        "precedents": precedents,
        "decision_fork": fork,
        "system_status": {
            "drift": ml_res["drift_status"],
            "parser_confidence": parsed.get("confidence", "Low")
        },
        "recommended_action": fork[0]["action"],
        "explanation": explanation,
        "parsed_signals": parsed
    }
