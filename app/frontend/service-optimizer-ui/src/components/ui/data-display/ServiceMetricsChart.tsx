import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface ServiceMetricsChartProps {
  data: {
    month: string;
    profit: number;
    revenue: number;
  }[];
  height?: number;
}

export function ServiceMetricsChart({ data, height = 300 }: ServiceMetricsChartProps) {
  return (
    <div className="w-full bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 animate-fade-in">
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="month"
            stroke="#6b7280"
            tick={{ fill: '#6b7280' }}
          />
          <YAxis
            stroke="#6b7280"
            tick={{ fill: '#6b7280' }}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '0.375rem',
            }}
            formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="profit"
            stroke="#45B6B0"
            strokeWidth={2}
            dot={false}
            name="Profit"
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#9333ea"
            strokeWidth={2}
            dot={false}
            name="Revenue"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
