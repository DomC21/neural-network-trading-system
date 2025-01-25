import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { Icons } from '../icons';
import { Tooltip } from '../tooltip';
import { Input } from '../input';

interface NavItem {
  icon: LucideIcon;
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { icon: Icons.BarChart, label: 'Dashboard', href: '/' },
  { icon: Icons.FileText, label: 'Reports', href: '/reports' },
  { icon: Icons.Settings, label: 'Settings', href: '/settings' },
  { icon: Icons.HelpCircle, label: 'Help', href: '/help' },
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
                <Icons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
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
              {isCollapsed ? <Icons.ChevronRight size={16} /> : <Icons.ChevronLeft size={16} />}
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
                <item.icon className="w-4 h-4" />
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
