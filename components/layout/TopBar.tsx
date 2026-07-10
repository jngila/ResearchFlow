'use client';

import { useEffect, useState } from 'react';
import { Bell, Search, Menu, X, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Notification } from '@/types';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

const NOTIF_COLORS = {
  info: 'bg-blue-100 text-blue-600',
  success: 'bg-green-100 text-green-600',
  warning: 'bg-amber-100 text-amber-700',
  error: 'bg-red-100 text-red-600',
};

interface TopBarProps {
  title?: string;
  breadcrumbs?: { label: string; href?: string }[];
  onMenuToggle?: () => void;
}

export default function TopBar({ title, breadcrumbs, onMenuToggle }: TopBarProps) {
  const { profile } = useAuth();
  const [showSearch, setShowSearch] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!profile) return;
    supabase
      .from('notifications')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(8)
      .then(({ data }) => {
        if (data) setNotifications(data as Notification[]);
      });
  }, [profile]);

  async function markAllRead() {
    if (!profile) return;
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', profile.id)
      .eq('is_read', false);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  }

  const unread = notifications.filter(n => !n.is_read).length;

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center px-4 sm:px-6 gap-4 shrink-0">
      {/* Mobile menu toggle */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden text-slate-500 hover:text-slate-700 transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Breadcrumbs / Title */}
      <div className="flex-1 min-w-0">
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <nav className="flex items-center gap-1 text-sm text-slate-500">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="w-3.5 h-3.5" />}
                {i === breadcrumbs.length - 1 ? (
                  <span className="font-medium text-slate-800 truncate">{crumb.label}</span>
                ) : (
                  <a href={crumb.href} className="hover:text-slate-700 truncate">{crumb.label}</a>
                )}
              </span>
            ))}
          </nav>
        ) : (
          <h1 className="text-base font-semibold text-slate-800 truncate">{title}</h1>
        )}
      </div>

      {/* Search */}
      <div className={cn('transition-all', showSearch ? 'w-64' : 'w-8')}>
        {showSearch ? (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              autoFocus
              placeholder="Search projects, users..."
              className="h-9 pl-9 pr-8 text-sm bg-slate-50 border-slate-200"
              onBlur={() => setShowSearch(false)}
            />
            <button onClick={() => setShowSearch(false)} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowSearch(true)}
            className="text-slate-500 hover:text-slate-700 transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Notifications */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative h-9 w-9">
            <Bell className="w-5 h-5 text-slate-500" />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#0B5ED7] text-white text-xs rounded-full flex items-center justify-center font-semibold">
                {unread}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80 p-0">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <span className="font-semibold text-slate-800 text-sm">Notifications</span>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-xs text-[#0B5ED7] hover:underline">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-xs text-slate-400">No notifications yet.</div>
            ) : notifications.slice(0, 6).map(n => (
              <DropdownMenuItem key={n.id} className="px-4 py-3 cursor-pointer block">
                <div className="flex gap-3">
                  <div className={cn('w-2 h-2 rounded-full mt-1.5 shrink-0', n.is_read ? 'bg-slate-200' : 'bg-[#0B5ED7]')} />
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-sm', n.is_read ? 'text-slate-500' : 'font-medium text-slate-800')}>
                      {n.title}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">{n.message}</p>
                    <p className="text-xs text-slate-300 mt-1">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-center text-sm text-[#0B5ED7] py-3 cursor-pointer justify-center font-medium">
            View all notifications
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
