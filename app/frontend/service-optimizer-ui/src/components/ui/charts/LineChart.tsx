import { ResponsiveContainer, LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { motion } from 'framer-motion';

interface LineChartProps {
  data: any[];
  height?: number;
  lines: Array<{
    key: string;
    color: string;
    name: string;
  }>;
  xAxisKey: string;
  tooltipFormatter?: (value: any) => string;
  yAxisFormatter?: (value: any) => string;
}

export function LineChart({
  data,
  height = 300,
  lines,
  xAxisKey,
  tooltipFormatter = (value) => `${value}`,
  yAxisFormatter = (value) => `${value}`,
}: LineChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full bg-card p-4 rounded-lg border border-border"
    >
      <ResponsiveContainer width="100%" height={height}>
        <RechartsLineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
          <XAxis
            dataKey={xAxisKey}
            stroke="currentColor"
            tick={{ fill: 'currentColor' }}
            opacity={0.5}
          />
          <YAxis
            stroke="currentColor"
            tick={{ fill: 'currentColor' }}
            opacity={0.5}
            tickFormatter={yAxisFormatter}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--background)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
            }}
            formatter={tooltipFormatter}
          />
          <Legend />
          {lines.map(({ key, color, name }) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={color}
              strokeWidth={2}
              dot={false}
              name={name}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
