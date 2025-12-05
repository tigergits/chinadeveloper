'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { defaultLocale } from '@/i18n/request';

export default function RootPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace(`/${defaultLocale}`);
  }, [router]);

  return null;
}

