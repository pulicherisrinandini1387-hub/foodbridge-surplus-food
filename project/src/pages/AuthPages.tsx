import { useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Utensils, Mail, Lock, ArrowRight, ArrowLeft, Heart, Home, Bike,
  Shield, User, Phone, Building2, FileText, Sparkles, CheckCircle2,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { useApp } from '@/store/AppContext';
import { useToast } from '@/components/ui/Toast';
import { demoCredentials } from '@/data/seed';
import type { Role, DonorType, OrgType } from '@/types';

function AuthShell({ children, title, subtitle }: { children: ReactNode; title: string; subtitle: string }) {
  return (
    <div className="min-h-screen flex bg-surface-0">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden p-12 flex-col justify-between">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900" />
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 70% 60%, white 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }} />
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-brand-400/30 rounded-full blur-[100px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-60 h-60 bg-accent-400/20 rounded-full blur-[80px] animate-pulse-glow" style={{ animationDelay: '1.5s' }} />

        <Link to="/" className="relative flex items-center gap-2.5 text-white z-10">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Utensils className="w-5 h-5" />
          </div>
          <span className="font-bold text-xl">FoodBridge</span>
        </Link>
        <div className="relative text-white z-10">
          <h2 className="text-4xl font-bold leading-tight">Turning surplus into someone's next meal.</h2>
          <p className="mt-4 text-brand-50/80 text-lg">Less waste. More meals. Stronger communities.</p>
          <div className="mt-8 space-y-3">
            {[
              'Real-time matching between donors and NGOs',
              'Verified organizations only',
              'Volunteer-powered delivery network',
              'Measurable social and environmental impact',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 text-brand-50/90">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="relative text-white/60 text-sm z-10">© 2026 FoodBridge. Built for hackathon demo.</div>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-surface-1">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white">
              <Utensils className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg text-ink-900">FoodBridge</span>
          </Link>
          <h1 className="text-2xl font-bold text-ink-900">{title}</h1>
          <p className="text-ink-500 mt-1.5">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </motion.div>
      </div>
    </div>
  );
}

export function LoginPage() {
  const { login, loginAs } = useApp();
  const { show } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      const result = login(email);
      setLoading(false);
      if (result.ok) {
        show('Welcome back to FoodBridge!', 'success');
        navigate('/app');
      } else {
        setError(result.error || 'Login failed');
      }
    }, 400);
  };

  const handleDemo = (userId: string, role: Role) => {
    loginAs(userId);
    show(`Logged in as demo ${role}`, 'success');
    navigate('/app');
  };

  return (
    <AuthShell title="Welcome back" subtitle="Login to access your FoodBridge dashboard">
      <form onSubmit={handleLogin} className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          icon={<Mail className="w-4 h-4" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          icon={<Lock className="w-4 h-4" />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 font-medium">
            {error}
          </div>
        )}
        <div className="flex justify-between items-center text-sm">
          <Link to="/forgot-password" className="text-brand-600 hover:text-brand-700 font-medium">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" fullWidth size="lg" loading={loading}>
          Login <ArrowRight className="w-4 h-4" />
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-ink-500">
        Don't have an account?{' '}
        <Link to="/signup" className="text-brand-600 hover:text-brand-700 font-semibold">
          Sign up
        </Link>
      </div>

      {/* Demo accounts */}
      <div className="mt-8 pt-6 border-t border-ink-100">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-accent-500" />
          <p className="text-sm font-semibold text-ink-700">Explore Demo — no account needed</p>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {demoCredentials.map((cred) => {
            const icons: Record<Role, LucideIcon> = { donor: Heart, ngo: Home, volunteer: Bike, admin: Shield };
            const Icon = icons[cred.role];
            return (
              <button
                key={cred.userId}
                onClick={() => handleDemo(cred.userId, cred.role)}
                className="flex items-center gap-2.5 p-3 rounded-xl border border-ink-200 bg-white hover:border-brand-300 hover:bg-brand-50 transition-all duration-200 text-left group"
              >
                <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600 group-hover:bg-brand-100 transition-colors">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-ink-800 truncate">{cred.label}</p>
                  <p className="text-xs text-ink-400 truncate">{cred.name}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </AuthShell>
  );
}

const roleOptions = [
  { value: 'donor', label: 'Food Donor', icon: Heart, desc: 'Restaurants, hotels, caterers, grocery stores, households' },
  { value: 'ngo', label: 'NGO / Receiver', icon: Home, desc: 'NGOs, shelters, orphanages, community kitchens' },
  { value: 'volunteer', label: 'Volunteer', icon: Bike, desc: 'Individuals who can pick up and deliver food' },
];

export function SignupPage() {
  const { signup } = useApp();
  const { show } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<Role | ''>('');
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '', location: '',
    donorType: '' as DonorType | '', orgType: '' as OrgType | '',
    registrationNumber: '', vehicleType: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      const result = signup({
        name: form.name,
        email: form.email,
        role: role as Role,
        phone: form.phone,
        location: form.location,
        donorType: form.donorType || undefined,
        orgType: form.orgType || undefined,
        registrationNumber: form.registrationNumber || undefined,
        vehicleType: form.vehicleType || undefined,
      });
      setLoading(false);
      if (result.ok) {
        show('Account created! Welcome to FoodBridge.', 'success');
        navigate('/app');
      } else {
        setError(result.error || 'Signup failed');
      }
    }, 500);
  };

  return (
    <AuthShell title="Create your account" subtitle="Join FoodBridge and start making a difference">
      {step === 1 && (
        <div className="space-y-4">
          <p className="text-sm font-semibold text-ink-700">Choose your role</p>
          <div className="space-y-2.5">
            {roleOptions.map((opt) => {
              const Icon = opt.icon;
              const selected = role === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setRole(opt.value as Role)}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                    selected ? 'border-brand-500 bg-brand-50' : 'border-ink-200 hover:border-ink-300 bg-white'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selected ? 'bg-brand-600 text-white' : 'bg-surface-3 text-ink-400'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-ink-800">{opt.label}</p>
                    <p className="text-xs text-ink-400">{opt.desc}</p>
                  </div>
                  {selected && <div className="w-5 h-5 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs">✓</div>}
                </button>
              );
            })}
          </div>
          <Button fullWidth size="lg" disabled={!role} onClick={() => setStep(2)}>
            Continue <ArrowRight className="w-4 h-4" />
          </Button>
          <div className="text-center text-sm text-ink-500">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-600 font-semibold">Login</Link>
          </div>
        </div>
      )}

      {step === 2 && role && (
        <form onSubmit={handleSignup} className="space-y-4">
          <button type="button" onClick={() => setStep(1)} className="flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-800">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <Input label="Full Name" placeholder={role === 'ngo' ? 'Organization name' : 'Your name'} icon={<User className="w-4 h-4" />} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Email" type="email" placeholder="you@example.com" icon={<Mail className="w-4 h-4" />} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <Input label="Password" type="password" placeholder="••••••••" icon={<Lock className="w-4 h-4" />} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <Input label="Phone" placeholder="+91 98450 12345" icon={<Phone className="w-4 h-4" />} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
          <Input label="Location" placeholder="Bengaluru" icon={<Building2 className="w-4 h-4" />} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />

          {role === 'donor' && (
            <Select
              label="Donor Type"
              value={form.donorType}
              onChange={(e) => setForm({ ...form, donorType: e.target.value as DonorType })}
              options={[
                { value: '', label: 'Select type' },
                { value: 'Restaurant', label: 'Restaurant' },
                { value: 'Hotel', label: 'Hotel' },
                { value: 'Caterer', label: 'Caterer' },
                { value: 'Grocery Store', label: 'Grocery Store' },
                { value: 'Event Organizer', label: 'Event Organizer' },
                { value: 'Household', label: 'Household' },
              ]}
              required
            />
          )}

          {role === 'ngo' && (
            <>
              <Select
                label="Organization Type"
                value={form.orgType}
                onChange={(e) => setForm({ ...form, orgType: e.target.value as OrgType })}
                options={[
                  { value: '', label: 'Select type' },
                  { value: 'NGO', label: 'NGO' },
                  { value: 'Shelter', label: 'Shelter' },
                  { value: 'Orphanage', label: 'Orphanage' },
                  { value: 'Community Kitchen', label: 'Community Kitchen' },
                ]}
                required
              />
              <Input
                label="Registration Number"
                placeholder="KA-NGO-2024-XXXX"
                icon={<FileText className="w-4 h-4" />}
                value={form.registrationNumber}
                onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })}
                required
              />
            </>
          )}

          {role === 'volunteer' && (
            <Select
              label="Vehicle Type"
              value={form.vehicleType}
              onChange={(e) => setForm({ ...form, vehicleType: e.target.value })}
              options={[
                { value: '', label: 'Select vehicle' },
                { value: 'Bike', label: 'Bike' },
                { value: 'Scooter', label: 'Scooter' },
                { value: 'Car', label: 'Car' },
                { value: 'On Foot', label: 'On Foot' },
              ]}
              required
            />
          )}

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 font-medium">{error}</div>
          )}

          <Button type="submit" fullWidth size="lg" loading={loading}>
            Create Account <ArrowRight className="w-4 h-4" />
          </Button>
        </form>
      )}
    </AuthShell>
  );
}

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const { show } = useToast();

  return (
    <AuthShell title="Forgot password" subtitle="We'll send you a reset link">
      {sent ? (
        <div className="text-center py-6">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 mx-auto mb-4">
            <Mail className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-ink-900 text-lg">Check your email</h3>
          <p className="text-sm text-ink-500 mt-2">We've sent a password reset link to {email}</p>
          <Link to="/login" className="block mt-6">
            <Button variant="outline" fullWidth>Back to Login</Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); setSent(true); show('Reset link sent!', 'success'); }} className="space-y-4">
          <Input label="Email" type="email" placeholder="you@example.com" icon={<Mail className="w-4 h-4" />} value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Button type="submit" fullWidth size="lg">Send Reset Link</Button>
          <div className="text-center text-sm text-ink-500">
            <Link to="/login" className="text-brand-600 font-semibold">Back to Login</Link>
          </div>
        </form>
      )}
    </AuthShell>
  );
}
