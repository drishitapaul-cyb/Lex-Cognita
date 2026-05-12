import os
import google.generativeai as genai
import json
import logging

genai.configure(api_key=os.environ.get("GEMINI_API_KEY", "DEMO_KEY"))

class LLMClient:
    def __init__(self):
        self.model = genai.GenerativeModel('gemini-1.5-flash')

    async def parse_narrative(self, narrative: str):
        prompt = f"""
        Extract structured Indian legal signals from the narrative.
        Return ONLY valid JSON. No text.

        Narrative: "{narrative}"

        Output Schema:
        {{
            "case_stage": "Filing | Evidence | Witness | Arguments",
            "ipc_section": "Extract code (e.g. 302) or 'NA'",
            "bailable": 0 or 1 (Infer from context/IPC if possible),
            "pleading_complexity": 0.1 to 1.0 (Infer from depth of narrative),
            "judge_signals": ["frustration", "seniority_cue", "strictness"],
            "procedural_events": ["missing_docs", "adjournee", "witness_presents"],
            "confidence": "Low | Medium | High"
        }}
        """
        try:
            response = self.model.generate_content(prompt)
            # Find JSON block
            text = response.text
            start = text.find('{')
            end = text.rfind('}') + 1
            return json.loads(text[start:end])
        except Exception as e:
            logging.error(f"LLM Parsing failed: {e}")
            return {
                "case_stage": "Filing",
                "judge_signals": [],
                "procedural_events": [],
                "missing_elements": [],
                "confidence": "Low"
            }

    async def explain_results(self, engine_data: dict):
        prompt = f"""
        You are a senior litigation strategist.
        Convert the raw engine outputs into a professional, plain-text legal explanation for the client or lawyer.
        Be calm, precise, and confident. Focus on CAUSAL drivers.

        Engine Data:
        {json.dumps(engine_data, indent=2)}

        Constraints:
        - Maximum 3 paragraphs.
        - Explain WHY delays happen (e.g., backlog, Judge behavior).
        - Recommend next strategic steps.
        """
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            return "Unable to generate explanation due to system load. Raw data suggests procedural friction in the current district."

llm_client = LLMClient()
