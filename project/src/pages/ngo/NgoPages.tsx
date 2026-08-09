import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Utensils, ClipboardList, Truck, Users, Heart, Activity,
  MapPin, ShoppingBag, Plus, Clock, AlertCircle, CheckCircle2,
  Bike, Building2,
} from 'lucide-react';
import { DashboardLayout, PageHeader } from '@/components/DashboardLayout';
import { Card, StatCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { ExpiryTimer } from '@/components/ui/ExpiryTimer';
import { EmptyState } from '@/components/ui/EmptyState';
import { DonationCard } from '@/components/DonationCard';
import { DonationModal } from '@/components/DonationModal';
import { useApp } from '@/store/AppContext';
import { useToast } from '@/components/ui/Toast';
import type { Donation, Urgency, FoodType } from '@/types';

export function NgoOverview() {
  const { donations, currentUserId, foodNeeds, users, claimDonation } = useApp();
  const { show } = useToast();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Donation | null>(null);

  const myClaims = donations.filter((d) => d.claimedBy === currentUserId);
  const activeClaims = myClaims.filter((d) => d.status !== 'COMPLETED' && d.status !== 'EXPIRED' && d.status !== 'CANCELLED');
  const completed = myClaims.filter((d) => d.status === 'COMPLETED' || d.status === 'DELIVERED');
  const totalMeals = myClaims.reduce((s, d) => s + d.meals, 0);
  const myNeeds = foodNeeds.filter((n) => n.organizationId === currentUserId);
  const openNeeds = myNeeds.filter((n) => n.status === 'open');
  const pendingDeliveries = myClaims.filter((d) => d.status === 'PICKUP_ASSIGNED' || d.status === 'PICKED_UP');
  const nearbyAvailable = donations.filter((d) => d.status === 'POSTED').slice(0, 3);
  const volunteers = users.filter((u) => u.role === 'volunteer');
  const peopleServed = Math.round(totalMeals * 1.5);

  const canClaim = users.find((u) => u.id === currentUserId)?.verified === 'verified';

  const handleClaim = (d: Donation) => {
    if (!currentUserId) return;
    const result = claimDonation(d.id, currentUserId);
    if (result.ok) {
      show('Donation claimed successfully!', 'success');
      setSelected(null);
    } else {
      show(result.error || 'Failed to claim', 'error');
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Overview"
        subtitle="Manage food claims, needs, and deliveries"
        action={<Button onClick={() => navigate('/ngo/food-requests')}><Plus className="w-4 h-4" /> Post Food Need</Button>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <StatCard icon={<Utensils className="w-5 h-5" />} label="Meals Received" value={totalMeals} color="brand" />
        <StatCard icon={<ClipboardList className="w-5 h-5" />} label="Active Claims" value={activeClaims.length} color="warm" />
        <StatCard icon={<Truck className="w-5 h-5" />} label="Pending Deliveries" value={pendingDeliveries.length} color="accent" />
        <StatCard icon={<AlertCircle className="w-5 h-5" />} label="Meals Needed Today" value={openNeeds.reduce((s, n) => s + n.mealsRequired, 0)} color="red" />
        <StatCard icon={<Heart className="w-5 h-5" />} label="Meals Distributed" value={completed.reduce((s, d) => s + d.meals, 0)} color="blue" />
        <StatCard icon={<Users className="w-5 h-5" />} label="People Served" value={peopleServed} color="purple" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Nearby food */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-ink-900">Available Nearby</h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/ngo/nearby-food')}>View all</Button>
          </div>
          {nearbyAvailable.length === 0 ? (
            <p className="text-sm text-ink-400 py-6 text-center">No donations available nearby</p>
          ) : (
            <div className="space-y-3">
              {nearbyAvailable.map((d) => (
                <div key={d.id} className="flex items-center gap-3 p-3 rounded-xl bg-ink-50 hover:bg-ink-100 transition-colors cursor-pointer" onClick={() => setSelected(d)}>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0" style={{ backgroundColor: d.imageColor }}>
                    <Utensils className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink-900 truncate">{d.foodName}</p>
                    <p className="text-xs text-ink-400">{d.meals} meals • {d.distanceKm} km</p>
                  </div>
                  <ExpiryTimer expiresAt={d.expiresAt} compact />
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Open needs */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-ink-900">Your Open Food Needs</h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/ngo/food-requests')}>View all</Button>
          </div>
          {openNeeds.length === 0 ? (
            <p className="text-sm text-ink-400 py-6 text-center">No open food needs</p>
          ) : (
            <div className="space-y-3">
              {openNeeds.slice(0, 4).map((n) => (
                <div key={n.id} className="flex items-center gap-3 p-3 rounded-xl bg-ink-50">
                  <UrgencyBadge urgency={n.urgency} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink-900">{n.mealsRequired} {n.foodType} meals</p>
                    <p className="text-xs text-ink-400">Required by {n.requiredBy}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Active claims */}
      <div className="mt-8">
        <h3 className="font-bold text-ink-900 mb-4">Active Claims</h3>
        {activeClaims.length === 0 ? (
          <Card><EmptyState icon={<ClipboardList className="w-7 h-7" />} title="No active claims" description="Claim donations from the nearby food page." /></Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {activeClaims.map((d) => (
              <DonationCard key={d.id} donation={d} onView={setSelected} />
            ))}
          </div>
        )}
      </div>

      <DonationModal donation={selected} open={!!selected} onClose={() => setSelected(null)} showMatches onClaim={handleClaim} canClaim={canClaim} />
    </DashboardLayout>
  );
}

export function UrgencyBadge({ urgency }: { urgency: Urgency }) {
  const config: Record<Urgency, { label: string; cls: string; dot: string }> = {
    critical: { label: 'Critical', cls: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500' },
    high: { label: 'High', cls: 'bg-accent-50 text-accent-700 border-accent-200', dot: 'bg-accent-500' },
    medium: { label: 'Medium', cls: 'bg-warm-50 text-warm-700 border-warm-200', dot: 'bg-warm-500' },
    normal: { label: 'Normal', cls: 'bg-ink-100 text-ink-600 border-ink-200', dot: 'bg-ink-400' },
  };
  const c = config[urgency];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold rounded-full border px-2.5 py-0.5 ${c.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

export function MyClaims() {
  const { donations, currentUserId } = useApp();
  const [selected, setSelected] = useState<Donation | null>(null);

  const myClaims = donations.filter((d) => d.claimedBy === currentUserId);

  return (
    <DashboardLayout>
      <PageHeader title="My Claims" subtitle="All donations you've claimed" />
      {myClaims.length === 0 ? (
        <Card><EmptyState icon={<ClipboardList className="w-7 h-7" />} title="No claims yet" description="Browse nearby food to claim donations." /></Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {myClaims.map((d) => (
            <DonationCard key={d.id} donation={d} onView={setSelected} />
          ))}
        </div>
      )}
      <DonationModal donation={selected} open={!!selected} onClose={() => setSelected(null)} />
    </DashboardLayout>
  );
}

export function FoodRequests() {
  const { foodNeeds, currentUserId, postFoodNeed, fulfillFoodNeed } = useApp();
  const { show } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    foodType: 'Vegetarian' as FoodType,
    mealsRequired: '',
    requiredBy: '',
    dietaryRequirements: '',
    urgency: 'normal' as Urgency,
    pickupCapability: true,
  });

  const myNeeds = foodNeeds.filter((n) => n.organizationId === currentUserId);

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    postFoodNeed({
      foodType: form.foodType,
      mealsRequired: parseInt(form.mealsRequired) || 0,
      requiredBy: form.requiredBy,
      urgency: form.urgency,
      dietaryRequirements: form.dietaryRequirements,
      pickupCapability: form.pickupCapability,
    });
    show('Food need posted! Nearby donors will be notified.', 'success');
    setShowForm(false);
    setForm({ foodType: 'Vegetarian', mealsRequired: '', requiredBy: '', dietaryRequirements: '', urgency: 'normal', pickupCapability: true });
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Food Requests"
        subtitle="Broadcast your current food requirements to nearby donors"
        action={<Button onClick={() => setShowForm(!showForm)}><Plus className="w-4 h-4" /> Post Food Need</Button>}
      />

      {showForm && (
        <Card className="p-6 mb-6">
          <form onSubmit={handlePost} className="space-y-4">
            <h3 className="font-bold text-ink-900">Post a Food Need</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-ink-700 mb-1.5">Food Type</label>
                <select value={form.foodType} onChange={(e) => setForm({ ...form, foodType: e.target.value as FoodType })} className="w-full h-11 px-4 rounded-xl border border-ink-200 bg-white text-sm outline-none cursor-pointer">
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Non-Vegetarian">Non-Vegetarian</option>
                  <option value="Vegan">Vegan</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink-700 mb-1.5">Number of Meals</label>
                <input type="number" value={form.mealsRequired} onChange={(e) => setForm({ ...form, mealsRequired: e.target.value })} placeholder="e.g. 80" required className="w-full h-11 px-4 rounded-xl border border-ink-200 bg-white text-sm outline-none focus:border-brand-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink-700 mb-1.5">Required By</label>
                <input type="text" value={form.requiredBy} onChange={(e) => setForm({ ...form, requiredBy: e.target.value })} placeholder="e.g. 8:00 PM" required className="w-full h-11 px-4 rounded-xl border border-ink-200 bg-white text-sm outline-none focus:border-brand-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink-700 mb-1.5">Urgency</label>
                <select value={form.urgency} onChange={(e) => setForm({ ...form, urgency: e.target.value as Urgency })} className="w-full h-11 px-4 rounded-xl border border-ink-200 bg-white text-sm outline-none cursor-pointer">
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="normal">Normal</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-1.5">Dietary Requirements</label>
              <input type="text" value={form.dietaryRequirements} onChange={(e) => setForm({ ...form, dietaryRequirements: e.target.value })} placeholder="e.g. No onion-garlic, low spice" className="w-full h-11 px-4 rounded-xl border border-ink-200 bg-white text-sm outline-none focus:border-brand-500" />
            </div>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={form.pickupCapability} onChange={(e) => setForm({ ...form, pickupCapability: e.target.checked })} className="w-5 h-5 rounded accent-brand-600" />
              <span className="text-sm font-medium text-ink-700">We can arrange pickup</span>
            </label>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit">Post Need</Button>
            </div>
          </form>
        </Card>
      )}

      {myNeeds.length === 0 ? (
        <Card><EmptyState icon={<ShoppingBag className="w-7 h-7" />} title="No food needs posted" description="Post a food need to let nearby donors know what you require." /></Card>
      ) : (
        <div className="space-y-4">
          {myNeeds.map((n) => (
            <Card key={n.id} className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-bold text-ink-900">{n.mealsRequired} {n.foodType} meals</h3>
                    <UrgencyBadge urgency={n.urgency} />
                    {n.status === 'fulfilled' && <Badge tone="green" dot>Fulfilled</Badge>}
                    {n.status === 'open' && <Badge tone="brand" dot>Open</Badge>}
                  </div>
                  <p className="text-sm text-ink-500">Required by {n.requiredBy} • {n.location}</p>
                  {n.dietaryRequirements && <p className="text-sm text-ink-400 mt-0.5">Dietary: {n.dietaryRequirements}</p>}
                  <p className="text-xs text-ink-400 mt-1">{n.pickupCapability ? '✓ Can arrange pickup' : '✗ Pickup assistance needed'}</p>
                </div>
                {n.status === 'open' && (
                  <Button variant="outline" size="sm" onClick={() => { fulfillFoodNeed(n.id); show('Marked as fulfilled!', 'success'); }}>
                    Mark Fulfilled
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}

export function NgoDeliveries() {
  const { donations, currentUserId, deliveries, users } = useApp();
  const [selected, setSelected] = useState<Donation | null>(null);

  const myDeliveries = deliveries.filter((d) => d.ngoId === currentUserId);
  const myClaimedDeliveries = donations.filter((d) => d.claimedBy === currentUserId && (d.status === 'PICKUP_ASSIGNED' || d.status === 'PICKED_UP' || d.status === 'DELIVERED'));

  return (
    <DashboardLayout>
      <PageHeader title="Deliveries" subtitle="Track incoming food deliveries" />
      {myClaimedDeliveries.length === 0 && myDeliveries.length === 0 ? (
        <Card><EmptyState icon={<Truck className="w-7 h-7" />} title="No deliveries" description="Active deliveries will appear here once a volunteer is assigned." /></Card>
      ) : (
        <div className="space-y-4">
          {myClaimedDeliveries.map((d) => {
            const volunteer = users.find((u) => u.id === d.volunteerId);
            return (
              <Card key={d.id} className="p-5" hover onClick={() => setSelected(d)}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shrink-0" style={{ backgroundColor: d.imageColor }}>
                    <Utensils className="w-7 h-7" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-ink-900">{d.foodName}</h3>
                      <StatusBadge status={d.status} />
                    </div>
                    <p className="text-sm text-ink-500 mt-0.5">{d.meals} meals from {d.donorName}</p>
                    {volunteer && <p className="text-sm text-accent-600 mt-0.5">🚴 {volunteer.name} ({volunteer.vehicleType})</p>}
                  </div>
                  <ExpiryTimer expiresAt={d.expiresAt} />
                </div>
              </Card>
            );
          })}
        </div>
      )}
      <DonationModal donation={selected} open={!!selected} onClose={() => setSelected(null)} />
    </DashboardLayout>
  );
}

export function NgoVolunteers() {
  const { users } = useApp();
  const volunteers = users.filter((u) => u.role === 'volunteer');

  return (
    <DashboardLayout>
      <PageHeader title="Volunteers" subtitle="Available volunteers in your area" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {volunteers.map((v) => (
          <Card key={v.id} className="p-5 hover:shadow-float transition-all">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: v.avatarColor }}>
                {v.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-ink-900 truncate">{v.name}</p>
                <p className="text-xs text-ink-400">{v.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-4 text-sm">
              <span className="flex items-center gap-1.5 text-ink-600"><Bike className="w-4 h-4 text-ink-400" />{v.vehicleType}</span>
              <span className="flex items-center gap-1.5 text-ink-600"><Truck className="w-4 h-4 text-ink-400" />{v.totalDeliveries}</span>
              <span className="flex items-center gap-1.5 text-warm-600">★ {v.rating}</span>
            </div>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}
