import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { format, addDays, subDays } from 'date-fns';
import { AlertCircle, CheckCircle2, Clock, Scale } from 'lucide-react';
import { cn } from '../lib/utils';
import GuidedInsight from './GuidedInsight';
import { ConfidenceHeatmap, LogicTrace } from './XAILayer';

interface HearingEvent {
  id: string;
  date: Date;
  type: 'progress' | 'adjournment' | 'delay';
  title: string;
  description: string;
  judge: string;
  probabilityShift?: number;
}

const today = new Date();

const initialEvents: HearingEvent[] = [
  { id: '1', date: subDays(today, 120), type: 'progress', title: 'Case Filed', description: 'Initial writ petition filed by plaintiff.', judge: 'Hon. K. Murthy', probabilityShift: 0 },
  { id: '2', date: subDays(today, 90), type: 'progress', title: 'Notice Issued', description: 'Notice served to respondents. 4 weeks given for reply.', judge: 'Hon. K. Murthy', probabilityShift: +5 },
  { id: '3', date: subDays(today, 60), type: 'adjournment', title: 'First Hearing', description: 'Respondent requested time to file objections.', judge: 'Hon. K. Murthy', probabilityShift: -2 },
  { id: '4', date: subDays(today, 30), type: 'progress', title: 'Objections Filed', description: 'Statement of objections filed. Matter posted for evidence.', judge: 'Hon. S. Patil', probabilityShift: +12 },
  { id: '5', date: subDays(today, 10), type: 'delay', title: 'Evidence Stage', description: 'Change of counsel application filed by respondent. Detected as tactical delay.', judge: 'Hon. S. Patil', probabilityShift: -15 },
  { id: '6', date: today, type: 'progress', title: 'Current State', description: 'Awaiting cross-examination.', judge: 'Hon. S. Patil', probabilityShift: 0 },
];

const springConfig = { type: "spring", stiffness: 300, damping: 30 };

const getLogicTrace = (event: HearingEvent, allEvents: HearingEvent[]) => {
  const trace = {
    baseline: 120,
    modifiers: [] as { label: string, days: number }[],
    certainty: 30
  };

  const eventIndex = allEvents.findIndex(e => e.id === event.id);
  
  if (eventIndex >= 3) {
    trace.modifiers.push({ label: 'Judge Sensitivity to Property Disputes', days: 40 });
    trace.certainty = 50;
  }
  if (event.type === 'delay') {
    trace.modifiers.push({ label: 'Tactical Delay Detected', days: 40 });
    trace.certainty = 85;
  } else if (event.type === 'adjournment') {
    trace.modifiers.push({ label: 'Adjournment Propensity Multiplier', days: 15 });
    trace.certainty = 70;
  } else if (event.title.includes('Sec 91')) {
    trace.modifiers.push({ label: 'Judge Tolerance for Sec 91', days: -10 });
    trace.certainty = 90;
  }

  const total = trace.baseline + trace.modifiers.reduce((acc, curr) => acc + curr.days, 0);
  return { ...trace, total };
};

export default function LitigationClock() {
  const [events, setEvents] = useState<HearingEvent[]>(initialEvents);
  const [selectedEvent, setSelectedEvent] = useState<HearingEvent | null>(initialEvents[initialEvents.length - 1]);
  const [liveInput, setLiveInput] = useState('');

  const handleInputChange = (text: string) => {
    setLiveInput(text);
  };

  const handleAcceptSuggestion = (suggestionType: string) => {
    if (suggestionType === 'document_delay') {
      const newEvent: HearingEvent = {
        id: Date.now().toString(),
        date: new Date(),
        type: 'delay',
        title: 'Document Delay (Sec 91)',
        description: "Judge's strict tolerance for Section 91 applications factored in. Opponent penalized.",
        judge: 'Hon. S. Patil',
        probabilityShift: +8 // Plaintiff win prob goes up if opponent is penalized
      };
      setEvents(prev => [...prev, newEvent]);
      setSelectedEvent(newEvent);
    } else if (suggestionType === 'judge_impatient') {
      const newEvent: HearingEvent = {
        id: Date.now().toString(),
        date: new Date(),
        type: 'adjournment',
        title: 'Rushed Hearing',
        description: "Judge impatient. +15% Adjournment Propensity multiplier applied to state machine.",
        judge: 'Hon. S. Patil',
        probabilityShift: -5
      };
      setEvents(prev => [...prev, newEvent]);
      setSelectedEvent(newEvent);
    }
  };

  const displayEvents = [...events];
  if (liveInput.length > 0) {
    displayEvents.push({
      id: 'live',
      date: new Date(),
      type: 'progress',
      title: 'Live Analysis...',
      description: liveInput,
      judge: 'Hon. S. Patil',
      probabilityShift: 0
    });
  }

  const currentTrace = selectedEvent ? getLogicTrace(selectedEvent, events) : { baseline: 120, modifiers: [], total: 120, certainty: 30 };

  return (
    <div className="h-full flex flex-col p-6 text-white bg-[#0a0a0a] font-mono">
      <GuidedInsight onInputChange={handleInputChange} onAcceptSuggestion={handleAcceptSuggestion} />

      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-serif font-light tracking-tight mb-2 text-emerald-400">Litigation Clock</h1>
          <p className="text-white/40 font-mono text-sm">Historical trajectory and predictive judgment timeline</p>
        </div>
        <div className="flex space-x-4 text-xs font-mono">
          <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>Progress</div>
          <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-amber-500 mr-2"></span>Adjournment</div>
          <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>Delay Tactic</div>
        </div>
      </div>

      {/* Timeline Visualization */}
      <div className="relative h-64 bg-[#0a0a0a] border border-white/10 rounded-xl p-8 overflow-hidden flex items-center shadow-xl">
        {/* Base Line */}
        <div className="absolute left-8 right-8 h-px bg-white/10 top-1/2 -translate-y-1/2"></div>
        
        {/* Confidence Interval Shading */}
        <div 
          className="absolute h-32 bg-emerald-500/5 border-x border-emerald-500/20 top-1/2 -translate-y-1/2"
          style={{ left: '75%', right: '5%' }}
        >
          <div className="absolute -top-6 left-0 right-0 text-center text-[10px] font-mono text-emerald-500/50 uppercase">
            95% Confidence Interval
          </div>
        </div>

        {/* Predicted Judgment Line */}
        <div className="absolute w-px h-48 bg-emerald-500 top-1/2 -translate-y-1/2 shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ left: '85%' }}>
          <div className="absolute -top-8 -translate-x-1/2">
            <ConfidenceHeatmap certainty={currentTrace.certainty}>
              <div className="bg-[#0a0a0a]/80 backdrop-blur-md text-emerald-400 px-3 py-1.5 rounded text-[10px] font-mono border border-emerald-500/50 whitespace-nowrap text-center">
                Predicted Judgment
                <br/>
                <span className="text-white">{format(addDays(today, currentTrace.total), 'MMM d, yyyy')}</span>
              </div>
            </ConfidenceHeatmap>
          </div>
        </div>

        {/* Events */}
        <AnimatePresence>
          {displayEvents.map((event, index) => {
            // Adjust spacing dynamically if there are more events
            const spacing = Math.max(8, 70 / Math.max(1, displayEvents.length));
            const position = 10 + (index * spacing);
            const isSelected = selectedEvent?.id === event.id;
            const isLive = event.id === 'live';
            
            let colorClass = "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]";
            if (event.type === 'adjournment') colorClass = "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]";
            if (event.type === 'delay') colorClass = "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]";
            if (isLive) colorClass = "bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)] animate-pulse";

            return (
              <motion.div
                key={event.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group"
                style={{ left: `${position}%` }}
                onClick={() => !isLive && setSelectedEvent(event)}
                whileHover={{ scale: 1.2 }}
                transition={springConfig}
              >
                <div className={cn(
                  "w-4 h-4 rounded-full border-2 border-[#0a0a0a] z-10 transition-transform",
                  colorClass,
                  isSelected ? "scale-150 ring-2 ring-white/20 ring-offset-2 ring-offset-[#0a0a0a]" : ""
                )}></div>
                
                <div className={cn(
                  "absolute mt-6 text-[10px] font-mono whitespace-nowrap text-center transition-opacity",
                  isSelected || isLive ? "text-white opacity-100" : "text-white/30 opacity-0 group-hover:opacity-100"
                )}>
                  {isLive ? 'Typing...' : format(event.date, 'MMM d')}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Selected Event Details */}
      <AnimatePresence mode="wait">
        {selectedEvent && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={springConfig}
            key={selectedEvent.id}
            className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            <div className="col-span-2 bg-[#0a0a0a] border border-white/10 rounded-xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {selectedEvent.type === 'progress' && <CheckCircle2 className="text-emerald-500" />}
                  {selectedEvent.type === 'adjournment' && <Clock className="text-amber-500" />}
                  {selectedEvent.type === 'delay' && <AlertCircle className="text-red-500" />}
                  <h2 className="text-xl font-medium text-white">{selectedEvent.title}</h2>
                </div>
                <div className="font-mono text-sm text-white/40">
                  {format(selectedEvent.date, 'MMMM d, yyyy')}
                </div>
              </div>
              
              <p className="text-white/60 mb-6 leading-relaxed">
                {selectedEvent.description}
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-lg border border-white/5">
                  <div className="text-[10px] font-mono text-white/30 uppercase mb-1">Presiding Judge</div>
                  <div className="flex items-center text-sm text-white/80">
                    <Scale size={14} className="mr-2 text-emerald-500" />
                    {selectedEvent.judge}
                  </div>
                </div>
                <div className="bg-white/5 p-4 rounded-lg border border-white/5">
                  <div className="text-[10px] font-mono text-white/30 uppercase mb-1">Outcome Probability Shift</div>
                  <div className="flex items-center text-sm font-mono">
                    {selectedEvent.probabilityShift !== undefined && (
                      <span className={cn(
                        selectedEvent.probabilityShift > 0 ? "text-emerald-400" : 
                        selectedEvent.probabilityShift < 0 ? "text-red-400" : "text-white/40"
                      )}>
                        {selectedEvent.probabilityShift > 0 ? '+' : ''}{selectedEvent.probabilityShift}% Win Prob.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-6 flex flex-col shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[10px] font-mono text-white/40 uppercase tracking-widest">XAI Logic Trace</h3>
                <span className="text-[10px] font-mono text-emerald-500/70 border border-emerald-500/20 px-2 py-0.5 rounded bg-emerald-500/10">
                  Certainty: {currentTrace.certainty}%
                </span>
              </div>
              
              <div className="flex-1 flex flex-col justify-center">
                <ConfidenceHeatmap certainty={currentTrace.certainty} className="w-full mb-6">
                  <div className="text-center py-4 border border-white/5 rounded-lg bg-[#0a0a0a]/50 backdrop-blur-sm">
                    <div className="text-4xl font-light mb-1 text-white">
                      {currentTrace.total}<span className="text-xl text-white/40">d</span>
                    </div>
                    <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Est. Duration</div>
                  </div>
                </ConfidenceHeatmap>
                
                <LogicTrace 
                  baseline={currentTrace.baseline} 
                  modifiers={currentTrace.modifiers} 
                  total={currentTrace.total} 
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
