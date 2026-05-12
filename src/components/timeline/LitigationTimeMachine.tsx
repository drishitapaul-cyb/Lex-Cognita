import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, Clock, Info, X } from 'lucide-react';

export type CaseEvent = {
  id: string;
  title: string;
  date?: string;
  status: "COMPLETED" | "DELAYED" | "CURRENT" | "PREDICTED";
  delayReason?: string;
  causalNote?: string;
  confidence?: number;
};

interface Props {
  caseHistory: CaseEvent[];
}

export default function LitigationTimeMachine({ caseHistory }: Props) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [timelineIndex, setTimelineIndex] = useState(caseHistory?.length ? caseHistory.length - 1 : 0);

  // Failsafe
  if (!caseHistory || caseHistory.length === 0) {
    return (
      <div className="flex items-center justify-center p-12 bg-white/5 rounded-3xl border border-white/10">
        <span className="text-white/40 font-medium tracking-widest text-xs uppercase">No timeline data available</span>
      </div>
    );
  }

  const selectedEvent = selectedIndex !== null ? caseHistory[selectedIndex] : null;

  return (
    <div className="relative w-full bg-[#0a0a0a] rounded-[48px] border border-white/10 overflow-hidden min-h-[500px] group">
      {/* Time Control Bar */}
      <div className="absolute top-8 inset-x-12 z-20 flex items-center justify-between">
         <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,1)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Chronological State</span>
         </div>
         
         <div className="flex items-center gap-6 bg-black/40 px-6 py-3 rounded-2xl border border-white/5 backdrop-blur-xl">
            <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Temporal Explorer</span>
            <input 
              type="range" 
              min={0}
              max={caseHistory.length - 1}
              value={timelineIndex}
              onChange={(e) => setTimelineIndex(parseInt(e.target.value))}
              className="w-48 h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-emerald-500 focus:outline-none"
            />
         </div>
      </div>

      {/* Main Timeline Scroll Area */}
      <div className="h-full overflow-x-auto overflow-y-hidden scrollbar-hide px-12 pt-48 pb-32 flex items-center min-w-full">
         <div className="flex items-center gap-24 relative">
            {caseHistory.map((event, idx) => {
              const isFuture = idx > timelineIndex;
              const isSelected = selectedIndex === idx;
              
              const formattedDate = event.date
                ? new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : "Date pending";

              return (
                <div key={event.id} className="relative flex items-center">
                  {/* Connection Line */}
                  {idx > 0 && (
                    <div className={`absolute right-full w-24 h-[1px] ${
                      idx <= timelineIndex ? 'bg-white/20' : 'bg-dashed border-t border-dashed border-white/10'
                    }`}>
                       {idx <= timelineIndex && idx <= (caseHistory.findIndex(e => e.status === 'CURRENT') || 0) && (
                         <motion.div 
                           initial={{ left: '-100%' }}
                           animate={{ left: '100%' }}
                           transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                           className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent w-1/2"
                         />
                       )}
                    </div>
                  )}

                  {/* Event Node */}
                  <motion.div
                    layout
                    initial={{ y: -40, opacity: 0 }}
                    animate={{ 
                      y: 0, 
                      opacity: isFuture ? 0.3 : 1,
                      filter: isFuture ? 'grayscale(1)' : 'grayscale(0)',
                      scale: event.status === 'CURRENT' ? 1.25 : 1
                    }}
                    transition={{ 
                      type: "spring", stiffness: 300, damping: 30,
                      delay: idx * 0.08 
                    }}
                    onClick={() => setSelectedIndex(idx)}
                    className={`
                      relative w-16 h-16 rounded-full flex items-center justify-center cursor-pointer transition-all
                      border-2 ${isSelected ? 'ring-8 ring-white/5' : ''}
                      ${event.status === 'COMPLETED' ? 'bg-emerald-500 border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)]' : ''}
                      ${event.status === 'DELAYED' ? 'bg-amber-500 border-amber-400 animate-pulse' : ''}
                      ${event.status === 'CURRENT' ? 'bg-emerald-500 border-white shadow-[0_0_40px_rgba(16,185,129,0.6)] z-10' : ''}
                      ${event.status === 'PREDICTED' ? 'bg-black border-dashed border-white/20' : ''}
                    `}
                  >
                    {/* Visual Indicators */}
                    {event.status === 'COMPLETED' && <CheckCircle2 size={24} className="text-white" />}
                    {event.status === 'DELAYED' && <AlertCircle size={24} className="text-white" />}
                    {event.status === 'CURRENT' && <Clock size={24} className="text-white" />}
                    {event.status === 'PREDICTED' && <div className="w-2 h-2 rounded-full bg-white/10" />}

                    {/* Confidence Cloud */}
                    {event.status === "PREDICTED" && (
                      <div 
                        style={{ 
                          transform: `scale(${1 + (1 - (event.confidence || 0.5))})`,
                          opacity: isFuture ? 0.1 : 0.2
                        }}
                        className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full -z-10" 
                      />
                    )}

                    {/* Label */}
                    <div className="absolute top-20 left-1/2 -translate-x-1/2 whitespace-nowrap text-center space-y-1">
                       <div className="text-[10px] font-black uppercase text-white tracking-widest">{event.title}</div>
                       <div className="text-[9px] font-bold text-white/20 uppercase tracking-tighter">{formattedDate}</div>
                    </div>
                  </motion.div>
                </div>
              );
            })}
         </div>
      </div>

      {/* Selected Detail Panel */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            className="absolute top-0 right-0 w-[400px] h-full bg-black/80 backdrop-blur-3xl border-l border-white/10 z-[100] p-12 flex flex-col"
          >
            <button 
              onClick={() => setSelectedIndex(null)}
              className="absolute top-12 right-12 p-2 hover:bg-white/5 rounded-xl transition-all"
            >
              <X size={20} className="text-white/40" />
            </button>

            <div className="mt-12 space-y-10">
               <div className="space-y-4">
                  <div className={`
                    inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest
                    ${selectedEvent.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' : ''}
                    ${selectedEvent.status === 'DELAYED' ? 'bg-amber-500/10 text-amber-500' : ''}
                    ${selectedEvent.status === 'PREDICTED' ? 'bg-white/5 text-white/40' : ''}
                  `}>
                    {selectedEvent.status}
                  </div>
                  <h3 className="text-4xl font-black tracking-tight leading-none text-white">{selectedEvent.title}</h3>
                  <p className="text-xs font-bold text-white/20 uppercase tracking-[0.4em]">{selectedEvent.date ? new Date(selectedEvent.date).toDateString() : 'Pending'}</p>
               </div>

               <div className="space-y-8">
                  {selectedEvent.delayReason && (
                    <div className="space-y-4">
                       <div className="flex items-center gap-2 text-amber-500">
                          <AlertCircle size={14} />
                          <span className="text-[10px] font-black uppercase tracking-widest">Delay Analysis</span>
                       </div>
                       <p className="text-lg text-white font-light italic leading-relaxed">"{selectedEvent.delayReason}"</p>
                    </div>
                  )}

                  {selectedEvent.causalNote && (
                    <div className="space-y-4">
                       <div className="flex items-center gap-2 text-indigo-400">
                          <Info size={14} />
                          <span className="text-[10px] font-black uppercase tracking-widest">Procedural Vector</span>
                       </div>
                       <p className="text-sm text-white/40 leading-relaxed font-light">{selectedEvent.causalNote}</p>
                    </div>
                  )}

                  {selectedEvent.status === 'PREDICTED' && (
                    <div className="pt-8 border-t border-white/5">
                       <div className="flex justify-between items-center mb-4">
                          <span className="text-[10px] font-black uppercase tracking-widest text-white/20">System Confidence</span>
                          <span className="text-xl font-mono text-white">{Math.round((selectedEvent.confidence || 0.5) * 100)}%</span>
                       </div>
                       <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(selectedEvent.confidence || 0.5) * 100}%` }}
                            className="h-full bg-indigo-500"
                          />
                       </div>
                    </div>
                  )}
               </div>
            </div>

            <div className="mt-auto space-y-4">
               <button className="w-full py-5 rounded-2xl bg-white text-black font-black uppercase text-[10px] tracking-widest hover:scale-105 active:scale-95 transition-all">
                  Request Detail Log
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
