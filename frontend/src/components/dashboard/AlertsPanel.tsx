import { AlertTriangle, Siren, ShieldCheck } from 'lucide-react';
import { AlertItem } from '../../types/health';

interface AlertsPanelProps {
  alerts: AlertItem[];
}

function iconForSeverity(severity: AlertItem['severity']) {
  if (severity === 'Critical') return <Siren size={18} />;
  if (severity === 'Warning') return <AlertTriangle size={18} />;
  return <ShieldCheck size={18} />;
}

export function AlertsPanel({ alerts }: AlertsPanelProps) {
  return (
    <section className="thesis-card support-card">
      <div className="section-heading">
        <div>
          <span className="card-label">Event timeline</span>
          <h3>Alert feed</h3>
        </div>
      </div>
      <div className="alerts-list">
        {alerts.length ? (
          alerts.map((alert) => (
            <article key={alert.id} className={`alert-item alert-item--${alert.severity.toLowerCase()}`}>
              <span className="alert-item__icon">{iconForSeverity(alert.severity)}</span>
              <div>
                <strong>{alert.type.replace(/_/g, ' ')}</strong>
                <p>{alert.message}</p>
              </div>
              <time>{new Date(alert.timestamp).toLocaleTimeString()}</time>
            </article>
          ))
        ) : (
          <div className="empty-state">No active anomalies. Monitoring remains calm and continuous.</div>
        )}
      </div>
    </section>
  );
}
