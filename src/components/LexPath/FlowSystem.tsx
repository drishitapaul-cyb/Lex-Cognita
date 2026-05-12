import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLexStore, FlowStage } from '../../store/caseStore';

// Components
import { InputLayer } from '../flow/InputLayer';
import { InterpretationLayer } from '../flow/InterpretationLayer';
import { TimelineLayer } from '../timeline/TimelineLayer';
import { DecisionLab } from '../decision/DecisionLab';

const navigation: { id: FlowStage; label: string }[] = [
  { id: 'input', label: 'CASE INPUT' },
  { id: 'interpretation', label: 'ANALYSIS' },
  { id: 'timeline', label: 'TIMELINE' },
  { id: 'decision', label: 'STRATEGY' },
];

export const FlowSystem = () => {
  const { stage, setStage } = useLexStore();

  return (
    <div className="min-h-screen selection:bg-cyan-500/30">
      {/* Nav Suspension */}
      <nav className="fixed top-12 left-1/2 -translate-x-1/2 z-[100] px-4 py-2 rounded-2xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-3xl shadow-2xl">
        <div className="flex items-center gap-12">
          {navigation.map((n) => (
            <button
              key={n.id}
              onClick={() => setStage(n.id)}
              className="relative py-2 px-1 text-[10px] font-black uppercase tracking-[0.4em] transition-all group"
            >
              <span className={stage === n.id ? 'text-cyan-400' : 'text-white/20 group-hover:text-white/60'}>
                {n.label}
              </span>
              {stage === n.id && (
                <motion.div 
                  layoutId="nav-glow"
                  className="absolute -bottom-1 inset-x-0 h-[1px] bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.8)]"
                />
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Environment Contents */}
      <main className="relative z-10 pt-48 pb-32 max-w-7xl mx-auto px-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={stage}
            initial={{ opacity: 0, scale: 0.95, filter: 'blur(20px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.05, filter: 'blur(20px)' }}
            transition={{ duration: 0.9, ease: [0.2, 0, 0, 1] }}
          >
            {stage === 'input' && <InputLayer />}
            {stage === 'interpretation' && <InterpretationLayer />}
            {stage === 'timeline' && <TimelineLayer />}
            {stage === 'decision' && <DecisionLab />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Infinite Void Environment */}
      <div className="fixed inset-0 pointer-events-none -z-20 bg-black overflow-hidden">
        <div className="nebula-glow w-[800px] h-[800px] -top-1/4 -left-1/4 bg-cyan-500/10" />
        <div className="nebula-glow w-[600px] h-[600px] bottom-1/4 -right-1/4 bg-violet-500/10" style={{ animationDelay: '-10s' }} />
        <div className="void-bg" />
        
        {/* Floating Particle Flux */}
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1.5px)', backgroundSize: '60px 60px' }} />
      </div>
    </div>
  );
};
