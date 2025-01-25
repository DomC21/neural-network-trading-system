import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Settings, HelpCircle, FileText, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { Tooltip } from '@radix-ui/react-tooltip';
import { Input } from '../input';

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

interface SidebarProps {
  onSearch?: (query: string) => void;
}

export function Sidebar({ onSearch }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <motion.div
      initial={false}
      animate={{ width: isCollapsed ? 64 : 240 }}
      className="fixed left-0 top-0 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-sm z-40"
    >
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          {!isCollapsed && (
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                <Input
                  type="search"
                  placeholder="Search services..."
                  className="pl-10 w-full bg-gray-50 dark:bg-gray-800"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    onSearch?.(e.target.value);
                  }}
                />
              </div>
            </div>
          )}
          <div className="flex items-center justify-between">
            {!isCollapsed && <span className="font-semibold text-gray-900 dark:text-white">Navigation</span>}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
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
