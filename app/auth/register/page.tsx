'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  FlaskConical, Loader2, Eye, EyeOff, ArrowLeft,
  University, Search, CheckCircle2, Hash, ChevronDown, ChevronUp,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ROLE_LABELS } from '@/lib/constants';
import { UserRole } from '@/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface UniversityOption {
  id: string;
  name: string;
  code: string;
  type: 'public' | 'private';
  county: string | null;
  country: string;
}

const schema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['student', 'supervisor', 'coordinator', 'examiner', 'peer_reviewer'] as const),
  university_id: z.string().min(1, 'Please select your university'),
  // Student-specific fields
  school_faculty: z.string().optional(),
  department: z.string().optional(),
  programme: z.string().optional(),
  level_of_study: z.enum(['undergraduate', 'masters', 'phd', '']).optional(),
  registration_number: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

// institution_admin and super_admin are assigned by administrators only
const REGISTER_ROLES: UserRole[] = ['student', 'supervisor', 'coordinator', 'examiner', 'peer_reviewer'];

const LEVEL_OF_STUDY_LABELS = {
  undergraduate: 'Undergraduate',
  masters: "Master's",
  phd: 'PhD',
} as const;

export default function RegisterPage() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [showPw, setShowPw] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [universities, setUniversities] = useState<UniversityOption[]>([]);
  const [uniSearch, setUniSearch] = useState('');
  const [uniLoading, setUniLoading] = useState(true);
  const [selectedUni, setSelectedUni] = useState<UniversityOption | null>(null);
  const [uniDropdownOpen, setUniDropdownOpen] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'student' },
  });

  const role = watch('role') as UserRole;
  const isStudent = role === 'student';

  useEffect(() => {
    async function fetchUniversities() {
      setUniLoading(true);
      const { data } = await supabase
        .from('universities')
        .select('id, name, code, type, county, country')
        .eq('status', 'active')
        .order('name');
      setUniversities((data as UniversityOption[]) ?? []);
      setUniLoading(false);
    }
    fetchUniversities();
  }, []);

  const filteredUniversities = universities.filter(u =>
    u.name.toLowerCase().includes(uniSearch.toLowerCase()) ||
    u.code.toLowerCase().includes(uniSearch.toLowerCase()) ||
    (u.county ?? '').toLowerCase().includes(uniSearch.toLowerCase())
  );

  function selectUniversity(u: UniversityOption) {
    setSelectedUni(u);
    setValue('university_id', u.id, { shouldValidate: true });
    setUniSearch(u.name);
    setUniDropdownOpen(false);
  }

  async function onSubmit(data: FormData) {
    setErrorMsg(null);

    const { error } = await signUp({
      email: data.email,
      password: data.password,
      full_name: data.full_name,
      role: data.role as UserRole,
      university_id: data.university_id,
      school_faculty: data.school_faculty || undefined,
      department: data.department || undefined,
      programme: data.programme || undefined,
      level_of_study: data.level_of_study || undefined,
      registration_number: data.registration_number || undefined,
    });

    if (error) { setErrorMsg(error); return; }
    toast.success('Account created! Please sign in.');
    router.push('/auth/login');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-[#0B5ED7] rounded-xl flex items-center justify-center shadow-lg">
              <FlaskConical className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900">ResearchFlow</span>
          </Link>
          <p className="text-slate-500 mt-2 text-sm">Create your account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
          <h1 className="text-xl font-semibold text-slate-900 mb-6">Create account</h1>

          {errorMsg && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{errorMsg}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full name */}
            <div className="space-y-1.5">
              <Label htmlFor="full_name">Full name</Label>
              <Input id="full_name" placeholder="e.g. Jane Mwangi" {...register('full_name')} />
              {errors.full_name && <p className="text-xs text-destructive">{errors.full_name.message}</p>}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email address</Label>
              <Input id="email" type="email" placeholder="you@university.ac.ke" {...register('email')} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  {...register('password')}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>

            {/* Role */}
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select
                value={role}
                onValueChange={(v) => setValue('role', v as FormData['role'])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {REGISTER_ROLES.map(r => (
                    <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* University selector */}
            <div className="space-y-1.5">
              <Label>University <span className="text-red-500">*</span></Label>
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <Input
                    placeholder={uniLoading ? 'Loading universities…' : 'Search by name, code, or county…'}
                    value={uniSearch}
                    onChange={(e) => {
                      setUniSearch(e.target.value);
                      setUniDropdownOpen(true);
                      if (selectedUni && e.target.value !== selectedUni.name) {
                        setSelectedUni(null);
                        setValue('university_id', '', { shouldValidate: false });
                      }
                    }}
                    onFocus={() => setUniDropdownOpen(true)}
                    onBlur={() => setTimeout(() => setUniDropdownOpen(false), 150)}
                    disabled={uniLoading}
                    className="pl-9 pr-9"
                  />
                  {selectedUni ? (
                    <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#198754] pointer-events-none" />
                  ) : (
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  )}
                </div>

                {uniDropdownOpen && !uniLoading && (
                  <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                    {filteredUniversities.length === 0 ? (
                      <div className="px-4 py-6 text-center">
                        <University className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">
                          {uniSearch ? 'No universities match your search.' : 'No universities registered yet.'}
                        </p>
                      </div>
                    ) : (
                      <ul className="max-h-56 overflow-y-auto divide-y divide-slate-50">
                        {filteredUniversities.map(u => (
                          <li key={u.id}>
                            <button
                              type="button"
                              onMouseDown={() => selectUniversity(u)}
                              className={cn(
                                'w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50 transition-colors',
                                selectedUni?.id === u.id && 'bg-blue-50'
                              )}
                            >
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-slate-800 truncate">{u.name}</p>
                                <p className="text-xs text-slate-400 mt-0.5">
                                  <span className={cn(
                                    'inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium mr-1.5',
                                    u.type === 'public' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-700'
                                  )}>
                                    {u.type === 'public' ? 'Public' : 'Private'}
                                  </span>
                                  {u.county && <>{u.county} &bull; </>}{u.country}
                                </p>
                              </div>
                              <span className="ml-3 shrink-0 inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-mono rounded-md">
                                <Hash className="w-3 h-3" />
                                {u.code}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              {selectedUni && (
                <div className="flex items-center gap-2 mt-2 p-2.5 bg-green-50 border border-green-100 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-[#198754] shrink-0" />
                  <p className="text-xs text-green-800">
                    Confirmed: <span className="font-semibold">{selectedUni.name}</span>
                    {' — '}University code: <span className="font-mono font-semibold">{selectedUni.code}</span>
                  </p>
                </div>
              )}

              {errors.university_id && (
                <p className="text-xs text-destructive">{errors.university_id.message}</p>
              )}

              <input type="hidden" {...register('university_id')} />
            </div>

            {/* Student-specific fields */}
            {isStudent && (
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Academic Details</p>

                {/* Level of study */}
                <div className="space-y-1.5">
                  <Label>Level of Study <span className="text-red-500">*</span></Label>
                  <Select
                    onValueChange={(v) => setValue('level_of_study', v as FormData['level_of_study'])}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your level" />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.entries(LEVEL_OF_STUDY_LABELS) as [string, string][]).map(([val, label]) => (
                        <SelectItem key={val} value={val}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* School / Faculty */}
                <div className="space-y-1.5">
                  <Label htmlFor="school_faculty">School / Faculty</Label>
                  <Input
                    id="school_faculty"
                    placeholder="e.g. School of Computing & Informatics"
                    {...register('school_faculty')}
                  />
                </div>

                {/* Department and Programme side by side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      placeholder="e.g. Computer Science"
                      {...register('department')}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="programme">Programme</Label>
                    <Input
                      id="programme"
                      placeholder="e.g. MSc Data Science"
                      {...register('programme')}
                    />
                  </div>
                </div>

                {/* Registration number */}
                <div className="space-y-1.5">
                  <Label htmlFor="registration_number">
                    Registration Number{' '}
                    <span className="text-slate-400 font-normal">(optional — can be added later)</span>
                  </Label>
                  <Input
                    id="registration_number"
                    placeholder="e.g. UON/CS/2022/001"
                    {...register('registration_number')}
                  />
                </div>
              </div>
            )}

            {/* Non-student department */}
            {!isStudent && (
              <div className="space-y-1.5">
                <Label htmlFor="department">
                  Department <span className="text-slate-400 font-normal">(optional)</span>
                </Label>
                <Input
                  id="department"
                  placeholder="e.g. Computer Science"
                  {...register('department')}
                />
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#0B5ED7] hover:bg-[#0a52c4] h-11 mt-2"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create account'}
            </Button>
          </form>

          <p className="text-sm text-center text-slate-500 mt-6">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-[#0B5ED7] font-medium hover:underline">Sign in</Link>
          </p>
        </div>

        {/* University not listed notice */}
        <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="flex items-start gap-3">
            <University className="w-5 h-5 text-[#0B5ED7] mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-slate-700">University not listed?</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Your university may not be in the registry.{' '}
                <Link href="/#contact" className="text-[#0B5ED7] hover:underline">Request it to be added</Link>
                {' '}or contact a platform administrator.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/auth/login" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
