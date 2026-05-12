import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Info, Calendar, Clock, Download } from 'lucide-react';
import { useLexStore, formatDuration, getEstimatedDate } from '../../store/caseStore';
import { GlassCard } from '../ui/GlassCard';
import LitigationTimeMachine, { CaseEvent } from './LitigationTimeMachine';

export const TimelineLayer = () => {
  const { prediction, setStage, exportReport } = useLexStore();
  
  if (!prediction) return null;

  const { p10, p50, p90 } = prediction.timeline;

  // Mock Case History for cinematic visualization
  const caseHistory: CaseEvent[] = [
    { 
      id: "1", 
      title: "Case Filing", 
      date: "2024-01-15", 
      status: "COMPLETED", 
      causalNote: "Initial suit filed in Mumbai District Court."
    },
    { 
      id: "2", 
      title: "Service of Process", 
      date: "2024-03-20", 
      status: "DELAYED", 
      delayReason: "Other side avoided service for 4 weeks.",
      causalNote: "Systemic delay noted in process serving speed."
    },
    { 
      id: "3", 
      title: "Discovery Phase", 
      date: "2024-11-10", 
      status: "CURRENT", 
      causalNote: "Currently analyzing document production vectors."
    },
    { 
      id: "4", 
      title: "Pre-Trial Review", 
      status: "PREDICTED", 
      confidence: 0.88,
      causalNote: "Scheduled post-discovery based on current backlog velocity."
    },
    { 
      id: "5", 
      title: "Final Judgment", 
      status: "PREDICTED", 
      confidence: 0.62,
      causalNote: "Estimated disposal date based on historical district averages."
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-24 pb-32">
      {/* Real Date Headline */}
      <div className="space-y-4 text-center">
        <h1 className="text-5xl font-bold tracking-tight">
          Your case may finish in <span className="text-indigo-400">{formatDuration(p50)}</span>
        </h1>
        <p className="text-white/40 text-xl font-light">
          Estimated completion: <span className="text-white font-semibold">{getEstimatedDate(p50)}</span>
        </p>
      </div>

      {/* Cinematic Time Machine */}
      <div className="space-y-8">
         <div className="flex items-center gap-3 px-6">
            <Clock size={16} className="text-white/20" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Chronological Flow</span>
         </div>
         <LitigationTimeMachine caseHistory={caseHistory} />
      </div>

      {/* Simplified Logic Bar */}
      <GlassCard className="!p-12 space-y-16">
        <div className="relative pt-12">
          {/* Track */}
          <div className="absolute top-1/2 left-0 w-full h-1 bg-white/5 -translate-y-1/2 rounded-full" />
          
          {/* Progress Markers */}
          <div className="relative flex justify-between items-center px-4">
            {/* Start */}
            <div className="flex flex-col items-center">
               <div className="w-4 h-4 rounded-full bg-white/20 mb-4" />
               <span className="text-[10px] font-bold text-white/20 uppercase">Today</span>
            </div>

            {/* Likely */}
            <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
               <motion.div 
                 initial={{ scale: 0 }}
                 animate={{ scale: 1 }}
                 className="w-6 h-6 rounded-full bg-indigo-500 shadow-[0_0_20px_rgba(88,86,214,0.5)] mb-4" 
               />
               <span className="text-xs font-black text-white uppercase tracking-widest">Likely End</span>
               <span className="text-[10px] text-white/40 mt-1">{getEstimatedDate(p50)}</span>
            </div>

            {/* Worst Case */}
            <div className="flex flex-col items-center">
               <div className="w-4 h-4 rounded-full bg-rose-500/20 mb-4 border border-rose-500/40" />
               <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Latest Forecast</span>
               <span className="text-[10px] text-white/20 mt-1">{getEstimatedDate(p90)}</span>
            </div>
          </div>
        </div>

        {/* Explainable Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-white/5">
           <div className="space-y-2">
              <span className="text-[10px] font-black tracking-widest text-emerald-500 uppercase">Fastest Path</span>
              <div className="text-2xl font-bold">{formatDuration(p10)}</div>
              <div className="text-[10px] text-white/20">{getEstimatedDate(p10)}</div>
           </div>
           <div className="space-y-2">
              <span className="text-[10px] font-black tracking-widest text-indigo-400 uppercase">Likely Path</span>
              <div className="text-3xl font-black">{formatDuration(p50)}</div>
              <div className="text-[10px] text-white/40">{getEstimatedDate(p50)}</div>
           </div>
           <div className="space-y-2">
              <span className="text-[10px] font-black tracking-widest text-white/20 uppercase">Slowest Path</span>
              <div className="text-2xl font-bold">{formatDuration(p90)}</div>
              <div className="text-[10px] text-white/20">{getEstimatedDate(p90)}</div>
           </div>
        </div>
      </GlassCard>

      {/* Advanced Action Bar */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-center pt-8">
         <button 
           onClick={exportReport}
           className="px-8 py-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center gap-3 font-bold text-sm"
         >
           <Download size={18} className="text-indigo-400" />
           Download Case Report
         </button>
         
         <button 
           onClick={() => setStage('decision')}
           className="px-12 py-5 rounded-2xl bg-white text-black font-black flex items-center gap-3 text-sm hover:scale-105 active:scale-95 transition-all shadow-xl"
         >
           View Strategic Options
           <ArrowRight size={18} />
         </button>
      </div>
    </div>
  );
};
