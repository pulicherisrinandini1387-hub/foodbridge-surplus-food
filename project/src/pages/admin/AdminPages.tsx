import { useState } from 'react';
import {
  Users, Building2, Package, Truck, Bike, Shield, FileWarning,
  Search, CheckCircle2, XCircle, Eye, Ban, Utensils, Activity,
  AlertTriangle, TrendingUp, Leaf,
} from 'lucide-react';
import { DashboardLayout, PageHeader } from '@/components/DashboardLayout';
import { Card, StatCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { VerificationBadge } from '@/components/ui/VerificationBadge';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';
import { useApp } from '@/store/AppContext';
import { useToast } from '@/components/ui/Toast';
import type { Role, VerificationStatus } from '@/types';

export function AdminOverview() {
  const { users, donations, deliveries } = useApp();

  const donors = users.filter((u) => u.role === 'donor');
  const ngos = users.filter((u) => u.role === 'ngo');
  const volunteers = users.filter((u) => u.role === 'volunteer');
  const verifiedNgos = ngos.filter((u) => u.verified === 'verified');
  const pendingNgos = ngos.filter((u) => u.verified === 'pending');
  const todayDonations = donations.filter((d) => new Date(d.postedAt).toDateString() === new Date().toDateString());
  const completedDeliveries = deliveries.filter((d) => d.status === 'delivered');
  const foodRescued = Math.round(donations.reduce((s, d) => s + d.meals, 0) * 0.4);
  const flagged = users.filter((u) => u.verified === 'rejected');

  return (
    <DashboardLayout>
      <PageHeader title="Admin Overview" subtitle="Platform-wide statistics and management" />

      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4 mb-8">
        <StatCard icon={<Users className="w-5 h-5" />} label="Total Users" value={users.length} color="brand" />
        <StatCard icon={<Utensils className="w-5 h-5" />} label="Active Donors" value={donors.length} color="accent" />
        <StatCard icon={<Building2 className="w-5 h-5" />} label="Verified NGOs" value={verifiedNgos.length} color="blue" />
        <StatCard icon={<Bike className="w-5 h-5" />} label="Active Volunteers" value={volunteers.length} color="warm" />
        <StatCard icon={<Package className="w-5 h-5" />} label="Donations Today" value={todayDonations.length} color="purple" />
        <StatCard icon={<Truck className="w-5 h-5" />} label="Deliveries" value={completedDeliveries.length} color="green" />
        <StatCard icon={<Leaf className="w-5 h-5" />} label="Food Rescued (kg)" value={foodRescued} color="brand" />
        <StatCard icon={<AlertTriangle className="w-5 h-5" />} label="Flagged" value={flagged.length} color="red" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pending verifications */}
        <Card className="p-6">
          <h3 className="font-bold text-ink-900 mb-4">Pending NGO Verifications</h3>
          {pendingNgos.length === 0 ? (
            <p className="text-sm text-ink-400 py-6 text-center">No pending verifications</p>
          ) : (
            <div className="space-y-3">
              {pendingNgos.map((n) => (
                <div key={n.id} className="flex items-center gap-3 p-3 rounded-xl bg-warm-50 border border-warm-200">
                  <Avatar name={n.name} color={n.avatarColor} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink-900 truncate">{n.name}</p>
                    <p className="text-xs text-ink-400">{n.registrationNumber}</p>
                  </div>
                  <VerificationBadge status="pending" size="sm" />
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent donations */}
        <Card className="p-6">
          <h3 className="font-bold text-ink-900 mb-4">Recent Donations</h3>
          <div className="space-y-3">
            {donations.slice(0, 5).map((d) => (
              <div key={d.id} className="flex items-center gap-3 p-3 rounded-xl bg-ink-50">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0" style={{ backgroundColor: d.imageColor }}>
                  <Utensils className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink-900 truncate">{d.foodName}</p>
                  <p className="text-xs text-ink-400">{d.donorName} • {d.meals} meals</p>
                </div>
                <StatusBadge status={d.status} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export function AdminUsers() {
  const { users, suspendUser } = useApp();
  const { show } = useToast();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | Role>('all');
  const [page, setPage] = useState(0);
  const perPage = 10;

  const filtered = users.filter((u) => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const paginated = filtered.slice(page * perPage, (page + 1) * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  return (
    <DashboardLayout>
      <PageHeader title="Users" subtitle={`${users.length} total users`} />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <input type="text" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full h-11 pl-11 pr-4 rounded-xl bg-white border border-ink-200 text-sm outline-none focus:border-brand-500" />
        </div>
        <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value as 'all' | Role); setPage(0); }} className="h-11 px-4 rounded-xl bg-white border border-ink-200 text-sm font-medium cursor-pointer">
          <option value="all">All roles</option>
          <option value="donor">Donors</option>
          <option value="ngo">NGOs</option>
          <option value="volunteer">Volunteers</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-ink-50 text-xs text-ink-400 font-semibold uppercase">
              <tr>
                <th className="text-left px-4 py-3">User</th>
                <th className="text-left px-4 py-3">Role</th>
                <th className="text-left px-4 py-3 hidden sm:table-cell">Location</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Status</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {paginated.map((u) => (
                <tr key={u.id} className="hover:bg-ink-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={u.name} color={u.avatarColor} size="sm" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-ink-900 truncate">{u.name}</p>
                        <p className="text-xs text-ink-400 truncate">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={u.role === 'donor' ? 'brand' : u.role === 'ngo' ? 'blue' : u.role === 'volunteer' ? 'accent' : 'gray'}>
                      {u.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-sm text-ink-600">{u.location}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {u.role === 'ngo' ? <VerificationBadge status={u.verified} size="sm" /> : <Badge tone="green" dot>Active</Badge>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" onClick={() => { suspendUser(u.id); show('User suspended', 'info'); }}>
                      <Ban className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-ink-100">
            <span className="text-sm text-ink-400">Page {page + 1} of {totalPages}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>Next</Button>
            </div>
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
}

export function AdminNgos() {
  const { users, verifyNGO, rejectNGO } = useApp();
  const { show } = useToast();
  const ngos = users.filter((u) => u.role === 'ngo');

  return (
    <DashboardLayout>
      <PageHeader title="NGOs" subtitle={`${ngos.length} organizations`} />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ngos.map((n) => (
          <Card key={n.id} className="p-5">
            <div className="flex items-start gap-3 mb-4">
              <Avatar name={n.name} color={n.avatarColor} size="md" />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-ink-900 truncate">{n.name}</h3>
                <p className="text-xs text-ink-400">{n.location}</p>
              </div>
              <VerificationBadge status={n.verified} size="sm" />
            </div>
            <div className="space-y-1.5 text-sm mb-4">
              <div className="flex justify-between"><span className="text-ink-400">Type</span><span className="font-medium text-ink-700">{n.orgType}</span></div>
              <div className="flex justify-between"><span className="text-ink-400">Reg. No.</span><span className="font-medium text-ink-700">{n.registrationNumber}</span></div>
              <div className="flex justify-between"><span className="text-ink-400">Capacity</span><span className="font-medium text-ink-700">{n.capacity} meals</span></div>
            </div>
            {n.verified === 'pending' && (
              <div className="flex gap-2">
                <Button size="sm" fullWidth onClick={() => { verifyNGO(n.id); show('NGO verified!', 'success'); }}>
                  <CheckCircle2 className="w-4 h-4" /> Verify
                </Button>
                <Button variant="danger" size="sm" onClick={() => { rejectNGO(n.id); show('NGO rejected', 'error'); }}>
                  <XCircle className="w-4 h-4" />
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}

export function AdminDonations() {
  const { donations } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = donations.filter((d) => {
    if (statusFilter !== 'all' && d.status !== statusFilter) return false;
    if (search && !d.foodName.toLowerCase().includes(search.toLowerCase()) && !d.donorName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <DashboardLayout>
      <PageHeader title="Donations" subtitle={`${donations.length} total donations`} />
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <input type="text" placeholder="Search donations..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full h-11 pl-11 pr-4 rounded-xl bg-white border border-ink-200 text-sm outline-none focus:border-brand-500" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-11 px-4 rounded-xl bg-white border border-ink-200 text-sm font-medium cursor-pointer">
          <option value="all">All statuses</option>
          <option value="POSTED">Posted</option>
          <option value="CLAIMED">Claimed</option>
          <option value="PICKUP_ASSIGNED">Pickup Assigned</option>
          <option value="PICKED_UP">Picked Up</option>
          <option value="DELIVERED">Delivered</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-ink-50 text-xs text-ink-400 font-semibold uppercase">
              <tr>
                <th className="text-left px-4 py-3">Food</th>
                <th className="text-left px-4 py-3 hidden sm:table-cell">Donor</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Meals</th>
                <th className="text-left px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {filtered.map((d) => (
                <tr key={d.id} className="hover:bg-ink-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0" style={{ backgroundColor: d.imageColor }}>
                        <Utensils className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-semibold text-ink-900">{d.foodName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-sm text-ink-600">{d.donorName}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-sm text-ink-600">{d.meals}</td>
                  <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </DashboardLayout>
  );
}

export function AdminDeliveries() {
  const { deliveries } = useApp();
  return (
    <DashboardLayout>
      <PageHeader title="Deliveries" subtitle={`${deliveries.length} total deliveries`} />
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-ink-50 text-xs text-ink-400 font-semibold uppercase">
              <tr>
                <th className="text-left px-4 py-3">Volunteer</th>
                <th className="text-left px-4 py-3 hidden sm:table-cell">Donor</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">NGO</th>
                <th className="text-left px-4 py-3 hidden lg:table-cell">Meals</th>
                <th className="text-left px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {deliveries.map((d) => (
                <tr key={d.id} className="hover:bg-ink-50">
                  <td className="px-4 py-3 text-sm font-semibold text-ink-900">{d.volunteerName}</td>
                  <td className="px-4 py-3 hidden sm:table-cell text-sm text-ink-600">{d.donorName}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-sm text-ink-600">{d.ngoName}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-sm text-ink-600">{d.meals}</td>
                  <td className="px-4 py-3"><Badge tone={d.status === 'delivered' ? 'green' : 'warm'} dot>{d.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </DashboardLayout>
  );
}

export function AdminVolunteers() {
  const { users } = useApp();
  const volunteers = users.filter((u) => u.role === 'volunteer');
  return (
    <DashboardLayout>
      <PageHeader title="Volunteers" subtitle={`${volunteers.length} volunteers`} />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {volunteers.map((v) => (
          <Card key={v.id} className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <Avatar name={v.name} color={v.avatarColor} size="md" />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-ink-900 truncate">{v.name}</h3>
                <p className="text-xs text-ink-400">{v.location}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-lg bg-ink-50">
                <p className="text-lg font-bold text-ink-900">{v.totalDeliveries}</p>
                <p className="text-xs text-ink-400">Deliveries</p>
              </div>
              <div className="p-2 rounded-lg bg-ink-50">
                <p className="text-lg font-bold text-ink-900">{v.rating}</p>
                <p className="text-xs text-ink-400">Rating</p>
              </div>
              <div className="p-2 rounded-lg bg-ink-50">
                <p className="text-sm font-bold text-ink-900">{v.vehicleType}</p>
                <p className="text-xs text-ink-400">Vehicle</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}

export function AdminVerification() {
  const { users, verifyNGO, rejectNGO } = useApp();
  const { show } = useToast();
  const pending = users.filter((u) => u.role === 'ngo' && u.verified === 'pending');
  const verified = users.filter((u) => u.role === 'ngo' && u.verified === 'verified');
  const rejected = users.filter((u) => u.role === 'ngo' && u.verified === 'rejected');

  return (
    <DashboardLayout>
      <PageHeader title="Verification" subtitle="Review and verify NGO organizations" />

      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard icon={<Activity className="w-5 h-5" />} label="Pending" value={pending.length} color="warm" />
        <StatCard icon={<CheckCircle2 className="w-5 h-5" />} label="Verified" value={verified.length} color="brand" />
        <StatCard icon={<XCircle className="w-5 h-5" />} label="Rejected" value={rejected.length} color="red" />
      </div>

      <h3 className="font-bold text-ink-900 mb-4">Pending Review</h3>
      {pending.length === 0 ? (
        <Card><EmptyState icon={<Shield className="w-7 h-7" />} title="No pending verifications" description="All NGO applications have been reviewed." /></Card>
      ) : (
        <div className="space-y-4">
          {pending.map((n) => (
            <Card key={n.id} className="p-5">
              <div className="flex flex-col sm:flex-row gap-4">
                <Avatar name={n.name} color={n.avatarColor} size="lg" />
                <div className="flex-1">
                  <h3 className="font-bold text-ink-900">{n.name}</h3>
                  <p className="text-sm text-ink-500">{n.orgType} • {n.location}</p>
                  <div className="grid sm:grid-cols-2 gap-2 mt-3 text-sm">
                    <div className="flex justify-between p-2 rounded-lg bg-ink-50"><span className="text-ink-400">Reg. Number</span><span className="font-medium">{n.registrationNumber}</span></div>
                    <div className="flex justify-between p-2 rounded-lg bg-ink-50"><span className="text-ink-400">Capacity</span><span className="font-medium">{n.capacity} meals</span></div>
                    <div className="flex justify-between p-2 rounded-lg bg-ink-50"><span className="text-ink-400">Phone</span><span className="font-medium">{n.phone}</span></div>
                    <div className="flex justify-between p-2 rounded-lg bg-ink-50"><span className="text-ink-400">Email</span><span className="font-medium truncate">{n.email}</span></div>
                  </div>
                </div>
                <div className="flex sm:flex-col gap-2">
                  <Button onClick={() => { verifyNGO(n.id); show('NGO verified successfully!', 'success'); }}>
                    <CheckCircle2 className="w-4 h-4" /> Approve
                  </Button>
                  <Button variant="danger" onClick={() => { rejectNGO(n.id); show('NGO rejected', 'error'); }}>
                    <XCircle className="w-4 h-4" /> Reject
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}

export function AdminReports() {
  const { donations, users } = useApp();
  const reports = [
    { id: 'r1', type: 'Suspicious Donation', desc: 'Donation posted with unusually large quantity', status: 'open', reporter: 'System' },
    { id: 'r2', type: 'Expired Food', desc: 'Donation was not claimed before expiry', status: 'resolved', reporter: 'Auto' },
    { id: 'r3', type: 'NGO Verification Issue', desc: 'Registration number could not be verified', status: 'open', reporter: 'Admin' },
  ];

  return (
    <DashboardLayout>
      <PageHeader title="Reports" subtitle="Review flagged issues and reports" />
      <div className="space-y-4">
        {reports.map((r) => (
          <Card key={r.id} className="p-5">
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${r.status === 'open' ? 'bg-red-50 text-red-600' : 'bg-brand-50 text-brand-600'}`}>
                <FileWarning className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-ink-900">{r.type}</h3>
                  <Badge tone={r.status === 'open' ? 'red' : 'green'} dot>{r.status}</Badge>
                </div>
                <p className="text-sm text-ink-500 mt-1">{r.desc}</p>
                <p className="text-xs text-ink-400 mt-1">Reported by: {r.reporter}</p>
              </div>
              {r.status === 'open' && <Button variant="outline" size="sm">Review</Button>}
            </div>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}
