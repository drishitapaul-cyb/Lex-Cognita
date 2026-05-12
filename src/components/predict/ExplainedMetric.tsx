import React from 'react';

export const ExplainedMetric = ({ label, value, unit, why, benchmark }: { label: string, value: number | string, unit: string, why: string, benchmark: number | string }) => (
  <div className="bg-[#111827] border border-white/10 p-4 rounded-lg flex flex-col gap-2">
    <div className="text-sm font-medium text-[#9CA3AF]">{label}</div>
    <div className="text-2xl font-mono text-[#F9FAFB]">
      {value} <span className="text-sm text-[#9CA3AF] font-sans">{unit}</span>
    </div>
    <div className="text-sm text-[#F9FAFB] leading-relaxed">
      {why}
    </div>
    <div className="text-xs text-[#9CA3AF] mt-2 pt-2 border-t border-white/5">
      District avg: <span className="font-mono">{benchmark} {unit}</span>
      {typeof value === 'number' && typeof benchmark === 'number' && (
        value < benchmark ? " — faster than average" : " — slower than average"
      )}
    </div>
  </div>
);
