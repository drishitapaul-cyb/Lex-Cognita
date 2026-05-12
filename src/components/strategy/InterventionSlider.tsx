import React from 'react';
import { useCaseStore } from '../../store/caseStore';

export const InterventionSlider = () => {
  const { interventions, setIntervention } = useCaseStore();

  return (
    <div className="bg-[#111827] border border-white/10 rounded-xl p-6 h-full">
      <h3 className="text-sm font-medium text-[#9CA3AF] mb-8">Strategic Interventions</h3>
      
      <div className="space-y-8">
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <label className="text-[#F9FAFB]">Filing Delay (Days)</label>
            <span className="text-[#4F9EF8] font-mono">{interventions.filing_delay}</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="60" 
            value={interventions.filing_delay}
            onChange={(e) => setIntervention('filing_delay', parseInt(e.target.value))}
            className="w-full accent-[#4F9EF8]"
          />
          <p className="text-xs text-[#9CA3AF]">How quickly you can file the initial documents.</p>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <label className="text-[#F9FAFB]">Opponent Aggressiveness</label>
            <span className="text-[#F87171] font-mono">{interventions.opponent_aggressiveness}</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="3" 
            step="1"
            value={interventions.opponent_aggressiveness}
            onChange={(e) => setIntervention('opponent_aggressiveness', parseInt(e.target.value))}
            className="w-full accent-[#F87171]"
          />
          <p className="text-xs text-[#9CA3AF]">Expected level of delay tactics from the opponent (0-3).</p>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <label className="text-[#F9FAFB]">Fast-Track Application</label>
            <span className="text-[#34D399] font-mono">{interventions.fast_track ? 'Yes' : 'No'}</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="1"
            value={interventions.fast_track}
            onChange={(e) => setIntervention('fast_track', parseInt(e.target.value))}
            className="w-full accent-[#34D399]"
          />
          <p className="text-xs text-[#9CA3AF]">Whether to file an application for expedited hearing.</p>
        </div>
      </div>
    </div>
  );
};
