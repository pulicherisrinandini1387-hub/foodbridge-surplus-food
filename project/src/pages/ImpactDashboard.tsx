import { motion } from 'framer-motion';
import {
  Utensils, Recycle, Leaf, Users, Truck, Award, TrendingUp,
  MapPin, PieChart, BarChart3, Target, Zap,
} from 'lucide-react';
import { DashboardLayout, PageHeader } from '@/components/DashboardLayout';
import { Card, StatCard } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useApp } from '@/store/AppContext';
import { useState } from 'react';

export function ImpactDashboard() {
  const { donations, currentUserId, deliveries } = useApp();

  const myDonations = donations.filter((d) => d.donorId === currentUserId);
  const myClaims = donations.filter((d) => d.claimedBy === currentUserId);
  const myDeliveries = deliveries.filter((d) => d.volunteerId === currentUserId);

  const relevant = [...myDonations, ...myClaims];
  const completed = relevant.filter((d) => d.status === 'COMPLETED' || d.status === 'DELIVERED');
  const totalMeals = completed.reduce((s, d) => s + d.meals, 0);
  const foodRescued = Math.round(totalMeals * 0.4);
  const co2Avoided = (totalMeals * 0.5).toFixed(1);
  const peopleServed = Math.round(totalMeals * 1.5);
  const deliveriesCount = myDeliveries.length || completed.filter((d) => d.volunteerId).length;

  const impactScore = Math.min(100, Math.round(totalMeals / 10 + completed.length * 2 + deliveriesCount * 3));

  const monthlyData = [
    { month: 'Mar', meals: 80 },
    { month: 'Apr', meals: 120 },
    { month: 'May', meals: 160 },
    { month: 'Jun', meals: 200 },
    { month: 'Jul', meals: 180 },
    { month: 'Aug', meals: totalMeals > 0 ? totalMeals : 100 },
  ];

  const categoryData = [
    { label: 'Cooked Meals', value: 45, color: '#16a34a' },
    { label: 'Raw Produce', value: 20, color: '#f97316' },
    { label: 'Bakery', value: 15, color: '#eab308' },
    { label: 'Dairy', value: 10, color: '#0891b2' },
    { label: 'Other', value: 10, color: '#9333ea' },
  ];

  const badges = [
    { id: 'hero', label: 'Community Hero', icon: Award, earned: totalMeals >= 100, desc: 'Donate 100+ meals' },
    { id: 'warrior', label: 'Waste Warrior', icon: Leaf, earned: totalMeals >= 50, desc: 'Rescue 50+ meals from waste' },
    { id: 'saver', label: 'Meal Saver', icon: Utensils, earned: totalMeals >= 10, desc: 'Save 10+ meals' },
    { id: 'champion', label: 'Delivery Champion', icon: Truck, earned: deliveriesCount >= 5, desc: 'Complete 5+ deliveries' },
  ];

  return (
    <DashboardLayout>
      <PageHeader title="Your Impact" subtitle="See the difference you're making" />

      {/* Impact Score */}
      <Card className="p-8 mb-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50 to-transparent" />
        <div className="relative flex flex-col lg:flex-row items-center gap-8">
          <div className="relative w-40 h-40 shrink-0">
            <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
              <circle cx="80" cy="80" r="68" fill="none" stroke="#e2e8f0" strokeWidth="12" />
              <motion.circle
                cx="80" cy="80" r="68" fill="none" stroke="#16a34a" strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 68}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 68 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 68 * (1 - impactScore / 100) }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-ink-900">{impactScore}</span>
              <span className="text-xs text-ink-400 font-medium">Impact Score</span>
            </div>
          </div>
          <div className="flex-1 text-center lg:text-left">
            <h2 className="text-2xl font-bold text-ink-900">You're making a real difference!</h2>
            <p className="text-ink-500 mt-2">
              You've helped save <strong className="text-brand-600">{totalMeals} meals</strong> from going to waste,
              served <strong className="text-brand-600">{peopleServed} people</strong>, and avoided
              <strong className="text-brand-600"> {co2Avoided} kg of CO₂</strong> emissions.
            </p>
            <div className="flex flex-wrap gap-2 mt-4 justify-center lg:justify-start">
              <Badge tone="brand" dot>Top 5% Contributor</Badge>
              <Badge tone="accent" dot>Streak: 12 days</Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard icon={<Utensils className="w-5 h-5" />} label="Meals Saved" value={totalMeals} color="brand" />
        <StatCard icon={<Recycle className="w-5 h-5" />} label="Food Rescued (kg)" value={foodRescued} color="accent" />
        <StatCard icon={<Leaf className="w-5 h-5" />} label="CO₂ Avoided (kg)" value={co2Avoided} color="green" />
        <StatCard icon={<Users className="w-5 h-5" />} label="People Served" value={peopleServed} color="blue" />
        <StatCard icon={<Truck className="w-5 h-5" />} label="Deliveries" value={deliveriesCount} color="purple" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Monthly chart */}
        <Card className="p-6 lg:col-span-2">
          <h3 className="font-bold text-ink-900 mb-1">Meals Donated by Month</h3>
          <p className="text-sm text-ink-400 mb-4">Your contribution over time</p>
          <BarChart data={monthlyData} />
        </Card>

        {/* Category breakdown */}
        <Card className="p-6">
          <h3 className="font-bold text-ink-900 mb-1">Food Rescued by Category</h3>
          <p className="text-sm text-ink-400 mb-4">Distribution of your donations</p>
          <DonutChart data={categoryData} />
        </Card>
      </div>

      {/* Badges */}
      <Card className="p-6">
        <h3 className="font-bold text-ink-900 mb-4">Achievement Badges</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {badges.map((b, i) => {
            const Icon = b.icon;
            return (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className={`p-5 rounded-2xl border-2 text-center transition-all ${b.earned ? 'border-brand-300 bg-brand-50' : 'border-ink-100 bg-ink-50 opacity-60'}`}
              >
                <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-3 ${b.earned ? 'bg-brand-600 text-white' : 'bg-ink-200 text-ink-400'}`}>
                  <Icon className="w-7 h-7" />
                </div>
                <p className={`font-bold text-sm ${b.earned ? 'text-ink-900' : 'text-ink-400'}`}>{b.label}</p>
                <p className="text-xs text-ink-400 mt-1">{b.desc}</p>
                {b.earned && <Badge tone="brand" size="sm" className="mt-2">Earned!</Badge>}
              </motion.div>
            );
          })}
        </div>
      </Card>
    </DashboardLayout>
  );
}

function BarChart({ data }: { data: { month: string; meals: number }[] }) {
  const max = Math.max(...data.map((d) => d.meals));
  return (
    <div className="flex items-end justify-between gap-3 h-48">
      {data.map((d, i) => (
        <div key={d.month} className="flex-1 flex flex-col items-center gap-2">
          <div className="w-full flex-1 flex items-end">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(d.meals / max) * 100}%` }}
              transition={{ delay: i * 0.08, duration: 0.6, type: 'spring' }}
              className="w-full rounded-t-lg bg-gradient-to-t from-brand-600 to-brand-400 relative group cursor-pointer"
            >
              <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs font-bold text-ink-700 bg-white px-2 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity">
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

function DonutChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((s, c) => s + c.value, 0);
  let offset = 0;
  const r = 60;
  const circ = 2 * Math.PI * r;

  return (
    <div className="flex items-center gap-6">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={r} fill="none" stroke="#f1f5f9" strokeWidth="16" />
        {data.map((c, i) => {
          const dash = (c.value / total) * circ;
          const el = (
            <motion.circle
              key={c.label}
              cx="70" cy="70" r={r} fill="none" stroke={c.color} strokeWidth="16"
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={-offset}
              transform="rotate(-90 70 70)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.1 }}
            />
          );
          offset += dash;
          return el;
        })}
      </svg>
      <div className="space-y-2 flex-1">
        {data.map((c) => (
          <div key={c.label} className="flex items-center gap-2 text-sm">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
            <span className="text-ink-600 flex-1">{c.label}</span>
            <span className="font-semibold text-ink-800">{c.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
