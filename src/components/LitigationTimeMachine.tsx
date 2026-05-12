import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, GitBranch, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

const spring = { type: "spring", stiffness: 300, damping: 30 };

const hearings = [
  { id: 'h1', date: '2023-10-12', title: 'Initial Filing', evidence: 'Writ Petition #4421 filed. Assigned to Hon. K. Murthy.' },
  { id: 'h2', date: '2023-11-05', title: 'Notice Issued', evidence: 'Respondent served via email. 4 weeks granted for reply.' },
  { id: 'h3', date: '2024-01-15', title: 'First Hearing', evidence: 'Adjournment requested by defense. Granted due to medical reasons.' },
  { id: 'h4', date: '2024-03-20', title: 'Evidence Stage', evidence: 'Witness testimonies recorded. Cross-examination pending.' },
];

const strategies = [
  { id: 's1', title: 'File Summary Judgment' },
  { id: 's2', title: 'Propose Settlement' },
  { id: 's3', title: 'Request Adjournment' }
];

const branches: Record<string, any[]> = {
  's1': [
    { id: 'b1_1', path: 'Motion Granted', prob: '65%', duration: '-120 days', yOffset: -90 },
    { id: 'b1_2', path: 'Motion Denied', prob: '35%', duration: '+45 days', yOffset: 90 }
  ],
  's2': [
    { id: 'b2_1', path: 'Settlement Accepted', prob: '40%', duration: '-150 days', yOffset: -90 },
    { id: 'b2_2', path: 'Settlement Rejected', prob: '60%', duration: '+15 days', yOffset: 90 }
  ],
  's3': [
    { id: 'b3_1', path: 'Adjournment Granted', prob: '85%', duration: '+60 days', yOffset: -90 },
    { id: 'b3_2', path: 'Adjournment Denied', prob: '15%', duration: '+0 days', yOffset: 90 }
  ]
};

export default function LitigationTimeMachine() {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);

  return (
    <div className="h-full flex flex-col p-8 bg-[#0a0a0a] text-white font-mono overflow-hidden">
      <div className="mb-12">
        <h1 className="text-2xl tracking-widest mb-2 border-b border-white/10 pb-4 inline-block pr-12">
          LITIGATION TIME MACHINE
        </h1>
        <p className="text-white/40 text-xs mt-4 max-w-xl leading-relaxed">
          Explore historical causal nodes and simulate counterfactual futures.
          Hover over past hearings to inspect causal evidence. Select a strategy to fork the timeline.
        </p>
      </div>

      <div className="flex-1 relative flex items-center mt-12 overflow-x-auto overflow-y-hidden">
        <div className="min-w-[1000px] w-full h-full relative flex items-center">
          {/* Main Timeline Line */}
          <div className="absolute left-0 w-2/3 h-px bg-white/10" />

          {/* Past Hearings */}
          <div className="w-2/3 flex justify-between pr-24 relative z-10">
            {hearings.map((h) => (
              <div
                key={h.id}
                className="relative flex flex-col items-center justify-center"
                onMouseEnter={() => setHoveredNode(h.id)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                <div className="h-32 flex items-center justify-center">
                  {hoveredNode !== h.id ? (
                    <motion.div
                      layoutId={`card-${h.id}`}
                      className="w-3 h-3 rounded-full bg-[#0a0a0a] border-2 border-white/30 cursor-pointer"
                      transition={spring}
                    />
                  ) : (
                    <motion.div
                      layoutId={`card-${h.id}`}
                      className="absolute top-1/2 -translate-y-1/2 w-64 bg-[#0a0a0a] border border-white/20 p-5 rounded-lg z-50 shadow-2xl shadow-black/50"
                      transition={spring}
                    >
                      <div className="flex items-center space-x-2 mb-3 text-white/40">
                        <Clock size={14} />
                        <span className="text-xs">{h.date}</span>
                      </div>
                      <h4 className="text-sm mb-4 text-white/90">{h.title}</h4>
                      <div className="bg-white/5 p-3 rounded border border-white/10">
                        <span className="text-[10px] text-white/30 uppercase tracking-widest block mb-2">Causal Evidence</span>
                        <span className="text-xs text-white/70 leading-relaxed">{h.evidence}</span>
                      </div>
                    </motion.div>
                  )}
                </div>
                {hoveredNode !== h.id && (
                  <div className="absolute top-24 text-[10px] text-white/30 whitespace-nowrap">
                    {h.date}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Decision Fork (Present) */}
          <div className="w-1/3 relative h-full flex items-center">
            {/* Present Node */}
            <div className="absolute left-0 w-4 h-4 rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)] -translate-x-1/2 z-20 flex items-center justify-center">
              <div className="w-1 h-1 bg-black rounded-full" />
            </div>
            <div className="absolute left-0 top-1/2 translate-y-6 -translate-x-1/2 text-xs text-white/50 uppercase tracking-widest">
              Present
            </div>

            {/* Strategy Menu */}
            <div className="absolute left-8 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-30">
              <div className="text-[10px] text-white/30 uppercase tracking-widest mb-2 flex items-center">
                <GitBranch size={12} className="mr-2" /> Action Forks
              </div>
              {strategies.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedStrategy(s.id === selectedStrategy ? null : s.id)}
                  className={cn(
                    "px-4 py-3 text-xs rounded border transition-all text-left flex items-center justify-between w-56",
                    selectedStrategy === s.id
                      ? "bg-white/10 border-white/40 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                      : "bg-[#0a0a0a] border-white/10 text-white/50 hover:text-white hover:border-white/20"
                  )}
                >
                  {s.title}
                  <ChevronRight size={14} className={selectedStrategy === s.id ? "opacity-100" : "opacity-0"} />
                </button>
              ))}
            </div>

            {/* Ghost Timelines */}
            <div className="absolute left-64 w-full">
              <AnimatePresence>
                {selectedStrategy && branches[selectedStrategy].map((branch) => (
                  <motion.div
                    key={branch.id}
                    initial={{ opacity: 0, y: 0, scale: 0.95 }}
                    animate={{ opacity: 1, y: branch.yOffset, scale: 1 }}
                    exit={{ opacity: 0, y: 0, scale: 0.95 }}
                    transition={spring}
                    className="absolute left-0 w-full flex items-center"
                  >
                    <div className="w-16 h-px border-t border-dashed border-white/20" />
                    <div className="w-64 bg-[#0a0a0a] border border-white/10 p-4 rounded-lg ml-2 shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-white/20" />
                      <div className="text-[10px] text-white/30 uppercase tracking-widest mb-2">Counterfactual Path</div>
                      <div className="text-sm text-white/90 mb-4">{branch.path}</div>
                      <div className="flex justify-between items-center border-t border-white/5 pt-3">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-white/30 uppercase">Probability</span>
                          <span className="text-xs text-white/80">{branch.prob}</span>
                        </div>
                        <div className="flex flex-col text-right">
                          <span className="text-[10px] text-white/30 uppercase">Duration Impact</span>
                          <span className="text-xs text-white/80 font-mono">{branch.duration}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
