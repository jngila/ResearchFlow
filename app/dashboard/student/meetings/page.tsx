'use client';

import { useEffect, useState } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, Clock, Video, MapPin, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { format, parseISO, isFuture, isPast } from 'date-fns';

interface Meeting {
  id: string;
  student_id: string;
  supervisor_id: string;
  title: string;
  scheduled_at: string;
  location: string | null;
  meeting_type: string;
  status: string;
  notes: string | null;
  supervisor?: { full_name: string };
}

export default function MeetingsPage() {
  const { profile } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    supabase
      .from('meetings')
      .select('*, supervisor:profiles!supervisor_id(full_name)')
      .eq('student_id', profile.id)
      .order('scheduled_at', { ascending: false })
      .then(({ data }) => {
        if (data) setMeetings(data as Meeting[]);
        setLoading(false);
      });
  }, [profile]);

  const upcoming = meetings.filter(m => isFuture(parseISO(m.scheduled_at)));
  const past = meetings.filter(m => isPast(parseISO(m.scheduled_at)));

  return (
    <DashboardShell
      basePath="/dashboard/student"
      title="Meetings"
      breadcrumbs={[{ label: 'Student', href: '/dashboard/student' }, { label: 'Meetings' }]}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">Supervision meetings and scheduled sessions</p>
          <Button size="sm" className="bg-[#0B5ED7] hover:bg-[#0a52c4] gap-1.5" disabled>
            <Plus className="w-3.5 h-3.5" /> Request meeting
          </Button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        ) : meetings.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No meetings scheduled yet.</p>
          </div>
        ) : (
          <>
            {upcoming.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-3">Upcoming</h3>
                <div className="space-y-3">
                  {upcoming.map(m => (
                    <MeetingCard key={m.id} meeting={m} upcoming />
                  ))}
                </div>
              </div>
            )}
            {past.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-3">Past</h3>
                <div className="space-y-3">
                  {past.map(m => (
                    <MeetingCard key={m.id} meeting={m} upcoming={false} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardShell>
  );
}

function MeetingCard({ meeting: m, upcoming }: { meeting: Meeting; upcoming: boolean }) {
  return (
    <div className={cn(
      'bg-white rounded-2xl border shadow-sm p-5',
      upcoming ? 'border-[#0B5ED7]/20' : 'border-slate-100'
    )}>
      <div className="flex items-start gap-4">
        <div className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
          upcoming ? 'bg-[#0B5ED7]/10' : 'bg-slate-100'
        )}>
          {m.meeting_type === 'online' ? (
            <Video className={cn('w-5 h-5', upcoming ? 'text-[#0B5ED7]' : 'text-slate-400')} />
          ) : (
            <MapPin className={cn('w-5 h-5', upcoming ? 'text-[#0B5ED7]' : 'text-slate-400')} />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <p className="font-semibold text-slate-800 text-sm">{m.title}</p>
            {upcoming && <Badge className="bg-[#0B5ED7]/10 text-[#0B5ED7] border-0 text-xs">Upcoming</Badge>}
          </div>
          <p className="text-xs text-slate-500 mb-1">With {m.supervisor?.full_name ?? 'Supervisor'}</p>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {format(parseISO(m.scheduled_at), 'MMM d, yyyy — h:mm a')}
            </span>
            {m.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {m.location}
              </span>
            )}
          </div>
          {m.notes && <p className="text-xs text-slate-400 mt-2 leading-relaxed">{m.notes}</p>}
        </div>
      </div>
    </div>
  );
}
