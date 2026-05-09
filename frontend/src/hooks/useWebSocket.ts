import { useEffect } from 'react';
import { useHealthStore } from '../store';
import { VitalEnvelope } from '../types/health';

export function isWebSocketEnabled() {
  return import.meta.env.VITE_ENABLE_WS !== 'false';
}

function resolveWebSocketUrl() {
  if (import.meta.env.VITE_WS_URL) {
    return import.meta.env.VITE_WS_URL as string;
  }

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.host;
  return `${protocol}//${host}/ws/vitals`;
}

export function useVitalsSocket() {
  const ingestPayload = useHealthStore((state) => state.ingestPayload);
  const setConnectionState = useHealthStore((state) => state.setConnectionState);

  useEffect(() => {
    if (!isWebSocketEnabled()) {
      setConnectionState('offline');
      return undefined;
    }

    let socket: WebSocket | null = null;
    let reconnectTimer: number | null = null;
    let disposed = false;
    let hasEverConnected = false;
    let retryDelay = 3000;

    const connect = () => {
      if (disposed) {
        return;
      }

      setConnectionState('connecting');
      socket = new WebSocket(resolveWebSocketUrl());

      socket.onopen = () => {
        hasEverConnected = true;
        retryDelay = 3000;
        setConnectionState('live');
      };

      socket.onmessage = (event) => {
        const payload = JSON.parse(event.data) as VitalEnvelope;
        ingestPayload(payload);
      };

      socket.onerror = () => {
        setConnectionState(hasEverConnected ? 'offline' : 'polling');
      };

      socket.onclose = () => {
        setConnectionState(hasEverConnected ? 'offline' : 'polling');
        if (!disposed) {
          reconnectTimer = window.setTimeout(connect, retryDelay);
          retryDelay = Math.min(retryDelay * 2, 30000);
        }
      };
    };

    connect();

    return () => {
      disposed = true;
      if (reconnectTimer !== null) {
        window.clearTimeout(reconnectTimer);
      }
      socket?.close();
    };
  }, [ingestPayload, setConnectionState]);
}
