import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className = '', hover, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl shadow-card border border-ink-100/60 ${hover ? 'transition-all duration-300 hover:shadow-card-hover hover:border-brand-200 hover:-translate-y-1 cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  trend?: string;
}

export function StatCard({ icon, label, value, sub, color = 'brand', trend }: StatCardProps) {
  const colorMap: Record<string, string> = {
    brand: 'bg-brand-50 text-brand-600',
    accent: 'bg-accent-50 text-accent-600',
    warm: 'bg-warm-50 text-warm-600',
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600',
    green: 'bg-brand-50 text-brand-600',
  };
  return (
    <Card className="p-5 hover:shadow-card-hover transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${colorMap[color] || colorMap.brand} group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
        {trend && (
          <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-2 py-1 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <p className="mt-4 text-3xl font-bold text-ink-800 tracking-tight">{value}</p>
      <p className="text-sm text-ink-500 mt-1 font-medium">{label}</p>
      {sub && <p className="text-xs text-ink-400 mt-0.5">{sub}</p>}
    </Card>
  );
}
