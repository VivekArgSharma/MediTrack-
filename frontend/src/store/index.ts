import { create } from 'zustand';
import { AlertItem, Insight, Status, VitalEnvelope } from '../types/health';

interface HealthState {
  currentVitals: VitalEnvelope | null;
  historicalData: VitalEnvelope[];
  activeAlerts: AlertItem[];
  aiSummary: Insight | null;
  status: Status;
  connectionState: 'connecting' | 'live' | 'polling' | 'offline';
  setHistory: (history: VitalEnvelope[]) => void;
  setAlerts: (alerts: AlertItem[]) => void;
  setInsight: (insight: Insight) => void;
  setConnectionState: (state: HealthState['connectionState']) => void;
  ingestPayload: (payload: VitalEnvelope) => void;
}

export const useHealthStore = create<HealthState>((set) => ({
  currentVitals: null,
  historicalData: [],
  activeAlerts: [],
  aiSummary: null,
  status: 'Stable',
  connectionState: 'connecting',
  setHistory: (history) => {
    const latest = history.length ? history[history.length - 1] : null;
    return set({
      historicalData: history,
      currentVitals: latest,
      status: latest?.status ?? 'Stable',
    });
  },
  setAlerts: (alerts) => set({ activeAlerts: alerts }),
  setInsight: (insight) => set({ aiSummary: insight }),
  setConnectionState: (connectionState) => set({ connectionState }),
  ingestPayload: (payload) =>
    set((state) => {
      const mergedAlerts = [
        ...payload.alerts,
        ...state.activeAlerts.filter(
          (existing) => !payload.alerts.some((incoming) => incoming.id === existing.id),
        ),
      ].slice(0, 20);

      const nextHistory = [...state.historicalData, payload].slice(-60);
      return {
        currentVitals: payload,
        historicalData: nextHistory,
        activeAlerts: mergedAlerts,
        aiSummary: payload.insight ?? state.aiSummary,
        status: payload.status,
      };
    }),
}));
