'use client';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';

// Calls hydrate() once on client mount to load auth state from cookies.
// Must be rendered inside the root layout so it runs on every page.
export function HydrationProvider({ children }: { children: React.ReactNode }) {
  const hydrate = useAuthStore((s) => s.hydrate);
  useEffect(() => { hydrate(); }, [hydrate]);
  return <>{children}</>;
}
