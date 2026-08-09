import type { ReactNode } from 'react';

type Tone = 'brand' | 'accent' | 'warm' | 'blue' | 'purple' | 'red' | 'gray' | 'green';

interface BadgeProps {
  children: ReactNode;
  tone?: Tone;
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

const tones: Record<Tone, string> = {
  brand: 'bg-brand-50 text-brand-700 border-brand-200',
  accent: 'bg-accent-50 text-accent-700 border-accent-200',
  warm: 'bg-warm-50 text-warm-600 border-warm-200',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-200',
  red: 'bg-red-50 text-red-700 border-red-200',
  gray: 'bg-ink-100 text-ink-600 border-ink-200',
  green: 'bg-brand-50 text-brand-700 border-brand-200',
};

const dotColors: Record<Tone, string> = {
  brand: 'bg-brand-500',
  accent: 'bg-accent-500',
  warm: 'bg-warm-400',
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
  red: 'bg-red-500',
  gray: 'bg-ink-400',
  green: 'bg-brand-500',
};

export function Badge({ children, tone = 'gray', size = 'sm', dot, className = '' }: BadgeProps) {
  const sizeCls = size === 'sm' ? 'text-xs px-2.5 py-0.5' : 'text-sm px-3 py-1';
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border ${tones[tone]} ${sizeCls} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[tone]}`} />}
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { tone: Tone; label: string }> = {
    POSTED: { tone: 'brand', label: 'Posted' },
    CLAIMED: { tone: 'blue', label: 'Claimed' },
    PICKUP_ASSIGNED: { tone: 'warm', label: 'Pickup Assigned' },
    PICKED_UP: { tone: 'accent', label: 'Picked Up' },
    DELIVERED: { tone: 'green', label: 'Delivered' },
    COMPLETED: { tone: 'green', label: 'Completed' },
    EXPIRED: { tone: 'red', label: 'Expired' },
    CANCELLED: { tone: 'gray', label: 'Cancelled' },
  };
  const cfg = map[status] || { tone: 'gray' as Tone, label: status };
  return (
    <Badge tone={cfg.tone} dot>
      {cfg.label}
    </Badge>
  );
}
