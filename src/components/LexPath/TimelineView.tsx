import React, { useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useSpring, useMotionTemplate, animate } from 'framer-motion';
import { usePredictionStore } from '../../store/caseStore';
import { logStep } from '../DebugSystem';

export const TimelineView = () => {
  const { timeline, loading, exploredDays, setExploredDays, setIsExploring } = usePredictionStore();
  const constraintsRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Motion Values for Physics-Based Drag
  const x = useMotionValue(0);
  
  if (loading) return (
    <div className="h-[400px] flex flex-col items-center justify-center">
       <div className="w-10 h-10 border-2 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin mb-6" />
       <p className="text-[10px] font-mono text-indigo-400 uppercase tracking-[0.4em] animate-pulse">Initializing Monte Carlo Nodes</p>
    </div>
  );
  
  logStep("RENDER_TIMELINE", { timeline });

  if (!timeline) return <div className="h-[400px] flex items-center justify-center text-white/20 font-mono text-[10px] uppercase tracking-widest">Awaiting Bayesian Timeline Vector...</div>;

  {/* DEBUG_MARKER: Timeline_Rendered */}

  const maxDays = (timeline?.p90 || 365) * 1.3;
  const scale = (val: number) => {
    if (!containerRef.current) return 0;
    const width = containerRef.current.offsetWidth;
    return (val / maxDays) * width;
  };

  // Map position to days and probability
  const xToDays = (val: number) => {
    if (!containerRef.current) return 0;
    const width = containerRef.current.offsetWidth;
    return Math.round((val / width) * maxDays);
  };

  // Sync motion value with timeline.p50 initially
  useEffect(() => {
    if (timeline && containerRef.current) {
      x.set(scale(timeline?.p50 || 0));
    }
  }, [timeline]);

  // Gradient trail effect
  const trailOpacity = useTransform(x, [0, 800], [0.1, 0.4]);
  const trailLinearGradient = useMotionTemplate`linear-gradient(90deg, rgba(88, 86, 214, 0) 0%, rgba(88, 86, 214, ${trailOpacity}) ${x}px, transparent ${x}px)`;

  const handleDrag = () => {
    setExploredDays(xToDays(x.get()));
  };

  const handleDragEnd = () => {
    setIsExploring(false);
    const currentX = x.get();
    const medianX = scale(timeline?.p50 || 0);
    // Snap to baseline if close
    if (Math.abs(currentX - medianX) < 40) {
      animate(x, medianX, { type: "spring", stiffness: 300, damping: 20 });
      setExploredDays(null);
    }
  };

  return (
    <div className="flex flex-col h-full" ref={containerRef}>
      <div className="flex justify-between items-start mb-16">
        <div>
          <span className="text-white/30 font-mono text-[10px] uppercase tracking-[0.4em] mb-4 block">Primary Temporal Projection</span>
          <motion.h3 
            className="text-8xl font-black text-white tracking-tighter flex items-baseline gap-4"
          >
             <motion.span
               animate={{ scale: exploredDays ? 1.05 : 1 }}
               transition={{ type: "spring", stiffness: 400, damping: 25 }}
             >
               {exploredDays || timeline?.p50 || 0}
             </motion.span>
            <span className="text-xl font-medium text-white/10 uppercase tracking-widest pt-2">Days</span>
          </motion.h3>
          <div className="flex items-center gap-3 mt-6">
            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[9px] font-black uppercase tracking-widest rounded border border-emerald-500/20">Stable Path</span>
            <span className="text-white/20 text-[11px] font-medium">Interval Confidence: {Math.round(100 - ((timeline?.p90 || 0) - (timeline?.p10 || 0))/10)}% Accuracy</span>
          </div>
        </div>
        
        <div className="text-right">
          <div className="p-6 glass rounded-l inline-block border-white/[0.04]">
            <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] mb-2">Likelihood</p>
            <motion.p 
              animate={{ color: exploredDays ? "#5856D6" : "#ffffff" }}
              className="text-4xl font-bold tracking-tight"
            >
              {exploredDays ? Math.max(5, Math.min(95, Math.round(100 - (exploredDays / maxDays) * 100))) : 82}%
            </motion.p>
          </div>
        </div>
      </div>

      <div className="relative mt-auto mb-16 h-40 flex flex-col justify-center overflow-visible" ref={constraintsRef}>
        {/* Dynamic Trail */}
        <motion.div 
          style={{ background: trailLinearGradient }}
          className="absolute inset-0 pointer-events-none rounded-m"
        />

        {/* Background Rail */}
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/[0.06]" />

        {/* P10 - P90 Uncertainty Region */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ 
            left: `${((timeline?.p10 || 0) / maxDays) * 100}%`, 
            width: `${(((timeline?.p90 || 0) - (timeline?.p10 || 0)) / maxDays) * 100}%` 
          }}
          className="absolute h-16 bg-white/[0.02] border-x border-white/10 rounded-m backdrop-blur-3xl"
        />

        {/* Median Marker (Baseline) */}
        <div 
          style={{ left: `${((timeline?.p50 || 0) / maxDays) * 100}%` }}
          className="absolute w-[1px] h-20 bg-white/20 z-0"
        />

        {/* Tactile Explorer Node */}
        <motion.div
          drag="x"
          dragConstraints={constraintsRef}
          onDrag={handleDrag}
          onDragStart={() => setIsExploring(true)}
          onDragEnd={handleDragEnd}
          dragElastic={0.05}
          dragMomentum={true}
          style={{ x }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9, cursor: 'grabbing' }}
          className="absolute cursor-grab z-30 group"
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <div className="relative p-4 -translate-x-1/2">
            <div className="w-5 h-5 bg-white rounded-full shadow-[0_0_30px_rgba(255,255,255,0.4)] relative border-[5px] border-indigo-600 group-hover:border-white transition-colors" />
            <motion.div 
               initial={{ opacity: 0, y: 10 }}
               whileHover={{ opacity: 1, y: 0 }}
               className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white text-black px-3 py-1 rounded-s text-[9px] font-bold whitespace-nowrap shadow-2xl pointer-events-none"
            >
              PROJECT DISPOSAL
            </motion.div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {[
          { label: 'Discovery', days: Math.round((timeline?.p50 || 0) * 0.3), color: 'indigo-400' },
          { label: 'Evidence', days: Math.round((timeline?.p50 || 0) * 0.4), color: 'white/40' },
          { label: 'Arguments', days: Math.round((timeline?.p50 || 0) * 0.2), color: 'white/40' },
          { label: 'Judgment', days: Math.round((timeline?.p50 || 0) * 0.1), color: 'white/40' },
        ].map((stage, i) => (
          <div key={stage.label} className="p-6 bg-white/[0.02] border border-white/[0.04] rounded-m hover:bg-white/[0.04] transition-all group">
            <div className="flex items-center gap-2 mb-2">
              <motion.div 
                animate={{ scale: exploredDays ? [1, 1.2, 1] : 1 }}
                className={`w-1 h-1 rounded-full bg-${stage.color}`} 
              />
              <span className="text-[10px] text-white/30 font-bold uppercase tracking-[0.2em]">{stage.label}</span>
            </div>
            <p className="text-2xl font-bold tracking-tight">{stage.days}d</p>
          </div>
        ))}
      </div>
    </div>
  );
};
