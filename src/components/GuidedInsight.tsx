import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, Sparkles, Check } from 'lucide-react';

interface GuidedInsightProps {
  onInputChange: (text: string) => void;
  onAcceptSuggestion: (suggestionType: string) => void;
}

export default function GuidedInsight({ onInputChange, onAcceptSuggestion }: GuidedInsightProps) {
  const [input, setInput] = useState('');
  const [suggestion, setSuggestion] = useState<{ type: string, text: string } | null>(null);

  useEffect(() => {
    onInputChange(input);
    
    const lowerInput = input.toLowerCase();
    if (lowerInput.includes('delay') || lowerInput.includes('document')) {
      setSuggestion({
        type: 'document_delay',
        text: "I noticed you mentioned a document delay; should I factor in the Judge's specific tolerance for Section 91 applications?"
      });
    } else if (lowerInput.includes('impatient') || lowerInput.includes('rushing')) {
      setSuggestion({
        type: 'judge_impatient',
        text: "The judge seems impatient. Should I apply a +15% Adjournment Propensity multiplier to the state machine?"
      });
    } else {
      setSuggestion(null);
    }
  }, [input, onInputChange]);

  const handleAccept = () => {
    if (suggestion) {
      onAcceptSuggestion(suggestion.type);
      setSuggestion(null);
      setInput(''); // Clear input after accepting to reset state
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto relative z-50 mb-8">
      <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl overflow-hidden shadow-emerald-900/20">
        <div className="p-5 flex items-center border-b border-slate-800">
          <Terminal className="text-emerald-500 mr-4" size={24} />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="What happened in court today?"
            className="w-full bg-transparent border-none outline-none text-slate-100 font-mono text-lg placeholder:text-slate-600 focus:ring-0"
            autoFocus
          />
        </div>
        
        <AnimatePresence>
          {suggestion && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-slate-800/80 border-t border-slate-700/50 overflow-hidden"
            >
              <div className="p-5 flex items-start space-x-4">
                <Sparkles className="text-amber-400 mt-0.5 flex-shrink-0" size={20} />
                <div className="flex-1">
                  <p className="text-sm text-slate-200 font-medium leading-relaxed">
                    {suggestion.text}
                  </p>
                  <div className="mt-4 flex space-x-3">
                    <button 
                      onClick={handleAccept}
                      className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs font-mono rounded-lg border border-emerald-500/30 transition-colors flex items-center"
                    >
                      <Check size={14} className="mr-2" /> Factor this in
                    </button>
                    <button 
                      onClick={() => setSuggestion(null)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-mono rounded-lg border border-slate-700 transition-colors"
                    >
                      Ignore
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
