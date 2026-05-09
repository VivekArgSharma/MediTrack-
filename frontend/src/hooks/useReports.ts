import { useEffect, useState, useCallback, useRef } from 'react';
import { ReportSummary } from '../pages/Reports';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';

export function useReports() {
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bufferCount, setBufferCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/reports/history`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setReports(data);
        setError(null);
      } else if (data.error) {
        setError('Could not load reports.');
      }
    } catch {
      setError('Could not load reports.');
    } finally {
      setLoading(false);
    }
  }, []);

  const syncBuffer = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/reports/status`);
      const data = await res.json();
      if (typeof data.buffer_size === 'number') {
        setBufferCount(data.buffer_size);
      }
    } catch {
    }
  }, []);

  useEffect(() => {
    syncBuffer();
    intervalRef.current = setInterval(syncBuffer, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [syncBuffer]);

  const generate = useCallback(async () => {
    try {
      setGenerating(true);
      setError(null);
      const res = await fetch(`${API_BASE}/reports/generate`, { method: 'POST' });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        await fetchReports();
      }
    } catch {
      setError('Failed to generate report.');
    } finally {
      setGenerating(false);
    }
  }, [fetchReports]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return { reports, loading, generating, error, generate, fetchReports, bufferCount };
}