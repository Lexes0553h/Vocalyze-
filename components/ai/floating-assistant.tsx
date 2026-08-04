'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot, X, Send, Sparkles, Mic, MicOff, Search, Pin,
  Copy, Check, RefreshCw, ThumbsUp, ThumbsDown, Trash2,
  ChevronDown, Plus, MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  time: string;
  liked?: boolean | null;
  disliked?: boolean | null;
}

const SUGGESTED_PROMPTS = [
  'Show my hot leads',
  'Summarize today\'s calls',
  'Draft a follow-up email',
  'What are my priorities today?',
  'Forecast this quarter\'s revenue',
  'Find missed calls from yesterday',
];

export function FloatingAiAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [listening, setListening] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [conversations, setConversations] = useState<{ id: string; title: string; pinned: boolean }[]>([
    { id: '1', title: 'Q3 Revenue Forecast', pinned: true },
    { id: '2', title: 'Hot Leads Analysis', pinned: false },
    { id: '3', title: 'Email Draft for Acme', pinned: false },
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streaming]);

  const send = useCallback(async (text: string) => {
    if (!text.trim() || streaming) return;
    const now = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', content: text, time: now };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setStreaming(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: text }] }),
      });
      const data = await res.json();
      const aiText = data.content || 'I\'m ready to help. Connect an AI provider for full capabilities.';

      // Simulate streaming by revealing text word by word
      const words = aiText.split(' ');
      const aiId = `a-${Date.now()}`;
      setMessages((m) => [...m, { id: aiId, role: 'assistant', content: '', time: now }]);
      for (let i = 0; i < words.length; i++) {
        await new Promise((r) => setTimeout(r, 20));
        setMessages((m) => {
          const copy = [...m];
          const last = copy[copy.length - 1];
          if (last.id === aiId) {
            copy[copy.length - 1] = { ...last, content: words.slice(0, i + 1).join(' ') };
          }
          return copy;
        });
      }
    } catch {
      setMessages((m) => [...m, { id: `a-${Date.now()}`, role: 'assistant', content: 'Sorry, I couldn\'t process that request. Please try again.', time: now }]);
    } finally {
      setStreaming(false);
    }
  }, [streaming]);

  const toggleVoice = () => {
    setListening((l) => !l);
    // Web Speech API placeholder — would use SpeechRecognition when available
  };

  const copyMessage = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const regenerate = (id: string) => {
    const idx = messages.findIndex((m) => m.id === id);
    if (idx < 1) return;
    const userMsg = messages[idx - 1];
    setMessages((m) => m.slice(0, idx));
    send(userMsg.content);
  };

  const setFeedback = (id: string, feedback: 'liked' | 'disliked') => {
    setMessages((m) => m.map((msg) =>
      msg.id === id
        ? { ...msg, liked: feedback === 'liked' ? !msg.liked : false, disliked: feedback === 'disliked' ? !msg.disliked : false }
        : msg
    ));
  };

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setOpen(true)}
            data-cursor="magnetic"
            className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-40 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-xl shadow-primary/30 transition-all hover:shadow-primary/50"
          >
            <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" />
            <motion.span
              animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-2xl bg-primary/30"
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-background/40 backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              className="fixed bottom-20 lg:bottom-6 right-3 sm:right-6 z-50 flex h-[520px] sm:h-[600px] max-h-[calc(100vh-6rem)] w-[calc(100vw-1.5rem)] sm:w-[400px] flex-col overflow-hidden rounded-2xl glass-strong shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/5 p-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/20">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">AI Assistant</p>
                    <p className="text-[10px] text-muted-foreground">{streaming ? 'Typing…' : 'Ready to help'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setShowHistory((s) => !s)} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-white/5 hover:text-foreground" title="History">
                    <MessageSquare className="h-4 w-4" />
                  </button>
                  <button onClick={() => setMessages([])} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-white/5 hover:text-foreground" title="Clear">
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => setOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-white/5 hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* History panel */}
              <AnimatePresence>
                {showHistory && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-b border-white/5"
                  >
                    <div className="p-3">
                      <div className="relative mb-2">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/60" />
                        <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search chats…" className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-xs focus:border-primary/50 focus:outline-none" />
                      </div>
                      <button onClick={() => { setMessages([]); setShowHistory(false); }} className="mb-2 flex w-full items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-xs font-medium text-primary hover:bg-primary/15">
                        <Plus className="h-3.5 w-3.5" />New Conversation
                      </button>
                      <div className="max-h-32 space-y-1 overflow-y-auto">
                        {filteredConversations.map((c) => (
                          <button key={c.id} onClick={() => setShowHistory(false)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-muted-foreground hover:bg-white/5 hover:text-foreground">
                            {c.pinned && <Pin className="h-3 w-3 text-primary" />}
                            <span className="truncate flex-1">{c.title}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Messages */}
              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {messages.length === 0 && (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/20">
                      <Sparkles className="h-8 w-8" />
                    </div>
                    <p className="mb-1 text-sm font-medium">How can I help you?</p>
                    <p className="mb-4 text-xs text-muted-foreground">Ask me anything about your CRM data</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {SUGGESTED_PROMPTS.map((p) => (
                        <button key={p} onClick={() => send(p)} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary/30 hover:text-foreground">
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {messages.map((m) => (
                  <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={cn('flex gap-2', m.role === 'user' && 'flex-row-reverse')}>
                    <div className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-lg', m.role === 'assistant' ? 'bg-primary/15 text-primary' : 'bg-white/8 text-muted-foreground')}>
                      {m.role === 'assistant' ? <Bot className="h-4 w-4" /> : <span className="text-[10px] font-medium">You</span>}
                    </div>
                    <div className={cn('group max-w-[80%]', m.role === 'user' && 'flex flex-col items-end')}>
                      <div className={cn('rounded-2xl px-3 py-2 text-sm', m.role === 'assistant' ? 'bg-white/5' : 'bg-primary text-primary-foreground')}>
                        <p className="whitespace-pre-wrap leading-relaxed">{m.content}{streaming && m.id === messages[messages.length - 1]?.id && m.role === 'assistant' && <span className="ml-0.5 inline-block h-3.5 w-1 animate-pulse bg-primary" />}</p>
                      </div>
                      {m.role === 'assistant' && m.content && (
                        <div className="mt-1 flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                          <button onClick={() => copyMessage(m.id, m.content)} className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-white/5 hover:text-foreground" title="Copy">
                            {copiedId === m.id ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                          </button>
                          <button onClick={() => regenerate(m.id)} className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-white/5 hover:text-foreground" title="Regenerate">
                            <RefreshCw className="h-3 w-3" />
                          </button>
                          <button onClick={() => setFeedback(m.id, 'liked')} className={cn('flex h-6 w-6 items-center justify-center rounded hover:bg-white/5', m.liked ? 'text-green-400' : 'text-muted-foreground hover:text-foreground')} title="Good response">
                            <ThumbsUp className="h-3 w-3" />
                          </button>
                          <button onClick={() => setFeedback(m.id, 'disliked')} className={cn('flex h-6 w-6 items-center justify-center rounded hover:bg-white/5', m.disliked ? 'text-red-400' : 'text-muted-foreground hover:text-foreground')} title="Bad response">
                            <ThumbsDown className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
                <div ref={endRef} />
              </div>

              {/* Input */}
              <div className="border-t border-white/5 p-3">
                {listening && (
                  <div className="mb-2 flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <motion.span key={i} animate={{ height: [4, 12, 4] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }} className="w-1 rounded-full bg-red-400" />
                      ))}
                    </div>
                    Listening… (speech-to-text placeholder)
                  </div>
                )}
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-1.5">
                  <button onClick={toggleVoice} className={cn('flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-colors', listening ? 'bg-red-500/20 text-red-400' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground')}>
                    {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </button>
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && send(input)}
                    placeholder={listening ? 'Listening…' : 'Ask anything…'}
                    className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground/50 focus:outline-none"
                  />
                  <button onClick={() => send(input)} disabled={!input.trim() || streaming} className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40">
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
