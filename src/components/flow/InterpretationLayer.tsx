import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, Scale, Database, Shield, AlertTriangle, User, Gavel, FileText, Activity } from 'lucide-react';
import { useLexStore, formatDuration } from '../../store/caseStore';
import { GlassCard } from '../ui/GlassCard';

export const InterpretationLayer = () => {
  const { prediction, setStage } = useLexStore();

  if (!prediction) return (
    <div className="text-center p-20 text-white/20">Waiting for information...</div>
  );

  const di = prediction.data_insights ?? {};
  const backlogPct    = di.backlog_percentile ?? 'N/A';
  const adjRisk       = di.adjournment_risk ?? 'Unknown';
  const nCases        = prediction.timeline.n_cases ?? di.n_cases_analyzed ?? 0;
  const dataSource    = prediction.timeline.source ?? di.data_source ?? '';
  const trustScore    = di.model_trust_score ?? 'N/A';

  // New Indian legal context fields
  const courtType     = di.court_type ?? 'District Court';
  const courtFactor   = di.court_type_factor ?? 1.0;
  const stage         = di.procedural_stage ?? 'Evidence';
  const stageRemPct   = di.stage_remaining_pct ?? 60;
  const evidenceQual  = di.evidence_quality ?? 'Adequate';
  const evidenceScore = di.evidence_quality_score ?? 0.55;
  const ipcSection    = di.ipc_section ?? 'NA';
  const lawyerExp     = di.lawyer_experience ?? 8;
  const delayTactics  = di.delay_tactics ?? false;
  const hearingGap    = di.hearing_gap_days ?? 28;
  const opponentAggr  = di.opponent_aggressiveness ?? 0.5;
  const stateBacklog  = di.state_backlog_weight ?? 60;
  const rawMlDays     = di.raw_ml_days ?? 0;
  const adjustNotes   = di.adjustment_notes ?? [];

  const riskColor = (level: string) => {
    if (level === 'Critical') return 'text-rose-400';
    if (level === 'High') return 'text-orange-400';
    if (level === 'Moderate') return 'text-amber-400';
    return 'text-emerald-400';
  };

  const evidenceColor = (label: string) => {
    if (label === 'Weak') return 'text-rose-400';
    if (label === 'Partial') return 'text-amber-400';
    if (label === 'Strong') return 'text-emerald-400';
    return 'text-white/60';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-5xl font-bold tracking-tight">What's happening in your case</h1>
        <p className="text-white/40 text-xl font-light">
          We've broken down the factors contributing to your estimated{' '}
          <span className="text-indigo-400 font-semibold">{formatDuration(prediction.timeline.p50)}</span> timeline.
        </p>
        {dataSource && (
          <div className="flex items-center gap-2 mt-2">
            <Database size={12} className="text-emerald-400" />
            <span className="text-[10px] font-mono text-emerald-400/70 uppercase tracking-widest">
              {dataSource}
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Causal Drivers -- SHAP-powered */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="text-[10px] font-black tracking-[0.3em] uppercase text-white/20 mb-2">
            Key Drivers of Delay  <span className="text-emerald-400/60 ml-2">(SHAP Analysis)</span>
          </div>

          {prediction.causal_drivers.length === 0 && (
            <GlassCard className="!p-8 text-white/30 text-sm">
              No significant delay drivers identified in this case profile.
            </GlassCard>
          )}

          {prediction.causal_drivers.map((driver, idx) => (
            <GlassCard key={idx} className="!p-8 group hover:bg-white/[0.04]">
              <div className="flex justify-between items-start">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                    <h3 className="text-2xl font-bold">{driver.factor}</h3>
                    {driver.confidence && (
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${
                        driver.confidence === 'High'
                          ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                          : driver.confidence === 'Medium'
                          ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
                          : 'text-white/30 border-white/10'
                      }`}>
                        {driver.confidence}
                      </span>
                    )}
                  </div>
                  <p className="text-white/40 leading-relaxed font-light text-lg">
                    {driver.reason}
                  </p>
                </div>
                <div className="text-right ml-8 flex-shrink-0">
                  <div className={`text-[10px] font-black mb-1 ${driver.impact_days > 0 ? 'text-rose-500' : 'text-emerald-400'}`}>
                    {driver.impact_days > 0 ? 'ADDS DELAY' : 'REDUCES DELAY'}
                  </div>
                  <div className={`text-4xl font-mono ${driver.impact_days > 0 ? 'text-white' : 'text-emerald-400'}`}>
                    {driver.impact_days > 0 ? '+' : ''}{formatDuration(driver.impact_days)}
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}

          {/* Indian Legal Context Grid */}
          <div className="text-[10px] font-black tracking-[0.3em] uppercase text-white/20 mt-6 mb-2">
            Indian Legal Context  <span className="text-indigo-400/60 ml-2">(Domain Intelligence)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Court Type */}
            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex gap-3">
              <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400 flex-shrink-0">
                <Gavel size={16} />
              </div>
              <div>
                <strong className="block text-white/70 text-xs font-bold mb-0.5">Court</strong>
                <span className="text-white/90 text-sm font-semibold">{courtType}</span>
                {courtFactor !== 1.0 && (
                  <span className={`ml-1.5 text-[10px] font-mono ${courtFactor > 1 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    ({courtFactor}x)
                  </span>
                )}
              </div>
            </div>

            {/* Procedural Stage */}
            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex gap-3">
              <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-400 flex-shrink-0">
                <Activity size={16} />
              </div>
              <div>
                <strong className="block text-white/70 text-xs font-bold mb-0.5">Stage</strong>
                <span className="text-white/90 text-sm font-semibold">{stage}</span>
                <span className="ml-1.5 text-[10px] font-mono text-white/40">({stageRemPct}% left)</span>
              </div>
            </div>

            {/* Evidence Quality */}
            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex gap-3">
              <div className="p-2.5 bg-white/5 rounded-xl text-white/40 flex-shrink-0">
                <FileText size={16} />
              </div>
              <div>
                <strong className="block text-white/70 text-xs font-bold mb-0.5">Evidence</strong>
                <span className={`text-sm font-semibold ${evidenceColor(evidenceQual)}`}>{evidenceQual}</span>
                <span className="ml-1.5 text-[10px] font-mono text-white/30">({(evidenceScore * 100).toFixed(0)}%)</span>
              </div>
            </div>

            {/* Lawyer Experience */}
            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex gap-3">
              <div className="p-2.5 bg-white/5 rounded-xl text-white/40 flex-shrink-0">
                <User size={16} />
              </div>
              <div>
                <strong className="block text-white/70 text-xs font-bold mb-0.5">Advocate</strong>
                <span className="text-white/90 text-sm font-semibold">
                  {lawyerExp >= 15 ? 'Senior' : lawyerExp >= 8 ? 'Experienced' : lawyerExp <= 2 ? 'Junior' : 'Mid-career'}
                </span>
                <span className="ml-1.5 text-[10px] font-mono text-white/30">({lawyerExp}yr)</span>
              </div>
            </div>

            {/* IPC Section (only for criminal) */}
            {ipcSection !== 'NA' && (
              <div className="p-4 bg-white/[0.02] border border-rose-500/10 rounded-2xl flex gap-3">
                <div className="p-2.5 bg-rose-500/10 rounded-xl text-rose-400 flex-shrink-0">
                  <Shield size={16} />
                </div>
                <div>
                  <strong className="block text-white/70 text-xs font-bold mb-0.5">IPC Section</strong>
                  <span className="text-rose-400 text-sm font-semibold">S. {ipcSection}</span>
                </div>
              </div>
            )}

            {/* Delay Tactics */}
            {delayTactics && (
              <div className="p-4 bg-rose-500/[0.04] border border-rose-500/20 rounded-2xl flex gap-3">
                <div className="p-2.5 bg-rose-500/10 rounded-xl text-rose-400 flex-shrink-0">
                  <AlertTriangle size={16} />
                </div>
                <div>
                  <strong className="block text-rose-400/80 text-xs font-bold mb-0.5">Delay Tactics</strong>
                  <span className="text-rose-300 text-sm font-semibold">Detected</span>
                  <span className="ml-1.5 text-[10px] font-mono text-rose-400/60">(+200d)</span>
                </div>
              </div>
            )}
          </div>

          {/* Adjustment Notes */}
          {adjustNotes.length > 0 && (
            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl mt-2">
              <div className="text-[9px] font-black tracking-[0.25em] uppercase text-white/20 mb-2">
                Adjustment Breakdown
              </div>
              <div className="space-y-1">
                {adjustNotes.slice(0, 5).map((note: string, i: number) => (
                  <p key={i} className="text-[11px] text-white/35 font-mono leading-relaxed">
                    {note}
                  </p>
                ))}
              </div>
              {rawMlDays > 0 && (
                <p className="text-[10px] text-indigo-400/50 font-mono mt-2">
                  ML baseline: {rawMlDays.toLocaleString()}d &rarr; Adjusted: {prediction.timeline.p50.toLocaleString()}d
                </p>
              )}
            </div>
          )}
        </div>

        {/* Summary Panel */}
        <div className="lg:col-span-4 space-y-6">
          <GlassCard className="bg-indigo-600 border-none !p-10 flex flex-col gap-8">
            <div className="space-y-4">
              <h3 className="text-3xl font-black tracking-tight leading-[0.9]">What this means for you</h3>
              <p className="text-white/80 leading-relaxed font-medium">
                {prediction.explanation}
              </p>
            </div>

            <button
              onClick={() => setStage('timeline')}
              className="w-full py-6 bg-white text-black font-black uppercase tracking-widest text-xs rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.03] active:scale-[0.97] transition-all shadow-xl"
            >
              View Timeline Forecast
              <ArrowRight size={18} />
            </button>
          </GlassCard>

          <div className="p-6 bg-white/[0.02] border border-white/5 rounded-[32px] space-y-6">
            <div className="flex gap-4">
              <div className="p-3 bg-white/5 rounded-2xl text-white/40">
                <Clock size={20} />
              </div>
              <div>
                <strong className="block text-white/80 font-bold mb-1">Court Congestion</strong>
                <p className="text-xs text-white/30 leading-relaxed">
                  Backlog is in the{' '}
                  <span className="text-indigo-400 font-bold">{backlogPct}th percentile</span>{' '}
                  of all courts nationally. State adds {stateBacklog > 0 ? '+' : ''}{stateBacklog}d delay.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="p-3 bg-white/5 rounded-2xl text-white/40">
                <Scale size={20} />
              </div>
              <div>
                <strong className="block text-white/80 font-bold mb-1">Adjournment Risk</strong>
                <p className="text-xs text-white/30 leading-relaxed">
                  Risk level is currently{' '}
                  <span className={`font-bold uppercase ${riskColor(adjRisk)}`}>{adjRisk}</span>{' '}
                  for your jurisdiction. {hearingGap > 35
                    ? `Gap of ${hearingGap}d between hearings is above normal.`
                    : `Hearing interval: ${hearingGap}d.`
                  }
                </p>
              </div>
            </div>

            {opponentAggr > 0.6 && (
              <div className="flex gap-4">
                <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-400">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <strong className="block text-rose-400/80 font-bold mb-1">Opponent Profile</strong>
                  <p className="text-xs text-rose-300/50 leading-relaxed">
                    Opponent aggressiveness: <span className="text-rose-400 font-bold">{(opponentAggr * 100).toFixed(0)}%</span>.
                    Expect procedural resistance and counter-filings.
                  </p>
                </div>
              </div>
            )}

            {nCases > 0 && (
              <div className="flex gap-4">
                <div className="p-3 bg-white/5 rounded-2xl text-white/40">
                  <Database size={20} />
                </div>
                <div>
                  <strong className="block text-white/80 font-bold mb-1">Data Foundation</strong>
                  <p className="text-xs text-white/30 leading-relaxed">
                    Prediction based on{' '}
                    <span className="text-emerald-400 font-bold">{nCases.toLocaleString()} real cases</span>.
                    Trust score: {trustScore}.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confidence Notes */}
      {prediction.confidence_notes && (
        <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
          <p className="text-[10px] text-white/30 font-mono">{prediction.confidence_notes}</p>
        </div>
      )}
    </div>
  );
};
