import { useState } from 'react';
import { DashboardLayout, PageHeader } from '@/components/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { ExpiryTimer } from '@/components/ui/ExpiryTimer';
import { EmptyState } from '@/components/ui/EmptyState';
import { DonationModal } from '@/components/DonationModal';
import { useApp } from '@/store/AppContext';
import { DonationCard } from '@/components/DonationCard';
import { Utensils, Search } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import type { Donation, DonationStatus } from '@/types';

export function MyDonations() {
  const { donations, currentUserId } = useApp();
  const [selected, setSelected] = useState<Donation | null>(null);
  const [filter, setFilter] = useState<'all' | DonationStatus>('all');
  const [search, setSearch] = useState('');

  const myDonations = donations.filter((d) => d.donorId === currentUserId);
  const filtered = myDonations.filter((d) => {
    if (filter !== 'all' && d.status !== filter) return false;
    if (search && !d.foodName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const filters: { value: 'all' | DonationStatus; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'POSTED', label: 'Posted' },
    { value: 'CLAIMED', label: 'Claimed' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'EXPIRED', label: 'Expired' },
  ];

  return (
    <DashboardLayout>
      <PageHeader title="My Donations" subtitle="All donations you've posted" />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <input
            type="text"
            placeholder="Search donations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-11 pr-4 rounded-xl bg-white border border-ink-200 text-sm outline-none focus:border-brand-500 transition-colors"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                filter === f.value ? 'bg-brand-600 text-white' : 'bg-white border border-ink-200 text-ink-600 hover:bg-ink-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Utensils className="w-7 h-7" />}
            title="No donations found"
            description="Try adjusting your filters or post a new donation."
          />
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((d) => (
            <DonationCard key={d.id} donation={d} onView={setSelected} />
          ))}
        </div>
      )}

      <DonationModal donation={selected} open={!!selected} onClose={() => setSelected(null)} showMatches />
    </DashboardLayout>
  );
}

export function ActiveDonations() {
  const { donations, currentUserId } = useApp();
  const [selected, setSelected] = useState<Donation | null>(null);

  const activeStatuses = ['POSTED', 'CLAIMED', 'PICKUP_ASSIGNED', 'PICKED_UP', 'DELIVERED'];
  const active = donations.filter((d) => d.donorId === currentUserId && activeStatuses.includes(d.status));

  return (
    <DashboardLayout>
      <PageHeader title="Active Donations" subtitle="Donations currently in progress" />

      {active.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Utensils className="w-7 h-7" />}
            title="No active donations"
            description="Your active donations will appear here once posted and claimed."
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {active.map((d) => (
            <Card key={d.id} className="p-5" hover onClick={() => setSelected(d)}>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shrink-0" style={{ backgroundColor: d.imageColor }}>
                  <Utensils className="w-7 h-7" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-ink-900">{d.foodName}</h3>
                    <StatusBadge status={d.status} />
                  </div>
                  <p className="text-sm text-ink-500 mt-0.5">{d.meals} meals • {d.quantity}</p>
                  {d.claimedByName && <p className="text-sm text-brand-600 mt-0.5">Claimed by {d.claimedByName}</p>}
                  {d.volunteerName && <p className="text-sm text-accent-600 mt-0.5">Volunteer: {d.volunteerName}</p>}
                </div>
                <ExpiryTimer expiresAt={d.expiresAt} />
              </div>
            </Card>
          ))}
        </div>
      )}

      <DonationModal donation={selected} open={!!selected} onClose={() => setSelected(null)} showMatches />
    </DashboardLayout>
  );
}

export function PickupRequests() {
  const { donations, currentUserId, users, updateDonationStatus } = useApp();
  const { show } = useToast();
  const [selected, setSelected] = useState<Donation | null>(null);

  const pickupDonations = donations.filter(
    (d) => d.donorId === currentUserId && (d.status === 'CLAIMED' || d.status === 'PICKUP_ASSIGNED' || d.status === 'PICKED_UP')
  );

  const handleAdvance = (d: Donation) => {
    if (d.status === 'PICKED_UP') {
      updateDonationStatus(d.id, 'DELIVERED');
      show('Marked as delivered!', 'success');
    }
  };

  return (
    <DashboardLayout>
      <PageHeader title="Pickup Requests" subtitle="Manage pickups and volunteer assignments" />

      {pickupDonations.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Utensils className="w-7 h-7" />}
            title="No pickup requests"
            description="Pickup requests will appear here when NGOs claim your donations."
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {pickupDonations.map((d) => {
            const volunteer = users.find((u) => u.id === d.volunteerId);
            return (
              <Card key={d.id} className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shrink-0" style={{ backgroundColor: d.imageColor }}>
                    <Utensils className="w-7 h-7" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-ink-900">{d.foodName}</h3>
                      <StatusBadge status={d.status} />
                    </div>
                    <p className="text-sm text-ink-500 mt-0.5">{d.meals} meals • {d.quantity}</p>
                    {d.claimedByName && <p className="text-sm text-brand-600 mt-0.5">→ {d.claimedByName}</p>}
                    {volunteer && (
                      <p className="text-sm text-accent-600 mt-0.5">🚴 {volunteer.name} ({volunteer.vehicleType})</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setSelected(d)}>Details</Button>
                    {d.status === 'PICKED_UP' && (
                      <Button size="sm" onClick={() => handleAdvance(d)}>Mark Delivered</Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <DonationModal donation={selected} open={!!selected} onClose={() => setSelected(null)} showMatches />
    </DashboardLayout>
  );
}
