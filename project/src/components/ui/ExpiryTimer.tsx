import { useEffect, useState } from 'react';

interface ExpiryTimerProps {
  expiresAt: string;
  compact?: boolean;
}

export function ExpiryTimer({ expiresAt, compact }: ExpiryTimerProps) {
  const [remaining, setRemaining] = useState<number>(0);

  useEffect(() => {
    const update = () => {
      setRemaining(Math.max(0, new Date(expiresAt).getTime() - Date.now()));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const totalSec = Math.floor(remaining / 1000);
  const hours = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;

  const isExpired = remaining <= 0;
  const isUrgent = remaining <= 30 * 60 * 1000 && !isExpired;
  const isWarning = remaining <= 60 * 60 * 1000 && !isUrgent;

  if (isExpired) {
    return (
      <span className={`inline-flex items-center gap-1.5 font-semibold ${compact ? 'text-xs' : 'text-sm'} text-red-400`}>
        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
        Expired
      </span>
    );
  }

  const color = isUrgent ? 'text-red-400' : isWarning ? 'text-accent-400' : 'text-ink-300';
  const dot = isUrgent ? 'bg-red-500 animate-pulse' : isWarning ? 'bg-accent-500' : 'bg-brand-500';

  const pad = (n: number) => String(n).padStart(2, '0');
  const timeStr = hours > 0 ? `${hours}:${pad(mins)}:${pad(secs)}` : `${pad(mins)}:${pad(secs)}`;

  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold ${compact ? 'text-xs' : 'text-sm'} ${color} tabular-nums`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {isUrgent && !compact && 'Expires in '}
      {isWarning && !compact && !isUrgent && 'Expires in '}
      {!isUrgent && !isWarning && !compact && 'Expires in '}
      {timeStr}
    </span>
  );
}
