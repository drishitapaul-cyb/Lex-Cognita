import React from 'react';
import { useCaseStore, usePredictionStore } from '../store/caseStore';

export const logStep = (step: string, data: any) => {
  console.log(`%c[LEXPATH_STEP: ${step}]`, 'background: #333; color: #5856D6; font-weight: bold; padding: 2px 4px;', data);
};

export const DebugMonitor = () => {
  const { caseData } = useCaseStore();
  const { timeline, causalDrivers, explanation, loading } = usePredictionStore();

  return (
    <div className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2">
      <div className="glass p-4 border-indigo-500/20 max-w-xs overflow-hidden">
        <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2">Stage: {loading ? 'Processing' : timeline ? 'Analysis Ready' : 'Awaiting Input'}</h4>
        <div className="space-y-1">
          <div className="flex justify-between text-[9px] font-mono">
             <span className="text-white/40">Input Captured:</span>
             <span className={Object.keys(caseData).length > 0 ? "text-emerald-400" : "text-rose-400"}>
               {Object.keys(caseData).length > 0 ? "YES" : "NO"}
             </span>
          </div>
          <div className="flex justify-between text-[9px] font-mono">
             <span className="text-white/40">API Response:</span>
             <span className={timeline ? "text-emerald-400" : "text-rose-400"}>
               {timeline ? "RECEIVED" : "NONE"}
             </span>
          </div>
           <div className="flex justify-between text-[9px] font-mono">
             <span className="text-white/40">Drivers Count:</span>
             <span className="text-indigo-400">{causalDrivers.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const DiagnosticDashboard = () => {
  const { caseData } = useCaseStore();
  const { timeline, causalDrivers, explanation } = usePredictionStore();

  return (
    <div className="p-20 space-y-20 bg-black min-h-screen text-white">
      <section>
        <h3 className="text-indigo-500 font-mono mb-6 uppercase tracking-widest">/debug/input_state</h3>
        <pre className="glass p-8 text-xs font-mono text-white/60">{JSON.stringify(caseData, null, 2)}</pre>
      </section>

      <section>
        <h3 className="text-emerald-500 font-mono mb-6 uppercase tracking-widest">/debug/api_output</h3>
        <pre className="glass p-8 text-xs font-mono text-emerald-400/60">{JSON.stringify({ timeline, causalDrivers }, null, 2)}</pre>
      </section>

      <section>
        <h3 className="text-purple-500 font-mono mb-6 uppercase tracking-widest">/debug/explanation_vector</h3>
        <p className="glass p-8 text-sm leading-relaxed text-white/80 italic">"{explanation}"</p>
      </section>
    </div>
  );
};
