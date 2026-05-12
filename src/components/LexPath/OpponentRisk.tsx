import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useCaseStore } from '../../store/caseStore';
import { API_URL } from '../../constants/api';

export const OpponentRisk = () => {
  const { caseData } = useCaseStore();
  const [error, setError] = useState(false);
  const [strategy, setStrategy] = useState<any>(null);

  useEffect(() => {
    const fetchStrategy = async () => {
      try {
        const response = await fetch(`${API_URL}/strategy`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(caseData),
        });
        const data = await response.json();
        setStrategy(data);
        setError(false);
      } catch (e) {
        console.error(e);
        setError(true);
      }
    };
    fetchStrategy();
  }, [caseData]);

  if (error) return <div style={{ color: 'white/40', fontSize: 10 }}>[STRATEGY_OFFLINE]</div>;

  if (!strategy) return (
    <div className="animate-pulse flex flex-col h-full">
      <div className="h-3 bg-white/5 rounded w-1/3 mb-12" />
      <div className="flex items-center gap-8 mb-8">
        <div className="w-24 h-24 rounded-full bg-white/5" />
        <div className="flex-1 space-y-3">
          <div className="h-2 bg-white/5 rounded" />
          <div className="h-2 bg-white/5 rounded w-2/3" />
        </div>
      </div>
    </div>
  );

  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const agg = strategy?.opponent_model?.aggressiveness || 0;
  const offset = circumference - (agg * circumference);

  return (
    <div className="flex flex-col h-full">
      {/* DEBUG_MARKER: Opponent_Strategy_Rendered */}
      <div className="flex justify-between items-center mb-10">
        <h3 className="text-[10px] font-mono text-white/40 uppercase tracking-[0.4em]">Adversarial Vector</h3>
        <div className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest ${agg > 0.6 ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
          {agg > 0.6 ? 'Anomaly Detected' : 'Baseline'}
        </div>
      </div>

      <div className="flex items-center gap-10 mb-10">
        <div className="relative w-28 h-28">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="56" cy="56" r={radius}
              fill="transparent"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="6"
            />
            <motion.circle
              cx="56" cy="56" r={radius}
              fill="transparent"
              stroke="currentColor"
              strokeWidth="6"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              className={agg > 0.6 ? 'text-rose-500' : 'text-indigo-400'}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-white tracking-tighter">{Math.round(agg * 100)}%</span>
            <span className="text-[8px] text-white/20 uppercase tracking-widest">Intensity</span>
          </div>
        </div>
        
        <div className="flex-1 space-y-4">
          {(strategy?.opponent_model?.tactics || []).map((t: any, i: number) => (
            <motion.div 
              key={t?.name || i}
              initial={{ opacity: 0, x: 5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col gap-1.5"
            >
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-medium text-white/50">{t?.name || "Tactic"}</span>
                <span className="text-[10px] font-mono text-white/20">{Math.round((t?.probability || 0) * 100)}%</span>
              </div>
              <div className="h-[2px] w-full bg-white/[0.04] rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(t?.probability || 0) * 100}%` }}
                  className={`h-full ${(t?.probability || 0) > 0.5 ? 'bg-rose-500' : 'bg-indigo-300'} opacity-60`}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className={`mt-auto p-5 rounded-m border ${agg > 0.6 ? 'bg-rose-500/[0.03] border-rose-500/10' : 'bg-white/[0.02] border-white/[0.04]'}`}>
        <p className="text-[9px] text-white/20 uppercase tracking-widest mb-2 font-mono">Simulated Response</p>
        <p className="text-sm text-white/70 leading-relaxed font-medium">
          "{strategy?.recommended_strategy || strategy?.recommendation || "System offline"}"
        </p>
      </div>
    </div>
  );
};
