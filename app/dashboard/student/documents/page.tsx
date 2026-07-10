'use client';

import { useEffect, useState } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, Upload, Download, Eye, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface Document {
  id: string;
  project_id: string;
  title: string;
  document_type: string;
  file_url: string | null;
  version: number;
  status: string;
  created_at: string;
}

const TYPE_LABELS: Record<string, string> = {
  concept_paper: 'Concept Paper',
  proposal: 'Proposal',
  report: 'Report',
  presentation: 'Presentation',
  letter: 'Letter',
  rubric: 'Rubric',
  other: 'Other',
};

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-600',
  submitted: 'bg-blue-100 text-blue-700',
  under_review: 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  revision_required: 'bg-orange-100 text-orange-700',
};

export default function DocumentsPage() {
  const { profile } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    supabase
      .from('documents')
      .select('*, research_projects!inner(student_id)')
      .eq('research_projects.student_id', profile.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setDocuments(data as Document[]);
        setLoading(false);
      });
  }, [profile]);

  return (
    <DashboardShell
      basePath="/dashboard/student"
      title="My Documents"
      breadcrumbs={[{ label: 'Student', href: '/dashboard/student' }, { label: 'Documents' }]}
    >
      <div className="max-w-4xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">All documents submitted across your research projects</p>
          <Button size="sm" className="bg-[#0B5ED7] hover:bg-[#0a52c4] gap-1.5" disabled>
            <Upload className="w-3.5 h-3.5" /> Upload document
          </Button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 mb-1">No documents uploaded yet.</p>
            <p className="text-xs text-slate-400">Documents you upload through your research projects will appear here.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-50">
              {documents.map(doc => (
                <div key={doc.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-[#0B5ED7]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 text-sm truncate">{doc.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-400">{TYPE_LABELS[doc.document_type] ?? doc.document_type}</span>
                      <span className="text-slate-200">·</span>
                      <span className="text-xs text-slate-400">v{doc.version}</span>
                      <span className="text-slate-200">·</span>
                      <span className="text-xs text-slate-400">{formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })}</span>
                    </div>
                  </div>
                  <Badge className={cn('text-xs border-0 shrink-0', STATUS_COLORS[doc.status] ?? 'bg-slate-100 text-slate-600')}>
                    {doc.status?.replace(/_/g, ' ')}
                  </Badge>
                  {doc.file_url && (
                    <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                      <Button size="icon" variant="ghost" className="w-8 h-8 text-slate-400 hover:text-[#0B5ED7]">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
