'use client';

import { useEffect, useState } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Notification } from '@/types';
import { Bell, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

const TYPE_COLORS: Record<string, string> = {
  info: 'bg-blue-50 text-[#0B5ED7]',
  success: 'bg-green-50 text-[#198754]',
  warning: 'bg-amber-50 text-amber-600',
  error: 'bg-red-50 text-red-600',
};

export default function NotificationsPage() {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    supabase
      .from('notifications')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setNotifications(data as Notification[]);
        setLoading(false);
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
    <DashboardShell
      basePath="/dashboard/student"
      title="Notifications"
      breadcrumbs={[{ label: 'Student', href: '/dashboard/student' }, { label: 'Notifications' }]}
    >
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-500">{notifications.length} total</span>
            {unread > 0 && <Badge className="bg-[#0B5ED7] text-white border-0 text-xs">{unread} unread</Badge>}
          </div>
          {unread > 0 && (
            <Button size="sm" variant="outline" onClick={markAllRead} className="gap-1.5 text-xs h-8">
              <CheckCheck className="w-3.5 h-3.5" /> Mark all read
            </Button>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
            <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No notifications yet.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
            {notifications.map(n => (
              <div key={n.id} className={cn('flex gap-4 px-5 py-4', !n.is_read && 'bg-blue-50/30')}>
                <div className={cn('w-2 h-2 rounded-full mt-2 shrink-0', n.is_read ? 'bg-slate-200' : 'bg-[#0B5ED7]')} />
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm mb-0.5', n.is_read ? 'text-slate-500' : 'font-medium text-slate-800')}>
                    {n.title}
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed">{n.message}</p>
                  <p className="text-xs text-slate-300 mt-1">
                    {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                  </p>
                </div>
                <Badge className={cn('text-xs border-0 shrink-0 self-start mt-1', TYPE_COLORS[n.type ?? 'info'] ?? 'bg-slate-100 text-slate-600')}>
                  {n.type ?? 'info'}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
