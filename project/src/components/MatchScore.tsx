import { motion } from 'framer-motion';
import type { MatchResult } from '@/types';
import { Trophy, MapPin, Check } from 'lucide-react';

export function MatchScore({ match, rank }: { match: MatchResult; rank: number }) {
  const medals = ['🥇', '🥈', '🥉'];
  const medal = medals[rank] || `#${rank + 1}`;
  const scoreColor =
    match.score >= 85 ? 'text-brand-600' : match.score >= 70 ? 'text-accent-600' : 'text-ink-500';
  const barColor =
    match.score >= 85 ? 'bg-brand-500' : match.score >= 70 ? 'bg-accent-500' : 'bg-ink-400';

  const urgencyTone: Record<string, string> = {
    critical: 'bg-red-50 text-red-600 border-red-200',
    high: 'bg-accent-50 text-accent-600 border-accent-200',
    medium: 'bg-warm-50 text-warm-600 border-warm-200',
    normal: 'bg-ink-50 text-ink-500 border-ink-200',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.08 }}
      className="flex items-center gap-4 p-4 rounded-xl bg-white border border-ink-100 hover:shadow-card-hover transition-all duration-300"
    >
      <div className="text-2xl shrink-0 w-10 text-center">{medal}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-bold text-ink-900 truncate">{match.ngoName}</h4>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize border ${urgencyTone[match.urgency]}`}>
            {match.urgency}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-1 text-sm text-ink-500">
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {match.distanceKm} km
          </span>
          <span>Needs {match.mealsNeeded} meals</span>
          <span className={match.pickupAvailable ? 'text-brand-600' : 'text-accent-600'}>
            {match.pickupAvailable ? 'Pickup available' : 'Volunteer required'}
          </span>
        </div>
        {match.reasons.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {match.reasons.slice(0, 3).map((r, i) => (
              <span key={i} className="inline-flex items-center gap-1 text-xs text-ink-500 bg-surface-3 px-2 py-0.5 rounded-md">
                <Check className="w-3 h-3 text-brand-600" />
                {r}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="shrink-0 text-right">
        <div className={`text-2xl font-bold ${scoreColor}`}>{match.score}%</div>
        <div className="w-20 h-1.5 bg-ink-100 rounded-full overflow-hidden mt-1">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${match.score}%` }}
            transition={{ delay: rank * 0.08 + 0.2, duration: 0.6 }}
            className={`h-full rounded-full ${barColor}`}
          />
        </div>
      </div>
    </motion.div>
  );
}
