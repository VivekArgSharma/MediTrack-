import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface VitalsCardProps {
  label: string;
  sublabel: string;
  value: string;
  unit?: string;
  accent: string;
  valueColor?: string;
  icon?: ReactNode;
  series: number[];
  className?: string;
}

function buildSparklinePath(series: number[], width: number, height: number) {
  if (!series.length) return '';
  const max = Math.max(...series);
  const min = Math.min(...series);
  const range = max - min || 1;
  return series
    .map((point, index) => {
      const x = (index / Math.max(series.length - 1, 1)) * width;
      const y = height - ((point - min) / range) * height;
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(' ');
}

export function VitalsCard({ label, sublabel, value, unit, accent, valueColor, icon, series, className = '' }: VitalsCardProps) {
  const sparkline = buildSparklinePath(series, 200, 55);
  const numColor = valueColor || accent;

  return (
    <motion.article
      className={`replica-card vital-card ${className}`.trim()}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="vital-card__top">
        <div>
          <h3>{label}</h3>
          <p className="vital-card__sub">{sublabel}</p>
        </div>
        {icon ? <span className="vital-card__icon">{icon}</span> : null}
      </div>
      <div className="vital-card__big-num">
        <strong style={{ color: numColor }}>{value}</strong>
        {unit ? <span>{unit}</span> : null}
      </div>
      <div className="vital-card__chart">
        <svg viewBox="0 0 200 55" aria-hidden="true" preserveAspectRatio="none">
          <path d={sparkline} stroke={accent} />
        </svg>
      </div>
    </motion.article>
  );
}