import { useState } from 'react';
import {
  User, Mail, Phone, MapPin, Building2, FileText, ShieldCheck,
  Upload, Save, Bike, Star, Truck, Heart, Home, Award,
} from 'lucide-react';
import { DashboardLayout, PageHeader } from '@/components/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { VerificationBadge } from '@/components/ui/VerificationBadge';
import { Badge } from '@/components/ui/Badge';
import { useApp } from '@/store/AppContext';
import { useToast } from '@/components/ui/Toast';

export function ProfilePage() {
  const { users, currentUserId, updateProfile } = useApp();
  const { show } = useToast();
  const user = users.find((u) => u.id === currentUserId);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    location: user?.location || '',
  });

  if (!user) return null;

  const handleSave = () => {
    updateProfile(form);
    setEditing(false);
    show('Profile updated successfully!', 'success');
  };

  const roleIcon = { donor: Heart, ngo: Home, volunteer: Bike, admin: ShieldCheck };
  const RoleIcon = roleIcon[user.role];

  return (
    <DashboardLayout>
      <PageHeader
        title="Profile"
        subtitle="Manage your account information"
        action={editing ? (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
            <Button onClick={handleSave}><Save className="w-4 h-4" /> Save</Button>
          </div>
        ) : (
          <Button variant="outline" onClick={() => setEditing(true)}>Edit Profile</Button>
        )}
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile card */}
        <Card className="p-6 text-center">
          <div className="relative inline-block mb-4">
            <div className="w-24 h-24 rounded-full mx-auto flex items-center justify-center text-white text-3xl font-bold" style={{ backgroundColor: user.avatarColor }}>
              {user.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
            </div>
            <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white border-2 border-ink-100 flex items-center justify-center">
              <RoleIcon className="w-4 h-4 text-brand-600" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-ink-900">{user.name}</h2>
          <p className="text-sm text-ink-400">{user.email}</p>
          <div className="flex justify-center gap-2 mt-3">
            <Badge tone="brand" dot>{user.role}</Badge>
            {user.role === 'ngo' && <VerificationBadge status={user.verified} size="sm" />}
          </div>
          <div className="mt-6 pt-6 border-t border-ink-100 space-y-2 text-sm text-left">
            <div className="flex items-center gap-2 text-ink-600"><Phone className="w-4 h-4 text-ink-400" />{user.phone}</div>
            <div className="flex items-center gap-2 text-ink-600"><MapPin className="w-4 h-4 text-ink-400" />{user.location}</div>
            {user.donorType && <div className="flex items-center gap-2 text-ink-600"><Building2 className="w-4 h-4 text-ink-400" />{user.donorType}</div>}
            {user.orgType && <div className="flex items-center gap-2 text-ink-600"><Building2 className="w-4 h-4 text-ink-400" />{user.orgType}</div>}
            {user.vehicleType && <div className="flex items-center gap-2 text-ink-600"><Bike className="w-4 h-4 text-ink-400" />{user.vehicleType}</div>}
          </div>
        </Card>

        {/* Edit form / details */}
        <div className="lg:col-span-2 space-y-6">
          {editing ? (
            <Card className="p-6">
              <h3 className="font-bold text-ink-900 mb-4">Edit Information</h3>
              <div className="space-y-4">
                <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} icon={<User className="w-4 h-4" />} />
                <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} icon={<Phone className="w-4 h-4" />} />
                <Input label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} icon={<MapPin className="w-4 h-4" />} />
              </div>
            </Card>
          ) : (
            <>
              {/* Role-specific info */}
              {user.role === 'ngo' && (
                <Card className="p-6">
                  <h3 className="font-bold text-ink-900 mb-4">Organization Details</h3>
                  <div className="space-y-3">
                    <DetailRow icon={Building2} label="Organization Type" value={user.orgType || 'N/A'} />
                    <DetailRow icon={FileText} label="Registration Number" value={user.registrationNumber || 'N/A'} />
                    <DetailRow icon={ShieldCheck} label="Verification Status" value={<VerificationBadge status={user.verified} size="sm" />} />
                    <DetailRow icon={Building2} label="Capacity" value={`${user.capacity || 0} meals`} />
                  </div>
                  {user.verified === 'pending' && (
                    <div className="mt-4 p-4 rounded-xl bg-warm-50 border border-warm-200">
                      <p className="text-sm text-warm-700 font-medium">
                        Your organization is pending verification. An admin will review your application shortly.
                      </p>
                    </div>
                  )}
                  {user.verified === 'rejected' && (
                    <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200">
                      <p className="text-sm text-red-700 font-medium">
                        Your verification was rejected. Please review your registration documents and contact support.
                      </p>
                    </div>
                  )}
                </Card>
              )}

              {user.role === 'volunteer' && (
                <Card className="p-6">
                  <h3 className="font-bold text-ink-900 mb-4">Volunteer Stats</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-ink-50 text-center">
                      <Truck className="w-6 h-6 text-brand-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-ink-900">{user.totalDeliveries || 0}</p>
                      <p className="text-xs text-ink-400">Deliveries</p>
                    </div>
                    <div className="p-4 rounded-xl bg-ink-50 text-center">
                      <Star className="w-6 h-6 text-warm-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-ink-900">{user.rating || 0}</p>
                      <p className="text-xs text-ink-400">Rating</p>
                    </div>
                    <div className="p-4 rounded-xl bg-ink-50 text-center">
                      <Award className="w-6 h-6 text-accent-500 mx-auto mb-2" />
                      <p className="text-sm font-bold text-ink-900">{user.vehicleType}</p>
                      <p className="text-xs text-ink-400">Vehicle</p>
                    </div>
                  </div>
                </Card>
              )}

              {user.role === 'donor' && (
                <Card className="p-6">
                  <h3 className="font-bold text-ink-900 mb-4">Donor Information</h3>
                  <div className="space-y-3">
                    <DetailRow icon={Building2} label="Donor Type" value={user.donorType || 'N/A'} />
                    <DetailRow icon={MapPin} label="Location" value={user.location} />
                    <DetailRow icon={Phone} label="Contact" value={user.phone} />
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function DetailRow({ icon: Icon, label, value }: { icon: typeof User; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <span className="flex items-center gap-2 text-sm text-ink-400">
        <Icon className="w-4 h-4" />
        {label}
      </span>
      <span className="text-sm font-semibold text-ink-800">{value}</span>
    </div>
  );
}
