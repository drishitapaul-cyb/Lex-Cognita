import React from 'react';
import { useCaseStore } from '../../store/caseStore';
import { motion } from 'framer-motion';

export const TimelineView = ({ onSelectP50 }: { onSelectP50: () => void }) => {
  const { interventions } = useCaseStore();
  
  // Base values
  const baseP50 = 287;
  const baseP90 = 410;
  
  // Calculate dynamic values based on interventions
  const p50 = Math.max(60, baseP50 - interventions.filing_delay * 1.2 - interventions.fast_track * 0.4 * baseP50 + interventions.opponent_aggressiveness * 45);
  const p90 = Math.max(90, baseP90 - interventions.filing_delay * 1.5 - interventions.fast_track * 0.3 * baseP90 + interventions.opponent_aggressiveness * 80);

  // Calculate positions (max 600 days for scale)
  const maxDays = 600;
  const p50Pos = (p50 / maxDays) * 100;
  const p90Pos = (p90 / maxDays) * 100;

  return (
    <div className="bg-[#111827] border border-white/10 rounded-xl p-6">
      <h3 className="text-sm font-medium text-[#9CA3AF] mb-8">Predicted Timeline Distribution</h3>
      
      <div className="relative h-32 mt-12 mb-8">
        {/* Axis */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-white/20" />
        <div className="absolute bottom-0 left-0 w-px h-2 bg-white/20" />
        <div className="absolute bottom-0 right-0 w-px h-2 bg-white/20" />
        <div className="absolute -bottom-6 left-0 text-xs text-[#9CA3AF]">0 days</div>
        <div className="absolute -bottom-6 right-0 text-xs text-[#9CA3AF]">600 days</div>

        {/* Distribution curve (simplified visualization) */}
        <svg className="absolute bottom-0 left-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
          <motion.path 
            d={`M 0 100 Q ${p50Pos * 0.5} 100, ${p50Pos} 20 T ${p90Pos} 80 T 100 100`}
            fill="url(#gradient)"
            stroke="#4F9EF8"
            strokeWidth="2"
            animate={{ d: `M 0 100 Q ${p50Pos * 0.5} 100, ${p50Pos} 20 T ${p90Pos} 80 T 100 100` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4F9EF8" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#4F9EF8" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        {/* P50 Marker */}
        <motion.div 
          className="absolute bottom-0 flex flex-col items-center cursor-pointer group"
          animate={{ left: `${p50Pos}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          onClick={onSelectP50}
        >
          <div className="bg-[#4F9EF8] text-[#0A0F1E] text-xs font-bold px-2 py-1 rounded mb-2 whitespace-nowrap group-hover:scale-110 transition-transform">
            P50: {Math.round(p50)} days
          </div>
          <div className="w-px h-full bg-[#4F9EF8] absolute top-8 bottom-0" />
        </motion.div>

        {/* P90 Marker */}
        <motion.div 
          className="absolute bottom-0 flex flex-col items-center"
          animate={{ left: `${p90Pos}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="bg-[#F87171] text-[#0A0F1E] text-xs font-bold px-2 py-1 rounded mb-2 whitespace-nowrap">
            P90: {Math.round(p90)} days
          </div>
          <div className="w-px h-full bg-[#F87171] absolute top-8 bottom-0" />
        </motion.div>
      </div>
    </div>
  );
};
