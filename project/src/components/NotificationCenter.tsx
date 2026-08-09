import { useApp } from '@/store/AppContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Bell, CheckCircle2, Truck, Bike, HandHeart, Clock, Shield, Info,
  Check,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Notification } from '@/types';

const typeConfig: Record<string, { icon: typeof Bell; color: string; bg: string }> = {
  claim: { icon: HandHeart, color: 'text-brand-600', bg: 'bg-brand-50' },
  volunteer: { icon: Bike, color: 'text-accent-600', bg: 'bg-accent-50' },
  delivery: { icon: Truck, color: 'text-blue-600', bg: 'bg-blue-50' },
  need: { icon: Clock, color: 'text-warm-600', bg: 'bg-warm-50' },
  expiry: { icon: Clock, color: 'text-red-600', bg: 'bg-red-50' },
  system: { icon: Info, color: 'text-ink-500', bg: 'bg-surface-3' },
  verification: { icon: Shield, color: 'text-purple-600', bg: 'bg-purple-50' },
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'Just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.floor(hr / 24)}d ago`;
}

export function NotificationCenter({ userId }: { userId: string }) {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useApp();
  const userNotifs = notifications
    .filter((n) => n.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const unread = userNotifs.filter((n) => !n.read).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-ink-900">Notifications</h2>
          {unread > 0 && (
            <span className="bg-accent-500 text-white text-xs font-bold rounded-full px-2 py-0.5">{unread} new</span>
          )}
        </div>
        {unread > 0 && (
          <Button variant="ghost" size="sm" onClick={() => markAllNotificationsRead(userId)}>
            <Check className="w-4 h-4" /> Mark all read
          </Button>
        )}
      </div>

      {userNotifs.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Bell className="w-7 h-7" />}
            title="No notifications yet"
            description="You'll see updates about donations, claims, and deliveries here."
          />
        </Card>
      ) : (
        <div className="space-y-2">
          {userNotifs.map((n) => {
            const cfg = typeConfig[n.type] || typeConfig.system;
            const Icon = cfg.icon;
            return (
              <NotificationItem
                key={n.id}
                notification={n}
                icon={Icon}
                color={cfg.color}
                bg={cfg.bg}
                onRead={() => markNotificationRead(n.id)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function NotificationItem({
  notification, icon: Icon, color, bg, onRead,
}: {
  notification: Notification;
  icon: typeof Bell;
  color: string;
  bg: string;
  onRead: () => void;
}) {
  return (
    <Card className={`p-4 transition-all duration-200 ${notification.read ? 'opacity-60' : 'border-l-4 border-l-brand-500'}`}>
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bg} ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-ink-700 font-medium">{notification.message}</p>
          <p className="text-xs text-ink-400 mt-1">{timeAgo(notification.createdAt)}</p>
        </div>
        {!notification.read && (
          <button
            onClick={onRead}
            className="text-xs text-brand-600 hover:text-brand-700 font-semibold shrink-0"
          >
            Mark read
          </button>
        )}
      </div>
      {notification.link && (
        <Link to={notification.link} className="block mt-2 text-xs text-brand-600 hover:text-brand-700 font-semibold">
          View →
        </Link>
      )}
    </Card>
  );
}
