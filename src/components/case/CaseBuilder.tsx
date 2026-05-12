import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCaseStore } from '../../store/caseStore';
import { ProgressBar } from '../shared/ProgressBar';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

const ALL_INDIAN_STATES = ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Gujarat'];
const districtsByState: Record<string, string[]> = {
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur'],
  'Delhi': ['New Delhi', 'Central Delhi', 'South Delhi'],
  'Karnataka': ['Bangalore', 'Mysore', 'Hubli'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara'],
};
const subtypesByType: Record<string, string[]> = {
  'Civil': ['Property Dispute', 'Breach of Contract', 'Family Matter'],
  'Criminal': ['Theft', 'Assault', 'Fraud'],
};

const steps = [
  { id: 'state', question: 'Which state is this case filed in?', type: 'select', options: ALL_INDIAN_STATES },
  { id: 'district', question: 'Which district court?', type: 'select', getOptions: (answers: any) => answers.state ? districtsByState[answers.state] : [] },
  { id: 'type', question: 'Civil or criminal matter?', type: 'choice', options: ['Civil', 'Criminal'] },
  { id: 'subtype', question: 'What kind of case?', type: 'select', getOptions: (answers: any) => answers.type ? subtypesByType[answers.type] : [] },
  { id: 'filed', question: 'When was the case filed?', type: 'date' },
  { id: 'hearings', question: 'How many hearings have occurred so far?', type: 'number' },
  { id: 'backlog', question: 'Estimated court backlog (if known)?', type: 'number', optional: true },
];

export const CaseBuilder = () => {
  const { answers, setAnswer, completeInput } = useCaseStore();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const currentStep = steps[currentStepIndex];
  const progress = ((currentStepIndex) / steps.length) * 100;

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setDirection(1);
      setCurrentStepIndex(i => i + 1);
    } else {
      completeInput();
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setDirection(-1);
      setCurrentStepIndex(i => i - 1);
    }
  };

  const currentOptions = currentStep.options || (currentStep.getOptions ? currentStep.getOptions(answers) : []);
  const currentValue = answers[currentStep.id] || '';
  const canProceed = currentValue !== '' || currentStep.optional;

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 50 : -50,
      opacity: 0
    })
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-24">
      <ProgressBar progress={progress} />
      
      <div className="bg-[#111827] border border-white/10 p-8 rounded-b-xl shadow-2xl relative overflow-hidden min-h-[320px] flex flex-col">
        <button 
          onClick={handleBack}
          disabled={currentStepIndex === 0}
          className={`absolute top-6 left-6 text-[#9CA3AF] hover:text-white transition-colors ${currentStepIndex === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        >
          <ArrowLeft size={20} />
        </button>

        <div className="flex-1 mt-8 relative">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStepIndex}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="absolute inset-0 flex flex-col items-center justify-center"
            >
              <h2 className="text-2xl font-sans font-medium text-[#F9FAFB] mb-8 text-center">
                {currentStep.question}
              </h2>

              {currentStep.type === 'select' && (
                <select 
                  value={currentValue}
                  onChange={(e) => setAnswer(currentStep.id, e.target.value)}
                  className="w-full max-w-md bg-[#0A0F1E] border border-white/10 rounded-lg px-4 py-3 text-[#F9FAFB] focus:outline-none focus:border-[#4F9EF8] transition-colors"
                >
                  <option value="" disabled>Select an option...</option>
                  {currentOptions.map((opt: string) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              )}

              {currentStep.type === 'choice' && (
                <div className="flex gap-4 w-full max-w-md">
                  {currentOptions.map((opt: string) => (
                    <button
                      key={opt}
                      onClick={() => setAnswer(currentStep.id, opt)}
                      className={`flex-1 py-4 rounded-lg border transition-all ${currentValue === opt ? 'bg-[#4F9EF8]/10 border-[#4F9EF8] text-[#4F9EF8]' : 'bg-[#0A0F1E] border-white/10 text-[#9CA3AF] hover:border-white/30'}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {currentStep.type === 'date' && (
                <input 
                  type="date"
                  value={currentValue}
                  onChange={(e) => setAnswer(currentStep.id, e.target.value)}
                  className="w-full max-w-md bg-[#0A0F1E] border border-white/10 rounded-lg px-4 py-3 text-[#F9FAFB] focus:outline-none focus:border-[#4F9EF8] transition-colors font-mono"
                />
              )}

              {currentStep.type === 'number' && (
                <input 
                  type="number"
                  value={currentValue}
                  onChange={(e) => setAnswer(currentStep.id, e.target.value)}
                  placeholder={currentStep.optional ? "Optional" : ""}
                  className="w-full max-w-md bg-[#0A0F1E] border border-white/10 rounded-lg px-4 py-3 text-[#F9FAFB] focus:outline-none focus:border-[#4F9EF8] transition-colors font-mono"
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleNext}
            disabled={!canProceed}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${canProceed ? 'bg-[#4F9EF8] text-[#0A0F1E] hover:bg-[#4F9EF8]/90' : 'bg-white/5 text-[#9CA3AF] cursor-not-allowed'}`}
          >
            {currentStepIndex === steps.length - 1 ? 'Analyze Case' : 'Next'}
            {currentStepIndex === steps.length - 1 ? <Check size={18} /> : <ArrowRight size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};
