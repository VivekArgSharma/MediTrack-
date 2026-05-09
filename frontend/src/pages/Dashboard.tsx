import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Droplets, Thermometer } from 'lucide-react';
import { HeartIllustration, LungsIllustration } from '../components/dashboard/MedicalIllustrations';
import { OrganStatusCard } from '../components/dashboard/OrganStatusCard';
import { TimelineCard } from '../components/dashboard/TimelineCard';
import { VitalsCard } from '../components/dashboard/VitalsCard';
import { StepsCard } from '../components/dashboard/StepsCard';
import { WeightCard } from '../components/dashboard/WeightCard';
import { BodyMapCard } from '../components/dashboard/BodyMapCard';
import { useHealthData } from '../hooks/useHealthData';
import { useHealthStore } from '../store';

const CONNECTION_LABELS = {
  connecting: 'Connecting',
  live: 'Live',
  polling: 'Live',
  offline: 'Reconnecting',
} as const;

function formatTime(ts: string | undefined) {
  if (!ts) return '--:--';
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function seriesFor(
  history: ReturnType<typeof useHealthStore.getState>['historicalData'],
  key: 'HR' | 'SpO2' | 'Temp'
) {
  return history.slice(-16).map((item) => item.data[key]);
}

export function DashboardPage() {
  const { loading, error } = useHealthData();
  const currentVitals = useHealthStore((state) => state.currentVitals);
  const historicalData = useHealthStore((state) => state.historicalData);
  const status = useHealthStore((state) => state.status);
  const connectionState = useHealthStore((state) => state.connectionState);

  const heartRate = currentVitals?.data.HR ?? 0;
  const spo2 = currentVitals?.data.SpO2 ?? 0;
  const temp = currentVitals?.data.Temp ?? 0;
  const motionState = currentVitals?.data.Motion ?? 'Resting';
  const fallDetected = currentVitals?.data.Fall === 1;
  const battery = currentVitals?.data.Battery ?? 0;
  const start = historicalData[0]?.timestamp;
  const end = currentVitals?.timestamp;

  const [clock, setClock] = useState('');

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <main className="replica-shell">
      <div className="replica-surface">
        <header className="replica-topbar">
          <div className="topbar-patient">
            <span className="topbar-avatar">AM</span>
            <span className="topbar-name">Arjun Mehta</span>
          </div>
          <div className="topbar-title">
            <span className="topbar-brand">VitalWatch</span>
          </div>
          <div className="topbar-status">
            <span className="live-dot" />
            <span className="live-label">{CONNECTION_LABELS[connectionState]}</span>
            {clock && <span className="live-time">{clock}</span>}
          </div>
        </header>

        {error && <div className="replica-banner replica-banner--error">{error}</div>}
        {loading && <div className="replica-banner">Loading live telemetry…</div>}

        <section className="replica-grid">
          <WeightCard weight={74.2} delta={-0.4} />

          <StepsCard steps={7425} goal={10000} />

          <motion.section
            className="replica-card hero-heart-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <div className="hero-heart-card__art">
              <HeartIllustration tone="#ef6954" />
            </div>
            <div className="hero-heart-card__ecg">
              <div className="ecg-labels">
                <span className="ecg-title">Heart Rate</span>
                <span className="ecg-sub">{heartRate || '--'} bpm</span>
              </div>
              <div className="ecg-wave-wrap">
                <svg viewBox="0 0 320 40" className="ecg-wave" preserveAspectRatio="none" aria-hidden="true">
                  <polyline
                    points="0,25 20,25 28,8 34,32 42,28 50,25 70,25 78,8 84,32 92,28 100,25 120,25 128,8 134,32 142,28 150,25 170,25 178,8 184,32 192,28 200,25 220,25 228,8 234,32 242,28 250,25 270,25 278,8 284,32 292,28 300,25 320,25"
                  />
                  <polyline
                    points="0,25 20,25 28,8 34,32 42,28 50,25 70,25 78,8 84,32 92,28 100,25 120,25 128,8 134,32 142,28 150,25 170,25 178,8 184,32 192,28 200,25 220,25 228,8 234,32 242,28 250,25 270,25 278,8 284,32 292,28 300,25 320,25"
                  />
                </svg>
              </div>
            </div>
          </motion.section>

          <BodyMapCard />

          <motion.section
            className="replica-card food-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.03 }}
          >
            <span className="food-card__label">Food</span>
            <p className="food-card__sub">254 / 1,342 kCal</p>
            <div className="food-card__bar">
              {Array.from({ length: 10 }).map((_, i) => (
                <span key={i} className={`bar-seg${i < 2 ? ' filled' : ''}`} />
              ))}
            </div>
            <div className="food-card__value">
              <span className="food-card__num">253</span>
              <span className="food-card__unit">kCal</span>
            </div>
          </motion.section>

          <motion.section
            className="replica-card heart-strip-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.03 }}
          >
            <div>
              <h3>Heart Rate</h3>
              <p>{heartRate || '--'} bpm</p>
            </div>
            <svg viewBox="0 0 126 44" className="heart-strip-card__wave" aria-hidden="true">
              <path d="M0 28 L20 28 L28 10 L40 39 L54 16 L68 27 L82 27 L94 7 L108 38 L118 19 L126 27" />
            </svg>
          </motion.section>

          <div className="bottom-organs-row">
            <OrganStatusCard
              label="Heart"
              status={status === 'Critical' ? 'Alert' : 'Normal'}
              tone={status === 'Critical' ? 'critical' : status === 'Warning' ? 'warning' : 'normal'}
              illustration={<HeartIllustration tone="#ef6954" />}
            />
            <OrganStatusCard
              label="Lungs"
              status={spo2 < 94 ? 'Observe' : 'Normal'}
              tone={spo2 < 94 ? 'warning' : 'normal'}
              illustration={<LungsIllustration tone="#b5cadf" />}
            />
          </div>

          <div className="bottom-stats-row">
            <VitalsCard
              label="Blood Status"
              sublabel={`${spo2 || '--'}/100`}
              value={String(spo2 || '--')}
              unit="/100"
              accent="#1A3A6B"
              icon={<Droplets size={15} />}
              series={seriesFor(historicalData, 'SpO2')}
            />
            <VitalsCard
              label="Temperature"
              sublabel={motionState}
              value={temp ? temp.toFixed(1) : '--'}
              unit="C"
              accent="#303642"
              icon={<Thermometer size={15} />}
              series={seriesFor(historicalData, 'Temp')}
            />
            <VitalsCard
              label="Heart Rate"
              sublabel={`${heartRate || '--'} bpm`}
              value={String(heartRate || '--')}
              unit="bpm"
              accent="#D85A30"
              icon={null}
              series={seriesFor(historicalData, 'HR')}
            />
          </div>

          <TimelineCard start={formatTime(start)} end={formatTime(end)} duration="7:30h" />
        </section>
      </div>
    </main>
  );
}