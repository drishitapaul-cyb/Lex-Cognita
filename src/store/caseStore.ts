import { create } from 'zustand';

export type FlowStage = 'input' | 'interpretation' | 'timeline' | 'decision';

export interface CausalDriver {
  factor: string;
  impact_days: number;
  reason: string;
  confidence?: string;
}

export interface DecisionOption {
  action: string;
  next_state: string;
  impact_days: number;
  success_probability: number;
  risk: string;
  reasoning: string;
}

export interface PredictionData {
  data_insights: Record<string, any>;
  causal_drivers: CausalDriver[];
  timeline: { p10: number; p50: number; p90: number; n_cases?: number; source?: string };
  decision_fork: DecisionOption[];
  explanation: string;
  confidence_notes: string;
}

interface LexState {
  stage: FlowStage;
  narrative: string;
  prediction: PredictionData | null;
  loading: boolean;
  error: string | null;
  
  setStage: (stage: FlowStage) => void;
  setNarrative: (text: string) => void;
  analyzeNarrative: () => Promise<void>;
  reset: () => void;
  exportReport: () => Promise<void>;
}

export const formatDuration = (days: number) => {
  const absDays = Math.abs(days);
  if (absDays >= 365) return `${(absDays / 365).toFixed(1)} years`;
  if (absDays >= 30) return `${Math.round(absDays / 30)} months`;
  return `${absDays} days`;
};

export const getEstimatedDate = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

export const useLexStore = create<LexState>((set, get) => ({
  stage: 'input',
  narrative: '',
  prediction: null,
  loading: false,
  error: null,

  setStage: (stage) => set({ stage }),
  setNarrative: (narrative) => set({ narrative }),

  analyzeNarrative: async () => {
    const { narrative } = get();
    if (!narrative) return;
    
    set({ loading: true, error: null });
    try {
      const resp = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: narrative }),
      });
      if (!resp.ok) throw new Error("Backend unavailable");
      const data = await resp.json();
      set({ prediction: data, stage: 'interpretation', loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  exportReport: async () => {
    const { narrative } = get();
    try {
      const resp = await fetch(`http://localhost:8000/export?text=${encodeURIComponent(narrative)}`);
      if (!resp.ok) throw new Error("Export failed");
      
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `LexPath_Case_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed", err);
    }
  },

  reset: () => set({ stage: 'input', narrative: '', prediction: null, error: null }),
}));
