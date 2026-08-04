'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Phone, Users, Building2, MessageCircle, MessageSquare, Mail, CheckSquare, ArrowRight, Loader2 } from 'lucide-react';
import { PageHeader, Avatar, Badge } from '@/components/crm/crm-ui';
import { cn } from '@/lib/utils';

interface SearchResult {
  type: string;
  id: string;
  title: string;
  subtitle: string;
  href: string;
}

const TYPE_CONFIG: Record<string, { icon: typeof Phone; color: string }> = {
  Lead: { icon: Users, color: 'text-primary' },
  Contact: { icon: Users, color: 'text-cyan' },
  Company: { icon: Building2, color: 'text-primary' },
  Call: { icon: Phone, color: 'text-cyan' },
  WhatsApp: { icon: MessageCircle, color: 'text-green-400' },
  SMS: { icon: MessageSquare, color: 'text-cyan' },
  Email: { icon: Mail, color: 'text-cyan' },
  Task: { icon: CheckSquare, color: 'text-muted-foreground' },
};

export default function GlobalSearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    if (!query.trim()) { setResults([]); setSearched(false); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
        }
      } catch { setResults([]); }
      setLoading(false);
      setSearched(true);
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    (acc[r.type] = acc[r.type] || []).push(r);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <PageHeader title="Global Search" subtitle="Search across leads, contacts, companies, calls, messages, emails, and tasks." />

      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search anything…"
          className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-12 pr-12 text-lg placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        {query && (
          <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground hover:bg-white/5 hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-sm text-muted-foreground">No results for &ldquo;{query}&rdquo;</p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="space-y-6">
          {Object.entries(grouped).map(([type, items]) => {
            const cfg = TYPE_CONFIG[type] || TYPE_CONFIG['Lead'];
            const Icon = cfg.icon;
            return (
              <motion.div key={type} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl glass-card p-5">
                <div className="mb-3 flex items-center gap-2">
                  <Icon className={cn('h-4 w-4', cfg.color)} />
                  <h3 className="text-sm font-medium">{type}</h3>
                  <Badge variant="muted">{items.length}</Badge>
                </div>
                <div className="space-y-2">
                  {items.map((r) => (
                    <a key={r.id} href={r.href} className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-white/5">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{r.title}</p>
                        <p className="truncate text-xs text-muted-foreground">{r.subtitle}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    </a>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {!searched && !loading && (
        <div className="py-16 text-center">
          <p className="text-sm text-muted-foreground">Start typing to search across your entire CRM.</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {['Leads', 'Contacts', 'Companies', 'Calls', 'WhatsApp', 'SMS', 'Emails', 'Tasks'].map((t) => (
              <Badge key={t} variant="muted">{t}</Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
