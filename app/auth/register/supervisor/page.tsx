'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SupervisorRegisterPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/auth/register?role=supervisor');
  }, [router]);
  return null;
}
