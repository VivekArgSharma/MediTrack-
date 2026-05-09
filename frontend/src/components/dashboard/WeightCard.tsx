import { motion } from 'framer-motion';

interface WeightCardProps {
  weight?: number;
  delta?: number;
}

export function WeightCard({ weight = 74.2, delta = -0.4 }: WeightCardProps) {
  const filled = 7;
  const total = 10;

  return (
    <motion.section
      className="replica-card weight-card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div>
        <span className="weight-card__label">Weight</span>
        <p className="weight-card__delta">
          {delta < 0 ? `Lost ${Math.abs(delta)} kg` : `Gained ${delta} kg`}
        </p>
      </div>
      <div className="weight-card__bar">
        {Array.from({ length: total }).map((_, i) => (
          <span key={i} className={`bar-seg${i < filled ? ' filled' : ''}`} />
        ))}
      </div>
      <div className="weight-card__value">
        <span className="weight-card__num">{weight}</span>
        <span className="weight-card__unit">kg</span>
      </div>
    </motion.section>
  );
}