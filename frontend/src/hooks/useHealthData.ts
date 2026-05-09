import { useEffect, useState } from 'react';
import {
  fetchAlerts,
  fetchHistory,
  fetchLatestInsight,
  fetchLatestVitals,
  triggerInsight,
} from '../services/api';
import { useHealthStore } from '../store';
import { isWebSocketEnabled, useVitalsSocket } from './useWebSocket';

export function useHealthData() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const setHistory = useHealthStore((state) => state.setHistory);
  const setAlerts = useHealthStore((state) => state.setAlerts);
  const setInsight = useHealthStore((state) => state.setInsight);
  const ingestPayload = useHealthStore((state) => state.ingestPayload);
  const connectionState = useHealthStore((state) => state.connectionState);
  useVitalsSocket();

  useEffect(() => {
    async function bootstrap() {
      try {
        setLoading(true);
        setError(null);
        const [history, alerts, insight] = await Promise.all([
          fetchHistory(),
          fetchAlerts(),
          fetchLatestInsight(),
        ]);
        setHistory(history);
        setAlerts(alerts);
        setInsight(insight);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to connect to monitoring services.');
      } finally {
        setLoading(false);
      }
    }

    bootstrap();
  }, [setAlerts, setHistory, setInsight]);

  useEffect(() => {
    if (connectionState === 'live') {
      return undefined;
    }

    const intervalId = window.setInterval(async () => {
      try {
        const latest = await fetchLatestVitals();
        if (latest) {
          setError(null);
          ingestPayload(latest);
        }
      } catch {
        setError('Live stream fallback is unable to reach the backend.');
      }
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [connectionState, ingestPayload]);

  async function refreshInsight() {
    const insight = await triggerInsight();
    setInsight(insight);
  }

  return { loading, error, refreshInsight };
}
