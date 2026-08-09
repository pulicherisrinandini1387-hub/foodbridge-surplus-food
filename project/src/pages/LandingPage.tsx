import { useEffect, useState, useRef, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useMotionValue, animate, useScroll, useTransform } from 'framer-motion';
import {
  Utensils, Search, HandHeart, Truck, ArrowRight, MapPin,
  Users, ShieldCheck, Activity, BarChart3, Leaf, Clock, Bike,
  Building2, Star, CheckCircle2, Sparkles, TrendingUp,
  Heart, ChevronRight, FileWarning, Package, Navigation,
  X as CloseIcon, Menu as MenuIcon,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ExpiryTimer } from '@/components/ui/ExpiryTimer';
import { useApp } from '@/store/AppContext';
import { testimonials } from '@/data/seed';

function AnimatedCounter({ value, suffix = '', decimals = 0 }: { value: number; suffix?: string; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const motionVal = useMotionValue(0);
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    if (!inView) return;
    const controls = animate(motionVal, value, {
      duration: 2,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(v.toFixed(decimals)),
    });
    return controls.stop;
  }, [inView, value, decimals, motionVal]);

  return (
    <span ref={ref} className="tabular-nums">
      {Number(display).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </span>
  );
}

function useMouseParallax() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      x.set((e.clientX - cx) / cx);
      y.set((e.clientY - cy) / cy);
    };
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, [x, y]);
  return { x, y };
}

function ParticleField() {
  const particles = useRef(
    Array.from({ length: 18 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1.5,
      duration: Math.random() * 8 + 6,
      delay: Math.random() * 5,
    })),
  ).current;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-brand-400/50"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            boxShadow: '0 0 8px rgba(52, 211, 153, 0.5)',
          }}
          animate={{ y: [0, -40, 0], opacity: [0, 1, 0] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

function FloatingFoodElements() {
  const items = [
    { emoji: '🍱', x: '8%', y: '20%', size: 48, delay: 0, float: 6 },
    { emoji: '🥗', x: '85%', y: '15%', size: 44, delay: 1, float: 7 },
    { emoji: '🍞', x: '78%', y: '70%', size: 40, delay: 0.5, float: 8 },
    { emoji: '🍎', x: '12%', y: '75%', size: 36, delay: 1.5, float: 5 },
    { emoji: '🥘', x: '50%', y: '8%', size: 38, delay: 2, float: 9 },
    { emoji: '🧺', x: '90%', y: '45%', size: 42, delay: 0.8, float: 6.5 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {items.map((item, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ left: item.x, top: item.y, fontSize: item.size }}
          animate={{ y: [0, -20, 0], rotate: [0, 5, -5, 0] }}
          transition={{ duration: item.float, delay: item.delay, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="opacity-25" style={{ filter: 'drop-shadow(0 4px 12px rgba(16,185,129,0.3))' }}>
            {item.emoji}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function FloatingGlassCards() {
  const { x, y } = useMouseParallax();
  const xMov1 = useTransform(x, [-1, 1], [-15, 15]);
  const yMov1 = useTransform(y, [-1, 1], [-10, 10]);
  const xMov2 = useTransform(x, [-1, 1], [15, -15]);
  const yMov2 = useTransform(y, [-1, 1], [10, -10]);
  const xMov3 = useTransform(x, [-1, 1], [-8, 8]);
  const yMov3 = useTransform(y, [-1, 1], [8, -8]);

  const cards = [
    { icon: Utensils, label: '165 Meals Rescued', tone: 'brand', x: xMov1, y: yMov1, pos: 'top-[10%] right-[5%]', delay: 1.0 },
    { icon: Building2, label: '18 NGOs Nearby', tone: 'blue', x: xMov2, y: yMov2, pos: 'bottom-[15%] left-[3%]', delay: 1.3 },
    { icon: MapPin, label: '2.4 km Away', tone: 'accent', x: xMov3, y: yMov3, pos: 'top-[50%] right-[0%]', delay: 1.6 },
    { icon: Package, label: '94% Delivered', tone: 'warm', x: xMov1, y: yMov2, pos: 'bottom-[5%] right-[15%]', delay: 1.9 },
  ];

  const toneMap: Record<string, string> = {
    brand: 'text-brand-600 bg-brand-50',
    blue: 'text-blue-600 bg-blue-50',
    accent: 'text-accent-600 bg-accent-50',
    warm: 'text-warm-600 bg-warm-50',
  };

  return (
    <>
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={i}
            style={{ x: card.x, y: card.y }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: card.delay, type: 'spring', damping: 20 }}
            className={`absolute ${card.pos} z-20 hidden md:block`}
          >
            <div className="glass-card rounded-2xl shadow-float px-4 py-3 flex items-center gap-3 animate-float border border-white/60" style={{ animationDelay: `${i * 0.5}s` }}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${toneMap[card.tone]}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-ink-800 leading-none">{card.label}</p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </>
  );
}

function NetworkLines() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1000 600" preserveAspectRatio="none">
      <defs>
        <linearGradient id="lineGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="lineGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f97316" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="lineGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path d="M 150 200 Q 400 100 500 300" fill="none" stroke="url(#lineGrad1)" strokeWidth="2" strokeDasharray="8 8"
        initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }} />
      <motion.path d="M 500 300 Q 600 400 850 350" fill="none" stroke="url(#lineGrad2)" strokeWidth="2" strokeDasharray="8 8"
        initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 2, delay: 0.5, repeat: Infinity, repeatType: 'reverse' }} />
      <motion.path d="M 850 350 Q 600 500 200 450" fill="none" stroke="url(#lineGrad3)" strokeWidth="2" strokeDasharray="8 8"
        initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 2, delay: 1, repeat: Infinity, repeatType: 'reverse' }} />
    </svg>
  );
}

function HeroSection() {
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, 100]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-20 pb-12">
      <div className="absolute inset-0 -z-10 animated-gradient" />
      <div className="absolute inset-0 -z-10 mesh-bg" />
      <ParticleField />
      <FloatingFoodElements />
      <NetworkLines />

      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-300/30 rounded-full blur-[120px] animate-pulse-glow -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-300/20 rounded-full blur-[100px] animate-pulse-glow -z-10" style={{ animationDelay: '1.5s' }} />

      <motion.div style={{ y: heroY, opacity: heroOpacity }} className="max-w-7xl mx-auto px-4 lg:px-8 w-full">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-brand-700 text-sm font-semibold mb-6 border border-brand-200/50"
          >
            <Sparkles className="w-4 h-4" />
            Real-time surplus food redistribution
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-7xl font-bold text-ink-900 leading-[1.05] tracking-tight"
          >
            Turn Surplus Food Into{' '}
            <span className="text-gradient">Someone's Next Meal.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-6 text-lg lg:text-xl text-ink-600 leading-relaxed max-w-2xl mx-auto"
          >
            FoodBridge connects surplus food with verified NGOs and volunteers in real time — turning waste into measurable social impact.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Link to="/signup">
              <Button size="lg" className="group w-full sm:w-auto">
                Donate Surplus Food
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                <MapPin className="w-4 h-4" />
                Find Food Nearby
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            className="mt-10 flex items-center justify-center gap-6 text-sm text-ink-500 font-medium"
          >
            <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-brand-600" /> Verified NGOs</div>
            <div className="flex items-center gap-2"><Users className="w-4 h-4 text-brand-600" /> 312+ Donors</div>
            <div className="flex items-center gap-2"><Leaf className="w-4 h-4 text-brand-600" /> Eco Impact</div>
          </motion.div>
        </div>
      </motion.div>

      <FloatingGlassCards />

      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <div className="scroll-indicator" />
        <span className="text-xs text-ink-500 font-medium">Scroll to explore</span>
      </motion.div>
    </section>
  );
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const navLinks = [
    { href: '#how', label: 'How It Works' },
    { href: '#network', label: 'Live Network' },
    { href: '#impact', label: 'Impact' },
    { href: '#safety', label: 'Safety' },
  ];

  return (
    <nav className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${scrolled ? 'w-[95%] max-w-5xl' : 'w-[92%] max-w-6xl'}`}>
      <div className={`glass-nav rounded-2xl shadow-float px-4 lg:px-6 h-14 flex items-center justify-between transition-all duration-300`}>
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-glow">
            <Utensils className="w-4 h-4" />
          </div>
          <span className="font-bold text-ink-900 text-lg">FoodBridge</span>
        </Link>

        <div className="hidden md:flex items-center gap-7 text-sm font-medium text-ink-600">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-brand-700 transition-colors">
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          <Link to="/login"><Button variant="ghost" size="sm">Login</Button></Link>
          <Link to="/signup"><Button size="sm">Get Started</Button></Link>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center text-ink-600 hover:bg-surface-3"
        >
          {mobileOpen ? <CloseIcon className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
        </button>
      </div>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="md:hidden mt-2 glass-nav rounded-2xl shadow-float p-4 space-y-1"
        >
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-sm font-medium text-ink-600 hover:bg-surface-3 hover:text-brand-700 transition-colors">
              {link.label}
            </a>
          ))}
          <div className="pt-2 flex flex-col gap-2">
            <Link to="/login"><Button variant="outline" fullWidth size="sm">Login</Button></Link>
            <Link to="/signup"><Button fullWidth size="sm">Get Started</Button></Link>
          </div>
        </motion.div>
      )}
    </nav>
  );
}

const journeySteps = [
  { icon: Utensils, title: 'Post Surplus', desc: 'Donors post surplus food in under 60 seconds with quantity, expiry, and pickup details.', color: 'brand' },
  { icon: Search, title: 'Smart Match', desc: 'Our system matches donations with verified NGOs based on distance, need, and food type.', color: 'accent' },
  { icon: HandHeart, title: 'Claim', desc: 'Verified NGOs claim available donations with a single tap. Smart matching prioritizes best fits.', color: 'warm' },
  { icon: Package, title: 'Pickup', desc: 'Volunteers or NGO staff coordinate pickup. Every step is tracked in real time.', color: 'blue' },
  { icon: Truck, title: 'Deliver', desc: 'Volunteers coordinate delivery. Track every step until the meal is served.', color: 'brand' },
];

function HowItWorksSection() {
  const colorMap: Record<string, string> = {
    brand: 'bg-brand-50 text-brand-600 border-brand-200',
    accent: 'bg-accent-50 text-accent-600 border-accent-200',
    warm: 'bg-warm-50 text-warm-600 border-warm-200',
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
  };

  return (
    <section id="how" className="py-20 lg:py-28 relative">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge tone="brand" size="md" className="mb-3">How FoodBridge Works</Badge>
          <h2 className="text-3xl lg:text-5xl font-bold text-ink-900">From surplus to served</h2>
          <p className="mt-3 text-ink-500 text-lg">A seamless flow that gets edible food to people who need it — fast.</p>
        </div>

        <div className="relative">
          <svg className="absolute top-12 left-0 w-full h-2 hidden lg:block" viewBox="0 0 1200 20" preserveAspectRatio="none">
            <defs>
              <linearGradient id="journeyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="25%" stopColor="#f97316" />
                <stop offset="50%" stopColor="#facc15" />
                <stop offset="75%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
            <line x1="0" y1="10" x2="1200" y2="10" stroke="rgba(15,23,42,0.06)" strokeWidth="2" />
            <motion.line x1="0" y1="10" x2="1200" y2="10" stroke="url(#journeyGrad)" strokeWidth="2" strokeDasharray="12 6"
              initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 2 }} className="flow-line" />
          </svg>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 lg:gap-4">
            {journeySteps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div key={step.title}
                  initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }}
                  transition={{ delay: i * 0.12 }} className="relative">
                  <Card hover className="p-6 h-full text-center group">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-white border border-ink-200 flex items-center justify-center text-xs font-bold text-ink-500 shadow-sm">
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 border ${colorMap[step.color]} group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <h3 className="font-bold text-ink-900 text-base">{step.title}</h3>
                    <p className="text-sm text-ink-500 mt-2 leading-relaxed">{step.desc}</p>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function LiveNetworkSection() {
  const stats = [
    { value: 127, label: 'Meals Available', icon: Utensils, color: 'brand' },
    { value: 18, label: 'Active NGOs', icon: Building2, color: 'blue' },
    { value: 32, label: 'Volunteers', icon: Bike, color: 'accent' },
    { value: 94, suffix: '%', label: 'Successfully Delivered', icon: CheckCircle2, color: 'warm' },
  ];

  const colorMap: Record<string, string> = {
    brand: 'text-brand-600 bg-brand-50',
    blue: 'text-blue-600 bg-blue-50',
    accent: 'text-accent-600 bg-accent-50',
    warm: 'text-warm-600 bg-warm-50',
  };

  return (
    <section id="network" className="py-20 lg:py-28 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-brand-300/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/3 w-80 h-80 bg-blue-300/15 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge tone="blue" size="md" className="mb-3">Live Network</Badge>
          <h2 className="text-3xl lg:text-5xl font-bold text-ink-900">A connected rescue network</h2>
          <p className="mt-3 text-ink-500 text-lg">Real-time visualization of food flowing from donors to communities.</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          <Card className="lg:col-span-3 p-6 relative overflow-hidden min-h-[400px]">
            <h3 className="font-bold text-ink-900 mb-4">Live City Map</h3>
            <StylizedCityMap />
          </Card>

          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}>
                  <Card className="p-5 hover:shadow-card-hover transition-all duration-300 card-3d">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[stat.color]} mb-3`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <p className="text-3xl font-bold text-ink-900 tracking-tight">
                      <AnimatedCounter value={stat.value} suffix={stat.suffix || ''} />
                    </p>
                    <p className="text-sm text-ink-500 mt-1 font-medium">{stat.label}</p>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function StylizedCityMap() {
  const nodes = [
    { x: 15, y: 25, type: 'restaurant', label: 'Restaurant' },
    { x: 45, y: 15, type: 'restaurant', label: 'Restaurant' },
    { x: 75, y: 30, type: 'restaurant', label: 'Cafe' },
    { x: 25, y: 55, type: 'ngo', label: 'NGO' },
    { x: 60, y: 60, type: 'ngo', label: 'Shelter' },
    { x: 85, y: 70, type: 'ngo', label: 'Community Kitchen' },
    { x: 40, y: 80, type: 'volunteer', label: 'Volunteer' },
    { x: 70, y: 85, type: 'community', label: 'Community' },
  ];

  const connections = [[0, 3], [1, 3], [1, 4], [2, 4], [2, 5], [3, 6], [4, 6], [4, 7], [5, 7]];

  const nodeConfig: Record<string, { color: string; emoji: string; ring: string }> = {
    restaurant: { color: '#10b981', emoji: '🍱', ring: 'ring-brand-500/30' },
    ngo: { color: '#3b82f6', emoji: '🏠', ring: 'ring-blue-500/30' },
    volunteer: { color: '#f97316', emoji: '🚴', ring: 'ring-accent-500/30' },
    community: { color: '#facc15', emoji: '👥', ring: 'ring-warm-400/30' },
  };

  return (
    <div className="relative w-full h-[340px] rounded-xl bg-surface-3 overflow-hidden border border-ink-100">
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: 'linear-gradient(to right, rgba(15,23,42,0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.5) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {connections.map(([from, to], i) => (
          <motion.line key={i} x1={nodes[from].x} y1={nodes[from].y} x2={nodes[to].x} y2={nodes[to].y}
            stroke={nodeConfig[nodes[from].type].color} strokeWidth="0.3" strokeDasharray="2 1"
            initial={{ opacity: 0 }} whileInView={{ opacity: 0.5 }} viewport={{ once: true }}
            transition={{ delay: i * 0.1 }} className="flow-line" />
        ))}
      </svg>
      {nodes.map((node, i) => {
        const cfg = nodeConfig[node.type];
        return (
          <motion.div key={i}
            initial={{ opacity: 0, scale: 0 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            transition={{ delay: i * 0.08, type: 'spring' }} className="absolute"
            style={{ left: `${node.x}%`, top: `${node.y}%`, transform: 'translate(-50%, -50%)' }}>
            <div className="relative">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm bg-white ring-2 ${cfg.ring} shadow-lg`}
                style={{ boxShadow: `0 0 16px ${cfg.color}40` }}>
                {cfg.emoji}
              </div>
              <motion.div className="absolute inset-0 rounded-full" style={{ border: `1px solid ${cfg.color}` }}
                animate={{ scale: [1, 2], opacity: [0.6, 0] }} transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }} />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

const impactStats = [
  { value: 50000, suffix: '+', label: 'Meals Rescued', icon: Utensils, color: 'brand' },
  { value: 1200, suffix: '+', label: 'Food Donors', icon: Building2, color: 'accent' },
  { value: 350, suffix: '+', label: 'Verified NGOs', icon: ShieldCheck, color: 'blue' },
  { value: 42000, suffix: '+', label: 'Successful Deliveries', icon: Truck, color: 'warm' },
];

function ImpactSection() {
  const colorMap: Record<string, string> = {
    brand: 'text-brand-600 bg-brand-50',
    accent: 'text-accent-600 bg-accent-50',
    blue: 'text-blue-600 bg-blue-50',
    warm: 'text-warm-600 bg-warm-50',
  };

  return (
    <section id="impact" className="py-20 lg:py-28 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-brand-300/20 rounded-full blur-[120px] animate-pulse-glow" />
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge tone="accent" size="md" className="mb-3">Real Numbers. Real Meals.</Badge>
          <h2 className="text-3xl lg:text-5xl font-bold text-ink-900">Every donation creates measurable impact</h2>
          <p className="mt-3 text-ink-500 text-lg">Track meals saved, food rescued, and CO₂ emissions avoided with detailed analytics.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {impactStats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div key={stat.label}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}>
                <Card className="p-6 text-center hover:shadow-card-hover transition-all duration-300 card-3d">
                  <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center ${colorMap[stat.color]} mb-4`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <p className="text-4xl lg:text-5xl font-bold text-ink-900 tracking-tight">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix || ''} />
                  </p>
                  <p className="text-sm text-ink-500 mt-2 font-medium">{stat.label}</p>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-8 grid lg:grid-cols-3 gap-5">
          <Card className="p-6 lg:col-span-2">
            <h3 className="font-bold text-ink-900 mb-1">Meals Saved Over Time</h3>
            <p className="text-sm text-ink-500 mb-4">Monthly meals rescued from going to waste</p>
            <ImpactChart data={chartData} dataKey="meals" color="#10b981" secondKey="deliveries" secondColor="#f97316" />
          </Card>
          <Card className="p-6">
            <h3 className="font-bold text-ink-900 mb-1">Food Rescued by Category</h3>
            <p className="text-sm text-ink-500 mb-4">Distribution of rescued food</p>
            <CategoryChart />
          </Card>
        </div>
      </div>
    </section>
  );
}

const whyCards = [
  { icon: Activity, title: 'Real-time Matching', desc: 'Instant pairing of surplus food with nearby organizations that need it most.' },
  { icon: ShieldCheck, title: 'Verified Organizations', desc: 'Every NGO is verified before they can claim, ensuring food reaches legitimate recipients.' },
  { icon: Bike, title: 'Volunteer Logistics', desc: 'A network of vetted volunteers handles pickup and delivery when donors cannot.' },
  { icon: MapPin, title: 'Location-based Discovery', desc: 'Find donations and needs within your neighborhood using our interactive live map.' },
  { icon: TrendingUp, title: 'Transparent Tracking', desc: 'Follow every donation from posting to delivery with a full status timeline.' },
  { icon: Leaf, title: 'Measurable Social Impact', desc: 'Track meals saved, food rescued, and CO₂ emissions avoided with detailed analytics.' },
];

function WhySection() {
  return (
    <section id="why" className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge tone="warm" size="md" className="mb-3">Why FoodBridge?</Badge>
          <h2 className="text-3xl lg:text-5xl font-bold text-ink-900">Built for the entire food rescue ecosystem</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {whyCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div key={card.title}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}>
                <Card hover className="p-6 h-full group">
                  <div className="w-11 h-11 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-ink-900">{card.title}</h3>
                  <p className="text-sm text-ink-500 mt-2 leading-relaxed">{card.desc}</p>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function LiveDonationPreview() {
  const { donations } = useApp();
  const activeDonations = donations.filter((d) => d.status === 'POSTED').slice(0, 3);

  return (
    <section className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <Badge tone="brand" size="md" className="mb-3">Live Donations</Badge>
            <h2 className="text-3xl lg:text-5xl font-bold text-ink-900">Available right now near you</h2>
            <p className="mt-3 text-ink-500 text-lg">A live preview of surplus food waiting to be claimed.</p>
          </div>
          <Link to="/login">
            <Button variant="outline">View All <ChevronRight className="w-4 h-4" /></Button>
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {activeDonations.map((d, i) => (
            <motion.div key={d.id}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}>
              <Card hover className="overflow-hidden">
                <div className="h-28 relative flex items-end p-4" style={{ background: `linear-gradient(135deg, ${d.imageColor}dd, ${d.imageColor}99)` }}>
                  <div className="text-white">
                    <p className="text-2xl font-bold leading-none">{d.meals}</p>
                    <p className="text-xs opacity-90">meals available</p>
                  </div>
                </div>
                <div className="p-4 space-y-2.5">
                  <div>
                    <h3 className="font-bold text-ink-900">{d.foodName}</h3>
                    <p className="text-sm text-ink-500">{d.donorName}</p>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-ink-500">
                      <MapPin className="w-4 h-4 text-ink-400" />
                      {d.distanceKm} km away
                    </span>
                    <ExpiryTimer expiresAt={d.expiresAt} compact />
                  </div>
                  <Badge tone="warm" dot>Pickup Required</Badge>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge tone="accent" size="md" className="mb-3">Testimonials</Badge>
          <h2 className="text-3xl lg:text-5xl font-bold text-ink-900">Stories from our community</h2>
          <p className="mt-3 text-ink-500 text-lg">Demo content — fictional but representative of real impact.</p>
        </div>
        <div className="grid lg:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div key={t.name}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}>
              <Card className="p-6 h-full">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-warm-400 text-warm-400" />
                  ))}
                </div>
                <p className="text-ink-600 leading-relaxed">"{t.quote}"</p>
                <div className="flex items-center gap-3 mt-5 pt-5 border-t border-ink-100">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: t.avatarColor }}>
                    {t.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                  </div>
                  <div>
                    <p className="font-semibold text-ink-900 text-sm">{t.name}</p>
                    <p className="text-xs text-ink-500">{t.role}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SafetySection() {
  const items = [
    { icon: ShieldCheck, title: 'Donor Food Safety Declaration', desc: 'Every donor confirms food is safe for consumption before posting.' },
    { icon: Clock, title: 'Expiry Tracking', desc: 'Live countdown timers on every donation. Expired items are automatically disabled.' },
    { icon: Building2, title: 'Verified NGO System', desc: 'Organizations must submit registration documents and pass verification.' },
    { icon: Activity, title: 'Transparent Delivery Tracking', desc: 'Track every step from posting to delivery with a full status timeline.' },
    { icon: FileWarning, title: 'Reporting Mechanism', desc: 'Flag suspicious donations or organizations for admin review.' },
    { icon: Heart, title: 'Community-Driven', desc: 'Real reviews and ratings keep the ecosystem accountable.' },
  ];

  return (
    <section id="safety" className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge tone="green" size="md" className="mb-3">Trust & Safety</Badge>
          <h2 className="text-3xl lg:text-5xl font-bold text-ink-900">Food Safety First</h2>
          <p className="mt-3 text-ink-500 text-lg">We built FoodBridge with safety and trust at its core.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div key={item.title}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}>
                <Card className="p-6 h-full group">
                  <div className="w-11 h-11 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-ink-900">{item.title}</h3>
                  <p className="text-sm text-ink-500 mt-2 leading-relaxed">{item.desc}</p>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="py-20 lg:py-28 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900" />
      <div className="absolute inset-0 -z-10 opacity-10" style={{
        backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 30%, white 1px, transparent 1px)',
        backgroundSize: '32px 32px',
      }} />
      <div className="max-w-3xl mx-auto px-4 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl lg:text-5xl font-bold text-white leading-tight">
            One extra meal shouldn't become one more waste statistic.
          </h2>
          <p className="mt-5 text-lg text-brand-50/90">
            Join the movement. Every donation matters. Every delivery feeds a person.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/signup">
              <Button variant="secondary" size="lg" className="bg-white text-brand-700 hover:bg-brand-50 w-full sm:w-auto">
                Start Donating <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/signup">
              <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 hover:border-white/50 w-full sm:w-auto">
                Join as NGO
              </Button>
            </Link>
            <Link to="/signup">
              <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 hover:border-white/50 w-full sm:w-auto">
                Become a Volunteer
              </Button>
            </Link>
          </div>
          <div className="mt-8">
            <Link to="/login">
              <button className="text-white/80 hover:text-white text-sm font-medium underline underline-offset-4">
                or explore the demo without an account
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-surface-1 border-t border-ink-100 py-12">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-glow">
                <Utensils className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg text-ink-900">FoodBridge</span>
            </div>
            <p className="text-sm text-ink-500 leading-relaxed">Turning surplus into someone's next meal.</p>
            <p className="text-xs mt-2 text-ink-400">Less waste. More meals. Stronger communities.</p>
          </div>
          <div>
            <h4 className="font-semibold text-ink-900 text-sm mb-3">Platform</h4>
            <ul className="space-y-2 text-sm text-ink-500">
              <li><a href="#how" className="hover:text-brand-700 transition-colors">How It Works</a></li>
              <li><a href="#impact" className="hover:text-brand-700 transition-colors">Impact</a></li>
              <li><a href="#why" className="hover:text-brand-700 transition-colors">Why FoodBridge</a></li>
              <li><a href="#safety" className="hover:text-brand-700 transition-colors">Safety</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-ink-900 text-sm mb-3">For You</h4>
            <ul className="space-y-2 text-sm text-ink-500">
              <li><Link to="/signup" className="hover:text-brand-700 transition-colors">For Donors</Link></li>
              <li><Link to="/signup" className="hover:text-brand-700 transition-colors">For NGOs</Link></li>
              <li><Link to="/signup" className="hover:text-brand-700 transition-colors">For Volunteers</Link></li>
              <li><Link to="/login" className="hover:text-brand-700 transition-colors">Explore Demo</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-ink-900 text-sm mb-3">Company</h4>
            <ul className="space-y-2 text-sm text-ink-500">
              <li><a href="#" className="hover:text-brand-700 transition-colors">About</a></li>
              <li><a href="#" className="hover:text-brand-700 transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-brand-700 transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-brand-700 transition-colors">Terms</a></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-ink-100 flex flex-col sm:flex-row justify-between gap-4 text-xs text-ink-400">
          <p>© 2026 FoodBridge. Demo platform built for hackathon presentation.</p>
          <p>Made with care for communities everywhere.</p>
        </div>
      </div>
    </footer>
  );
}

const chartData = [
  { month: 'Jan', meals: 1200, deliveries: 95 },
  { month: 'Feb', meals: 1800, deliveries: 140 },
  { month: 'Mar', meals: 2400, deliveries: 180 },
  { month: 'Apr', meals: 3100, deliveries: 220 },
  { month: 'May', meals: 3800, deliveries: 280 },
  { month: 'Jun', meals: 4500, deliveries: 340 },
  { month: 'Jul', meals: 5200, deliveries: 410 },
  { month: 'Aug', meals: 2860, deliveries: 285 },
];

function ImpactChart({ data, dataKey, color, secondKey, secondColor }: {
  data: { month: string; meals: number; deliveries: number }[];
  dataKey: 'meals' | 'deliveries';
  color: string;
  secondKey?: 'meals' | 'deliveries';
  secondColor?: string;
}) {
  const maxVal = Math.max(...data.map((d) => d[dataKey]));
  const maxVal2 = secondKey ? Math.max(...data.map((d) => d[secondKey])) : 0;
  const w = 100 / data.length;

  return (
    <div className="w-full">
      <svg viewBox="0 0 400 180" className="w-full" preserveAspectRatio="none" style={{ height: 180 }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={i} x1="0" y1={i * 45} x2="400" y2={i * 45} stroke="rgba(15,23,42,0.05)" strokeWidth="1" />
        ))}
        <motion.path d={`M 0 180 ${data.map((d, i) => `L ${i * w * 4} ${180 - (d[dataKey] / maxVal) * 160}`).join(' ')} L 400 180 Z`}
          fill={color} opacity="0.08" initial={{ opacity: 0 }} whileInView={{ opacity: 0.08 }} viewport={{ once: true }} transition={{ duration: 1 }} />
        <motion.path d={`M 0 ${180 - (data[0][dataKey] / maxVal) * 160} ${data.map((d, i) => `L ${i * w * 4} ${180 - (d[dataKey] / maxVal) * 160}`).join(' ')}`}
          fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.5 }} />
        {secondKey && secondColor && (
          <motion.path d={`M 0 ${180 - (data[0][secondKey] / maxVal2) * 160} ${data.map((d, i) => `L ${i * w * 4} ${180 - (d[secondKey] / maxVal2) * 160}`).join(' ')}`}
            fill="none" stroke={secondColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 4"
            initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.5, delay: 0.3 }} />
        )}
        {data.map((d, i) => (
          <motion.circle key={i} cx={i * w * 4} cy={180 - (d[dataKey] / maxVal) * 160} r="3" fill={color}
            initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 + 0.5 }} />
        ))}
      </svg>
      <div className="flex justify-between mt-2 text-xs text-ink-400">
        {data.map((d) => (<span key={d.month}>{d.month}</span>))}
      </div>
    </div>
  );
}

function CategoryChart() {
  const cats = [
    { label: 'Cooked Meals', value: 45, color: '#10b981' },
    { label: 'Raw Produce', value: 20, color: '#f97316' },
    { label: 'Bakery', value: 15, color: '#facc15' },
    { label: 'Dairy', value: 10, color: '#3b82f6' },
    { label: 'Other', value: 10, color: '#a78bfa' },
  ];
  const total = cats.reduce((s, c) => s + c.value, 0);
  let offset = 0;
  const r = 60;
  const circ = 2 * Math.PI * r;

  return (
    <div className="flex items-center gap-6">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(15,23,42,0.05)" strokeWidth="16" />
        {cats.map((c, i) => {
          const dash = (c.value / total) * circ;
          const el = (
            <motion.circle key={c.label} cx="70" cy="70" r={r} fill="none" stroke={c.color} strokeWidth="16"
              strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={-offset} transform="rotate(-90 70 70)"
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} />
          );
          offset += dash;
          return el;
        })}
        <text x="70" y="66" textAnchor="middle" fontSize="20" fontWeight="bold" fill="#1e293b">8.7T</text>
        <text x="70" y="82" textAnchor="middle" fontSize="9" fill="#64748b">Rescued</text>
      </svg>
      <div className="space-y-2 flex-1">
        {cats.map((c) => (
          <div key={c.label} className="flex items-center gap-2 text-sm">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
            <span className="text-ink-600 flex-1">{c.label}</span>
            <span className="font-semibold text-ink-900">{c.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LandingPage() {
  return (
    <div className="min-h-screen bg-surface-0">
      <Navbar />
      <HeroSection />
      <HowItWorksSection />
      <LiveNetworkSection />
      <ImpactSection />
      <WhySection />
      <LiveDonationPreview />
      <TestimonialsSection />
      <SafetySection />
      <FinalCTA />
      <Footer />
    </div>
  );
}
