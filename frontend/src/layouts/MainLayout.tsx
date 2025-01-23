import { Outlet, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  message: string;
  read: boolean;
}

export default function MainLayout() {
  const location = useLocation();
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: '1', message: 'New job request submitted', read: false },
    { id: '2', message: 'Contractor assigned to job', read: false },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-semibold">MSS Operations</h1>
              <div className="flex space-x-4">
                <Link
                  to="/dashboard"
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium",
                    location.pathname === '/dashboard'
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  Dashboard
                </Link>
                <Link
                  to="/request"
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium",
                    location.pathname === '/request'
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  New Request
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  {notifications.length === 0 ? (
                    <DropdownMenuItem className="text-gray-500">
                      No notifications
                    </DropdownMenuItem>
                  ) : (
                    notifications.map(notification => (
                      <DropdownMenuItem
                        key={notification.id}
                        onClick={() => markAsRead(notification.id)}
                        className={cn(
                          "flex items-center py-2",
                          !notification.read && "bg-blue-50"
                        )}
                      >
                        <span className="text-sm">{notification.message}</span>
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
