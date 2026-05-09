import { motion } from 'framer-motion';

const DOTS = [
  { cx: 110, cy: 145, delay: 0 },
  { cx: 110, cy: 92,  delay: 0.6 },
  { cx: 84,  cy: 355, delay: 1.2 },
  { cx: 170, cy: 130, delay: 1.8 },
];

export function BodyMapCard() {
  return (
    <motion.section
      className="replica-card body-map-card"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.05 }}
    >
      <div className="body-map-card__inner">
        <svg viewBox="0 0 220 420" aria-hidden="true">
          <ellipse cx="110" cy="55" rx="28" ry="32" />
          <rect x="100" y="85" width="20" height="18" rx="4" />
          <path d="M75 103 Q60 110 58 160 L65 230 Q80 240 110 240 Q140 240 155 230 L162 160 Q160 110 145 103 Z" />
          <path d="M75 108 Q50 120 42 180 Q40 200 48 210" />
          <path d="M145 108 Q170 120 178 180 Q180 200 172 210" />
          <path d="M88 238 Q82 290 80 350 Q79 380 84 400" />
          <path d="M132 238 Q138 290 140 350 Q141 380 136 400" />
          {DOTS.map((dot, i) => (
            <g key={i} style={{ transformOrigin: `${dot.cx}px ${dot.cy}px` }}>
              <circle
                cx={dot.cx} cy={dot.cy} r="5"
                fill="#D85A30"
                style={{ animation: `sensorPulse ${2}s ease-out ${dot.delay}s infinite` }}
              />
              <circle
                cx={dot.cx} cy={dot.cy} r="5"
                fill="none" stroke="#D85A30" strokeWidth="1.5"
                style={{ animation: `sensorRing ${2}s ease-out ${dot.delay}s infinite` }}
              />
            </g>
          ))}
        </svg>
      </div>
    </motion.section>
  );
}