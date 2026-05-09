import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Droplets, Thermometer } from 'lucide-react';
import { HeartIllustration, LungsIllustration } from '../components/dashboard/MedicalIllustrations';
import { OrganStatusCard } from '../components/dashboard/OrganStatusCard';
import { TimelineCard } from '../components/dashboard/TimelineCard';
import { VitalsCard } from '../components/dashboard/VitalsCard';
import { PatientStatusCard, PatientStatus } from '../components/dashboard/PatientStatusCard';

const DATA_STREAM = [
  { HR: 78,  SpO2: 98, Temp: 36.8, Steps: 1240, Fall: 0, Motion: 'Walking', Battery: 82 },
  { HR: 79,  SpO2: 97, Temp: 36.9, Steps: 1252, Fall: 0, Motion: 'Walking', Battery: 81 },
  { HR: 76,  SpO2: 98, Temp: 36.7, Steps: 1260, Fall: 0, Motion: 'Idle',    Battery: 81 },
  { HR: 118, SpO2: 94, Temp: 37.2, Steps: 1265, Fall: 1, Motion: 'Impact',  Battery: 80 },
];

function computeStatus(d: typeof DATA_STREAM[0]): PatientStatus {
  if (d.Fall === 1 || d.Motion === 'Impact') return 'Fallen';
  if (d.HR > 110 || d.SpO2 < 95 || d.Temp > 37.5) return 'Emergency';
  if (d.Motion === 'Walking') return 'Walking';
  if (d.Motion === 'Idle' && d.HR < 80) return 'Idle';
  if (d.Motion === 'Idle' && d.HR >= 80) return 'Recovery';
  return 'Idle';
}

function spo2Color(v: number) {
  if (v >= 97) return '#1D9E75';
  if (v >= 94) return '#BA7517';
  return '#D85A30';
}

function tempColor(v: number) {
  if (v <= 37.2) return '#1D9E75';
  if (v <= 37.9) return '#BA7517';
  return '#D85A30';
}

export function DashboardPage() {
  const [streamIndex, setStreamIndex] = useState(0);
  const [current, setCurrent] = useState(DATA_STREAM[0]);
  const [spo2History, setSpo2History] = useState<number[]>([98, 98, 98, 98]);
  const [tempHistory, setTempHistory] = useState<number[]>([36.8, 36.8, 36.8, 36.8]);

  const heartRate = current.HR;
  const spo2 = current.SpO2;
  const temp = current.Temp;
  const patientStatus = computeStatus(current);

  useEffect(() => {
    const id = setInterval(() => {
      setStreamIndex(i => (i + 1) % DATA_STREAM.length);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const row = DATA_STREAM[streamIndex];
    setCurrent(row);
    setSpo2History(h => [...h.slice(1), row.SpO2]);
    setTempHistory(h => [...h.slice(1), row.Temp]);
  }, [streamIndex]);

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
            <span className="topbar-brand">MediTrack+</span>
          </div>
          <div className="topbar-status">
            <span className="live-dot" />
            <span className="live-label">Live</span>
            {clock && <span className="live-time">{clock}</span>}
          </div>
        </header>

        <section className="replica-grid">
          <PatientStatusCard
            status={patientStatus}
            motion={current.Motion}
            fall={current.Fall}
            battery={current.Battery}
          />

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
                <div className="ecg-hr-row">
                  <span className="ecg-hr-num">{heartRate}</span>
                  <span className="ecg-hr-unit">bpm</span>
                </div>
              </div>
              <div className="ecg-wave-wrap">
                <svg viewBox="0 0 320 48" className="ecg-wave" preserveAspectRatio="none" aria-hidden="true">
                  <polyline points="0,30 20,30 28,10 34,38 42,34 50,30 70,30 78,10 84,38 92,34 100,30 120,30 128,10 134,38 142,34 150,30 170,30 178,10 184,38 192,34 200,30 220,30 228,10 234,38 242,34 250,30 270,30 278,10 284,38 292,34 300,30 320,30" />
                  <polyline points="0,30 20,30 28,10 34,38 42,34 50,30 70,30 78,10 84,38 92,34 100,30 120,30 128,10 134,38 142,34 150,30 170,30 178,10 184,38 192,34 200,30 220,30 228,10 234,38 242,34 250,30 270,30 278,10 284,38 292,34 300,30 320,30" />
                </svg>
              </div>
            </div>
          </motion.section>

          <div className="bottom-organs-row">
            <OrganStatusCard
              label="Heart"
              status={patientStatus === 'Fallen' || patientStatus === 'Emergency' ? 'Alert' : 'Normal'}
              tone={patientStatus === 'Fallen' || patientStatus === 'Emergency' ? 'critical' : 'normal'}
              illustration={<HeartIllustration tone="#ef6954" />}
            />
            <OrganStatusCard
              label="Lungs"
              status="Normal"
              tone="normal"
              illustration={<LungsIllustration tone="#b5cadf" />}
            />
          </div>

          <div className="bottom-stats-row">
            <VitalsCard
              label="SpO2"
              sublabel={`${spo2}%`}
              value={String(spo2)}
              unit="%"
              accent={spo2Color(spo2)}
              icon={<Droplets size={16} />}
              series={spo2History}
            />
            <VitalsCard
              label="Temperature"
              sublabel={current.Motion}
              value={temp.toFixed(1)}
              unit="°C"
              accent={tempColor(temp)}
              icon={<Thermometer size={16} />}
              series={tempHistory}
            />
          </div>

          <TimelineCard start="23:30" end="07:00" duration="7:30h" />
        </section>
      </div>
    </main>
  );
}