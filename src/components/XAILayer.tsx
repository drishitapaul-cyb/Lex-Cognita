import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export function ConfidenceHeatmap({ certainty, children, className }: { certainty: number, children: React.ReactNode, className?: string }) {
  // High certainty: sharp, focused, fast
  // Low certainty: wide, soft, slow
  const isHigh = certainty > 75;
  const isMedium = certainty > 40 && certainty <= 75;

  const blurClass = isHigh ? 'blur-md' : isMedium ? 'blur-xl' : 'blur-3xl';
  const scaleRange = isHigh ? [1, 1.05, 1] : isMedium ? [1, 1.15, 1] : [1, 1.3, 1];
  const duration = isHigh ? 1.5 : isMedium ? 3 : 5;
  const opacityRange = isHigh ? [0.4, 0.8, 0.4] : [0.2, 0.5, 0.2];
  const colorClass = isHigh ? 'bg-emerald-500' : isMedium ? 'bg-amber-500' : 'bg-slate-500';

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <motion.div
        className={cn("absolute inset-0 rounded-full z-0", blurClass, colorClass)}
        animate={{
          scale: scaleRange,
          opacity: opacityRange,
        }}
        transition={{
          duration: duration,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
}

export function LogicTrace({ baseline, modifiers, total }: { baseline: number, modifiers: { label: string, days: number }[], total: number }) {
  return (
    <div className="flex flex-col space-y-3 font-mono text-xs w-full">
      <div className="flex items-center text-white/70">
        <span className="w-12 text-right mr-4">{baseline}d</span>
        <span className="text-white/50">Baseline</span>
      </div>
      {modifiers.map((mod, i) => (
        <div key={i} className="flex items-center">
          <span className={cn("w-12 text-right mr-4", mod.days >= 0 ? "text-amber-400" : "text-emerald-400")}>
            {mod.days >= 0 ? '+' : ''}{mod.days}d
          </span>
          <span className="text-white/70 truncate" title={mod.label}>{mod.label}</span>
        </div>
      ))}
      <div className="flex items-center pt-3 border-t border-white/10 mt-2 text-white">
        <span className="w-12 text-right mr-4 font-bold text-sm">{total}d</span>
        <span className="font-bold text-emerald-400 uppercase tracking-wider text-[10px]">Predicted</span>
      </div>
    </div>
  );
}
