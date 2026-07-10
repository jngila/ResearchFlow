'use client';

import { useEffect, useState } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { ResearchProject } from '@/types';
import { STATUS_COLORS, STAGE_LABELS } from '@/lib/constants';
import { Search, Filter, Plus, Download, Eye, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useState as useLocalState } from 'react';

export default function CoordinatorProjectsPage() {
  const { profile } = useAuth();
  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [studentNames, setStudentNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useLocalState('');
  const [stageFilter, setStageFilter] = useLocalState('all');
  const [statusFilter, setStatusFilter] = useLocalState('all');

  useEffect(() => {
    if (!profile?.institution_id) return;
    async function load() {
      const { data: projData } = await supabase
        .from('research_projects')
        .select('*')
        .eq('institution_id', profile!.institution_id)
        .order('created_at', { ascending: false });

      const projs = (projData ?? []) as ResearchProject[];
      setProjects(projs);

      if (projs.length > 0) {
        const ids = Array.from(new Set(projs.map(p => p.student_id)));
        const { data: students } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', ids);
        const map: Record<string, string> = {};
        (students ?? []).forEach((s: any) => { map[s.id] = s.full_name; });
        setStudentNames(map);
      }
      setLoading(false);
    }
    load();
  }, [profile]);

  const filtered = projects.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.program.toLowerCase().includes(search.toLowerCase());
    const matchStage = stageFilter === 'all' || p.current_stage === stageFilter;
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStage && matchStatus;
  });

  return (
    <DashboardShell
      basePath="/dashboard/coordinator"
      demoRole="coordinator"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard/coordinator' },
        { label: 'All Projects' },
      ]}
    >
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Research Projects</h1>
          <p className="text-slate-500 text-sm mt-1">{loading ? '…' : `${projects.length} total projects`}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2 h-9">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-100 p-4 mb-5 flex flex-wrap gap-3 items-center shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search projects, programs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-9 bg-slate-50 border-slate-200 text-sm"
          />
        </div>
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="w-44 h-9 text-sm bg-slate-50 border-slate-200">
            <SelectValue placeholder="All stages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All stages</SelectItem>
            <SelectItem value="concept_paper">Concept Paper</SelectItem>
            <SelectItem value="proposal_development">Proposal</SelectItem>
            <SelectItem value="proposal_defense">Proposal Defense</SelectItem>
            <SelectItem value="data_collection">Data Collection</SelectItem>
            <SelectItem value="report_development">Report</SelectItem>
            <SelectItem value="final_defense">Final Defense</SelectItem>
            <SelectItem value="peer_review">Peer Review</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44 h-9 text-sm bg-slate-50 border-slate-200">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="submitted">Submitted</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="under_review">Under Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="revision_required">Revision Required</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="ghost" size="sm" className="h-9 text-slate-500 gap-1.5">
          <Filter className="w-4 h-4" />
          More filters
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-medium text-slate-400 bg-slate-50/50 border-b border-slate-100">
                <th className="px-5 py-3.5">
                  <button className="flex items-center gap-1 hover:text-slate-600">
                    Project Title <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="px-5 py-3.5">Student</th>
                <th className="px-5 py-3.5">Program</th>
                <th className="px-5 py-3.5">Stage</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Progress</th>
                <th className="px-5 py-3.5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={7} className="px-5 py-4"><Skeleton className="h-8 rounded" /></td></tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center">
                    <Search className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                    <p className="text-slate-400 font-medium">No projects found</p>
                    <p className="text-slate-300 text-xs mt-1">Try adjusting your search or filters</p>
                  </td>
                </tr>
              ) : filtered.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-800 truncate max-w-xs">{p.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{p.field_of_study}</p>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-[#0B5ED7]/10 rounded-full flex items-center justify-center text-[#0B5ED7] text-xs font-bold">
                        {(studentNames[p.student_id] ?? '?').split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <span className="text-xs text-slate-600">{studentNames[p.student_id] ?? 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs text-slate-500 whitespace-nowrap">{p.program}</span>
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant="outline" className="text-xs whitespace-nowrap">
                      {STAGE_LABELS[p.current_stage]}
                    </Badge>
                  </td>
                  <td className="px-5 py-4">
                    <Badge className={cn('text-xs border-0 whitespace-nowrap', STATUS_COLORS[p.status])}>
                      {p.status.replace(/_/g, ' ')}
                    </Badge>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <ProgressBar value={p.progress_percentage} className="h-1.5 w-20" />
                      <span className="text-xs text-slate-500 whitespace-nowrap">{p.progress_percentage}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <Link href={`/dashboard/coordinator/projects/${p.id}`}>
                      <Button variant="ghost" size="sm" className="h-8 text-xs text-[#0B5ED7] hover:bg-blue-50 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-50 text-xs text-slate-500">
          <span>Showing {filtered.length} of {projects.length} projects</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-7 text-xs" disabled>Previous</Button>
            <span className="px-2 py-1 bg-[#0B5ED7] text-white rounded text-xs">1</span>
            <Button variant="outline" size="sm" className="h-7 text-xs" disabled>Next</Button>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
