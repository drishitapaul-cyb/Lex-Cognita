import React from 'react';
import { motion } from 'framer-motion';

export const CausalBreakdown = ({ totalDays }: { totalDays: number }) => {
  // Mock causal factors that sum to totalDays
  const factors = [
    { name: 'Court Backlog', days: Math.round(totalDays * 0.45), color: 'bg-[#4F9EF8]' },
    { name: 'Procedural Delays', days: Math.round(totalDays * 0.25), color: 'bg-[#FBBF24]' },
    { name: 'Evidence Gathering', days: Math.round(totalDays * 0.20), color: 'bg-[#34D399]' },
    { name: 'Judge Availability', days: Math.round(totalDays * 0.10), color: 'bg-[#A78BFA]' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#111827] border border-white/10 rounded-xl p-6 h-full"
    >
      <h3 className="text-sm font-medium text-[#9CA3AF] mb-6">Causal Breakdown (P50)</h3>
      
      <div className="space-y-6">
        {factors.map((factor, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#F9FAFB]">{factor.name}</span>
              <span className="text-[#9CA3AF] font-mono">{factor.days}d</span>
            </div>
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                className={`h-full ${factor.color}`}
                initial={{ width: 0 }}
                animate={{ width: `${(factor.days / totalDays) * 100}%` }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              />
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 pt-6 border-t border-white/5">
        <p className="text-xs text-[#9CA3AF] leading-relaxed">
          This breakdown is generated using a SHAP (SHapley Additive exPlanations) model, isolating the contribution of each feature to the final prediction.
        </p>
      </div>
    </motion.div>
  );
};
