'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, ArrowRight, Bot, Clock, Phone, Users, Building2, Mail, CheckSquare, Mic, MicOff } from 'lucide-react';
import { PageHeader, Card, Badge, Button, EmptyState } from '@/components/crm/crm-ui';
import { useAiRequest } from '@/lib/data/ai-hooks';
import { cn } from '@/lib/utils';

const EXAMPLES = [
  'Show my hot leads',
  'Show missed calls from yesterday',
  'Find customers from Bangalore',
  "Show today's meetings",
  'Find leads with score above 80',
  'Show deals closing this week',
];

const TYPE_ICONS: Record<string, typeof Phone> = {
  lead: Users, contact: Users, company: Building2, call: Phone,
  event: Clock, email: Mail, task: CheckSquare,
};

interface SearchResult { type: string; title: string; subtitle: string; href: string }

export default function AiSearchPage() {
  const { request, loading } = useAiRequest();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searched, setSearched] = useState(false);
  const [listening, setListening] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const search = async (q: string) => {
    if (!q.trim()) return;
    setSearched(true);
    setResults([]);
    setAiResponse('');
    const res = await request('natural-search', q);
    if (res?.structured) {
      const data = res.structured as { results: SearchResult[]; message?: string };
      setResults(data.results ?? []);
      if (data.message) setAiResponse(data.message);
    }
  };

  const toggleVoice = () => setListening((l) => !l);

  return (
    <div className="space-y-6">
      <PageHeader title="AI Search" subtitle="Search your CRM using natural language. Just ask." />

      <Card>
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Sparkles className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && search(query)}
              placeholder={listening ? 'Listening… speak your query' : 'Ask in natural language…'}
              className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-12 pr-4 text-lg placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <Button variant="secondary" size="icon" onClick={toggleVoice} className={cn(listening && 'bg-red-500/20 text-red-400')}>
            {listening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>
          <Button variant="primary" size="lg" onClick={() => search(query)} disabled={loading || !query.trim()}>
            <Search className="h-5 w-5" />
          </Button>
        </div>

        {listening && (
          <div className="mt-3 flex items-center gap-2 text-xs text-red-400">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <motion.span key={i} animate={{ height: [4, 14, 4] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }} className="w-1 rounded-full bg-red-400" />
              ))}
            </div>
            Voice input active — speech-to-text placeholder
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button key={ex} onClick={() => { setQuery(ex); search(ex); }} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary/30 hover:text-foreground">
              {ex}
            </button>
          ))}
        </div>
      </Card>

      {/* AI Response */}
      {aiResponse && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary"><Bot className="h-4 w-4" /></div>
              <p className="text-sm text-muted-foreground">{aiResponse}</p>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Results */}
      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-white/5" />)}
        </div>
      )}

      {!loading && searched && results.length > 0 && (
        <div className="space-y-2">
          {results.map((r, i) => {
            const Icon = TYPE_ICONS[r.type] ?? Users;
            return (
              <motion.a key={i} href={r.href} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center gap-3 rounded-xl glass-card p-4 transition-all hover:border-primary/30">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary"><Icon className="h-5 w-5" /></div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{r.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{r.subtitle}</p>
                </div>
                <Badge variant="muted" className="capitalize">{r.type}</Badge>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </motion.a>
            );
          })}
        </div>
      )}

      {!loading && searched && results.length === 0 && !aiResponse && (
        <EmptyState icon={<Search className="h-6 w-6" />} title="No results found" desc="Try rephrasing your query or use one of the example searches above." />
      )}

      {!searched && !loading && (
        <Card>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/20"><Sparkles className="h-8 w-8" /></div>
            <p className="mb-1 text-sm font-medium">AI-Powered Natural Language Search</p>
            <p className="max-w-md text-sm text-muted-foreground">Search across leads, contacts, companies, calls, meetings, emails, and tasks — just by asking in plain English.</p>
          </div>
        </Card>
      )}
    </div>
  );
}
