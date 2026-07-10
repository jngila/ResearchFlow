'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function DashboardRouter() {
  const { profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!profile) {
      // Not signed in — go to demo student dashboard
      router.replace('/dashboard/student');
      return;
    }

    const role = profile.role;
    const destinations: Record<string, string> = {
      student: '/dashboard/student',
      supervisor: '/dashboard/supervisor',
      coordinator: '/dashboard/coordinator',
      examiner: '/dashboard/examiner',
      peer_reviewer: '/dashboard/peer-reviewer',
      institution_admin: '/dashboard/admin',
      super_admin: '/dashboard/super-admin',
    };

    router.replace(destinations[role] ?? '/dashboard/student');
  }, [profile, loading, router]);

  return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <Loader2 className="w-8 h-8 text-[#0B5ED7] animate-spin mx-auto mb-3" />
        <p className="text-slate-500 text-sm">Loading your dashboard...</p>
      </div>
    </div>
  );
}
