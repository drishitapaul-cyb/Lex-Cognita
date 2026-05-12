import React from 'react';
import { motion } from 'framer-motion';
import { usePredictionStore } from '../../store/caseStore';

export const CausalBreakdown = () => {
  const { causalDrivers, loading } = usePredictionStore();

  if (loading || !causalDrivers.length) return (
    <div className="animate-pulse flex flex-col h-full">
      <div className="h-3 bg-white/5 rounded w-1/4 mb-12" />
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-2 bg-white/5 rounded w-1/2" />
          <div className="h-8 bg-white/5 rounded-m" />
        </div>
        <div className="space-y-2">
          <div className="h-2 bg-white/5 rounded w-1/3" />
          <div className="h-8 bg-white/5 rounded-m" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* DEBUG_MARKER: Causal_Drivers_Rendered */}
      <h3 className="text-[10px] font-mono text-white/40 uppercase tracking-[0.4em] mb-12">Systemic Vectors</h3>
      <div className="space-y-8">
        {(causalDrivers || []).map((driver, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="relative group"
          >
            <div className="flex justify-between items-end mb-3">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-bold text-white/80 uppercase tracking-tight">{driver?.factor || "Unknown Factor"}</span>
                <span className="text-[9px] text-white/20 font-mono uppercase tracking-[0.2em]">Causal Influence</span>
              </div>
              <div className="text-right">
                <span className={`text-xl font-bold font-mono tracking-tighter ${(driver?.impact_days || 0) > 0 ? 'text-rose-500' : 'text-emerald-400'}`}>
                  {(driver?.impact_days || 0) > 0 ? '+' : ''}{driver?.impact_days || 0}
                  <span className="text-[10px] font-normal text-white/20 ml-1 uppercase">Days</span>
                </span>
              </div>
            </div>
            
            <div className="h-1 w-full bg-white/[0.04] rounded-full overflow-hidden relative">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.abs((driver?.impact_days || 0) / 180) * 100}%` }}
                className={`h-full ${(driver?.impact_days || 0) > 0 ? 'bg-rose-500/60' : 'bg-emerald-500/60'}`}
              />
            </div>
            
            <p className="mt-3 text-[11px] text-white/40 leading-relaxed font-medium group-hover:text-white/60 transition-colors">
              {driver?.explanation || "No explanation provided."}
            </p>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-auto pt-6 border-t border-white/[0.04]">
        <div className="flex items-center gap-2 text-[9px] text-indigo-400/50 font-mono uppercase tracking-widest">
          <div className="w-1 h-1 bg-indigo-500 rounded-full animate-pulse" />
          Verified Bayesian Inference
        </div>
      </div>
    </div>
  );
};
