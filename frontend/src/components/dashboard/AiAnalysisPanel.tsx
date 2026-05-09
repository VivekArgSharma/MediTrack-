import { motion } from 'framer-motion';
import { BrainCircuit, Sparkles } from 'lucide-react';
import { Insight } from '../../types/health';

interface AiAnalysisPanelProps {
  insight: Insight | null;
  onRefresh: () => Promise<void>;
}

export function AiAnalysisPanel({ insight, onRefresh }: AiAnalysisPanelProps) {
  return (
    <section className="thesis-card support-card ai-panel">
      <div className="section-heading">
        <div>
          <span className="card-label">Predictive layer</span>
          <h3>AI clinical brief</h3>
        </div>
        <button className="action-button" onClick={() => void onRefresh()}>
          <Sparkles size={16} /> Refresh
        </button>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="ai-summary"
      >
        <div className="ai-summary__badge">
          <BrainCircuit size={18} />
          <span>{insight ? `${Math.round(insight.confidence * 100)}% confidence` : 'Calibrating'}</span>
        </div>
        <p>{insight?.summary ?? 'Waiting for live data and baseline formation.'}</p>
        <div className="recommendations">
          {(insight?.recommendations ?? []).map((recommendation) => (
            <span key={recommendation}>{recommendation}</span>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
