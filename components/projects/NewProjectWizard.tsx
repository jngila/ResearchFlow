'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  FlaskConical, GraduationCap, BookOpen, Award,
  ChevronRight, ChevronLeft, Calendar, Clock,
  Sparkles, Loader2, CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  PROJECT_TYPE_LABELS, PROJECT_TYPE_DURATIONS, MASTERS_DURATION_OPTIONS, KES_PRICING,
} from '@/lib/constants';
import { calcProjectDeadline, formatDeadlineDate, formatKes } from '@/lib/project-utils';
import { ProjectType } from '@/types';
import PaymentModal from '@/components/payments/PaymentModal';
import { toast } from 'sonner';

interface NewProjectWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
}

type Step = 'type' | 'details' | 'duration' | 'confirm' | 'payment' | 'done';

const detailsSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters'),
  abstract: z.string().min(50, 'Abstract must be at least 50 characters'),
  field_of_study: z.string().min(2),
  program: z.string().min(2),
  department: z.string().optional(),
});

type DetailsForm = z.infer<typeof detailsSchema>;

const PROJECT_TYPE_ICONS: Record<ProjectType, React.ElementType> = {
  undergraduate: GraduationCap,
  masters_thesis: BookOpen,
  phd_dissertation: Award,
};

const PROJECT_TYPE_DESC: Record<ProjectType, string> = {
  undergraduate: 'Fixed 6-month license. Ideal for final year undergraduate research projects.',
  masters_thesis: "Select 4–12 months based on your program. KES 1,000 license.",
  phd_dissertation: 'Fixed 24-month license. Comprehensive doctoral research program.',
};

export default function NewProjectWizard({ open, onOpenChange, onCreated }: NewProjectWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>('type');
  const [projectType, setProjectType] = useState<ProjectType | null>(null);
  const [selectedMonths, setSelectedMonths] = useState<number>(6);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const { register, handleSubmit, formState: { errors }, getValues } = useForm<DetailsForm>({
    resolver: zodResolver(detailsSchema),
  });

  const startDate = new Date();
  const durationMonths = projectType
    ? (PROJECT_TYPE_DURATIONS[projectType] ?? selectedMonths)
    : 6;
  const deadline = projectType ? calcProjectDeadline(startDate, projectType, selectedMonths) : null;

  function reset() {
    setStep('type');
    setProjectType(null);
    setSelectedMonths(6);
  }

  function handleClose(open: boolean) {
    if (!open) reset();
    onOpenChange(open);
  }

  function handleTypeSelect(type: ProjectType) {
    setProjectType(type);
  }

  function handleDetailsNext(data: DetailsForm) {
    if (projectType === 'masters_thesis') {
      setStep('duration');
    } else {
      setStep('confirm');
    }
  }

  function handlePaymentSuccess() {
    setPaymentModalOpen(false);
    setCreating(true);
    // In production: write to Supabase here
    setTimeout(() => {
      setCreating(false);
      setStep('done');
      toast.success('Project registered and license activated!');
      onCreated?.();
    }, 1000);
  }

  const STEPS: Step[] = ['type', 'details', projectType === 'masters_thesis' ? 'duration' : '', 'confirm'].filter(Boolean) as Step[];
  const currentStepIndex = STEPS.indexOf(step);

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-[#0B5ED7]" />
              Register New Research Project
            </DialogTitle>
          </DialogHeader>

          {/* Step indicator */}
          {step !== 'done' && (
            <div className="flex items-center gap-1.5 mb-2">
              {['type', 'details', 'confirm'].map((s, i) => (
                <div key={s} className="flex items-center gap-1.5">
                  <div className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                    currentStepIndex >= i
                      ? 'bg-[#0B5ED7] text-white'
                      : 'bg-slate-100 text-slate-400'
                  )}>
                    {i + 1}
                  </div>
                  <span className={cn('text-xs hidden sm:block', currentStepIndex >= i ? 'text-slate-700' : 'text-slate-400')}>
                    {s === 'type' ? 'Project Type' : s === 'details' ? 'Details' : 'Confirm'}
                  </span>
                  {i < 2 && <ChevronRight className="w-3.5 h-3.5 text-slate-300" />}
                </div>
              ))}
            </div>
          )}

          {/* ── Step: Project Type ── */}
          {step === 'type' && (
            <div className="space-y-3">
              <p className="text-sm text-slate-600 mb-4">
                Select your project type. Each type has different duration requirements and licensing terms.
              </p>
              {(['undergraduate', 'masters_thesis', 'phd_dissertation'] as ProjectType[]).map(type => {
                const Icon = PROJECT_TYPE_ICONS[type];
                const fixed = PROJECT_TYPE_DURATIONS[type];
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleTypeSelect(type)}
                    className={cn(
                      'w-full flex items-start gap-4 p-5 rounded-xl border-2 text-left transition-all',
                      projectType === type
                        ? 'border-[#0B5ED7] bg-blue-50'
                        : 'border-slate-100 hover:border-slate-300'
                    )}
                  >
                    <div className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center shrink-0',
                      projectType === type ? 'bg-[#0B5ED7] text-white' : 'bg-slate-100 text-slate-500'
                    )}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <p className="font-semibold text-slate-800">{PROJECT_TYPE_LABELS[type]}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {fixed ? `${fixed} months` : '4–12 months (you choose)'}
                          </Badge>
                          <Badge className="bg-blue-100 text-blue-700 border-0 text-xs">
                            {formatKes(KES_PRICING.studentProjectLicense)}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-slate-500 mt-1">{PROJECT_TYPE_DESC[type]}</p>
                    </div>
                  </button>
                );
              })}
              <Button
                className="w-full bg-[#0B5ED7] hover:bg-[#0a52c4] h-11 mt-2"
                disabled={!projectType}
                onClick={() => setStep('details')}
              >
                Continue
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}

          {/* ── Step: Project Details ── */}
          {step === 'details' && (
            <form onSubmit={handleSubmit(handleDetailsNext)} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Research Title</Label>
                <Input placeholder="Enter the full title of your research project" {...register('title')} className="bg-slate-50" />
                {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Abstract <span className="text-slate-400 font-normal">(min. 50 words)</span></Label>
                <Textarea
                  placeholder="Provide a brief summary of your research — objectives, methodology, and expected outcomes."
                  {...register('abstract')}
                  rows={4}
                  className="bg-slate-50 resize-none"
                />
                {errors.abstract && <p className="text-xs text-destructive">{errors.abstract.message}</p>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Field of Study</Label>
                  <Input placeholder="e.g. Computer Science" {...register('field_of_study')} className="bg-slate-50" />
                  {errors.field_of_study && <p className="text-xs text-destructive">{errors.field_of_study.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Program</Label>
                  <Input placeholder="e.g. PhD Computer Science" {...register('program')} className="bg-slate-50" />
                  {errors.program && <p className="text-xs text-destructive">{errors.program.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Department <span className="text-slate-400 font-normal">(optional)</span></Label>
                  <Input placeholder="e.g. School of Computing" {...register('department')} className="bg-slate-50" />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setStep('type')}>
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
                <Button type="submit" className="flex-1 bg-[#0B5ED7] hover:bg-[#0a52c4]">
                  Continue
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </form>
          )}

          {/* ── Step: Duration (Masters only) ── */}
          {step === 'duration' && (
            <div className="space-y-5">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
                <p className="font-semibold mb-1">Select your intended completion period</p>
                <p className="text-blue-700 text-xs">
                  Choose the duration that best fits your research plan. Your project deadline will be calculated automatically from today.
                  You can purchase a 6-month extension later if needed.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {MASTERS_DURATION_OPTIONS.map(months => (
                  <button
                    key={months}
                    type="button"
                    onClick={() => setSelectedMonths(months)}
                    className={cn(
                      'p-4 rounded-xl border-2 text-center transition-all',
                      selectedMonths === months
                        ? 'border-[#0B5ED7] bg-blue-50 text-[#0B5ED7]'
                        : 'border-slate-100 hover:border-slate-300 text-slate-600'
                    )}
                  >
                    <p className="text-xl font-bold leading-none">{months}</p>
                    <p className="text-xs mt-1">months</p>
                  </button>
                ))}
              </div>
              {deadline && (
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-100 rounded-xl">
                  <Calendar className="w-5 h-5 text-[#198754] shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-green-900">
                      Your deadline: <span className="font-bold">{formatDeadlineDate(deadline)}</span>
                    </p>
                    <p className="text-xs text-green-700 mt-0.5">
                      Starting today &rarr; {selectedMonths} months &rarr; {formatDeadlineDate(deadline)}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep('details')}>
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
                <Button
                  className="flex-1 bg-[#0B5ED7] hover:bg-[#0a52c4]"
                  onClick={() => setStep('confirm')}
                >
                  Continue
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* ── Step: Confirm & Pay ── */}
          {step === 'confirm' && projectType && deadline && (
            <div className="space-y-5">
              <div className="bg-white border border-slate-100 rounded-xl p-5 space-y-3 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-800">Project Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex gap-2">
                    <span className="text-slate-400 w-28 shrink-0">Type</span>
                    <span className="font-medium text-slate-800">{PROJECT_TYPE_LABELS[projectType]}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-slate-400 w-28 shrink-0">Title</span>
                    <span className="font-medium text-slate-800 leading-snug">{getValues('title')}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-slate-400 w-28 shrink-0">Duration</span>
                    <span className="font-medium text-slate-800">{durationMonths} months</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-slate-400 w-28 shrink-0">Start date</span>
                    <span className="font-medium text-slate-800">{formatDeadlineDate(startDate)}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-slate-400 w-28 shrink-0">Deadline</span>
                    <span className="font-bold text-[#0B5ED7]">{formatDeadlineDate(deadline)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-xl p-4 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-900">AI Project Planner included</p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    Upon payment, ResearchFlow will automatically generate a complete research roadmap with milestones, phases, weekly tasks, and a Gantt chart tailored to your {durationMonths}-month timeline.
                  </p>
                </div>
              </div>

              <div className="bg-white border border-slate-100 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-800">Student Project License</p>
                  <p className="text-xs text-slate-500">One-time payment &bull; Valid for {durationMonths} months</p>
                </div>
                <p className="text-xl font-bold text-[#0B5ED7]">{formatKes(KES_PRICING.studentProjectLicense)}</p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep(projectType === 'masters_thesis' ? 'duration' : 'details')}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
                <Button
                  className="flex-1 bg-[#0B5ED7] hover:bg-[#0a52c4] h-11"
                  onClick={() => setPaymentModalOpen(true)}
                >
                  Pay {formatKes(KES_PRICING.studentProjectLicense)} &amp; Register
                </Button>
              </div>
            </div>
          )}

          {/* ── Step: Done ── */}
          {(step === 'done' || creating) && (
            <div className="flex flex-col items-center py-8 gap-4 text-center">
              {creating ? (
                <>
                  <Loader2 className="w-10 h-10 text-[#0B5ED7] animate-spin" />
                  <p className="text-sm font-medium text-slate-700">Setting up your project and generating AI roadmap…</p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-[#198754]" />
                  </div>
                  <p className="text-lg font-bold text-slate-900">Project Registered!</p>
                  <p className="text-sm text-slate-500">
                    Your project license is active. Your AI-generated research roadmap and milestones are ready.
                  </p>
                  <Button
                    className="bg-[#0B5ED7] hover:bg-[#0a52c4] mt-2"
                    onClick={() => handleClose(false)}
                  >
                    View my projects
                  </Button>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <PaymentModal
        open={paymentModalOpen}
        onOpenChange={setPaymentModalOpen}
        title="Student Project License"
        description={`${PROJECT_TYPE_LABELS[projectType ?? 'masters_thesis']} — ${durationMonths} months`}
        amountKes={KES_PRICING.studentProjectLicense}
        onSuccess={handlePaymentSuccess}
      />
    </>
  );
}
