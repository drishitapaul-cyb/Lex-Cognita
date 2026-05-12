import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Type } from '@google/genai';
import { 
  Brain, Scale, Clock, GitBranch, ShieldAlert, 
  CheckCircle2, Activity, ChevronRight, AlertTriangle,
  Zap, FileText, ArrowRight
} from 'lucide-react';
import { cn } from '../lib/utils';
import { ConfidenceHeatmap } from './XAILayer';

// --- Types ---
interface LexState {
  updated_state_graph: {
    current_node: string;
    causal_inferences: string[];
    active_edges: { source: string; target: string; weight_probability: number; time_cost_days: number }[];
  };
  judge_belief_vector: {
    strictness: number;
    delay_tolerance: number;
    procedural_sensitivity: number;
    reaction_to_non_compliance: number;
  };
  action_simulation_table: {
    action: string;
    forward_simulation_steps: string[];
    success_probability_percent: number;
    reward_score: number;
    time_impact_days: number;
  }[];
  optimal_policy: {
    recommended_action_sequence: string[];
    expected_total_duration_days: number;
    delta_from_base_days: number;
  };
  confidence_and_risk: {
    confidence_score_percent: number;
    variance: string;
    risk_notes: string[];
  };
}

const initialState: LexState = {
  updated_state_graph: {
    current_node: "Awaiting Input",
    causal_inferences: ["System ready for narrative ingestion."],
    active_edges: []
  },
  judge_belief_vector: {
    strictness: 0.5,
    delay_tolerance: 0.5,
    procedural_sensitivity: 0.5,
    reaction_to_non_compliance: 0.5
  },
  action_simulation_table: [],
  optimal_policy: {
    recommended_action_sequence: [],
    expected_total_duration_days: 0,
    delta_from_base_days: 0
  },
  confidence_and_risk: {
    confidence_score_percent: 0,
    variance: "N/A",
    risk_notes: []
  }
};

const spring = { type: "spring", stiffness: 300, damping: 30 };

export default function CommandCenter() {
  const [input, setInput] = useState("We were in the District Court today before Hon. S. Patil. The opponent, TechCorp's counsel, kept interrupting. The judge seems impatient today and just wanted to move things along. We are currently at the Evidence Stage.");
  const [isParsing, setIsParsing] = useState(false);
  const [lexState, setLexState] = useState<LexState>(initialState);
  const [hasParsed, setHasParsed] = useState(false);

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    setIsParsing(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `
      You are the Core Reasoning Engine of LexPath Alpha.
      Analyze this narrative and output the required JSON schema.
      Narrative: "${input}"
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
                  strictness: { type: Type.NUMBER },
                  delay_tolerance: { type: Type.NUMBER },
                  procedural_sensitivity: { type: Type.NUMBER },
                  reaction_to_non_compliance: { type: Type.NUMBER }
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
                  variance: { type: Type.STRING },
                  risk_notes: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
              }
            }
          }
        }
      });

      const result = JSON.parse(response.text || "{}");
      setLexState(result);
      setHasParsed(true);
    } catch (error) {
      console.error("Error parsing narrative:", error);
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="h-full bg-[#0a0a0a] text-white font-mono flex overflow-hidden">
      
      {/* LEFT COLUMN: Input & Judge Profile */}
      <div className="w-1/3 border-r border-white/10 flex flex-col bg-[#0a0a0a] z-20 shadow-2xl">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-8 h-8 rounded bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center">
              <Brain className="text-emerald-400" size={18} />
            </div>
            <h1 className="text-xl font-serif font-light tracking-tight text-emerald-400">LexPath Alpha</h1>
          </div>
          <p className="text-xs text-white/40 uppercase tracking-widest">Causal Decision Engine</p>
        </div>

        {/* Narrative Input */}
        <div className="p-6 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-white/50 uppercase tracking-wider flex items-center">
              <FileText size={14} className="mr-2" /> Live Narrative
            </span>
            {isParsing && <Activity size={14} className="text-emerald-500 animate-pulse" />}
          </div>
          <div className="relative">
            <textarea
              className="w-full h-32 bg-white/5 border border-white/10 rounded-lg p-4 text-sm text-white/80 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 resize-none transition-all"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter court proceedings, judge behavior, or case updates..."
            />
            <div className="absolute bottom-4 right-4">
              <button
                onClick={handleAnalyze}
                disabled={isParsing}
                className="bg-emerald-500 hover:bg-emerald-400 text-[#0a0a0a] px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 flex items-center shadow-[0_0_15px_rgba(16,185,129,0.3)]"
              >
                {isParsing ? 'Processing...' : 'Analyze'}
                {!isParsing && <ChevronRight size={14} className="ml-1" />}
              </button>
            </div>
          </div>
        </div>

        {/* Judge Profile Panel */}
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="flex items-center space-x-2 mb-6">
            <Scale size={16} className="text-blue-400" />
            <span className="text-xs text-blue-400 uppercase tracking-wider">Bayesian Belief Update</span>
          </div>
          
          <div className="space-y-6">
            <JudgeMetric label="Strictness" value={lexState.judge_belief_vector.strictness} />
            <JudgeMetric label="Delay Tolerance" value={lexState.judge_belief_vector.delay_tolerance} />
            <JudgeMetric label="Procedural Sensitivity" value={lexState.judge_belief_vector.procedural_sensitivity} />
            <JudgeMetric label="Reaction to Non-Compliance" value={lexState.judge_belief_vector.reaction_to_non_compliance} />
          </div>

          {hasParsed && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg"
            >
              <h4 className="text-[10px] text-blue-400 uppercase tracking-widest mb-2">Causal Inferences</h4>
              <ul className="space-y-2">
                {lexState.updated_state_graph.causal_inferences.map((inf, i) => (
                  <li key={i} className="text-xs text-white/70 flex items-start">
                    <Zap size={12} className="text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                    {inf}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Timeline & Decisions */}
      <div className="w-2/3 flex flex-col bg-[#0a0a0a] relative overflow-hidden">
        
        {/* Background Grid */}
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

        {/* Top: Litigation Timeline */}
        <div className="h-1/3 border-b border-white/10 p-8 relative flex flex-col justify-center">
          <div className="absolute top-6 left-8 flex items-center space-x-2">
            <Clock size={16} className="text-white/40" />
            <span className="text-xs text-white/40 uppercase tracking-wider">Temporal Dynamics</span>
          </div>

          <div className="relative w-full h-24 flex items-center mt-4">
            {/* Base Line */}
            <div className="absolute left-0 right-0 h-px bg-white/10"></div>
            
            {/* Current Node */}
            <motion.div 
              layout
              transition={spring}
              className="absolute left-1/4 -translate-x-1/2 flex flex-col items-center z-10"
            >
              <div className="w-4 h-4 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] border-2 border-[#0a0a0a]"></div>
              <div className="mt-3 text-xs text-blue-400 font-medium bg-[#0a0a0a] px-2 py-1 rounded border border-blue-500/30">
                {lexState.updated_state_graph.current_node}
              </div>
            </motion.div>

            {/* Projected End Node */}
            <motion.div 
              layout
              transition={spring}
              className="absolute left-3/4 -translate-x-1/2 flex flex-col items-center z-10"
            >
              <ConfidenceHeatmap certainty={lexState.confidence_and_risk.confidence_score_percent}>
                <div className="w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#0a0a0a]"></div>
              </ConfidenceHeatmap>
              <div className="mt-3 text-center">
                <div className="text-xs text-emerald-400 font-medium">Projected Resolution</div>
                <div className="text-[10px] text-white/50">{lexState.optimal_policy.expected_total_duration_days} Days</div>
                {lexState.optimal_policy.delta_from_base_days !== 0 && (
                  <div className={cn(
                    "text-[10px]",
                    lexState.optimal_policy.delta_from_base_days > 0 ? "text-red-400" : "text-emerald-400"
                  )}>
                    {lexState.optimal_policy.delta_from_base_days > 0 ? '+' : ''}{lexState.optimal_policy.delta_from_base_days}d shift
                  </div>
                )}
              </div>
            </motion.div>

            {/* Connecting Line */}
            <motion.div 
              layout
              className="absolute left-1/4 right-1/4 h-px bg-gradient-to-r from-blue-500/50 to-emerald-500/50"
            ></motion.div>
          </div>
        </div>

        {/* Bottom: Decision Forks & XAI */}
        <div className="h-2/3 flex relative">
          
          {/* Decision Fork View */}
          <div className="w-2/3 p-8 overflow-y-auto border-r border-white/10">
            <div className="flex items-center space-x-2 mb-8">
              <GitBranch size={16} className="text-emerald-400" />
              <span className="text-xs text-emerald-400 uppercase tracking-wider">Markov Decision Process (MDP)</span>
            </div>

            <div className="space-y-4">
              <AnimatePresence>
                {lexState.action_simulation_table.map((action, idx) => {
                  const isOptimal = lexState.optimal_policy.recommended_action_sequence.includes(action.action);
                  const isRisky = action.time_impact_days > 0 || action.success_probability_percent < 40;
                  
                  return (
                    <motion.div
                      key={action.action + idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ ...spring, delay: idx * 0.1 }}
                      className={cn(
                        "p-5 rounded-xl border relative overflow-hidden group cursor-pointer transition-all",
                        isOptimal ? "bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20" : 
                        isRisky ? "bg-rose-500/5 border-rose-500/20 hover:bg-rose-500/10" : 
                        "bg-white/5 border-white/10 hover:bg-white/10"
                      )}
                    >
                      {/* Glow effect */}
                      <div className={cn(
                        "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                        isOptimal ? "bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent)]" :
                        isRisky ? "bg-[radial-gradient(circle_at_50%_50%,rgba(244,63,94,0.1),transparent)]" :
                        "bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.05),transparent)]"
                      )}></div>

                      <div className="relative z-10 flex justify-between items-start">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            {isOptimal && <CheckCircle2 size={14} className="text-emerald-400" />}
                            <h3 className={cn(
                              "text-sm font-medium",
                              isOptimal ? "text-emerald-400" : isRisky ? "text-rose-400" : "text-white"
                            )}>{action.action}</h3>
                          </div>
                          <div className="text-[10px] text-white/50 flex items-center space-x-2 mt-2">
                            <span>Reward Score: {action.reward_score}</span>
                            <span>•</span>
                            <span>Success: {action.success_probability_percent}%</span>
                          </div>
                        </div>
                        <div className={cn(
                          "text-xl font-light",
                          action.time_impact_days <= 0 ? "text-emerald-400" : "text-rose-400"
                        )}>
                          {action.time_impact_days > 0 ? '+' : ''}{action.time_impact_days}<span className="text-xs text-white/40 ml-1">days</span>
                        </div>
                      </div>

                      {/* Forward Simulation Steps (Progressive Disclosure on Hover) */}
                      <div className="mt-4 pt-4 border-t border-white/5 hidden group-hover:block">
                        <div className="text-[10px] text-white/40 uppercase tracking-widest mb-2">Simulation Trace</div>
                        <div className="flex items-center space-x-2 text-xs text-white/60">
                          {action.forward_simulation_steps.map((step, i) => (
                            <React.Fragment key={i}>
                              <span>{step}</span>
                              {i < action.forward_simulation_steps.length - 1 && <ArrowRight size={10} className="text-white/30" />}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
                {lexState.action_simulation_table.length === 0 && (
                  <div className="text-sm text-white/30 text-center py-12 border border-dashed border-white/10 rounded-xl">
                    Awaiting narrative to generate decision forks.
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* XAI Panel */}
          <div className="w-1/3 p-6 bg-white/[0.02]">
            <div className="flex items-center space-x-2 mb-6">
              <ShieldAlert size={16} className="text-amber-400" />
              <span className="text-xs text-amber-400 uppercase tracking-wider">Uncertainty Model</span>
            </div>

            <div className="mb-8">
              <div className="text-[10px] text-white/40 uppercase tracking-widest mb-2">Confidence Score</div>
              <div className="flex items-end space-x-2">
                <span className="text-4xl font-light text-white">{lexState.confidence_and_risk.confidence_score_percent}%</span>
                <span className={cn(
                  "text-xs mb-1 px-2 py-0.5 rounded border",
                  lexState.confidence_and_risk.variance === 'Low' ? "text-emerald-400 border-emerald-400/30 bg-emerald-400/10" :
                  lexState.confidence_and_risk.variance === 'Medium' ? "text-amber-400 border-amber-400/30 bg-amber-400/10" :
                  "text-rose-400 border-rose-400/30 bg-rose-400/10"
                )}>
                  {lexState.confidence_and_risk.variance} Variance
                </span>
              </div>
            </div>

            <div>
              <div className="text-[10px] text-white/40 uppercase tracking-widest mb-3">Risk Notes</div>
              <ul className="space-y-3">
                {lexState.confidence_and_risk.risk_notes.map((note, i) => (
                  <li key={i} className="text-xs text-white/70 flex items-start bg-rose-500/5 p-3 rounded border border-rose-500/10">
                    <AlertTriangle size={14} className="text-rose-400 mr-2 flex-shrink-0 mt-0.5" />
                    {note}
                  </li>
                ))}
                {lexState.confidence_and_risk.risk_notes.length === 0 && (
                  <div className="text-xs text-white/30">No significant risks identified.</div>
                )}
              </ul>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// --- Helper Components ---

function JudgeMetric({ label, value }: { label: string, value: number }) {
  // value is 0.0 to 1.0
  const percentage = Math.round(value * 100);
  
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-white/60">{label}</span>
        <span className="text-blue-400 font-mono">{percentage}%</span>
      </div>
      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={spring}
        />
      </div>
    </div>
  );
}
