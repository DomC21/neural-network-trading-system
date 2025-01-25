import { ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, TooltipProps } from 'recharts';
import { motion } from 'framer-motion';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

interface BarChartProps {
  data: Array<Record<string, any>>;
  height?: number;
  bars: Array<{
    key: string;
    color: string;
    name: string;
    stackId?: string;
  }>;
  xAxisKey: string;
  tooltipFormatter?: TooltipProps<ValueType, NameType>['formatter'];
  yAxisFormatter?: (value: any) => string;
}

export function BarChart({
  data,
  height = 300,
  bars,
  xAxisKey,
  tooltipFormatter = (value) => `${value}`,
  yAxisFormatter = (value) => `${value}`,
}: BarChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full bg-card p-4 rounded-lg border border-border"
    >
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
          {bars.map(({ key, color, name, stackId }) => (
            <Bar
              key={key}
              dataKey={key}
              fill={color}
              name={name}
              stackId={stackId}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
