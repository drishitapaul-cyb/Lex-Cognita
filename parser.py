import os
import json
from google import genai
from google.genai import types

# Initialize Gemini Client
# Assumes GEMINI_API_KEY is set in the environment
client = genai.Client()

def load_judicial_fingerprint_graph(csv_path="judicial_fingerprints.csv"):
    """
    Mock function to load the CSV-based Judicial Fingerprint Graph.
    In a real scenario, this would parse the attached CSV.
    """
    # Mock data representing the CSV
    return {
        "Hon. S. Patil": {
            "base_adjournment_propensity": 0.30,
            "evidentiary_strictness": 0.90,
            "settlement_push": 0.70
        },
        "Hon. K. Murthy": {
            "base_adjournment_propensity": 0.60,
            "evidentiary_strictness": 0.50,
            "settlement_push": 0.40
        }
    }

def parse_legal_scenario(user_input_text):
    """
    Uses Gemini's NLP to extract entities and events from a scattered paragraph,
    maps them to the Judicial Fingerprint Graph, applies state machine modifiers,
    and computes the next Action Forks using MDP logic.
    """
    
    # 1. Load the Judicial Fingerprint Graph (mocked CSV)
    fingerprints = load_judicial_fingerprint_graph()
    
    # 2. Define the prompt for Gemini
    prompt = f"""
    You are the Core Reasoning Engine of LexPath Alpha.

    Your task is to upgrade the system from a simple rule-based or static probabilistic system into a dynamic, causal inference engine with adaptive learning.

    You must implement the following internal mechanisms:

    ### 1. CAUSAL GRAPH MODEL
    Represent litigation as a directed graph where:
    - Nodes = Case states (e.g., Filing, Evidence, Cross, Adjournment, Order Reserved)
    - Edges = Transitions triggered by actions or events
    - Edge weights = Probabilities + time cost
    You must:
    - Infer hidden causal relationships between events (e.g., "missing document" -> "judge irritation" -> "adjournment likelihood ↑")
    - Maintain dependencies (not independent variables)

    ### 2. BAYESIAN BELIEF UPDATES
    Continuously update judge profile using:
    - Prior beliefs from dataset
    - Likelihood from current narrative
    Update:
    - Strictness
    - Delay tolerance
    - Procedural sensitivity
    - Reaction to non-compliance
    Use approximate Bayesian reasoning (numerical precision is less important than directional correctness).

    ### 3. MARKOV DECISION PROCESS (MDP)
    Model each case as:
    - State (S)
    - Actions (A)
    - Transition Probabilities (P)
    - Reward Function (R)
    Where:
    - Reward = Negative time delay + positive procedural efficiency
    You must:
    - Evaluate at least 3 possible actions
    - Simulate forward 2-3 steps
    - Return optimal policy (not just immediate action)

    ### 4. TEMPORAL DYNAMICS
    Introduce a "Litigation Clock":
    - Every event modifies expected timeline
    - Maintain: Base duration, Updated duration, Delta change

    ### 5. UNCERTAINTY MODELING
    For every output:
    - Attach confidence score
    - Show variance (High / Medium / Low certainty)

    ### 6. SELF-CORRECTION LOOP
    If future inputs contradict past assumptions:
    - Adjust judge profile
    - Recalculate strategy

    ### 7. OUTPUT DISCIPLINE
    Never produce generic text.
    Always produce:
    1. Updated State Graph (abstract)
    2. Judge Belief Vector (numerical)
    3. Action Simulation Table
    4. Optimal Policy
    5. Confidence + Risk Notes

    ### 8. BEHAVIORAL RULES
    - Think like a litigation strategist, not a chatbot
    - Prefer causality over correlation
    - Prefer decisions over descriptions
    - Avoid verbosity
    - Avoid legal textbook explanations

    Narrative to process:
    "{user_input_text}"
    """
    
    # 3. Call Gemini API
    try:
        response = client.models.generate_content(
            model='gemini-3.1-pro-preview',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.2,
                response_schema=types.Schema(
                    type=types.Type.OBJECT,
                    properties={
                        "updated_state_graph": types.Schema(
                            type=types.Type.OBJECT,
                            properties={
                                "current_node": types.Schema(type=types.Type.STRING),
                                "causal_inferences": types.Schema(type=types.Type.ARRAY, items=types.Schema(type=types.Type.STRING)),
                                "active_edges": types.Schema(
                                    type=types.Type.ARRAY,
                                    items=types.Schema(
                                        type=types.Type.OBJECT,
                                        properties={
                                            "source": types.Schema(type=types.Type.STRING),
                                            "target": types.Schema(type=types.Type.STRING),
                                            "weight_probability": types.Schema(type=types.Type.NUMBER),
                                            "time_cost_days": types.Schema(type=types.Type.NUMBER)
                                        }
                                    )
                                )
                            }
                        ),
                        "judge_belief_vector": types.Schema(
                            type=types.Type.OBJECT,
                            properties={
                                "strictness": types.Schema(type=types.Type.NUMBER, description="0.0 to 1.0"),
                                "delay_tolerance": types.Schema(type=types.Type.NUMBER, description="0.0 to 1.0"),
                                "procedural_sensitivity": types.Schema(type=types.Type.NUMBER, description="0.0 to 1.0"),
                                "reaction_to_non_compliance": types.Schema(type=types.Type.NUMBER, description="0.0 to 1.0")
                            }
                        ),
                        "action_simulation_table": types.Schema(
                            type=types.Type.ARRAY,
                            items=types.Schema(
                                type=types.Type.OBJECT,
                                properties={
                                    "action": types.Schema(type=types.Type.STRING),
                                    "forward_simulation_steps": types.Schema(type=types.Type.ARRAY, items=types.Schema(type=types.Type.STRING)),
                                    "success_probability_percent": types.Schema(type=types.Type.NUMBER),
                                    "reward_score": types.Schema(type=types.Type.NUMBER),
                                    "time_impact_days": types.Schema(type=types.Type.NUMBER)
                                }
                            )
                        ),
                        "optimal_policy": types.Schema(
                            type=types.Type.OBJECT,
                            properties={
                                "recommended_action_sequence": types.Schema(type=types.Type.ARRAY, items=types.Schema(type=types.Type.STRING)),
                                "expected_total_duration_days": types.Schema(type=types.Type.NUMBER),
                                "delta_from_base_days": types.Schema(type=types.Type.NUMBER)
                            }
                        ),
                        "confidence_and_risk": types.Schema(
                            type=types.Type.OBJECT,
                            properties={
                                "confidence_score_percent": types.Schema(type=types.Type.NUMBER),
                                "variance": types.Schema(type=types.Type.STRING, description="High, Medium, or Low"),
                                "risk_notes": types.Schema(type=types.Type.ARRAY, items=types.Schema(type=types.Type.STRING))
                            }
                        )
                    }
                )
            ),
        )
        
        result = json.loads(response.text)
        
        # 4. Map to Judicial Fingerprint Graph (Optional logic based on new schema)
        # Assuming we can extract judge name from the text or it's known
        # For now, we just return the parsed result directly as it contains the judge profile update
        return result
        
    except Exception as e:
        print(f"Error during parsing: {e}")
        return None

if __name__ == "__main__":
    sample_text = "We were in the District Court today before Hon. S. Patil. The opponent, TechCorp's counsel, kept interrupting. The judge seems impatient today and just wanted to move things along. We are currently at the Evidence Stage."
    print("Analyzing narrative...")
    result = parse_legal_scenario(sample_text)
    print(json.dumps(result, indent=2))
