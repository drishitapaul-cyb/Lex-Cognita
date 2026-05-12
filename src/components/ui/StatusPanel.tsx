import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Cpu, Database, Wifi } from 'lucide-react';
import { useLexStore } from '../../store/caseStore';

export const StatusPanel = () => {
  const { loading, error, stage } = useLexStore();

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed bottom-8 right-8 z-[100]"
    >
      <div className="glass bg-black/80 backdrop-blur-3xl border border-white/[0.08] rounded-2xl p-4 flex gap-6 items-center shadow-2xl">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Wifi size={14} className={error ? 'text-rose-500' : 'text-emerald-500'} />
            {!error && <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-20" />}
          </div>
          <span className="text-[10px] font-bold tracking-widest uppercase text-white/40">API</span>
        </div>

        <div className="w-[1px] h-4 bg-white/10" />

        <div className="flex items-center gap-2">
          <Cpu size={14} className={loading ? 'text-indigo-400 animate-pulse' : 'text-white/20'} />
          <span className="text-[10px] font-bold tracking-widest uppercase text-white/40">RFM_MODEL</span>
        </div>

        <div className="w-[1px] h-4 bg-white/10" />

        <div className="flex items-center gap-2">
          <Activity size={14} className="text-indigo-500" />
          <span className="text-[10px] font-bold tracking-widest uppercase text-white/40">{stage}</span>
        </div>
      </div>
    </motion.div>
  );
};
