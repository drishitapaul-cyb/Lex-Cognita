import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Target, Download } from 'lucide-react';
import { useLexStore, formatDuration, getEstimatedDate } from '../../store/caseStore';
import { GlassCard } from '../ui/GlassCard';

export const DecisionLab = () => {
  const { prediction, reset, exportReport } = useLexStore();
  const [activeActions, setActiveActions] = useState<string[]>([]);
  const [exporting, setExporting] = useState(false);

  if (!prediction) return null;

  const currentP50 = prediction.timeline.p50;

  // Calculate potential savings based on active actions
  const totalSavings = activeActions.reduce((acc, actionName) => {
    const action = prediction.decision_fork.find(d => d.action === actionName);
    return acc + (action?.impact_days || 0);
  }, 0);

  const finalDays = Math.max(0, currentP50 + totalSavings);

  const toggleAction = (action: string) => {
    setActiveActions(prev =>
      prev.includes(action) ? prev.filter(a => a !== action) : [...prev, action]
    );
  };

  const handleExport = async () => {
    setExporting(true);
    await exportReport();
    setExporting(false);
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start pb-20">
      {/* Options Column */}
      <div className="lg:col-span-8 space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold tracking-tight">Your options for resolution</h1>
          <p className="text-white/40 text-xl font-light">
            Select actions to see how much time you could save. Probabilities are derived from{' '}
            {(prediction.timeline.n_cases ?? 0) > 0
              ? `${(prediction.timeline.n_cases ?? 0).toLocaleString()} real cases`
              : 'historical procedural data'} in your district.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {prediction.decision_fork.map((decision, idx) => (
            <button
              key={idx}
              onClick={() => toggleAction(decision.action)}
              className="text-left outline-none group"
            >
              <GlassCard
                className={`!p-8 transition-all h-full ${
                  activeActions.includes(decision.action)
                    ? 'bg-indigo-600/20 border-indigo-500/50'
                    : 'bg-white/[0.02] border-white/10 hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-3 rounded-2xl ${activeActions.includes(decision.action) ? 'bg-indigo-500 text-white' : 'bg-white/5 text-white/30 group-hover:text-white/60'}`}>
                    <Target size={20} />
                  </div>
                  <div className={`text-xl font-bold ${decision.impact_days <= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {decision.impact_days <= 0
                      ? `Save ${formatDuration(decision.impact_days)}`
                      : `+${formatDuration(decision.impact_days)}`}
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-3">{decision.action}</h3>
                <p className="text-sm text-white/30 leading-relaxed font-light mb-6">
                  {decision.reasoning}
                </p>

                <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-black uppercase text-white/20">
                      Success: {Math.round(decision.success_probability * 100)}%
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-white/20">{decision.risk}</div>
                </div>
              </GlassCard>
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Forecast Panel */}
      <div className="lg:col-span-4 lg:sticky lg:top-32 space-y-6">
        <GlassCard className="!p-10 text-center space-y-10 border-white/5 bg-black/40">
          <div className="text-[10px] font-black tracking-[0.4em] uppercase text-white/20">Updated Forecast</div>

          <div className="space-y-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={finalDays}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-7xl font-black tracking-tighter"
              >
                {getEstimatedDate(finalDays)}
              </motion.div>
            </AnimatePresence>
            <div className="text-xs font-bold text-white/30 uppercase tracking-widest">Estimated Completion Date</div>
          </div>

          <div className="h-[1px] w-12 bg-white/10 mx-auto" />

          <div className="space-y-2">
            <div className="text-5xl font-mono font-light text-white/60">
              {formatDuration(finalDays)}
            </div>
            <div className="text-[10px] font-black text-white/20 uppercase tracking-widest">Remaining Duration</div>
          </div>

          {totalSavings < 0 && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 font-bold"
            >
              You could finish ~{formatDuration(totalSavings)} earlier
            </motion.div>
          )}

          <button
            onClick={reset}
            className="w-full py-5 bg-white text-black font-black uppercase tracking-widest text-[10px] rounded-2xl hover:scale-105 transition-all shadow-2xl"
          >
            New Analysis
          </button>

          <button
            onClick={handleExport}
            disabled={exporting}
            className="w-full py-4 border border-white/20 text-white/60 font-bold uppercase tracking-widest text-[10px] rounded-2xl hover:border-white/40 hover:text-white transition-all flex items-center justify-center gap-2 disabled:opacity-40"
          >
            <Download size={14} />
            {exporting ? 'Generating PDF...' : 'Download Case Report'}
          </button>
        </GlassCard>

        <div className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-3xl flex gap-4">
          <AlertCircle size={20} className="text-amber-500 shrink-0" />
          <p className="text-[10px] text-amber-500/60 leading-relaxed font-bold uppercase tracking-widest">
            Actions are simulated using GBR predictions calibrated on real case outcome data.
          </p>
        </div>
      </div>
    </div>
  );
};
