import React from 'react';
import { cn } from '../../lib/utils';

export const RiskBadge = ({ level }: { level: 'HIGH' | 'MEDIUM' | 'LOW' }) => {
  const colors = {
    HIGH: 'bg-[#F87171]/20 text-[#F87171] border-[#F87171]/30',
    MEDIUM: 'bg-[#FBBF24]/20 text-[#FBBF24] border-[#FBBF24]/30',
    LOW: 'bg-[#34D399]/20 text-[#34D399] border-[#34D399]/30',
  };

  return (
    <span className={cn("px-2 py-1 rounded-full text-xs font-semibold border", colors[level])}>
      {level} RISK
    </span>
  );
};
