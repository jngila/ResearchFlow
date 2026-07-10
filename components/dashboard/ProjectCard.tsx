import { cn } from '@/lib/utils';
import { STATUS_COLORS, STAGE_LABELS } from '@/lib/constants';
import { ResearchProject } from '@/types';
import Link from 'next/link';
import { ChevronRight, User, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ui/progress-bar';

interface ProjectCardProps {
  project: ResearchProject;
  href: string;
  showStudent?: boolean;
  studentName?: string;
}

export default function ProjectCard({ project, href, showStudent, studentName }: ProjectCardProps) {
  return (
    <Link href={href} className="block group">
      <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-800 text-sm leading-snug group-hover:text-[#0B5ED7] transition-colors line-clamp-2">
              {project.title}
            </h3>
            {showStudent && studentName && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs text-slate-500">{studentName}</span>
              </div>
            )}
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#0B5ED7] shrink-0 mt-0.5 transition-colors" />
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Badge className={cn('text-xs border-0', STATUS_COLORS[project.status])}>
            {project.status.replace('_', ' ')}
          </Badge>
          <Badge variant="outline" className="text-xs text-slate-500">
            {STAGE_LABELS[project.current_stage]}
          </Badge>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Progress</span>
            <span className="font-semibold text-slate-700">{project.progress_percentage}%</span>
          </div>
          <ProgressBar value={project.progress_percentage} className="h-1.5" />
        </div>

        {project.expected_completion && (
          <div className="flex items-center gap-1.5 mt-3">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-400">
              Due {new Date(project.expected_completion).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
