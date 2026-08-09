import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Bike, Truck, MapPin, Clock, CheckCircle2, Navigation, User,
  Phone, Package, ArrowRight, Award, Star, Utensils, Activity,
} from 'lucide-react';
import { DashboardLayout, PageHeader } from '@/components/DashboardLayout';
import { Card, StatCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';
import { useApp } from '@/store/AppContext';
import { useToast } from '@/components/ui/Toast';
import type { Donation, DeliveryStatus } from '@/types';

export function VolunteerTasks() {
  const { donations, currentUserId, assignVolunteer, users } = useApp();
  const { show } = useToast();
  const navigate = useNavigate();

  const availableTasks = donations.filter(
    (d) => d.status === 'CLAIMED' && d.deliveryOption === 'VOLUNTEER_REQUIRED'
  );

  const myActive = donations.filter(
    (d) => d.volunteerId === currentUserId && (d.status === 'PICKUP_ASSIGNED' || d.status === 'PICKED_UP')
  );

  const handleAccept = (d: Donation) => {
    if (!currentUserId) return;
    assignVolunteer(d.id, currentUserId);
    show('Pickup task accepted! Check your active task.', 'success');
  };

  const volunteer = users.find((u) => u.id === currentUserId);

  return (
    <DashboardLayout>
      <PageHeader title="Available Tasks" subtitle={`${availableTasks.length} pickup tasks near you`} />

      {/* Volunteer stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<Truck className="w-5 h-5" />} label="Total Deliveries" value={volunteer?.totalDeliveries || 0} color="brand" />
        <StatCard icon={<Activity className="w-5 h-5" />} label="Active Tasks" value={myActive.length} color="warm" />
        <StatCard icon={<Star className="w-5 h-5" />} label="Rating" value={volunteer?.rating || 0} color="accent" />
        <StatCard icon={<Award className="w-5 h-5" />} label="Rank" value="#3" color="purple" />
      </div>

      {/* Active task */}
      {myActive.length > 0 && (
        <div className="mb-8">
          <h3 className="font-bold text-ink-900 mb-4">Your Active Task</h3>
          {myActive.map((d) => (
            <ActiveTaskCard key={d.id} donation={d} onTrack={() => navigate('/volunteer/active')} />
          ))}
        </div>
      )}

      {/* Available tasks */}
      <h3 className="font-bold text-ink-900 mb-4">Available Pickup Tasks</h3>
      {availableTasks.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Bike className="w-7 h-7" />}
            title="No tasks available"
            description="New pickup tasks will appear here when NGOs claim donations that need volunteer delivery."
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {availableTasks.map((d) => {
            const ngo = users.find((u) => u.id === d.claimedBy);
            return (
              <Card key={d.id} className="p-5 hover:shadow-float transition-all">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shrink-0" style={{ backgroundColor: d.imageColor }}>
                      <Utensils className="w-7 h-7" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-ink-900">{d.foodName}</h3>
                      <p className="text-sm text-ink-500">{d.meals} meals • {d.quantity}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 text-sm lg:text-right">
                    <span className="flex items-center gap-1.5 text-ink-600">
                      <MapPin className="w-4 h-4 text-ink-400" />
                      {d.donorName}
                    </span>
                    {ngo && (
                      <span className="flex items-center gap-1.5 text-brand-600">
                        <ArrowRight className="w-4 h-4" />
                        {ngo.name}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5 text-ink-600">
                      <Navigation className="w-4 h-4 text-ink-400" />
                      {d.distanceKm} km
                    </span>
                  </div>
                  <div className="flex gap-2 lg:flex-col">
                    <Button onClick={() => handleAccept(d)} className="flex-1">
                      <Bike className="w-4 h-4" /> Accept
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}

function ActiveTaskCard({ donation, onTrack }: { donation: Donation; onTrack: () => void }) {
  const { users } = useApp();
  const ngo = users.find((u) => u.id === donation.claimedBy);
  return (
    <Card className="p-5 border-2 border-brand-300 bg-brand-50/30">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shrink-0" style={{ backgroundColor: donation.imageColor }}>
          <Utensils className="w-7 h-7" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-ink-900">{donation.foodName}</h3>
            <StatusBadge status={donation.status} />
          </div>
          <p className="text-sm text-ink-500 mt-0.5">{donation.meals} meals</p>
          <p className="text-sm text-ink-600 mt-1">
            {donation.donorName} → {ngo?.name}
          </p>
        </div>
        <Button onClick={onTrack}>
          Track Delivery <Navigation className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}

export function ActiveTask() {
  const { donations, currentUserId, updateDonationStatus, users } = useApp();
  const { show } = useToast();
  const navigate = useNavigate();

  const active = donations.find(
    (d) => d.volunteerId === currentUserId && (d.status === 'PICKUP_ASSIGNED' || d.status === 'PICKED_UP')
  );

  if (!active) {
    return (
      <DashboardLayout>
        <PageHeader title="Active Task" subtitle="Your current delivery" />
        <Card>
          <EmptyState
            icon={<Bike className="w-7 h-7" />}
            title="No active task"
            description="Accept a pickup task from the available tasks page to start delivering."
            action={<Button onClick={() => navigate('/volunteer')}>Find Tasks</Button>}
          />
        </Card>
      </DashboardLayout>
    );
  }

  const donor = users.find((u) => u.id === active.donorId);
  const ngo = users.find((u) => u.id === active.claimedBy);

  const steps = [
    { status: 'PICKUP_ASSIGNED', label: 'Volunteer Assigned', done: true },
    { status: 'PICKED_UP', label: 'Food Picked Up', done: active.status === 'PICKED_UP' || active.status === 'DELIVERED' },
    { status: 'DELIVERED', label: 'Delivered to NGO', done: active.status === 'DELIVERED' },
  ];

  const handlePickup = () => {
    updateDonationStatus(active.id, 'PICKED_UP');
    show('Food picked up! Now delivering to NGO.', 'success');
  };

  const handleDeliver = () => {
    updateDonationStatus(active.id, 'DELIVERED');
    show('Delivery completed! Great job.', 'success');
    setTimeout(() => navigate('/volunteer/completed'), 1500);
  };

  return (
    <DashboardLayout>
      <PageHeader title="Active Task" subtitle="Track and update your current delivery" />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Delivery tracker */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white" style={{ backgroundColor: active.imageColor }}>
                <Utensils className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-bold text-ink-900 text-lg">{active.foodName}</h3>
                <p className="text-sm text-ink-500">{active.meals} meals • {active.quantity}</p>
              </div>
              <div className="ml-auto">
                <StatusBadge status={active.status} />
              </div>
            </div>

            {/* Route */}
            <div className="space-y-0">
              <RouteNode icon={<Package className="w-5 h-5" />} title={active.donorName} subtitle={active.pickupAddress} color={active.imageColor} done />
              <div className="ml-7 h-12 w-0.5 bg-ink-200 my-1 relative">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: active.status === 'PICKED_UP' || active.status === 'DELIVERED' ? '100%' : '50%' }}
                  className="absolute top-0 left-0 w-full bg-brand-500"
                />
              </div>
              <RouteNode icon={<Bike className="w-5 h-5" />} title="You (Volunteer)" subtitle="In transit" color="#f97316" done={active.status === 'PICKED_UP' || active.status === 'DELIVERED'} />
              <div className="ml-7 h-12 w-0.5 bg-ink-200 my-1 relative">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: active.status === 'DELIVERED' ? '100%' : '0%' }}
                  className="absolute top-0 left-0 w-full bg-brand-500"
                />
              </div>
              <RouteNode icon={<CheckCircle2 className="w-5 h-5" />} title={ngo?.name || 'NGO'} subtitle={ngo?.location || ''} color="#16a34a" done={active.status === 'DELIVERED'} />
            </div>

            {/* Actions */}
            <div className="mt-6 pt-6 border-t border-ink-100">
              {active.status === 'PICKUP_ASSIGNED' && (
                <Button fullWidth size="lg" onClick={handlePickup}>
                  <Package className="w-4 h-4" /> Confirm Food Picked Up
                </Button>
              )}
              {active.status === 'PICKED_UP' && (
                <Button fullWidth size="lg" onClick={handleDeliver}>
                  <CheckCircle2 className="w-4 h-4" /> Confirm Delivered to NGO
                </Button>
              )}
              {active.status === 'DELIVERED' && (
                <div className="text-center py-4">
                  <CheckCircle2 className="w-12 h-12 text-brand-600 mx-auto mb-2" />
                  <p className="font-bold text-ink-900">Delivery Complete!</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Contact info */}
        <div className="space-y-4">
          <Card className="p-5">
            <h4 className="font-bold text-ink-900 mb-4">Contact Information</h4>
            {donor && (
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-ink-400 font-semibold uppercase">Donor</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Avatar name={donor.name} color={donor.avatarColor} size="sm" />
                    <div>
                      <p className="text-sm font-semibold text-ink-900">{donor.name}</p>
                      <p className="text-xs text-ink-400">{donor.phone}</p>
                    </div>
                  </div>
                </div>
                {ngo && (
                  <div>
                    <p className="text-xs text-ink-400 font-semibold uppercase">NGO</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Avatar name={ngo.name} color={ngo.avatarColor} size="sm" />
                      <div>
                        <p className="text-sm font-semibold text-ink-900">{ngo.name}</p>
                        <p className="text-xs text-ink-400">{ngo.phone}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>

          <Card className="p-5">
            <h4 className="font-bold text-ink-900 mb-3">Delivery Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-ink-400">Distance</span><span className="font-semibold text-ink-800">{active.distanceKm} km</span></div>
              <div className="flex justify-between"><span className="text-ink-400">Est. Time</span><span className="font-semibold text-ink-800">{Math.round(active.distanceKm * 4)} min</span></div>
              <div className="flex justify-between"><span className="text-ink-400">Pickup From</span><span className="font-semibold text-ink-800">{active.pickupFrom}</span></div>
              <div className="flex justify-between"><span className="text-ink-400">Deadline</span><span className="font-semibold text-ink-800">{active.pickupDeadline}</span></div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

function RouteNode({ icon, title, subtitle, color, done }: { icon: React.ReactNode; title: string; subtitle: string; color: string; done: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all ${done ? 'text-white' : 'bg-ink-100 text-ink-400'}`} style={done ? { backgroundColor: color } : {}}>
        {icon}
      </div>
      <div>
        <p className={`font-semibold ${done ? 'text-ink-900' : 'text-ink-400'}`}>{title}</p>
        <p className="text-xs text-ink-400">{subtitle}</p>
      </div>
    </div>
  );
}

export function MyDeliveries() {
  const { donations, currentUserId, users } = useApp();
  const [selected, setSelected] = useState<Donation | null>(null);

  const myDeliveries = donations.filter((d) => d.volunteerId === currentUserId);

  return (
    <DashboardLayout>
      <PageHeader title="My Deliveries" subtitle="All deliveries you've accepted" />
      {myDeliveries.length === 0 ? (
        <Card><EmptyState icon={<Truck className="w-7 h-7" />} title="No deliveries yet" description="Accept a pickup task to start delivering." /></Card>
      ) : (
        <div className="space-y-4">
          {myDeliveries.map((d) => {
            const ngo = users.find((u) => u.id === d.claimedBy);
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
                    <p className="text-sm text-ink-500 mt-0.5">{d.meals} meals • {d.donorName} → {ngo?.name}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      {/* Simple modal reuse */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="absolute inset-0 bg-ink-950/40 backdrop-blur-sm" />
          <Card className="relative max-w-lg w-full p-6" >
            <h3 className="font-bold text-ink-900 text-lg mb-2">{selected.foodName}</h3>
            <p className="text-sm text-ink-500">{selected.meals} meals from {selected.donorName}</p>
            <StatusBadge status={selected.status} />
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}

export function CompletedTasks() {
  const { donations, currentUserId, users } = useApp();

  const completed = donations.filter(
    (d) => d.volunteerId === currentUserId && (d.status === 'COMPLETED' || d.status === 'DELIVERED')
  );
  const totalMeals = completed.reduce((s, d) => s + d.meals, 0);

  return (
    <DashboardLayout>
      <PageHeader title="Completed Tasks" subtitle={`${completed.length} deliveries completed`} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={<CheckCircle2 className="w-5 h-5" />} label="Completed" value={completed.length} color="brand" />
        <StatCard icon={<Utensils className="w-5 h-5" />} label="Meals Delivered" value={totalMeals} color="accent" />
        <StatCard icon={<Navigation className="w-5 h-5" />} label="Distance Covered" value={`${completed.reduce((s, d) => s + d.distanceKm, 0).toFixed(1)} km`} color="blue" />
        <StatCard icon={<Star className="w-5 h-5" />} label="Rating" value="4.9" color="warm" />
      </div>

      {completed.length === 0 ? (
        <Card><EmptyState icon={<CheckCircle2 className="w-7 h-7" />} title="No completed tasks" description="Your completed deliveries will appear here." /></Card>
      ) : (
        <div className="space-y-4">
          {completed.map((d) => {
            const ngo = users.find((u) => u.id === d.claimedBy);
            return (
              <Card key={d.id} className="p-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0" style={{ backgroundColor: d.imageColor }}>
                    <Utensils className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-ink-900">{d.foodName}</h3>
                    <p className="text-sm text-ink-500">{d.meals} meals • {d.donorName} → {ngo?.name}</p>
                  </div>
                  <Badge tone="green" dot>Completed</Badge>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
