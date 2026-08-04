'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, Send, Sparkles, MessageSquare } from 'lucide-react';
import { PageHeader, Card, Badge, Button, Avatar } from '@/components/crm/crm-ui';
import { useAiChat, useAiSuggestions } from '@/lib/data/hooks';
import { cn } from '@/lib/utils';

const SUGGESTED_REPLIES = ["Summarize today's calls", 'Draft follow-up email', 'Forecast Q3'];

const CALL_SUMMARIES = [
  { contact: 'Jordan Avery', company: 'Acme Corp', summary: 'Discussed 40-seat team plan. Awaiting pricing PDF.', time: '10:24 AM' },
  { contact: 'Elena Vasquez', company: 'Helios Energy', summary: 'Hot inbound, 60 seats multi-region. Solutions looped in.', time: '09:50 AM' },
  { contact: 'Marcus Reid', company: 'Vertex.io', summary: 'Proposal v2 reviewed. Legal reviewing terms.', time: '09:15 AM' },
];

type ChatMsg = { id: number | string; role: string; text: string; time: string };

export default function AiAssistantPage() {
  const { data: AI_CHAT = [] } = useAiChat();
  const { data: AI_SUGGESTIONS = [] } = useAiSuggestions();
  const [messages, setMessages] = useState<ChatMsg[]>(AI_CHAT as ChatMsg[]);
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = (text: string) => {
    if (!text.trim()) return;
    const now = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    setMessages((m) => [...m, { id: m.length + 1, role: 'user', text, time: now }]);
    setInput('');
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          id: m.length + 1,
          role: 'ai',
          text: "Got it. I'm on it — I'll have that ready for you shortly. Is there anything else you'd like me to prioritize?",
          time: now,
        },
      ]);
    }, 900);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="AI Assistant" subtitle="Your AI co-pilot for sales" />

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Chat area */}
        <Card className="flex h-[calc(100vh-220px)] flex-col" delay={0.05}>
          <div className="flex-1 space-y-4 overflow-y-auto pr-2">
            {messages.map((m, i) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
                className={cn('flex gap-3', m.role === 'user' && 'flex-row-reverse')}
              >
                {m.role === 'ai' ? (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/20">
                    <Bot className="h-5 w-5" />
                  </div>
                ) : (
                  <Avatar name="Sarah Chen" size={36} ring />
                )}
                <div className={cn('max-w-[75%] rounded-2xl px-4 py-2.5 text-sm', m.role === 'ai' ? 'bg-primary/15' : 'bg-primary text-primary-foreground')}>
                  <p>{m.text}</p>
                  <p className={cn('mt-1 text-[10px]', m.role === 'ai' ? 'text-muted-foreground' : 'text-primary-foreground/60')}>{m.time}</p>
                </div>
              </motion.div>
            ))}
            <div ref={endRef} />
          </div>

          {/* Suggested reply chips */}
          <div className="flex flex-wrap gap-2 pt-3">
            {SUGGESTED_REPLIES.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary/30 hover:text-foreground"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-2">
            <Sparkles className="ml-1 h-4 w-4 text-primary" />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send(input)}
              placeholder="Ask your AI assistant…"
              className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground/50 focus:outline-none"
            />
            <Button variant="primary" size="icon" onClick={() => send(input)}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </Card>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card title="Suggested Actions" delay={0.1}>
            <div className="space-y-3">
              {AI_SUGGESTIONS.map((s) => (
                <div key={s.id} className="rounded-xl bg-white/5 p-3 transition hover:bg-white/8">
                  <div className="mb-1 flex items-center gap-2">
                    <Badge variant={s.priority === 'urgent' ? 'red' : s.priority === 'high' ? 'primary' : s.priority === 'medium' ? 'cyan' : 'muted'}>
                      {s.priority}
                    </Badge>
                    <p className="text-sm font-medium">{s.title}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{s.desc}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Call Summaries" delay={0.15}>
            <div className="space-y-3">
              {CALL_SUMMARIES.map((c) => (
                <div key={c.contact} className="flex gap-3 rounded-xl bg-white/5 p-3">
                  <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-cyan" />
                  <div>
                    <p className="text-sm font-medium">{c.contact}</p>
                    <p className="text-xs text-muted-foreground">{c.company} • {c.time}</p>
                    <p className="mt-1 text-xs text-muted-foreground/80">{c.summary}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
