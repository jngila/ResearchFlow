'use client';

import DashboardShell from '@/components/layout/DashboardShell';
import WorkflowTracker from '@/components/dashboard/WorkflowTracker';
import { DUMMY_PROJECTS, DUMMY_USERS } from '@/lib/dummy-data';
import { STATUS_COLORS, STAGE_LABELS, STAGE_ORDER } from '@/lib/constants';
import {
  ChevronRight, User, Calendar, BookOpen, FileText, MessageSquare,
  Clock, CheckCircle, Upload, Download, Plus, Send, Shield, AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const PROJECT = DUMMY_PROJECTS[0];

const DOCUMENTS = [
  { name: 'Concept_Paper_v1.pdf', type: 'PDF', stage: 'Concept Paper', size: '1.2 MB', uploaded: '2024-09-15', version: 1, status: 'approved' },
  { name: 'Research_Proposal_Draft_v3.docx', type: 'DOCX', stage: 'Proposal', size: '3.8 MB', uploaded: '2024-11-01', version: 3, status: 'submitted' },
  { name: 'Literature_Review.pdf', type: 'PDF', stage: 'Proposal', size: '2.1 MB', uploaded: '2024-10-20', version: 1, status: 'approved' },
];

const COMMENTS = [
  {
    id: 'c1',
    author: 'Dr. James Kamau',
    role: 'Supervisor',
    content: 'The methodology section needs more detail on data collection instruments. Please revise and resubmit by Friday.',
    time: '2 days ago',
    internal: false,
  },
  {
    id: 'c2',
    author: 'Alice Njoroge',
    role: 'Student',
    content: 'Thank you for the feedback. I have revised the methodology and added the data collection instrument section. Please review.',
    time: '1 day ago',
    internal: false,
  },
  {
    id: 'c3',
    author: 'Prof. Mary Wanjiru',
    role: 'Coordinator',
    content: 'Note: Defense panel has been tentatively scheduled for December. Please confirm availability.',
    time: '5 hours ago',
    internal: true,
  },
];

const AUDIT_TRAIL = [
  { action: 'Project created', user: 'Alice Njoroge', time: 'Feb 1, 2024', detail: 'Initial project registration' },
  { action: 'Concept paper submitted', user: 'Alice Njoroge', time: 'Apr 10, 2024', detail: 'Concept_Paper_v1.pdf' },
  { action: 'Concept paper approved', user: 'Prof. Mary Wanjiru', time: 'Apr 15, 2024', detail: 'Approved with comments' },
  { action: 'Supervisor allocated', user: 'Prof. Mary Wanjiru', time: 'Apr 20, 2024', detail: 'Dr. James Kamau assigned as primary supervisor' },
  { action: 'Proposal draft submitted', user: 'Alice Njoroge', time: 'Nov 1, 2024', detail: 'Research_Proposal_Draft_v3.docx' },
  { action: 'Supervisor feedback given', user: 'Dr. James Kamau', time: 'Nov 14, 2024', detail: 'Revision required — methodology section' },
];

const DOC_COLORS: Record<string, string> = {
  PDF: 'bg-red-100 text-red-600',
  DOCX: 'bg-blue-100 text-blue-600',
  PPTX: 'bg-amber-100 text-amber-600',
  XLSX: 'bg-green-100 text-green-600',
};

export default function ProjectDetailPage() {
  const project = PROJECT;
  const supervisor = DUMMY_USERS.find(u => u.id === project.supervisor_id);
  const student = DUMMY_USERS.find(u => u.id === project.student_id);

  return (
    <DashboardShell
      basePath="/dashboard/coordinator"
      demoRole="coordinator"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard/coordinator' },
        { label: 'Projects', href: '/dashboard/coordinator/projects' },
        { label: project.title.slice(0, 40) + '...' },
      ]}
    >
      {/* Project header */}
      <div className="bg-white rounded-xl border border-slate-100 p-6 mb-6 shadow-sm">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge className={cn('text-xs border-0', STATUS_COLORS[project.status])}>
                {project.status.replace(/_/g, ' ')}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {STAGE_LABELS[project.current_stage]}
              </Badge>
              <Badge variant="outline" className="text-xs">{project.program}</Badge>
            </div>
            <h1 className="text-xl font-bold text-slate-900 leading-tight mb-2">{project.title}</h1>
            <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">{project.abstract}</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="outline" size="sm" className="h-9 gap-2 text-sm">
              <Upload className="w-4 h-4" />
              Upload Document
            </Button>
            <Button size="sm" className="h-9 bg-[#0B5ED7] hover:bg-[#0a52c4] gap-2 text-sm">
              <Send className="w-4 h-4" />
              Submit Stage
            </Button>
          </div>
        </div>

        {/* Meta */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-50">
          <div>
            <p className="text-xs text-slate-400 mb-1">Student</p>
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-sm font-medium text-slate-700">{student?.full_name ?? 'Unknown'}</span>
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">Supervisor</p>
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-sm font-medium text-slate-700">{supervisor?.full_name ?? 'Not assigned'}</span>
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">Start Date</p>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-sm font-medium text-slate-700">
                {project.start_date ? new Date(project.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : 'N/A'}
              </span>
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">Expected Completion</p>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-sm font-medium text-slate-700">
                {project.expected_completion ? new Date(project.expected_completion).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-4 pt-4 border-t border-slate-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-600">Overall Progress</span>
            <span className="text-sm font-bold text-slate-800">{project.progress_percentage}%</span>
          </div>
          <ProgressBar value={project.progress_percentage} className="h-2" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="workflow">
            <TabsList className="bg-slate-100 h-9 mb-4">
              <TabsTrigger value="workflow" className="text-xs h-7">Workflow</TabsTrigger>
              <TabsTrigger value="documents" className="text-xs h-7">Documents</TabsTrigger>
              <TabsTrigger value="comments" className="text-xs h-7">Comments</TabsTrigger>
              <TabsTrigger value="audit" className="text-xs h-7">Audit Trail</TabsTrigger>
            </TabsList>

            {/* Workflow tab */}
            <TabsContent value="workflow">
              <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-800 mb-5">Research Lifecycle Stages</h3>
                <div className="space-y-3">
                  {STAGE_ORDER.slice(0, -1).map((stage, i) => {
                    const currentIdx = STAGE_ORDER.indexOf(project.current_stage);
                    const done = i < currentIdx;
                    const active = i === currentIdx;
                    const upcoming = i > currentIdx;

                    return (
                      <div key={stage} className={cn(
                        'flex items-center gap-4 p-4 rounded-xl border transition-all',
                        active ? 'border-[#0B5ED7] bg-[#0B5ED7]/5' :
                        done ? 'border-slate-100 bg-slate-50/50' :
                        'border-slate-100 opacity-50'
                      )}>
                        <div className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                          active ? 'bg-[#0B5ED7] text-white' :
                          done ? 'bg-[#198754] text-white' :
                          'bg-slate-100 text-slate-400'
                        )}>
                          {done ? <CheckCircle className="w-4 h-4" /> : (i + 1)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={cn('text-sm font-medium', active ? 'text-[#0B5ED7]' : done ? 'text-slate-500' : 'text-slate-400')}>
                              {STAGE_LABELS[stage]}
                            </p>
                            {active && <Badge className="text-xs bg-[#0B5ED7]/10 text-[#0B5ED7] border-0">Current Stage</Badge>}
                            {done && <Badge className="text-xs bg-[#198754]/10 text-[#198754] border-0">Completed</Badge>}
                          </div>
                          {active && (
                            <p className="text-xs text-slate-400 mt-0.5">Status: {project.status.replace(/_/g, ' ')}</p>
                          )}
                        </div>
                        {active && (
                          <Button size="sm" variant="outline" className="h-8 text-xs shrink-0">
                            Take action
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </TabsContent>

            {/* Documents tab */}
            <TabsContent value="documents">
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between p-5 border-b border-slate-50">
                  <h3 className="text-sm font-semibold text-slate-800">Project Documents</h3>
                  <Button size="sm" className="h-8 text-xs bg-[#0B5ED7] hover:bg-[#0a52c4] gap-1.5">
                    <Plus className="w-3.5 h-3.5" />
                    Upload
                  </Button>
                </div>
                <div className="divide-y divide-slate-50">
                  {DOCUMENTS.map((doc, i) => (
                    <div key={i} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/50 transition-colors">
                      <div className={cn('px-2 py-1 rounded text-xs font-bold', DOC_COLORS[doc.type] ?? 'bg-slate-100 text-slate-600')}>
                        {doc.type}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 truncate">{doc.name}</p>
                        <p className="text-xs text-slate-400">{doc.stage} &bull; {doc.size} &bull; v{doc.version} &bull; {doc.uploaded}</p>
                      </div>
                      <Badge className={cn(
                        'text-xs border-0 shrink-0',
                        doc.status === 'approved' ? 'bg-green-100 text-green-700' :
                        doc.status === 'submitted' ? 'bg-blue-100 text-blue-700' :
                        'bg-slate-100 text-slate-600'
                      )}>
                        {doc.status}
                      </Badge>
                      <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 shrink-0">
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Comments tab */}
            <TabsContent value="comments">
              <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm space-y-5">
                {COMMENTS.map(comment => (
                  <div key={comment.id} className="flex gap-3.5">
                    <div className="w-9 h-9 bg-[#0B5ED7]/10 rounded-full flex items-center justify-center text-[#0B5ED7] text-xs font-bold shrink-0">
                      {comment.author.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="text-sm font-semibold text-slate-800">{comment.author}</span>
                        <Badge variant="outline" className="text-xs">{comment.role}</Badge>
                        {comment.internal && (
                          <Badge className="text-xs bg-amber-100 text-amber-700 border-0">Internal note</Badge>
                        )}
                        <span className="text-xs text-slate-400">{comment.time}</span>
                      </div>
                      <div className={cn(
                        'p-3 rounded-lg text-sm text-slate-700 leading-relaxed',
                        comment.internal ? 'bg-amber-50 border border-amber-100' : 'bg-slate-50'
                      )}>
                        {comment.content}
                      </div>
                    </div>
                  </div>
                ))}

                {/* New comment */}
                <div className="border-t border-slate-100 pt-5">
                  <textarea
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm text-slate-700 resize-none h-20 focus:outline-none focus:ring-2 focus:ring-[#0B5ED7]/20 focus:border-[#0B5ED7] bg-slate-50"
                    placeholder="Add a comment..."
                  />
                  <div className="flex justify-end mt-2 gap-2">
                    <Button variant="outline" size="sm" className="h-8 text-xs">Internal note</Button>
                    <Button size="sm" className="h-8 text-xs bg-[#0B5ED7] hover:bg-[#0a52c4]">Send comment</Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Audit tab */}
            <TabsContent value="audit">
              <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-slate-400" />
                  Audit Trail
                </h3>
                <div className="space-y-0">
                  {AUDIT_TRAIL.map((entry, i) => (
                    <div key={i} className="relative flex gap-4 pb-5 last:pb-0">
                      {i < AUDIT_TRAIL.length - 1 && (
                        <div className="absolute left-3.5 top-7 bottom-0 w-0.5 bg-slate-100" />
                      )}
                      <div className="w-7 h-7 bg-[#0B5ED7]/10 rounded-full flex items-center justify-center shrink-0 z-10">
                        <div className="w-2 h-2 bg-[#0B5ED7] rounded-full" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800">{entry.action}</p>
                        <p className="text-xs text-slate-500 mt-0.5">by {entry.user} &bull; {entry.time}</p>
                        {entry.detail && (
                          <p className="text-xs text-slate-400 mt-0.5">{entry.detail}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Mini workflow */}
          <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Stage Progress</h3>
            <WorkflowTracker currentStage={project.current_stage} status={project.status} />
          </div>

          {/* Actions */}
          <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Actions</h3>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full h-9 text-sm justify-start gap-2">
                <CheckCircle className="w-4 h-4 text-[#198754]" />
                Approve current stage
              </Button>
              <Button variant="outline" size="sm" className="w-full h-9 text-sm justify-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Request revision
              </Button>
              <Button variant="outline" size="sm" className="w-full h-9 text-sm justify-start gap-2">
                <Calendar className="w-4 h-4 text-[#0B5ED7]" />
                Schedule defense
              </Button>
              <Button variant="outline" size="sm" className="w-full h-9 text-sm justify-start gap-2">
                <User className="w-4 h-4 text-slate-500" />
                Reassign supervisor
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
