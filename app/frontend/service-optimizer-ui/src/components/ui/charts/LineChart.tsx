import { ResponsiveContainer, LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, TooltipProps } from 'recharts';
// Removed framer-motion import
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

interface LineChartProps {
  data: Array<Record<string, number | string>>;
  height?: number;
  lines: Array<{
    key: string;
    color: string;
    name: string;
  }>;
  xAxisKey: string;
  tooltipFormatter?: TooltipProps<ValueType, NameType>['formatter'];
  yAxisFormatter?: (value: number) => string;
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
    <div className="w-full bg-card p-4 rounded-lg border border-border animate-fade-in">
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
    </div>
  );
}
