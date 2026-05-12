import React from 'react';
import { RiskBadge } from '../shared/RiskBadge';

export const OpponentRisk = () => {
  return (
    <div className="bg-[#111827] border border-white/10 rounded-xl p-6">
      <div className="flex justify-between items-start mb-6">
        <h3 className="text-sm font-medium text-[#9CA3AF]">Opponent Counsel Profile</h3>
        <RiskBadge level="HIGH" />
      </div>
      
      <div className="space-y-6">
        <div>
          <div className="text-2xl font-medium text-[#F9FAFB] mb-1">Adv. Sharma & Associates</div>
          <div className="text-sm text-[#9CA3AF]">Representing the Defendant</div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-[#0A0F1E] border border-white/5 rounded-lg">
            <div className="text-xs text-[#9CA3AF] mb-1">Adjournment Rate</div>
            <div className="text-lg font-mono text-[#F87171]">68%</div>
          </div>
          <div className="p-3 bg-[#0A0F1E] border border-white/5 rounded-lg">
            <div className="text-xs text-[#9CA3AF] mb-1">Avg. Delay Caused</div>
            <div className="text-lg font-mono text-[#FBBF24]">+142 days</div>
          </div>
        </div>
        
        <div className="pt-4 border-t border-white/5">
          <h4 className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wider mb-3">Known Tactics</h4>
          <ul className="space-y-2 text-sm text-[#F9FAFB]">
            <li className="flex items-start gap-2">
              <span className="text-[#F87171] mt-1">•</span>
              <span>Frequent medical adjournments during evidence phase.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#F87171] mt-1">•</span>
              <span>Filing interlocutory applications to stall proceedings.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
