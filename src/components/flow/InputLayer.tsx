import React from 'react';
import { motion } from 'framer-motion';
import { useLexStore } from '../../store/caseStore';
import { GlassCard } from '../ui/GlassCard';
import { ArrowUpRight, Sparkles } from 'lucide-react';

export const InputLayer = () => {
  const { narrative, setNarrative, analyzeNarrative, loading } = useLexStore();

  return (
    <div className="space-y-32">
      {/* Weightless Header */}
      <div className="space-y-8">
        <div className="flex items-center gap-4">
           <div className="h-[1px] w-12 bg-cyan-400 opacity-40" />
           <span className="subheading uppercase">Neural Intake Phase</span>
        </div>
        <h1 className="heading-hero">
          Evolve the <br />Narrative.
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
        <div className="lg:col-span-8">
          <GlassCard className="min-h-[500px] !p-12 flex flex-col group">
            <div className="flex justify-between items-center mb-16">
               <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.8)]" />
                  <span className="text-[10px] font-black tracking-widest text-white/40 uppercase">Awaiting Signal</span>
               </div>
               <Sparkles size={16} className="text-white/10 group-focus-within:text-cyan-400 group-focus-within:animate-pulse transition-colors" />
            </div>

            <textarea
              value={narrative}
              onChange={(e) => setNarrative(e.target.value)}
              placeholder="Input historical vectors or narrative fragments..."
              className="flex-1 bg-transparent border-none resize-none text-4xl font-light tracking-tight text-white placeholder:text-white/5 focus:ring-0 outline-none caret-cyan-400"
            />

            <div className="mt-16 flex items-center justify-between">
              <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">
                Autoscale processing: active
              </div>
              
              <button
                onClick={() => analyzeNarrative()}
                disabled={loading || !narrative.trim()}
                className="group h-24 w-24 rounded-full bg-white text-black flex items-center justify-center transition-all hover:scale-110 active:scale-90 shadow-[0_20px_50px_rgba(255,255,255,0.2)] disabled:opacity-20"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                ) : (
                  <ArrowUpRight size={32} className="group-hover:rotate-45 transition-transform duration-500" />
                )}
              </button>
            </div>
          </GlassCard>
        </div>

        <div className="lg:col-span-4 space-y-8 pb-4">
           {[
             "IDENTIFY_DELAY_PATTERN",
             "ESTIMATE_TEMPORAL_FLUX",
             "REIFY_OUTCOME_PROBABILITY"
           ].map((text, i) => (
             <motion.div 
               key={text}
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: 1 + i * 0.1 }}
               className="flex items-center gap-4 group cursor-default"
             >
                <div className="h-px w-4 bg-white/10 group-hover:w-8 group-hover:bg-cyan-400 transition-all" />
                <span className="text-[9px] font-black uppercase tracking-[0.5em] text-white/20 group-hover:text-white/60 transition-colors">
                  {text}
                </span>
             </motion.div>
           ))}
        </div>
      </div>
    </div>
  );
};
