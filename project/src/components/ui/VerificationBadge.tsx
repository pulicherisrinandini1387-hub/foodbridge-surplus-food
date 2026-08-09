import { CheckCircle2, ShieldCheck } from 'lucide-react';
import type { VerificationStatus } from '@/types';

export function VerificationBadge({ status, size = 'md' }: { status?: VerificationStatus; size?: 'sm' | 'md' }) {
  if (!status) return null;
  const sizeCls = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';

  if (status === 'verified') {
    return (
      <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20 ${sizeCls}`}>
        <ShieldCheck className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
        Verified
      </span>
    );
  }
  if (status === 'pending') {
    return (
      <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-warm-400/10 text-warm-400 border border-warm-400/20 ${sizeCls}`}>
        <span className="w-2 h-2 rounded-full bg-warm-400 animate-pulse" />
        Pending Verification
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-red-500/10 text-red-400 border border-red-500/20 ${sizeCls}`}>
      Rejected
    </span>
  );
}

export function VerifiedCheck({ status }: { status?: VerificationStatus }) {
  if (status === 'verified') {
    return <CheckCircle2 className="w-4 h-4 text-brand-400 inline-block" />;
  }
  return null;
}
