import { useApp } from '@/store/AppContext';
import { DashboardLayout, PageHeader } from '@/components/DashboardLayout';
import { NotificationCenter } from '@/components/NotificationCenter';
import { ChatWindow } from '@/components/ChatWindow';

export function NotificationsPage() {
  const { currentUserId } = useApp();
  if (!currentUserId) return null;
  return (
    <DashboardLayout>
      <NotificationCenter userId={currentUserId} />
    </DashboardLayout>
  );
}

export function ChatPage() {
  const { currentUserId } = useApp();
  if (!currentUserId) return null;
  return (
    <DashboardLayout>
      <PageHeader title="Messages" subtitle="Chat with donors, NGOs, and volunteers" />
      <ChatWindow currentUserId={currentUserId} />
    </DashboardLayout>
  );
}
