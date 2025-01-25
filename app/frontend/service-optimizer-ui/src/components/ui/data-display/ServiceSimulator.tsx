import { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Users, TrendingUp } from 'lucide-react';
import { Tooltip } from '@radix-ui/react-tooltip';
import * as Slider from '@radix-ui/react-slider';

interface ServiceSimulatorProps {
  initialRevenue: number;
  initialUsage: number;
  initialMargin: number;
  onSimulate: (params: SimulationParams) => void;
}

interface SimulationParams {
  revenue: number;
  usage: number;
  margin: number;
}

export function ServiceSimulator({ initialRevenue, initialUsage, initialMargin, onSimulate }: ServiceSimulatorProps) {
  const [revenue, setRevenue] = useState(initialRevenue);
  const [usage, setUsage] = useState(initialUsage);
  const [margin, setMargin] = useState(initialMargin);

  const handleSimulate = () => {
    onSimulate({ revenue, usage, margin });
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 space-y-6"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Service Simulation</h3>
        <Tooltip content="Adjust metrics to see potential impact on service performance">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Drag sliders to simulate changes
          </span>
        </Tooltip>
      </div>

      <div className="space-y-4">
        {/* Revenue Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Revenue</span>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              ${revenue.toLocaleString()}
            </span>
          </div>
          <Slider.Root
            className="relative flex items-center select-none touch-none w-full h-5"
            defaultValue={[revenue]}
            max={initialRevenue * 2}
            min={0}
            step={1000}
            onValueChange={([value]) => setRevenue(value)}
          >
            <Slider.Track className="bg-gray-200 dark:bg-gray-700 relative grow rounded-full h-1">
              <Slider.Range className="absolute bg-green-500 rounded-full h-full" />
            </Slider.Track>
            <Slider.Thumb className="block w-5 h-5 bg-white border-2 border-green-500 rounded-full hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500" />
          </Slider.Root>
        </div>

        {/* Usage Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Usage</span>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {usage.toLocaleString()} uses
            </span>
          </div>
          <Slider.Root
            className="relative flex items-center select-none touch-none w-full h-5"
            defaultValue={[usage]}
            max={initialUsage * 2}
            min={0}
            step={1}
            onValueChange={([value]) => setUsage(value)}
          >
            <Slider.Track className="bg-gray-200 dark:bg-gray-700 relative grow rounded-full h-1">
              <Slider.Range className="absolute bg-blue-500 rounded-full h-full" />
            </Slider.Track>
            <Slider.Thumb className="block w-5 h-5 bg-white border-2 border-blue-500 rounded-full hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </Slider.Root>
        </div>

        {/* Margin Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Margin</span>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {margin.toFixed(1)}%
            </span>
          </div>
          <Slider.Root
            className="relative flex items-center select-none touch-none w-full h-5"
            defaultValue={[margin]}
            max={60}
            min={0}
            step={0.1}
            onValueChange={([value]) => setMargin(value)}
          >
            <Slider.Track className="bg-gray-200 dark:bg-gray-700 relative grow rounded-full h-1">
              <Slider.Range className="absolute bg-purple-500 rounded-full h-full" />
            </Slider.Track>
            <Slider.Thumb className="block w-5 h-5 bg-white border-2 border-purple-500 rounded-full hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </Slider.Root>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSimulate}
          className="w-full py-2 px-4 bg-[#45B6B0] hover:bg-[#3a9a95] text-white rounded-lg transition-colors flex items-center justify-center gap-2 mt-4"
        >
          <span>Apply Simulation</span>
        </motion.button>
      </div>
    </motion.div>
  );
}
