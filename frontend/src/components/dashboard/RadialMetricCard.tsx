import { motion } from 'framer-motion';
import { Activity, AlertTriangle, BatteryCharging } from 'lucide-react';

interface MotionStatusCardProps {
  label: string;
  motionLabel: string;
  fallDetected: boolean;
  battery: number;
  status: 'Stable' | 'Warning' | 'Critical';
}

function statusCopy(motion: string, fallDetected: boolean, status: MotionStatusCardProps['status']) {
  if (fallDetected || motion.toLowerCase() === 'impact') return 'Impact detected';
  if (status === 'Critical') return 'Escalate now';
  if (motion.toLowerCase() === 'walking') return 'Patient walking';
  if (motion.toLowerCase() === 'idle' || motion.toLowerCase() === 'resting') return 'Patient idle';
  return motion;
}

export function RadialMetricCard({ label, motionLabel, fallDetected, battery, status }: MotionStatusCardProps) {
  const headline = statusCopy(motionLabel, fallDetected, status);
  const tone = fallDetected || status === 'Critical' ? 'critical' : status === 'Warning' ? 'warning' : 'stable';

  return (
    <motion.section
      className={`replica-card motion-card motion-card--${tone}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <span className="card-label">{label}</span>
      <div className="motion-card__hero">
        <div>
          <strong>{headline}</strong>
          <p>{fallDetected ? 'Fall flag triggered from live telemetry.' : 'Live posture and activity classification.'}</p>
        </div>
        <div className="motion-card__badge">
          {fallDetected ? <AlertTriangle size={18} /> : <Activity size={18} />}
        </div>
      </div>
      <div className="motion-card__stats">
        <div>
          <span><Activity size={13} /> Motion</span>
          <strong>{motionLabel}</strong>
        </div>
        <div>
          <span><AlertTriangle size={13} /> Fall</span>
          <strong>{fallDetected ? 'Detected' : 'None'}</strong>
        </div>
        <div>
          <span><BatteryCharging size={13} /> Battery</span>
          <strong>{battery}%</strong>
        </div>
      </div>
    </motion.section>
  );
}