import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { VitalEnvelope } from '../../types/health';

interface RealTimeChartProps {
  title: string;
  data: VitalEnvelope[];
  dataKey: 'HR' | 'SpO2' | 'Temp';
  color: string;
}

export function RealTimeChart({ title, data, dataKey, color }: RealTimeChartProps) {
  const chartData = data.map((item) => ({
    time: new Date(item.timestamp).toLocaleTimeString([], {
      minute: '2-digit',
      second: '2-digit',
    }),
    value: item.data[dataKey],
  }));

  return (
    <section className="glass-card chart-card">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Live waveform</span>
          <h3>{title}</h3>
        </div>
      </div>
      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id={`gradient-${dataKey}`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
            <XAxis dataKey="time" tick={{ fill: '#96a7c5', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#96a7c5', fontSize: 12 }} axisLine={false} tickLine={false} width={32} />
            <Tooltip
              contentStyle={{
                background: 'rgba(8, 12, 24, 0.92)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '14px',
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={3}
              fill={`url(#gradient-${dataKey})`}
              isAnimationActive
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
