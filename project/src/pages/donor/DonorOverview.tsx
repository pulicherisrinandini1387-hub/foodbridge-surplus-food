import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Utensils, Package, CheckCircle2, Leaf, Truck, Plus, TrendingUp,
  Activity, Clock, MapPin, Bike, Building2, PackageCheck,
} from 'lucide-react';
import { DashboardLayout, PageHeader } from '@/components/DashboardLayout';
import { Card, StatCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { ExpiryTimer } from '@/components/ui/ExpiryTimer';
import { useApp } from '@/store/AppContext';
import { DonationCard } from '@/components/DonationCard';
import { DonationModal } from '@/components/DonationModal';
import type { Donation } from '@/types';

export function DonorOverview() {
  const { donations, currentUserId, users } = useApp();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Donation | null>(null);

  const myDonations = donations.filter((d) => d.donorId === currentUserId);
  const active = myDonations.filter((d) => d.status === 'POSTED' || d.status === 'CLAIMED' || d.status === 'PICKUP_ASSIGNED' || d.status === 'PICKED_UP' || d.status === 'DELIVERED');
  const completed = myDonations.filter((d) => d.status === 'COMPLETED');
  const totalMeals = myDonations.reduce((s, d) => s + d.meals, 0);
  const co2Saved = (totalMeals * 0.5).toFixed(1); // ~0.5kg CO2 per meal
  const pickups = myDonations.filter((d) => d.volunteerId).length;

  // Chart data — last 6 months
  const chartData = [
    { month: 'Mar', meals: 120 },
    { month: 'Apr', meals: 180 },
    { month: 'May', meals: 240 },
    { month: 'Jun', meals: 310 },
    { month: 'Jul', meals: 280 },
    { month: 'Aug', meals: totalMeals > 0 ? totalMeals : 150 },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="Overview"
        subtitle="Track your donations, pickups, and social impact"
        action={<Button onClick={() => navigate('/donor/post')}><Plus className="w-4 h-4" /> Post Donation</Button>}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <StatCard icon={<Utensils className="w-5 h-5" />} label="Total Meals Donated" value={totalMeals} color="brand" />
        <StatCard icon={<Activity className="w-5 h-5" />} label="Active Donations" value={active.length} color="warm" />
        <StatCard icon={<CheckCircle2 className="w-5 h-5" />} label="Completed" value={completed.length} color="blue" />
        <StatCard icon={<Package className="w-5 h-5" />} label="Food Rescued (kg)" value={Math.round(totalMeals * 0.4)} color="accent" />
        <StatCard icon={<Leaf className="w-5 h-5" />} label="CO₂ Avoided (kg)" value={co2Saved} color="green" />
        <StatCard icon={<Truck className="w-5 h-5" />} label="Successful Pickups" value={pickups} color="purple" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chart */}
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-ink-900">Donations Over Time</h3>
              <p className="text-sm text-ink-400">Meals donated by month</p>
            </div>
            <Badge tone="brand" dot>+12% this month</Badge>
          </div>
          <MiniChart data={chartData} />
        </Card>

        {/* Active donations */}
        <Card className="p-6">
          <h3 className="font-bold text-ink-900 mb-4">Active Donations</h3>
          {active.length === 0 ? (
            <p className="text-sm text-ink-400 py-8 text-center">No active donations</p>
          ) : (
            <div className="space-y-3">
              {active.slice(0, 4).map((d) => (
                <div key={d.id} className="flex items-center gap-3 p-3 rounded-xl bg-ink-50 hover:bg-ink-100 transition-colors cursor-pointer" onClick={() => setSelected(d)}>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0" style={{ backgroundColor: d.imageColor }}>
                    <Utensils className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink-900 truncate">{d.foodName}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <StatusBadge status={d.status} />
                    </div>
                  </div>
                  <ExpiryTimer expiresAt={d.expiresAt} compact />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Recent donations */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-ink-900">Recent Donations</h3>
          <Button variant="ghost" size="sm" onClick={() => navigate('/donor/my-donations')}>View all</Button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {myDonations.slice(0, 4).map((d) => (
            <DonationCard key={d.id} donation={d} onView={setSelected} />
          ))}
        </div>
      </div>

      <DonationModal donation={selected} open={!!selected} onClose={() => setSelected(null)} showMatches />
    </DashboardLayout>
  );
}

function MiniChart({ data }: { data: { month: string; meals: number }[] }) {
  const max = Math.max(...data.map((d) => d.meals));
  return (
    <div className="flex items-end justify-between gap-2 h-40">
      {data.map((d, i) => (
        <div key={d.month} className="flex-1 flex flex-col items-center gap-2">
          <div className="w-full flex-1 flex items-end">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(d.meals / max) * 100}%` }}
              transition={{ delay: i * 0.08, duration: 0.6, type: 'spring' }}
              className="w-full rounded-t-lg bg-gradient-to-t from-brand-600 to-brand-400 relative group"
            >
              <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-ink-700 opacity-0 group-hover:opacity-100 transition-opacity">
                {d.meals}
              </span>
            </motion.div>
          </div>
          <span className="text-xs text-ink-400">{d.month}</span>
        </div>
      ))}
    </div>
  );
}
