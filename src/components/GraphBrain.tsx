import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Network, ArrowRight, Database, User, FileText, Cpu, Zap, Code } from 'lucide-react';
import { GoogleGenAI, Type } from '@google/genai';
import { cn } from '../lib/utils';

interface Node {
  id: string;
  type: 'actor' | 'event' | 'evidence' | 'precedent';
  label: string;
  detail: string;
  x: number;
  y: number;
}

interface Edge {
  source: string;
  target: string;
  label: string;
}

const mockNodes: Node[] = [
  { id: 'n1', type: 'actor', label: 'Plaintiff', detail: 'Employee', x: 10, y: 20 },
  { id: 'n2', type: 'event', label: 'OSHA Report', detail: 'Protected Activity', x: 40, y: 20 },
  { id: 'n3', type: 'actor', label: 'Manager "Dave"', detail: 'Defendant Agent', x: 10, y: 60 },
  { id: 'n4', type: 'evidence', label: 'Email', detail: '"Not a team player"', x: 40, y: 60 },
  { id: 'n5', type: 'precedent', label: 'Handbook Breach', detail: '0/3 Warnings', x: 70, y: 40 },
  { id: 'n6', type: 'event', label: 'Termination', detail: 'Adverse Action', x: 90, y: 40 },
];

const mockEdges: Edge[] = [
  { source: 'n1', target: 'n2', label: 'initiated' },
  { source: 'n3', target: 'n4', label: 'authored' },
  { source: 'n2', target: 'n6', label: 'causal link?' },
  { source: 'n4', target: 'n6', label: 'intent evidence' },
  { source: 'n5', target: 'n6', label: 'procedural violation' },
];

const springConfig = { type: "spring", stiffness: 300, damping: 30 };

export default function GraphBrain() {
  const [input, setInput] = useState("We were in the District Court today before Hon. S. Patil. The opponent, TechCorp's counsel, kept interrupting. The judge seems impatient today and just wanted to move things along. We are currently at the Evidence Stage.");
  const [isParsing, setIsParsing] = useState(false);
  const [parsed, setParsed] = useState(false);
  const [parsedData, setParsedData] = useState<any>(null);

  const handleParse = async () => {
    if (!input.trim()) return;
    setIsParsing(true);
    setParsed(false);
    setParsedData(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const prompt = `
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
      "${input}"
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              updated_state_graph: {
                type: Type.OBJECT,
                properties: {
                  current_node: { type: Type.STRING },
                  causal_inferences: { type: Type.ARRAY, items: { type: Type.STRING } },
                  active_edges: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        source: { type: Type.STRING },
                        target: { type: Type.STRING },
                        weight_probability: { type: Type.NUMBER },
                        time_cost_days: { type: Type.NUMBER }
                      }
                    }
                  }
                }
              },
              judge_belief_vector: {
                type: Type.OBJECT,
                properties: {
                  strictness: { type: Type.NUMBER, description: "0.0 to 1.0" },
                  delay_tolerance: { type: Type.NUMBER, description: "0.0 to 1.0" },
                  procedural_sensitivity: { type: Type.NUMBER, description: "0.0 to 1.0" },
                  reaction_to_non_compliance: { type: Type.NUMBER, description: "0.0 to 1.0" }
                }
              },
              action_simulation_table: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    action: { type: Type.STRING },
                    forward_simulation_steps: { type: Type.ARRAY, items: { type: Type.STRING } },
                    success_probability_percent: { type: Type.NUMBER },
                    reward_score: { type: Type.NUMBER },
                    time_impact_days: { type: Type.NUMBER }
                  }
                }
              },
              optimal_policy: {
                type: Type.OBJECT,
                properties: {
                  recommended_action_sequence: { type: Type.ARRAY, items: { type: Type.STRING } },
                  expected_total_duration_days: { type: Type.NUMBER },
                  delta_from_base_days: { type: Type.NUMBER }
                }
              },
              confidence_and_risk: {
                type: Type.OBJECT,
                properties: {
                  confidence_score_percent: { type: Type.NUMBER },
                  variance: { type: Type.STRING, description: "High, Medium, or Low" },
                  risk_notes: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
              }
            }
          }
        }
      });

      const result = JSON.parse(response.text || "{}");
      setParsedData(result);
    } catch (error) {
      console.error("Error parsing narrative:", error);
    } finally {
      setIsParsing(false);
      setParsed(true);
    }
  };

  return (
    <div className="h-full flex flex-col p-6 text-slate-50">
      <div className="mb-6">
        <h1 className="text-3xl font-serif font-light tracking-tight mb-2 text-emerald-400">Graph Brain Ingestion</h1>
        <p className="text-slate-400 font-mono text-sm">Unstructured narrative to Directed Acyclic Graph (DAG) mapping</p>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
        {/* Input Section */}
        <div className="w-full lg:w-1/3 flex flex-col gap-4 flex-shrink-0">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex flex-col h-full shadow-lg">
            <div className="flex items-center space-x-2 mb-4 text-emerald-500">
              <FileText size={18} />
              <span className="font-mono text-xs uppercase tracking-wider">Raw War Story Input</span>
            </div>
            <textarea
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-4 text-sm text-slate-300 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 resize-none font-mono leading-relaxed"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste scattered legal narrative here..."
            />
            <button
              onClick={handleParse}
              disabled={isParsing}
              className="mt-4 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-sm uppercase tracking-wider py-3 rounded-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isParsing ? (
                <>
                  <Cpu className="animate-spin" size={18} />
                  <span>Extracting Entities...</span>
                </>
              ) : (
                <>
                  <Network size={18} />
                  <span>Map to State Machine</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* DAG Visualization Section */}
        <div className="flex-1 bg-slate-900 border border-slate-700 rounded-xl p-6 relative overflow-hidden shadow-lg flex flex-col">
          <div className="flex items-center justify-between mb-4 z-10">
            <div className="flex items-center space-x-2 text-amber-500">
              <Database size={18} />
              <span className="font-mono text-xs uppercase tracking-wider">Structured DAG Representation</span>
            </div>
            {parsed && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full font-mono text-[10px] uppercase tracking-wider flex items-center"
              >
                <Zap size={12} className="mr-1" />
                State Machine Initialized
              </motion.div>
            )}
          </div>

          <div className="flex-1 relative bg-slate-950 rounded-lg border border-slate-800 overflow-hidden flex flex-col lg:flex-row">
            {/* Grid Background */}
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)', backgroundSize: '24px 24px', opacity: 0.3 }}></div>

            <AnimatePresence>
              {parsed && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 flex flex-col lg:flex-row"
                >
                  {/* Edges (SVG) */}
                  <div className="relative flex-1">
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                      <defs>
                        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                          <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
                        </marker>
                      </defs>
                      {mockEdges.map((edge, i) => {
                        const sourceNode = mockNodes.find(n => n.id === edge.source)!;
                        const targetNode = mockNodes.find(n => n.id === edge.target)!;
                        return (
                          <motion.g 
                            key={i}
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ delay: 0.5 + (i * 0.1), duration: 0.8, ease: "easeInOut" }}
                          >
                            <line
                              x1={`${sourceNode.x + 5}%`}
                              y1={`${sourceNode.y}%`}
                              x2={`${targetNode.x - 5}%`}
                              y2={`${targetNode.y}%`}
                              stroke="#475569"
                              strokeWidth="2"
                              strokeDasharray="4 4"
                              markerEnd="url(#arrowhead)"
                            />
                            <text
                              x={`${(sourceNode.x + targetNode.x) / 2}%`}
                              y={`${(sourceNode.y + targetNode.y) / 2 - 2}%`}
                              fill="#94a3b8"
                              fontSize="10"
                              fontFamily="monospace"
                              textAnchor="middle"
                            >
                              {edge.label}
                            </text>
                          </motion.g>
                        );
                      })}
                    </svg>

                    {/* Nodes */}
                    {mockNodes.map((node, i) => (
                      <motion.div
                        key={node.id}
                        initial={{ opacity: 0, scale: 0, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ ...springConfig, delay: i * 0.1 }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                        style={{ left: `${node.x}%`, top: `${node.y}%` }}
                      >
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center border-2 shadow-lg backdrop-blur-sm",
                          node.type === 'actor' ? "bg-slate-800 border-blue-500 text-blue-400" :
                          node.type === 'event' ? "bg-slate-800 border-amber-500 text-amber-400" :
                          node.type === 'evidence' ? "bg-slate-800 border-emerald-500 text-emerald-400" :
                          "bg-slate-800 border-purple-500 text-purple-400"
                        )}>
                          {node.type === 'actor' && <User size={20} />}
                          {node.type === 'event' && <Zap size={20} />}
                          {node.type === 'evidence' && <FileText size={20} />}
                          {node.type === 'precedent' && <Database size={20} />}
                        </div>
                        <div className="mt-2 bg-slate-900/90 border border-slate-700 px-2 py-1 rounded text-center whitespace-nowrap">
                          <div className="text-xs font-medium text-slate-200">{node.label}</div>
                          <div className="text-[9px] font-mono text-slate-500 uppercase">{node.detail}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* JSON Output Panel */}
                  {parsedData && (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="w-full lg:w-1/3 bg-slate-900/80 border-l border-slate-800 p-4 overflow-y-auto z-10 backdrop-blur-md"
                    >
                      <div className="flex items-center space-x-2 mb-4 text-emerald-400">
                        <Code size={16} />
                        <span className="font-mono text-xs uppercase tracking-wider">LexPath Alpha Output</span>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase mb-1">1. Updated State Graph</div>
                          <pre className="text-[10px] font-mono text-slate-300 whitespace-pre-wrap break-words bg-slate-950 p-2 rounded border border-slate-800">
                            {JSON.stringify(parsedData.updated_state_graph, null, 2)}
                          </pre>
                        </div>
                        
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase mb-1">2. Judge Belief Vector</div>
                          <pre className="text-[10px] font-mono text-slate-300 whitespace-pre-wrap break-words bg-slate-950 p-2 rounded border border-slate-800">
                            {JSON.stringify(parsedData.judge_belief_vector, null, 2)}
                          </pre>
                        </div>

                        <div>
                          <div className="text-[10px] text-slate-500 uppercase mb-1">3. Action Simulation Table</div>
                          <pre className="text-[10px] font-mono text-slate-300 whitespace-pre-wrap break-words bg-slate-950 p-2 rounded border border-slate-800">
                            {JSON.stringify(parsedData.action_simulation_table, null, 2)}
                          </pre>
                        </div>

                        <div>
                          <div className="text-[10px] text-slate-500 uppercase mb-1">4. Optimal Policy</div>
                          <pre className="text-[10px] font-mono text-emerald-400 whitespace-pre-wrap break-words bg-emerald-500/10 p-2 rounded border border-emerald-500/20">
                            {JSON.stringify(parsedData.optimal_policy, null, 2)}
                          </pre>
                        </div>

                        <div>
                          <div className="text-[10px] text-slate-500 uppercase mb-1">5. Confidence & Risk</div>
                          <pre className="text-[10px] font-mono text-amber-400 whitespace-pre-wrap break-words bg-amber-500/10 p-2 rounded border border-amber-500/20">
                            {JSON.stringify(parsedData.confidence_and_risk, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            
            {!parsed && !isParsing && (
              <div className="absolute inset-0 flex items-center justify-center text-slate-600 font-mono text-sm">
                Awaiting narrative input...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
