import React from 'react';
import { motion } from 'framer-motion';

export const ProgressBar = ({ progress }: { progress: number }) => (
  <div className="w-full h-1 bg-white/10 overflow-hidden">
    <motion.div
      className="h-full bg-[#4F9EF8]"
      initial={{ width: 0 }}
      animate={{ width: `${progress}%` }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    />
  </div>
);
