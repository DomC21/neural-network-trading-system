import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface PageLayoutProps {
  children: ReactNode;
}

export function PageLayout({ children }: PageLayoutProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200"
    >
      {children}
    </motion.div>
  );
}
