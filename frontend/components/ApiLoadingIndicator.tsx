'use client';

import { useEffect, useState } from 'react';
import { LoaderCircle } from 'lucide-react';
import { useRequestActivity } from '../lib/requestActivity';

export default function ApiLoadingIndicator() {
  const pending = useRequestActivity(state => state.pending);
  const busy = pending > 0;
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    setSlow(false);
    if (!busy) return;
    const timer = setTimeout(() => setSlow(true), 10000);
    return () => clearTimeout(timer);
  }, [busy]);
  if (!busy) return null;
  return (
    <div data-testid="api-loading" className="pointer-events-none fixed inset-0 z-[100]" role="status" aria-live="polite" aria-atomic="true">
      <div className="absolute inset-x-0 top-0 h-1 bg-primary/20 overflow-hidden" aria-hidden="true">
        <div className="h-full w-full bg-primary motion-safe:animate-pulse" />
      </div>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full bg-bubble-surface px-5 py-3 text-sm font-bold text-text-main shadow-xl border border-border-main whitespace-nowrap">
        <LoaderCircle className="text-primary motion-safe:animate-spin" size={20} aria-hidden="true" />
        <span>{slow ? 'Still working, please wait…' : 'Loading, please wait…'}</span>
        <span className="sr-only">{pending} active {pending === 1 ? 'request' : 'requests'}</span>
      </div>
    </div>
  );
}
