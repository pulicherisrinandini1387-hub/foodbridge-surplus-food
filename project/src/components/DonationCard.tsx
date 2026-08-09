import { MapPin, Clock, Bike, Utensils, Building2, Package } from 'lucide-react';
import type { Donation } from '@/types';
import { Card } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { ExpiryTimer } from '@/components/ui/ExpiryTimer';
import { Button } from '@/components/ui/Button';

interface DonationCardProps {
  donation: Donation;
  onView?: (d: Donation) => void;
  onClaim?: (d: Donation) => void;
  showClaim?: boolean;
  canClaim?: boolean;
  compact?: boolean;
}

const deliveryLabels: Record<string, { label: string; icon: typeof Bike }> = {
  NGO_PICKUP: { label: 'NGO Pickup', icon: Building2 },
  VOLUNTEER_REQUIRED: { label: 'Volunteer Pickup', icon: Bike },
  DONOR_DELIVERS: { label: 'Donor Delivers', icon: Package },
};

export function DonationCard({ donation, onView, onClaim, showClaim, canClaim = true, compact }: DonationCardProps) {
  const isExpired = new Date(donation.expiresAt).getTime() <= Date.now();
  const isClaimed = donation.status !== 'POSTED';
  const delivery = deliveryLabels[donation.deliveryOption];
  const DeliveryIcon = delivery.icon;

  const foodTypeTone = donation.foodType === 'Vegetarian' ? 'green' : donation.foodType === 'Vegan' ? 'green' : 'accent';

  const isUrgent = !isExpired && new Date(donation.expiresAt).getTime() - Date.now() < 30 * 60 * 1000;
  const urgencyBorder = isUrgent ? 'border-l-2 border-l-red-500/50' : isClaimed ? 'border-l-2 border-l-blue-500/50' : 'border-l-2 border-l-brand-500/50';

  return (
    <Card hover={!!onView} onClick={() => onView?.(donation)} className={`overflow-hidden group ${urgencyBorder}`}>
      {/* Image area */}
      <div
        className="h-32 relative flex items-end p-4"
        style={{ background: `linear-gradient(135deg, ${donation.imageColor}dd 0%, ${donation.imageColor}99 100%)` }}
      >
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 70% 60%, white 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }} />
        <div className="relative flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
              <Utensils className="w-5 h-5" />
            </div>
            <div className="text-white">
              <p className="text-2xl font-bold leading-none">{donation.meals}</p>
              <p className="text-xs font-medium opacity-90">meals</p>
            </div>
          </div>
          <Badge tone={foodTypeTone} className="bg-white/90 backdrop-blur-sm border-0">
            {donation.foodType}
          </Badge>
        </div>
        {isUrgent && !isExpired && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-red-500/90 text-white text-xs font-bold px-2 py-1 rounded-full backdrop-blur-sm">
            <Clock className="w-3 h-3" />
            URGENT
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-bold text-ink-900 text-base leading-tight">{donation.foodName}</h3>
          <p className="text-sm text-ink-500 mt-0.5">{donation.donorName}</p>
        </div>

        {!compact && (
          <div className="flex flex-wrap gap-2">
            <Badge tone="gray">{donation.category}</Badge>
            <Badge tone="gray">{donation.quantity}</Badge>
          </div>
        )}

        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1.5 text-ink-600">
            <MapPin className="w-4 h-4 text-ink-400" />
            {donation.distanceKm} km
          </span>
          {!isExpired && <ExpiryTimer expiresAt={donation.expiresAt} compact />}
          {isExpired && <StatusBadge status="EXPIRED" />}
        </div>

        <div className="flex items-center gap-1.5 text-sm text-ink-500">
          <DeliveryIcon className="w-4 h-4 text-ink-400" />
          {delivery.label}
        </div>

        {(showClaim || onView) && (
          <div className="flex gap-2 pt-1">
            {onView && (
              <Button variant="outline" size="sm" fullWidth onClick={(e) => { e.stopPropagation(); onView(donation); }}>
                View Details
              </Button>
            )}
            {showClaim && (
              <Button
                variant="primary"
                size="sm"
                fullWidth
                disabled={isExpired || isClaimed || !canClaim}
                onClick={(e) => { e.stopPropagation(); onClaim?.(donation); }}
              >
                {isExpired ? 'Expired' : isClaimed ? 'Claimed' : 'Claim'}
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
