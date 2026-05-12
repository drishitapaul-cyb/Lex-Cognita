import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCaseStore, usePredictionStore } from '../../store/caseStore';
import { API_URL } from '../../constants/api';
import { logStep } from '../DebugSystem';

const MOCK_DATA = {
  timeline: { p10: 100, p50: 200, p90: 350 },
  causal_drivers: [{ factor: "Backlog (Mock)", impact_days: 120, confidence: "High", explanation: "Simulated due to pipeline timeout" }],
  explanation: "Using diagnostic fallback mode. Check backend logs for /predict failure."
};

const questions = [
  { id: 'state', label: 'Select State', options: ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Uttar Pradesh'] },
  { id: 'case_type', label: 'Case Category', options: ['Civil', 'Criminal', 'Commercial', 'Family', 'Property'] },
  { id: 'ipc_section', label: 'IPC Section (if Criminal)', options: ['302 (Murder)', '420 (Cheating)', '498A (Domestic)', 'NA'], dependsOn: 'case_type', value: 'Criminal' },
  { id: 'bailable', label: 'Bail Status', options: [1, 0], labels: ['Bailable', 'Non-Bailable'], dependsOn: 'case_type', value: 'Criminal' },
  { id: 'judge_seniority', label: 'Judge Experience', options: [5, 12, 20], labels: ['Junior (<5y)', 'Mid (5-15y)', 'Senior (>15y)'] },
  { id: 'backlog_size', label: 'Court Load', options: [1000, 3000, 5000], labels: ['Low', 'Medium', 'Critical'] },
];

export const CaseBuilder = () => {
  const [step, setStep] = useState(0);
  const { caseData, setCaseData } = useCaseStore();
  const { setPrediction, setLoading } = usePredictionStore();

  const handleSelect = (value: any) => {
    const updatedData = { ...caseData, [questions[step].id]: value };
    setCaseData(updatedData);
    
    let nextStep = step + 1;
    while (nextStep < questions.length) {
      const q = questions[nextStep];
      if (q.dependsOn && updatedData[q.dependsOn] !== q.value) {
        nextStep++;
      } else {
        break;
      }
    }

    if (nextStep < questions.length) {
      setStep(nextStep);
    } else {
      submitCase(updatedData);
    }
  };

  const submitCase = async (finalData: any) => {
    logStep("INPUT_CAPTURED", finalData);
    setLoading(true);
    try {
      logStep("API_REQUEST", { url: `${API_URL}/predict`, payload: finalData });
      const response = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData),
      });
      const data = await response.json();
      logStep("API_RESPONSE", data);
      
      const payload = (data.timeline && data.causal_drivers) ? data : MOCK_DATA;
      setPrediction(payload);
      logStep("STORE_UPDATED", payload);
    } catch (error) {
      logStep("API_ERROR", error);
      console.error('Failed to fetch prediction:', error);
      setPrediction(MOCK_DATA);
    } finally {
      setLoading(false);
    }
  };

  const springConfig = { type: "spring", stiffness: 400, damping: 30 };

  return (
    <div className="max-w-3xl mx-auto px-4 relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={springConfig}
          className="relative"
        >
          <div className="mb-12">
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-indigo-400 font-mono text-[10px] uppercase tracking-[0.4em] mb-4 block"
            >
              Session Sequence 0{step + 1}
            </motion.span>
            <h2 className="text-4xl font-bold text-white tracking-tight leading-tight">
              {questions[step].label}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {questions[step].options.map((opt, idx) => (
              <motion.button
                key={opt}
                whileHover={{ scale: 1.01, backgroundColor: "rgba(255,255,255,0.06)" }}
                whileTap={{ scale: 0.98 }}
                transition={springConfig}
                onClick={() => handleSelect(opt)}
                className="group relative h-32 glass rounded-l p-8 text-left transition-all border-white/[0.04] hover:border-white/[0.12]"
              >
                <div className="absolute top-6 right-8 text-white/[0.03] group-hover:text-white/10 transition-colors">
                  <span className="text-2xl font-mono">0{idx + 1}</span>
                </div>
                <div className="h-full flex flex-col justify-center">
                   <span className="text-lg font-medium text-white group-hover:text-indigo-300 transition-colors">
                    {questions[step].labels ? questions[step].labels[idx] : opt}
                  </span>
                  <div className="overflow-hidden h-0 group-hover:h-4 transition-all duration-300">
                    <p className="text-[10px] text-white/30 uppercase tracking-widest mt-1">Select option</p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Modern Progress Indicator */}
      <div className="mt-24 flex items-center justify-center gap-2">
        {questions.map((_, i) => (
          <motion.div 
            key={i}
            initial={false}
            animate={{ 
              width: i === step ? 32 : 8,
              backgroundColor: i === step ? "#5856D6" : "rgba(255,255,255,0.08)",
            }}
            className="h-1 rounded-full"
            transition={springConfig}
          />
        ))}
      </div>
    </div>
  );
};
