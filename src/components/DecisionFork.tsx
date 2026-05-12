import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, GitBranch, Shield, Sword, FileText, Link as LinkIcon, Scale, Database } from 'lucide-react';
import { cn } from '../lib/utils';

interface ActionOption {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  metrics: {
    winProb: number;
    settlementProb: number;
    durationDays: number;
    costEst: string;
  };
  counterMoves: {
    move: string;
    prob: number;
  }[];
  causalChain: {
    type: 'precedent' | 'judge' | 'state';
    label: string;
    impact: string;
  }[];
}

const actions: ActionOption[] = [
  {
    id: 'a1',
    title: 'File Summary Judgment',
    icon: <Sword size={20} />,
    description: 'Aggressive move. High risk, high reward. Forces judge to evaluate evidence early.',
    metrics: { winProb: 42, settlementProb: 15, durationDays: 45, costEst: '$4,500' },
    counterMoves: [
      { move: 'File Counter-Affidavit', prob: 65 },
      { move: 'Request Adjournment', prob: 25 },
      { move: 'Settle', prob: 10 }
    ],
    causalChain: [
      { type: 'judge', label: 'Hon. S. Patil Profile', impact: '-12% Win Prob (Low tolerance for early SJ)' },
      { type: 'precedent', label: 'State v. Kumar (2022)', impact: '+5% Win Prob (Similar evidentiary standard)' },
      { type: 'state', label: 'Evidence Stage', impact: 'High variance outcome' }
    ]
  },
  {
    id: 'a2',
    title: 'Submit Additional Evidence',
    icon: <FileText size={20} />,
    description: 'Standard progression. Strengthens case but extends timeline.',
    metrics: { winProb: 68, settlementProb: 30, durationDays: 120, costEst: '$2,000' },
    counterMoves: [
      { move: 'Cross-Examine Witness', prob: 80 },
      { move: 'File Rebuttal Evidence', prob: 20 }
    ],
    causalChain: [
      { type: 'judge', label: 'Hon. S. Patil Profile', impact: '+15% Win Prob (High evidentiary strictness)' },
      { type: 'state', label: 'Current DAG Node', impact: 'Optimal path for this stage' },
      { type: 'precedent', label: 'Rao v. TechCorp (2019)', impact: '+8% Win Prob (Documentary evidence favored)' }
    ]
  },
  {
    id: 'a3',
    title: 'Propose Settlement',
    icon: <Shield size={20} />,
    description: 'De-escalation. Signals willingness to negotiate but may show weakness.',
    metrics: { winProb: 50, settlementProb: 75, durationDays: 30, costEst: '$1,000' },
    counterMoves: [
      { move: 'Accept Offer', prob: 40 },
      { move: 'Counter-Offer', prob: 50 },
      { move: 'Reject & Proceed', prob: 10 }
    ],
    causalChain: [
      { type: 'judge', label: 'Hon. S. Patil Profile', impact: '+20% Settlement Prob (Pro-settlement bias)' },
      { type: 'state', label: 'Opponent Fatigue', impact: 'High probability of acceptance' }
    ]
  }
];

const springConfig = { type: "spring", stiffness: 300, damping: 30 };

export default function DecisionFork() {
  const [selectedAction, setSelectedAction] = useState<string>('a2');

  return (
    <div className="h-full flex flex-col p-6 text-slate-50">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-light tracking-tight mb-2 text-emerald-400">Decision Fork</h1>
        <p className="text-slate-400 font-mono text-sm">Intervention simulation and counterfactual trajectories</p>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden">
        {/* Action Menu */}
        <div className="w-full md:w-80 flex flex-col gap-4 flex-shrink-0">
          <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">Available Interventions</div>
          {actions.map(action => (
            <button
              key={action.id}
              onClick={() => setSelectedAction(action.id)}
              className={cn(
                "text-left p-4 rounded-xl border transition-all duration-300 relative overflow-hidden group",
                selectedAction === action.id 
                  ? "bg-slate-800 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.15)]" 
                  : "bg-slate-900 border-slate-800 hover:border-slate-600"
              )}
            >
              {selectedAction === action.id && (
                <motion.div layoutId="activeIndicator" className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></motion.div>
              )}
              <div className="flex items-center space-x-3 mb-2 relative z-10">
                <div className={cn(
                  "p-2 rounded-lg transition-colors",
                  selectedAction === action.id ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-400"
                )}>
                  {action.icon}
                </div>
                <div className="font-medium text-slate-200">{action.title}</div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed relative z-10">
                {action.description}
              </p>
            </button>
          ))}
        </div>

        {/* Simulation Canvas */}
        <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-8 overflow-y-auto relative shadow-xl">
          <AnimatePresence mode="wait">
            {actions.map(action => (
              action.id === selectedAction && (
                <motion.div 
                  key={action.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={springConfig}
                  className="h-full flex flex-col"
                >
                  <div className="flex items-center space-x-3 mb-8 pb-6 border-b border-slate-800">
                    <GitBranch className="text-emerald-500" />
                    <h2 className="text-xl font-medium text-slate-100">Simulated Trajectory: {action.title}</h2>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <MetricCard label="Win Probability" value={`${action.metrics.winProb}%`} color="text-emerald-400" />
                    <MetricCard label="Settlement Prob." value={`${action.metrics.settlementProb}%`} color="text-blue-400" />
                    <MetricCard label="Expected Duration" value={`+${action.metrics.durationDays}d`} color="text-amber-400" />
                    <MetricCard label="Est. Cost" value={action.metrics.costEst} color="text-slate-200" />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
                    {/* Counter Moves */}
                    <div className="relative">
                      <div className="text-sm font-mono text-slate-400 uppercase mb-6 flex items-center">
                        <GitBranch size={16} className="mr-2 text-slate-500" />
                        Markov State Transition
                      </div>
                      
                      <div className="relative pl-8 space-y-6">
                        <div className="absolute left-[11px] top-2 bottom-2 w-px bg-slate-800"></div>
                        
                        {action.counterMoves.map((move, idx) => (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            key={idx} 
                            className="relative"
                          >
                            <div className="absolute -left-8 top-1/2 w-8 h-px bg-slate-800"></div>
                            <div className="absolute -left-[37px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-slate-900 border-2 border-slate-600"></div>
                            
                            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 flex items-center justify-between hover:bg-slate-800 transition-colors">
                              <div className="flex items-center space-x-4">
                                <div className="text-xl font-light w-16 text-right text-slate-200">
                                  {move.prob}<span className="text-sm text-slate-500">%</span>
                                </div>
                                <div className="h-8 w-px bg-slate-700"></div>
                                <div className="font-medium text-slate-300">{move.move}</div>
                              </div>
                              <ArrowRight className="text-slate-600" size={16} />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* XAI Causal Chain */}
                    <div className="relative">
                      <div className="text-sm font-mono text-slate-400 uppercase mb-6 flex items-center">
                        <LinkIcon size={16} className="mr-2 text-emerald-500" />
                        XAI Causal Chain
                      </div>
                      
                      <div className="space-y-4">
                        {action.causalChain.map((cause, idx) => (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 + (idx * 0.1) }}
                            key={idx}
                            className="bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col relative overflow-hidden"
                          >
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-800"></div>
                            <div className="flex items-center space-x-2 mb-2">
                              {cause.type === 'judge' && <Scale size={14} className="text-amber-500" />}
                              {cause.type === 'precedent' && <Database size={14} className="text-blue-500" />}
                              {cause.type === 'state' && <GitBranch size={14} className="text-emerald-500" />}
                              <span className="text-xs font-mono text-slate-400 uppercase">{cause.type}</span>
                            </div>
                            <div className="font-medium text-slate-200 mb-1">{cause.label}</div>
                            <div className={cn(
                              "text-sm font-mono",
                              cause.impact.includes('+') ? "text-emerald-400" : cause.impact.includes('-') ? "text-red-400" : "text-slate-400"
                            )}>
                              {cause.impact}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, color }: { label: string, value: string, color: string }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
      <div className="text-[10px] font-mono text-slate-500 uppercase mb-2">{label}</div>
      <div className={cn("text-2xl font-light", color)}>{value}</div>
    </div>
  );
}
