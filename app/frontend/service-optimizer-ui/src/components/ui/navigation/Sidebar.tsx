import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Settings, HelpCircle, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { Tooltip } from '@radix-ui/react-tooltip';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { icon: <BarChart className="w-5 h-5" />, label: 'Dashboard', href: '/' },
  { icon: <FileText className="w-5 h-5" />, label: 'Reports', href: '/reports' },
  { icon: <Settings className="w-5 h-5" />, label: 'Settings', href: '/settings' },
  { icon: <HelpCircle className="w-5 h-5" />, label: 'Help', href: '/help' },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <motion.div
      initial={false}
      animate={{ width: isCollapsed ? 64 : 240 }}
      className="fixed left-0 top-0 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-sm z-40"
    >
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          {!isCollapsed && <span className="font-semibold text-gray-900 dark:text-white">Navigation</span>}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        <nav className="flex-1 p-2">
          {navItems.map((item) => (
            <Tooltip key={item.label} content={isCollapsed ? item.label : undefined}>
              <a
                href={item.href}
                className="flex items-center gap-3 p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                {item.icon}
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </a>
            </Tooltip>
          ))}
        </nav>
      </div>
    </motion.div>
  );
}
