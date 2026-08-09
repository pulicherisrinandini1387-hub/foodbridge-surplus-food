import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Utensils, Building2, Bike, Users, Sparkles, MapPin, Package } from 'lucide-react';

/**
 * FoodRescueNetwork
 * The signature "3D Smart Food Rescue Network" visualization.
 * A central smart-match food node connected to Donor → NGO → Volunteer → Community
 * with glowing curved connection lines, animated energy flow, depth, and mouse parallax.
 * Purely presentational — no app state, safe to reuse anywhere.
 */

type SatelliteKey = 'donor' | 'ngo' | 'volunteer' | 'community';

interface Satellite {
  key: SatelliteKey;
  label: string;
  sublabel: string;
  icon: typeof Utensils;
  color: string;
  soft: string;
  /** SVG coords in a 400x400 viewBox */
  cx: number;
  cy: number;
  /** quadratic control point */
  qx: number;
  qy: number;
  /** parallax depth factor */
  depth: number;
}

const SATELLITES: Satellite[] = [
  { key: 'donor', label: 'Donor', sublabel: 'Surplus posted', icon: Utensils, color: '#059669', soft: '#ecfdf5', cx: 72, cy: 78, qx: 120, qy: 108, depth: 1.4 },
  { key: 'ngo', label: 'NGO', sublabel: 'Claims & routes', icon: Building2, color: '#2563eb', soft: '#eff6ff', cx: 328, cy: 92, qx: 292, qy: 118, depth: 1.1 },
  { key: 'volunteer', label: 'Volunteer', sublabel: 'Pickup & deliver', icon: Bike, color: '#ea580c', soft: '#fff7ed', cx: 328, cy: 322, qx: 300, qy: 282, depth: 1.25 },
  { key: 'community', label: 'Community', sublabel: 'Meals served', icon: Users, color: '#ca8a04', soft: '#fefce8', cx: 72, cy: 322, qx: 108, qy: 292, depth: 1.55 },
];

const CENTER = { x: 200, y: 200 };

function pathFor(s: Satellite) {
  return `M ${CENTER.x} ${CENTER.y} Q ${s.qx} ${s.qy} ${s.cx} ${s.cy}`;
}

function useReducedMotionPref() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)');
    const onChange = () => setMobile(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return mobile;
}

export function FoodRescueNetwork() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotionPref();
  const isMobile = useIsMobile();

  // Mouse parallax — spring-smoothed tilt of the whole scene
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rx = useSpring(useTransform(py, [-0.5, 0.5], [8, -8]), { stiffness: 120, damping: 18 });
  const ry = useSpring(useTransform(px, [-0.5, 0.5], [-10, 10]), { stiffness: 120, damping: 18 });

  useEffect(() => {
    if (reduced || isMobile) return;
    const el = wrapRef.current;
    if (!el) return;
    const handler = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      px.set((e.clientX - (rect.left + rect.width / 2)) / rect.width);
      py.set((e.clientY - (rect.top + rect.height / 2)) / rect.height);
    };
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, [px, py, reduced, isMobile]);

  return (
    <div
      ref={wrapRef}
      className="relative w-full max-w-[560px] mx-auto aspect-square"
      style={{ perspective: 1200 }}
      role="img"
      aria-label="Smart food rescue network: a central smart-match hub connecting donors, NGOs, volunteers, and the community."
    >
      {/* Ambient depth halos */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/2 h-2/3 w-2/3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-300/30 blur-[90px]" />
        <div className="absolute right-[10%] bottom-[12%] h-1/3 w-1/3 rounded-full bg-accent-300/20 blur-[70px]" />
      </div>

      <motion.div
        className="absolute inset-0"
        style={{ rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d' }}
      >
        {/* Connection lines + energy flow */}
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 400 400"
          fill="none"
          style={{ transform: 'translateZ(10px)' }}
        >
          <defs>
            {SATELLITES.map((s) => (
              <linearGradient key={s.key} id={`grad-${s.key}`} gradientUnits="userSpaceOnUse" x1={CENTER.x} y1={CENTER.y} x2={s.cx} y2={s.cy}>
                <stop offset="0%" stopColor={s.color} stopOpacity="0.55" />
                <stop offset="100%" stopColor={s.color} stopOpacity="0.12" />
              </linearGradient>
            ))}
          </defs>

          {/* Orbit guide ring */}
          <circle cx={CENTER.x} cy={CENTER.y} r="118" stroke="rgba(16,185,129,0.14)" strokeWidth="1" strokeDasharray="3 6" />

          {SATELLITES.map((s, i) => {
            const d = pathFor(s);
            return (
              <g key={s.key}>
                {/* base glowing line */}
                <path id={`fr-path-${s.key}`} d={d} stroke={`url(#grad-${s.key})`} strokeWidth="2.5" strokeLinecap="round" />
                {/* animated dashed overlay for flow direction */}
                {!reduced && (
                  <path
                    d={d}
                    stroke={s.color}
                    strokeOpacity="0.5"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray="2 16"
                    className="fr-flow"
                    style={{ animationDelay: `${i * 0.4}s` }}
                  />
                )}
                {/* traveling energy pulse */}
                {!reduced && (
                  <circle r="3.4" fill={s.color} style={{ filter: `drop-shadow(0 0 5px ${s.color})` }}>
                    <animateMotion dur={`${2.6 + i * 0.35}s`} repeatCount="indefinite" begin={`${i * 0.5}s`} rotate="auto">
                      <mpath href={`#fr-path-${s.key}`} />
                    </animateMotion>
                  </circle>
                )}
              </g>
            );
          })}
        </svg>

        {/* Central smart-match hub */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ transform: 'translate(-50%, -50%) translateZ(60px)' }}
        >
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 14, delay: 0.2 }}
            className="relative"
          >
            {/* pulsing aura */}
            {!reduced && (
              <motion.span
                className="absolute inset-0 rounded-[28px] bg-brand-500/40"
                animate={{ scale: [1, 1.35, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}
            <div
              className="relative flex h-28 w-28 flex-col items-center justify-center rounded-[28px] text-white sm:h-32 sm:w-32"
              style={{
                background: 'linear-gradient(150deg, #34d399 0%, #10b981 45%, #047857 100%)',
                boxShadow:
                  '0 24px 48px -12px rgba(4,120,87,0.55), inset 0 2px 0 rgba(255,255,255,0.45), inset 0 -8px 16px rgba(4,78,59,0.35)',
              }}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/25 backdrop-blur-sm">
                <Utensils className="h-6 w-6" />
              </div>
              <span className="mt-2 text-xs font-bold tracking-wide">Smart Match</span>
              <span className="flex items-center gap-1 text-[10px] font-medium text-white/80">
                <Sparkles className="h-3 w-3" /> AI routing
              </span>
            </div>
          </motion.div>
        </div>

        {/* Satellite nodes */}
        {SATELLITES.map((s, i) => {
          const Icon = s.icon;
          const leftPct = (s.cx / 400) * 100;
          const topPct = (s.cy / 400) * 100;
          const tz = 30 + s.depth * 8;
          return (
            <motion.div
              key={s.key}
              className="absolute"
              style={{ left: `${leftPct}%`, top: `${topPct}%`, transform: `translate(-50%, -50%) translateZ(${tz}px)` }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 15, delay: 0.35 + i * 0.12 }}
            >
              <motion.div
                animate={reduced ? undefined : { y: [0, -7, 0] }}
                transition={{ duration: 4 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
                className="glass-card flex items-center gap-2.5 rounded-2xl border border-white/70 px-3 py-2.5 shadow-float"
              >
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{ backgroundColor: s.soft, color: s.color }}
                >
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <div className="pr-1 text-left">
                  <p className="text-sm font-bold leading-none text-ink-900">{s.label}</p>
                  <p className="mt-1 text-[11px] font-medium leading-none text-ink-500">{s.sublabel}</p>
                </div>
              </motion.div>
            </motion.div>
          );
        })}

        {/* Floating data cards (brief-specified stats) — placed at mid-edges, clear of the corner nodes */}
        <FloatingStat pos="left-[-6%] top-[46%]" icon={Package} tint="#059669" label="165" unit="Meals Rescued" delay={1.0} reduced={reduced} />
        <FloatingStat pos="left-1/2 -translate-x-1/2 top-[-4%]" icon={Building2} tint="#2563eb" label="18" unit="NGOs Nearby" delay={1.2} reduced={reduced} />
        <FloatingStat pos="right-[-6%] top-[46%]" icon={MapPin} tint="#ea580c" label="2.4 km" unit="Away" delay={1.4} reduced={reduced} />
        <FloatingStat pos="left-1/2 -translate-x-1/2 bottom-[-4%]" icon={Sparkles} tint="#ca8a04" label="94%" unit="Delivered" delay={1.6} reduced={reduced} />
      </motion.div>
    </div>
  );
}

function FloatingStat({
  pos,
  icon: Icon,
  tint,
  label,
  unit,
  delay,
  reduced,
}: {
  pos: string;
  icon: typeof Utensils;
  tint: string;
  label: string;
  unit: string;
  delay: number;
  reduced: boolean;
}) {
  return (
    <motion.div
      className={`absolute z-20 hidden md:block ${pos}`}
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: 'spring', damping: 18 }}
    >
      <motion.div
        animate={reduced ? undefined : { y: [0, -8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: delay * 0.5 }}
        className="glass-card flex items-center gap-2.5 rounded-2xl border border-white/70 px-3.5 py-2.5 shadow-float"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: `${tint}1a`, color: tint }}>
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-extrabold leading-none text-ink-900">{label}</p>
          <p className="mt-0.5 text-[11px] font-medium leading-none text-ink-500">{unit}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
