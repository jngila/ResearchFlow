'use client';

import { useEffect, useState } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Users, Search, GraduationCap, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { STAGE_LABELS } from '@/lib/constants';
import { ResearchProject } from '@/types';
import Link from 'next/link';

export default function SuperviseeListPage() {
  const { profile } = useAuth();
  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [studentNames, setStudentNames] = useState<Record<string, string>>({});
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    supabase
      .from('research_projects')
      .select('*')
      .eq('supervisor_id', profile.id)
      .order('created_at', { ascending: false })
      .then(async ({ data }) => {
        if (!data) { setLoading(false); return; }
        setProjects(data as ResearchProject[]);
        const ids = Array.from(new Set(data.map(p => p.student_id)));
        if (ids.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id,full_name')
            .in('id', ids);
          if (profiles) {
            const map: Record<string, string> = {};
            profiles.forEach(p => { map[p.id] = p.full_name; });
            setStudentNames(map);
          }
        }
        setLoading(false);
      });
  }, [profile]);

  const filtered = projects.filter(p => {
    const name = studentNames[p.student_id] ?? '';
    return name.toLowerCase().includes(query.toLowerCase()) ||
      p.title.toLowerCase().includes(query.toLowerCase());
  });

  return (
    <DashboardShell
      basePath="/dashboard/supervisor"
      title="My Supervisees"
      breadcrumbs={[{ label: 'Supervisor', href: '/dashboard/supervisor' }, { label: 'Supervisees' }]}
    >
      <div className="max-w-4xl mx-auto space-y-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search supervisees or projects..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">{query ? 'No results found.' : 'No supervisees assigned yet.'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(p => (
              <Link key={p.id} href={`/dashboard/supervisor/projects/${p.id}`}>
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#0B5ED7]/10 rounded-xl flex items-center justify-center shrink-0">
                      <GraduationCap className="w-5 h-5 text-[#0B5ED7]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-sm truncate">{studentNames[p.student_id] ?? 'Student'}</p>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{p.title}</p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <Badge className="text-xs bg-blue-50 text-[#0B5ED7] border-0">
                          {STAGE_LABELS[p.current_stage]}
                        </Badge>
                        <Badge className="text-xs bg-slate-100 text-slate-600 border-0 capitalize">
                          {p.project_type?.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
