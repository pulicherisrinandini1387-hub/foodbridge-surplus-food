import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { ExpiryTimer } from '@/components/ui/ExpiryTimer';
import { StatusTimeline } from '@/components/StatusTimeline';
import { MatchScore } from '@/components/MatchScore';
import { Avatar } from '@/components/ui/Avatar';
import { VerificationBadge } from '@/components/ui/VerificationBadge';
import {
  MapPin, Clock, Utensils, Bike, Building2, Package, Phone, User,
  ShieldCheck, AlertTriangle, CheckCircle2, Navigation, MessageSquare,
} from 'lucide-react';
import type { Donation, MatchResult } from '@/types';
import { useApp } from '@/store/AppContext';
import { useToast } from '@/components/ui/Toast';
import { useState } from 'react';

interface DonationModalProps {
  donation: Donation | null;
  open: boolean;
  onClose: () => void;
  onClaim?: (d: Donation) => void;
  showMatches?: boolean;
  canClaim?: boolean;
}

export function DonationModal({ donation, open, onClose, onClaim, showMatches, canClaim = true }: DonationModalProps) {
  const { calculateMatches, users, startConversation } = useApp();
  const { show } = useToast();
  const [confirming, setConfirming] = useState(false);

  if (!donation) return null;

  const isExpired = new Date(donation.expiresAt).getTime() <= Date.now();
  const isClaimed = donation.status !== 'POSTED';
  const matches = showMatches ? calculateMatches(donation.id).slice(0, 3) : [];

  const deliveryLabels: Record<string, string> = {
    NGO_PICKUP: 'NGO will pick up',
    VOLUNTEER_REQUIRED: 'Volunteer pickup required',
    DONOR_DELIVERS: 'Donor will deliver',
  };

  const ngo = users.find((u) => u.id === donation.claimedBy);
  const volunteer = users.find((u) => u.id === donation.volunteerId);

  const handleClaim = () => {
    setConfirming(false);
    onClaim?.(donation);
  };

  return (
    <Modal open={open} onClose={onClose} size="lg" title="Donation Details">
      <div className="space-y-5">
        {/* Header */}
        <div
          className="h-32 rounded-xl relative flex items-end p-5"
          style={{ background: `linear-gradient(135deg, ${donation.imageColor}dd, ${donation.imageColor}99)` }}
        >
          <div className="text-white">
            <p className="text-3xl font-bold leading-none">{donation.meals} meals</p>
            <p className="text-sm opacity-90 mt-1">{donation.quantity}</p>
          </div>
          <div className="absolute top-4 right-4">
            <StatusBadge status={donation.status} />
          </div>
        </div>

        {/* Title */}
        <div>
          <h3 className="text-xl font-bold text-ink-900">{donation.foodName}</h3>
          <div className="flex items-center gap-2 mt-1">
            <Avatar name={donation.donorName} color={donation.imageColor} size="xs" />
            <span className="text-sm text-ink-600 font-medium">{donation.donorName}</span>
            <Badge tone="gray">{donation.donorType}</Badge>
          </div>
        </div>

        {/* Key info grid */}
        <div className="grid grid-cols-2 gap-3">
          <InfoItem icon={MapPin} label="Distance" value={`${donation.distanceKm} km`} />
          <InfoItem icon={Clock} label="Expiry" value={isExpired ? 'Expired' : <ExpiryTimer expiresAt={donation.expiresAt} compact />} />
          <InfoItem icon={Utensils} label="Category" value={donation.category} />
          <InfoItem icon={Bike} label="Delivery" value={deliveryLabels[donation.deliveryOption]} />
        </div>

        {/* Food details */}
        <div className="rounded-xl border border-ink-100 bg-surface-3 p-4 space-y-2.5">
          <h4 className="font-semibold text-ink-800 text-sm">Food Information</h4>
          <DetailRow label="Food Type" value={donation.foodType} />
          <DetailRow label="Preparation Time" value={donation.preparationTime} />
          <DetailRow label="Best Before" value={donation.bestBefore} />
          <DetailRow label="Condition" value={donation.condition} />
          <DetailRow label="Packaging" value={donation.packaging} />
          {donation.allergens.length > 0 && (
            <DetailRow label="Allergens" value={donation.allergens.join(', ')} />
          )}
          {donation.safetyDeclared && (
            <div className="flex items-center gap-2 text-sm text-brand-600 font-medium pt-1">
              <ShieldCheck className="w-4 h-4" />
              Food safety declaration confirmed
            </div>
          )}
        </div>

        {/* Pickup details */}
        <div className="rounded-xl border border-ink-100 bg-surface-3 p-4 space-y-2.5">
          <h4 className="font-semibold text-ink-800 text-sm">Pickup Information</h4>
          <DetailRow label="Address" value={donation.pickupAddress} />
          <DetailRow label="Available From" value={donation.pickupFrom} />
          <DetailRow label="Pickup Deadline" value={donation.pickupDeadline} />
          <DetailRow label="Contact Person" value={donation.contactPerson} />
          <DetailRow label="Contact Phone" value={donation.contactPhone} />
        </div>

        {/* Status timeline */}
        {isClaimed && (
          <div className="rounded-xl border border-ink-100 bg-surface-3 p-4">
            <h4 className="font-semibold text-ink-800 text-sm mb-4">Delivery Status</h4>
            <StatusTimeline status={donation.status} />
            {ngo && (
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-ink-100">
                <Avatar name={ngo.name} color={ngo.avatarColor} size="sm" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-ink-900">{ngo.name}</p>
                  <VerificationBadge status={ngo.verified} size="sm" />
                </div>
              </div>
            )}
            {volunteer && (
              <div className="flex items-center gap-2 mt-3">
                <Avatar name={volunteer.name} color={volunteer.avatarColor} size="sm" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-ink-900">{volunteer.name}</p>
                  <p className="text-xs text-ink-500">Volunteer • {volunteer.vehicleType}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Smart matches */}
        {showMatches && matches.length > 0 && (
          <div>
            <h4 className="font-semibold text-ink-800 text-sm mb-3">Smart Matches — Best NGOs for this donation</h4>
            <div className="space-y-2">
              {matches.map((m, i) => (
                <MatchScore key={m.ngoId} match={m} rank={i} />
              ))}
            </div>
          </div>
        )}

        {/* Expired warning */}
        {isExpired && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <p className="text-sm font-medium text-red-600">This donation has expired and can no longer be claimed.</p>
          </div>
        )}

        {/* Already claimed */}
        {isClaimed && !isExpired && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 border border-blue-200">
            <CheckCircle2 className="w-5 h-5 text-blue-500" />
            <p className="text-sm font-medium text-blue-600">This donation has been claimed by {donation.claimedBy ? ngo?.name : 'an NGO'}.</p>
          </div>
        )}

        {/* Actions */}
        {onClaim && !isClaimed && !isExpired && canClaim && (
          confirming ? (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-brand-50 border border-brand-200">
                <p className="text-sm text-ink-700">
                  You are about to claim <strong className="text-ink-900">{donation.meals} {donation.foodType.toLowerCase()}</strong> meals from <strong className="text-ink-900">{donation.donorName}</strong>.
                </p>
                <div className="mt-2 text-xs text-ink-500 space-y-0.5">
                  <p>Pickup: {donation.pickupAddress}</p>
                  <p>Expiry: <ExpiryTimer expiresAt={donation.expiresAt} compact /></p>
                  <p>Distance: {donation.distanceKm} km</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" fullWidth onClick={() => setConfirming(false)}>Cancel</Button>
                <Button fullWidth onClick={handleClaim}>
                  <CheckCircle2 className="w-4 h-4" /> Confirm Claim
                </Button>
              </div>
            </div>
          ) : (
            <Button fullWidth size="lg" onClick={() => setConfirming(true)}>
              Claim Donation
            </Button>
          )
        )}

        {onClaim && (!canClaim || isClaimed || isExpired) && (
          <Button variant="outline" fullWidth size="lg" disabled>
            {isExpired ? 'Expired' : isClaimed ? 'Already Claimed' : 'Verification Required'}
          </Button>
        )}
      </div>
    </Modal>
  );
}

function InfoItem({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 p-3 rounded-xl bg-surface-3 border border-ink-100">
      <Icon className="w-4 h-4 text-ink-400 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-ink-500">{label}</p>
        <p className="text-sm font-semibold text-ink-800 truncate">{value}</p>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-ink-500 shrink-0">{label}</span>
      <span className="text-ink-800 font-medium text-right">{value}</span>
    </div>
  );
}
