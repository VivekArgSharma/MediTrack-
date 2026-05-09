import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';

interface StepsCardProps {
  steps?: number;
  goal?: number;
}

export function StepsCard({ steps = 7425, goal = 10000 }: StepsCardProps) {
  const fgRef = useRef<SVGCircleElement>(null);
  const circumference = 2 * Math.PI * 80;
  const arcLen = circumference * (220 / 360);
  const progress = Math.min((steps / goal) * 100, 100);
  const filled = (progress / 100) * arcLen;
  const rotateOffset = 160;

  useEffect(() => {
    const el = fgRef.current;
    if (!el) return;
    const start = performance.now();
    const from = 0;
    const to = filled;
    const dur = 1200;
    const cubic = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    let raf: number;
    const animate = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / dur, 1);
      el.style.strokeDasharray = `${cubic(t) * to} ${circumference}`;
      if (t < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [filled, circumference]);

  return (
    <motion.section
      className="replica-card steps-card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <span className="steps-card__label">Daily steps</span>
      <div className="steps-card__arc-wrap">
        <svg
          viewBox="0 0 200 200"
          width="180" height="180"
          style={{ transform: `rotate(${rotateOffset}deg)` }}
        >
          <circle
            cx="100" cy="100" r="80"
            fill="none"
            stroke="#D8D6D0"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={`${arcLen} ${circumference}`}
            strokeDashoffset="0"
          />
          <circle
            ref={fgRef}
            cx="100" cy="100" r="80"
            fill="none"
            stroke="#1A3A6B"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={`0 ${circumference}`}
            strokeDashoffset="0"
          />
          <g style={{ transform: `rotate(${-rotateOffset}deg)`, transformOrigin: '100px 100px' }}>
            <text x="100" y="92" textAnchor="middle" fontSize="36" fontWeight="600" fill="#1C1C1C">
              {steps.toLocaleString()}
            </text>
            <text x="100" y="112" textAnchor="middle" fontSize="13" fill="#888780">
              Steps
            </text>
          </g>
        </svg>
      </div>
      <p className="steps-card__goal">{goal.toLocaleString()} Steps</p>
    </motion.section>
  );
}