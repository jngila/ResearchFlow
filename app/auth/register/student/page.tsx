'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function StudentRegisterPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/auth/register?role=student');
  }, [router]);
  return null;
}
