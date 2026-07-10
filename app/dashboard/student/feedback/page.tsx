'use client';

import { useEffect, useState } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { MessageSquare, Star, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface Comment {
  id: string;
  project_id: string;
  author_id: string;
  content: string;
  created_at: string;
  author?: { full_name: string };
}

export default function FeedbackPage() {
  const { profile } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    supabase
      .from('comments')
      .select('*, author:profiles!author_id(full_name), research_projects!inner(student_id)')
      .eq('research_projects.student_id', profile.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setComments(data as Comment[]);
        setLoading(false);
      });
  }, [profile]);

  return (
    <DashboardShell
      basePath="/dashboard/student"
      title="Supervisor Feedback"
      breadcrumbs={[{ label: 'Student', href: '/dashboard/student' }, { label: 'Feedback' }]}
    >
      <div className="max-w-3xl mx-auto space-y-5">
        <p className="text-sm text-slate-500">Feedback and comments from your supervisors across all projects</p>

        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No feedback yet.</p>
            <p className="text-xs text-slate-400 mt-1">Supervisor comments on your documents will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {comments.map(comment => (
              <div key={comment.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-[#198754]/10 rounded-full flex items-center justify-center shrink-0">
                    <MessageSquare className="w-4 h-4 text-[#198754]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="text-sm font-semibold text-slate-800">
                        {comment.author?.full_name ?? 'Supervisor'}
                      </p>
                      <span className="text-xs text-slate-400">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">{comment.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
