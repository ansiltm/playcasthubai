'use client';
import { useState } from 'react';
import { Camera } from 'lucide-react';

export default function ProductPhoto({ src, name, className = '' }: { src?: string; name: string; className?: string }) {
  const [failedSource, setFailedSource] = useState<string>();
  if (!src || failedSource === src) return (
    <div className={`flex flex-col items-center justify-center gap-2 p-4 bg-bubble-input text-text-muted text-center ${className}`}>
      <Camera size={28} aria-hidden="true" />
      <span className="text-xs font-bold">Product photo coming soon</span>
      <span className="text-[10px] max-w-48">{name}</span>
    </div>
  );
  return <img src={src} alt={name} loading="lazy" decoding="async" onError={() => setFailedSource(src)} className={className} />;
}
