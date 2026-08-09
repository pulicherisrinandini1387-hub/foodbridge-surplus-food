import { useState, useMemo } from 'react';
import { DashboardLayout, PageHeader } from '@/components/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { ExpiryTimer } from '@/components/ui/ExpiryTimer';
import { DonationCard } from '@/components/DonationCard';
import { DonationModal } from '@/components/DonationModal';
import { MapView } from '@/components/MapView';
import { useApp } from '@/store/AppContext';
import { useToast } from '@/components/ui/Toast';
import { Search, SlidersHorizontal, Map as MapIcon, LayoutGrid, Utensils, Bike, Building2 } from 'lucide-react';
import type { Donation, FoodType } from '@/types';

type SortOption = 'nearest' | 'expiring' | 'largest' | 'recent';

export function DonationFeed({ role = 'ngo' }: { role?: 'ngo' | 'public' }) {
  const { donations, users, claimDonation, currentUserId } = useApp();
  const { show } = useToast();
  const [selected, setSelected] = useState<Donation | null>(null);
  const [view, setView] = useState<'list' | 'map'>('list');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortOption>('nearest');
  const [filters, setFilters] = useState({
    foodType: 'all' as 'all' | FoodType,
    expiringSoon: false,
    pickupAvailable: false,
    maxDistance: 10,
  });
  const [showFilters, setShowFilters] = useState(false);

  const currentUser = users.find((u) => u.id === currentUserId);
  const canClaim = currentUser?.role === 'ngo' && currentUser?.verified === 'verified';

  const available = useMemo(() => {
    return donations
      .filter((d) => d.status === 'POSTED')
      .filter((d) => {
        if (search && !d.foodName.toLowerCase().includes(search.toLowerCase()) && !d.donorName.toLowerCase().includes(search.toLowerCase())) return false;
        if (filters.foodType !== 'all' && d.foodType !== filters.foodType) return false;
        if (filters.pickupAvailable && d.deliveryOption === 'DONOR_DELIVERS') return false;
        if (filters.maxDistance < d.distanceKm) return false;
        if (filters.expiringSoon) {
          const ms = new Date(d.expiresAt).getTime() - Date.now();
          if (ms > 60 * 60 * 1000) return false;
        }
        return true;
      })
      .sort((a, b) => {
        switch (sort) {
          case 'nearest': return a.distanceKm - b.distanceKm;
          case 'expiring': return new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime();
          case 'largest': return b.meals - a.meals;
          case 'recent': return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
        }
      });
  }, [donations, search, sort, filters]);

  const handleClaim = (d: Donation) => {
    if (!currentUserId) return;
    const result = claimDonation(d.id, currentUserId);
    if (result.ok) {
      show('Donation claimed successfully!', 'success');
      setSelected(null);
    } else {
      show(result.error || 'Failed to claim donation', 'error');
    }
  };

  const ngos = users.filter((u) => u.role === 'ngo');
  const volunteers = users.filter((u) => u.role === 'volunteer');

  return (
    <DashboardLayout>
      <PageHeader
        title="Nearby Food"
        subtitle={`${available.length} donations available near you`}
        action={
          <div className="flex gap-2">
            <div className="flex bg-white rounded-xl border border-ink-200 p-1">
              <button
                onClick={() => setView('list')}
                className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all ${view === 'list' ? 'bg-brand-600 text-white' : 'text-ink-600'}`}
              >
                <LayoutGrid className="w-4 h-4" /> List
              </button>
              <button
                onClick={() => setView('map')}
                className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all ${view === 'map' ? 'bg-brand-600 text-white' : 'text-ink-600'}`}
              >
                <MapIcon className="w-4 h-4" /> Map
              </button>
            </div>
          </div>
        }
      />

      {/* Search & sort bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <input
            type="text"
            placeholder="Search food or donor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-11 pr-4 rounded-xl bg-white border border-ink-200 text-sm outline-none focus:border-brand-500 transition-colors"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          className="h-11 px-4 rounded-xl bg-white border border-ink-200 text-sm font-medium text-ink-700 outline-none cursor-pointer focus:border-brand-500"
        >
          <option value="nearest">Nearest first</option>
          <option value="expiring">Expiring soon</option>
          <option value="largest">Largest donation</option>
          <option value="recent">Recently posted</option>
        </select>
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
          <SlidersHorizontal className="w-4 h-4" /> Filters
        </Button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <Card className="p-4 mb-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-1.5">Food Type</label>
              <select
                value={filters.foodType}
                onChange={(e) => setFilters({ ...filters, foodType: e.target.value as 'all' | FoodType })}
                className="w-full h-11 px-4 rounded-xl border border-ink-200 bg-white text-sm outline-none cursor-pointer"
              >
                <option value="all">All types</option>
                <option value="Vegetarian">Vegetarian</option>
                <option value="Non-Vegetarian">Non-Vegetarian</option>
                <option value="Vegan">Vegan</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-1.5">Max Distance: {filters.maxDistance} km</label>
              <input
                type="range"
                min="1"
                max="10"
                value={filters.maxDistance}
                onChange={(e) => setFilters({ ...filters, maxDistance: parseInt(e.target.value) })}
                className="w-full mt-3 accent-brand-600"
              />
            </div>
            <label className="flex items-center gap-2.5 cursor-pointer mt-6">
              <input
                type="checkbox"
                checked={filters.expiringSoon}
                onChange={(e) => setFilters({ ...filters, expiringSoon: e.target.checked })}
                className="w-5 h-5 rounded accent-brand-600"
              />
              <span className="text-sm font-medium text-ink-700">Expiring soon (≤1hr)</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer mt-6">
              <input
                type="checkbox"
                checked={filters.pickupAvailable}
                onChange={(e) => setFilters({ ...filters, pickupAvailable: e.target.checked })}
                className="w-5 h-5 rounded accent-brand-600"
              />
              <span className="text-sm font-medium text-ink-700">Pickup available</span>
            </label>
          </div>
        </Card>
      )}

      {/* Content */}
      {view === 'map' ? (
        <div className="space-y-4">
          <MapView
            donations={available}
            ngos={ngos}
            volunteers={volunteers}
            onDonationClick={setSelected}
            height="500px"
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {available.slice(0, 6).map((d) => (
              <DonationCard key={d.id} donation={d} onView={setSelected} showClaim={role === 'ngo'} canClaim={canClaim} onClaim={handleClaim} />
            ))}
          </div>
        </div>
      ) : available.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Utensils className="w-7 h-7" />}
            title="No donations found"
            description="Try adjusting your filters or search terms."
          />
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {available.map((d) => (
            <DonationCard key={d.id} donation={d} onView={setSelected} showClaim={role === 'ngo'} canClaim={canClaim} onClaim={handleClaim} />
          ))}
        </div>
      )}

      <DonationModal donation={selected} open={!!selected} onClose={() => setSelected(null)} showMatches={role === 'ngo'} onClaim={handleClaim} canClaim={canClaim} />
    </DashboardLayout>
  );
}
