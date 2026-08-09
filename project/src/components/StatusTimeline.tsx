import { motion } from 'framer-motion';
import { Check, Clock, Circle } from 'lucide-react';
import type { DonationStatus } from '@/types';

const steps: { status: DonationStatus; label: string }[] = [
  { status: 'POSTED', label: 'Posted' },
  { status: 'CLAIMED', label: 'Claimed' },
  { status: 'PICKUP_ASSIGNED', label: 'Assigned' },
  { status: 'PICKED_UP', label: 'Picked Up' },
  { status: 'DELIVERED', label: 'Delivered' },
  { status: 'COMPLETED', label: 'Completed' },
];

const statusOrder: Record<DonationStatus, number> = {
  POSTED: 0,
  CLAIMED: 1,
  PICKUP_ASSIGNED: 2,
  PICKED_UP: 3,
  DELIVERED: 4,
  COMPLETED: 5,
  EXPIRED: -1,
  CANCELLED: -1,
};

export function StatusTimeline({ status, cancelled }: { status: DonationStatus; cancelled?: boolean }) {
  const currentIndex = statusOrder[status];

  if (cancelled || currentIndex < 0) {
    return (
      <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 border border-red-200">
        <Circle className="w-5 h-5 text-red-500" />
        <span className="font-semibold text-red-600">
          {status === 'EXPIRED' ? 'This donation has expired' : 'This donation was cancelled'}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-1">
      {steps.map((step, i) => {
        const isDone = i <= currentIndex;
        const isCurrent = i === currentIndex;
        return (
          <div key={step.status} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isDone
                    ? isCurrent
                      ? 'bg-brand-500 text-white shadow-glow ring-4 ring-brand-500/20'
                      : 'bg-brand-600 text-white'
                    : 'bg-surface-3 text-ink-400 border border-ink-200'
                }`}
              >
                {isDone && !isCurrent ? <Check className="w-4 h-4" /> : isCurrent ? <Clock className="w-4 h-4 animate-pulse" /> : <span className="text-xs font-bold">{i + 1}</span>}
              </motion.div>
              <span className={`text-xs font-medium text-center w-16 ${isDone ? 'text-ink-700' : 'text-ink-400'}`}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="flex-1 h-0.5 mx-1 rounded-full bg-ink-100 relative overflow-hidden -mt-5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: i < currentIndex ? '100%' : '0%' }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="absolute inset-y-0 left-0 bg-brand-500 rounded-full"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
