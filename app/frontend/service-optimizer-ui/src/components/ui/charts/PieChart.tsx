import { ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Tooltip, Legend, TooltipProps } from 'recharts';
// Removed framer-motion import
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

interface PieChartProps {
  data: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  height?: number;
  tooltipFormatter?: TooltipProps<ValueType, NameType>['formatter'];
}

export function PieChart({
  data,
  height = 300,
  tooltipFormatter = (value) => `${value}`,
}: PieChartProps) {
  return (
    <div className="w-full bg-card p-4 rounded-lg border border-border animate-fade-in">
      <ResponsiveContainer width="100%" height={height}>
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--background)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
            }}
            formatter={tooltipFormatter}
          />
          <Legend />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}
