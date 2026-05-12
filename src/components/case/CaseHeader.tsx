import React from 'react';
import { useCaseStore } from '../../store/caseStore';

export const CaseHeader = () => {
  const { answers } = useCaseStore();
  
  return (
    <div 
      className="w-full h-12 bg-[#111827] border-b border-white/10 flex items-center px-6 justify-between sticky top-0 z-50"
      style={{ viewTransitionName: 'case-anchor' }}
    >
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#9CA3AF] uppercase tracking-wider">Case ID</span>
          <span className="text-sm font-mono text-[#F9FAFB]">LX-{Math.floor(Math.random() * 10000)}</span>
        </div>
        <div className="w-px h-4 bg-white/10" />
        <div className="text-sm text-[#F9FAFB]">{answers.district || 'District Court'}, {answers.state || 'State'}</div>
        <div className="w-px h-4 bg-white/10" />
        <div className="text-sm text-[#F9FAFB]">{answers.subtype || 'Case Type'}</div>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-[#34D399] animate-pulse" />
        <span className="text-xs text-[#34D399] font-medium uppercase tracking-wider">Active Analysis</span>
      </div>
    </div>
  );
};
