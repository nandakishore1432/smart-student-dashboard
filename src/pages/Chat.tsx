import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GlassCard } from '@/components/GlassCard';
import { SkeletonCard } from '@/components/SkeletonCard';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/hooks/useChat';

export default function Chat() {
  const { user } = useAuth();
  const { messages, isLoading, send, isSending } = useChat();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isSending) return;
    await send(input.trim());
    setInput('');
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col" style={{ height: 'calc(100vh - 8rem)' }}>
      <div className="mb-4">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Student Chat</h1>
        <p className="text-muted-foreground text-sm">Real-time conversation with classmates</p>
      </div>

      <GlassCard hover={false} className="flex-1 flex flex-col overflow-hidden !p-0">
        {isLoading ? (
          <div className="p-4"><SkeletonCard lines={6} /></div>
        ) : (
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
              </div>
            )}
            {messages.map((msg, i) => {
              const isOwn = msg.user_id === user?.id;
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                    isOwn
                      ? 'gradient-primary text-primary-foreground rounded-br-md'
                      : 'bg-muted text-foreground rounded-bl-md'
                  }`}>
                    {!isOwn && (
                      <p className="text-xs font-semibold mb-0.5 opacity-70">{msg.display_name}</p>
                    )}
                    <p className="text-sm">{msg.content}</p>
                    <p className={`text-[10px] mt-1 ${isOwn ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        <div className="p-3 border-t border-border/50">
          <form onSubmit={e => { e.preventDefault(); handleSend(); }} className="flex gap-2">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type a message..."
              className="rounded-xl bg-muted/50 border-border/50"
              disabled={isSending}
            />
            <Button type="submit" size="icon" variant="gradient" className="rounded-xl shrink-0" disabled={isSending || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </GlassCard>
    </div>
  );
}
