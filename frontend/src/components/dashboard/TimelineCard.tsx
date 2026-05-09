import { motion } from 'framer-motion';

interface TimelineCardProps {
  start: string;
  end: string;
  duration?: string;
}

export function TimelineCard({ start, end, duration = '7:30h' }: TimelineCardProps) {
  return (
    <motion.section
      className="replica-card timeline-card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1 }}
    >
      <div className="timeline-card__meta">
        <span className="timeline-card__label">Sleep time</span>
        <p className="timeline-card__dur">{duration}</p>
      </div>
      <div className="timeline-card__track-shell">
        <div className="timeline-card__track">
          <span className="timeline-card__fill" />
          <span className="timeline-thumb timeline-thumb--start">
            <span className="timeline-thumb__label">{start}</span>
          </span>
          <span className="timeline-thumb timeline-thumb--end">
            <span className="timeline-thumb__label">{end}</span>
          </span>
        </div>
        <span className="timeline-card__range-pill">{start} – {end}</span>
      </div>
    </motion.section>
  );
}