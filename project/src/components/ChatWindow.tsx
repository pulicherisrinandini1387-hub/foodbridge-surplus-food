import { useState, useRef, useEffect } from 'react';
import { useApp } from '@/store/AppContext';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Send, MessageSquare, ArrowLeft } from 'lucide-react';
import type { Conversation } from '@/types';

function timeFmt(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export function ChatWindow({ currentUserId }: { currentUserId: string }) {
  const { conversations, sendMessage, users } = useApp();
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  const userConvs = conversations.filter((c) => c.participantIds.includes(currentUserId));
  const activeConv = userConvs.find((c) => c.id === activeConvId);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages.length]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !activeConvId) return;
    sendMessage(activeConvId, currentUserId, message.trim());
    setMessage('');
  };

  const getOtherParticipant = (conv: Conversation) => {
    const otherId = conv.participantIds.find((id) => id !== currentUserId);
    return users.find((u) => u.id === otherId);
  };

  return (
    <div className="bg-white rounded-2xl border border-ink-100 shadow-card overflow-hidden flex h-[600px]">
      {/* Conversation list */}
      <div className={`w-full sm:w-72 border-r border-ink-100 ${activeConv ? 'hidden sm:flex' : 'flex'} flex-col`}>
        <div className="px-4 py-4 border-b border-ink-100">
          <h3 className="font-bold text-ink-900">Messages</h3>
        </div>
        <div className="flex-1 overflow-y-auto">
          {userConvs.length === 0 ? (
            <div className="p-4">
              <EmptyState icon={<MessageSquare className="w-6 h-6" />} title="No conversations" description="Start chatting from a donation or delivery." />
            </div>
          ) : (
            userConvs.map((conv) => {
              const other = getOtherParticipant(conv);
              if (!other) return null;
              const lastMsg = conv.messages[conv.messages.length - 1];
              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  className={`w-full flex items-center gap-3 p-3 hover:bg-ink-50 transition-colors text-left ${activeConvId === conv.id ? 'bg-brand-50' : ''}`}
                >
                  <Avatar name={other.name} color={other.avatarColor} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm text-ink-900 truncate">{other.name}</p>
                    <p className="text-xs text-ink-400 truncate">
                      {lastMsg ? lastMsg.message : 'Start a conversation'}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className={`flex-1 flex flex-col ${activeConv ? 'flex' : 'hidden sm:flex'}`}>
        {activeConv ? (
          <>
            <div className="px-4 py-3 border-b border-ink-100 flex items-center gap-3">
              <button onClick={() => setActiveConvId(null)} className="sm:hidden w-8 h-8 rounded-lg flex items-center justify-center hover:bg-ink-100">
                <ArrowLeft className="w-4 h-4" />
              </button>
              {(() => {
                const other = getOtherParticipant(activeConv);
                return other ? (
                  <>
                    <Avatar name={other.name} color={other.avatarColor} size="sm" />
                    <div>
                      <p className="font-semibold text-sm text-ink-900">{other.name}</p>
                      <p className="text-xs text-ink-400 capitalize">{other.role}</p>
                    </div>
                  </>
                ) : null;
              })()}
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-ink-50/50">
              {activeConv.messages.map((msg) => {
                const isMe = msg.senderId === currentUserId;
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                      <div className={`px-3.5 py-2.5 rounded-2xl text-sm ${isMe ? 'bg-brand-600 text-white rounded-br-md' : 'bg-white border border-ink-100 text-ink-800 rounded-bl-md'}`}>
                        {msg.message}
                      </div>
                      <span className="text-xs text-ink-400 px-1">{timeFmt(msg.timestamp)}</span>
                    </div>
                  </div>
                );
              })}
              <div ref={endRef} />
            </div>
            <form onSubmit={handleSend} className="p-3 border-t border-ink-100 flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 h-11 px-4 rounded-xl bg-ink-50 border border-transparent focus:bg-white focus:border-ink-200 text-sm outline-none transition-all"
              />
              <Button type="submit" size="md" disabled={!message.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <EmptyState icon={<MessageSquare className="w-7 h-7" />} title="Select a conversation" description="Choose a chat from the list to start messaging." />
          </div>
        )}
      </div>
    </div>
  );
}
