import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCaseStore, usePredictionStore } from '../../store/caseStore';
import { API_URL } from '../../constants/api';

export const InterventionSlider = () => {
  const { caseData } = useCaseStore();
  const { timeline, setTimeline } = usePredictionStore();
  const [backlog, setBacklog] = useState(caseData?.backlog_size || 2000);
  const [adjournments, setAdjournments] = useState(caseData?.adjournment_count || 5);
  const [delta, setDelta] = useState<number | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const simulateCounterfactual = async () => {
      try {
        const response = await fetch(`${API_URL}/counterfactual`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
             case: caseData,
             intervention: { backlog, adjournments }
          }),
        });
        const result = await response.json();
        setDelta(Math.round(result?.delta || 0));
        if (result?.timeline) {
          setTimeline(result.timeline);
        }
        setError(false);
      } catch (error) {
        console.error("Counterfactual simulation failed:", error);
        setError(true);
      }
    };
    const timer = setTimeout(simulateCounterfactual, 250);
    return () => clearTimeout(timer);
  }, [backlog, adjournments, caseData, setTimeline]);

  if (!caseData || error) return <div className="text-[10px] text-white/20 uppercase font-mono px-8">Simulator Desynced</div>;

  const validDelta = delta || 0;

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-12">
        <h3 className="text-[10px] font-mono text-white/40 uppercase tracking-[0.4em]">Simulation Node</h3>
        <motion.div 
          animate={validDelta !== 0 ? { scale: [1, 1.05, 1] } : {}}
          className={`px-2 py-0.5 border rounded-full text-[8px] font-bold uppercase tracking-widest ${validDelta !== 0 ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-white/5 border-white/10 text-white/30'}`}
        >
          {validDelta !== 0 ? `Optimization Active` : 'Nominal'}
        </motion.div>
      </div>
      
      <div className="space-y-10 mb-12">
        <div className="relative group">
          <div className="flex justify-between items-end mb-4">
            <span className="text-[11px] font-bold text-white/60">Backlog Volume</span>
            <span className="text-[11px] font-mono text-indigo-400">{backlog} Cases</span>
          </div>
          <input 
            type="range" 
            min="500" 
            max="5000" 
            value={backlog} 
            onChange={(e) => setBacklog(parseInt(e.target.value))}
            className="w-full h-[3px] bg-white/[0.04] rounded-full appearance-none cursor-pointer accent-indigo-500 active:accent-white transition-all group-hover:bg-white/[0.08]"
          />
        </div>

        <div className="relative group">
          <div className="flex justify-between items-end mb-4">
            <span className="text-[11px] font-bold text-white/60">Adjournment Cap</span>
            <span className="text-[11px] font-mono text-indigo-400">{adjournments} Max</span>
          </div>
          <input 
            type="range" 
            min="1" 
            max="20" 
            value={adjournments} 
            onChange={(e) => setAdjournments(parseInt(e.target.value))}
            className="w-full h-[3px] bg-white/[0.04] rounded-full appearance-none cursor-pointer accent-indigo-500 active:accent-white transition-all group-hover:bg-white/[0.08]"
          />
        </div>
      </div>

      <div className="mt-auto">
        <div className="p-6 bg-white/[0.02] border border-white/[0.04] rounded-m flex items-center justify-between mb-4">
          <div>
            <p className="text-[9px] text-white/20 uppercase tracking-widest mb-1 font-mono">Temporal Delta</p>
            <p className="text-[11px] text-white/50 font-medium tracking-tight">Projected Time Reduction</p>
          </div>
          <div className="text-right">
            <motion.p 
              key={validDelta}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`text-3xl font-bold font-mono tracking-tighter ${validDelta !== 0 ? 'text-emerald-400' : 'text-white/20'}`}
            >
              {validDelta !== 0 ? `-${validDelta}` : '0'}
              <span className="text-[10px] font-normal ml-1 uppercase">Days</span>
            </motion.p>
          </div>
        </div>
        
        <div className="px-6 py-4 bg-indigo-500/5 border border-indigo-500/10 rounded-m">
            <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                <span className="text-[9px] font-bold text-indigo-300 uppercase tracking-widest">Decision Intel</span>
            </div>
            <p className="text-[11px] text-white/60 leading-relaxed italic">
                {validDelta > 150 
                    ? "Surgical intervention on judicial backlog yields maximum compression for this district's profile."
                    : "Focusing on adjournment caps is current priority to stabilize the primary disposal vector."}
            </p>
        </div>
      </div>
    </div>
  );
};
