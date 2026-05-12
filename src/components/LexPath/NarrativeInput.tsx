import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePredictionStore } from '../../store/caseStore';
import { API_URL } from '../../constants/api';

export const NarrativeInput = () => {
  const [narrative, setNarrative] = useState('');
  const { setPrediction, setLoading, loading } = usePredictionStore();

  const analyzeNarrative = async () => {
    if (!narrative.trim()) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ narrative }),
      });
      const data = await response.json();
      setPrediction(data);
    } catch (e) {
      console.error("Narrative analysis failed:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-l blur opacity-10 group-focus-within:opacity-30 transition duration-500"></div>
      <div className="relative glass rounded-l p-1 overflow-hidden">
        <textarea
          value={narrative}
          onChange={(e) => setNarrative(e.target.value)}
          placeholder="Describe your case narrative... (e.g. 'Judge mentioned backlog in Delhi court for property case')"
          className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-white/20 p-6 text-sm resize-none h-32 leading-relaxed"
        />
        <div className="px-6 py-4 bg-white/[0.02] border-t border-white/[0.04] flex justify-between items-center">
          <p className="text-[10px] text-white/20 font-mono uppercase tracking-widest">Pipeline: AI-Narrative Interpretation</p>
          <button
            onClick={analyzeNarrative}
            disabled={loading}
            className="px-6 py-2 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 text-white text-[10px] font-bold uppercase tracking-widest rounded-s transition-all transform active:scale-95"
          >
            {loading ? 'Analyzing...' : 'Execute Analysis'}
          </button>
        </div>
      </div>
    </div>
  );
};
