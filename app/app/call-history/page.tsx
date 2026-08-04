'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Search,
  Sparkles,
  Play,
  MoreVertical,
} from 'lucide-react';
import { PageHeader, Card, Badge, Avatar } from '@/components/crm/crm-ui';
import { useCalls, useContacts } from '@/lib/data/hooks';
import type { Call } from '@/lib/crm-data';
import { CallAiInsightsModal } from '@/components/ai/call-ai-insights-modal';

const DIRECTIONS = ['All', 'Inbound', 'Outbound', 'Missed'] as const;
type DirectionFilter = (typeof DIRECTIONS)[number];


function DirectionIcon({ direction }: { direction: Call['direction'] }) {
  if (direction === 'inbound') {
    return <PhoneIncoming className="h-4 w-4 text-cyan" />;
  }
  if (direction === 'outbound') {
    return <PhoneOutgoing className="h-4 w-4 text-primary" />;
  }
  return <PhoneMissed className="h-4 w-4 text-red-400" />;
}

function dispositionVariant(disposition: string): 'primary' | 'cyan' | 'green' | 'red' | 'muted' {
  const v = disposition.toLowerCase();
  if (v.includes('interest') || v.includes('demo')) return 'cyan';
  if (v.includes('proposal') || v.includes('negotiat')) return 'primary';
  if (v.includes('follow') || v.includes('needs')) return 'green';
  if (v.includes('no answer') || v.includes('lost')) return 'red';
  return 'muted';
}

function Waveform({ playing }: { playing: boolean }) {
  const bars = Array.from({ length: 48 });
  return (
    <div className="flex h-16 items-center gap-0.5">
      {bars.map((_, i) => (
        <motion.div
          key={i}
          className="w-1 flex-shrink-0 rounded-full bg-gradient-to-t from-primary/40 to-cyan"
          initial={{ height: 4 }}
          animate={
            playing
              ? { height: [4, 6 + ((i * 7) % 44), 8 + ((i * 13) % 32), 6, 4] }
              : { height: 6 + ((i * 11) % 26) }
          }
          transition={
            playing
              ? { duration: 0.9, repeat: Infinity, delay: (i % 12) * 0.05, ease: 'easeInOut' }
              : { duration: 0.3 }
          }
        />
      ))}
    </div>
  );
}

export default function CallHistoryPage() {
  const { data: CALLS = [] } = useCalls();
  const { data: CONTACTS = [] } = useContacts();
  const AVATAR_BY_NAME: Record<string, string> = Object.fromEntries(
    CONTACTS.map((c) => [c.name, c.avatar])
  );
  const [search, setSearch] = useState('');
  const [direction, setDirection] = useState<DirectionFilter>('All');
  const [selected, setSelected] = useState<Call | null>(null);
  const [playing, setPlaying] = useState(false);

  const filtered = useMemo(
    () =>
      CALLS.filter((c) => {
        const matchesSearch =
          c.contact.toLowerCase().includes(search.toLowerCase()) ||
          c.company.toLowerCase().includes(search.toLowerCase()) ||
          c.agent.toLowerCase().includes(search.toLowerCase());
        const matchesDirection =
          direction === 'All' || c.direction === direction.toLowerCase();
        return matchesSearch && matchesDirection;
      }),
    [search, direction]
  );

  const openModal = (call: Call) => {
    setSelected(call);
    setPlaying(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Call History" subtitle="All calls across your team" />

      {/* Filter row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by contact, company, or agent…"
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <select
          value={direction}
          onChange={(e) => setDirection(e.target.value as DirectionFilter)}
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          {DIRECTIONS.map((d) => (
            <option key={d} value={d} className="bg-bg-secondary">
              {d}
            </option>
          ))}
        </select>
      </div>

      {/* Calls table */}
      <Card className="p-0" delay={0.1}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/5 text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3 font-medium">Contact</th>
                <th className="px-5 py-3 font-medium">Company</th>
                <th className="px-5 py-3 font-medium">Direction</th>
                <th className="px-5 py-3 font-medium">Duration</th>
                <th className="px-5 py-3 font-medium">Disposition</th>
                <th className="px-5 py-3 font-medium">AI Sentiment</th>
                <th className="px-5 py-3 font-medium">Lead Score</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">AI Insights</th>
                <th className="px-5 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((call, i) => (
                <motion.tr
                  key={call.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                  onClick={() => openModal(call)}
                  className="cursor-pointer border-b border-white/5 transition-colors last:border-0 hover:bg-white/5"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar src={AVATAR_BY_NAME[call.contact]} name={call.contact} size={32} />
                      <div>
                        <p className="font-medium">{call.contact}</p>
                        <p className="text-xs text-muted-foreground">{call.agent}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{call.company}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <DirectionIcon direction={call.direction} />
                      <span className="capitalize text-muted-foreground">{call.direction}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 tabular-nums text-muted-foreground">{call.duration}</td>
                  <td className="px-5 py-3">
                    <Badge variant={dispositionVariant(call.disposition)}>{call.disposition}</Badge>
                  </td>
                  <td className="px-5 py-3">
                    <Badge
                      variant={
                        (call.sentiment || 'Neutral').toLowerCase().includes('pos')
                          ? 'green'
                          : (call.sentiment || '').toLowerCase().includes('neg')
                          ? 'red'
                          : 'yellow'
                      }
                    >
                      {call.sentiment || 'Neutral'}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 font-semibold text-xs">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-md border ${
                        (call.leadScore || 50) >= 75
                          ? 'text-green-400 bg-green-500/10 border-green-500/20'
                          : (call.leadScore || 50) >= 50
                          ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
                          : 'text-red-400 bg-red-500/10 border-red-500/20'
                      }`}
                    >
                      {call.leadScore || 50}/100
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <p>{call.date}</p>
                    <p className="text-xs text-muted-foreground">{call.time}</p>
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openModal(call);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/15 text-primary text-xs font-medium hover:bg-primary/25 transition-colors"
                    >
                      <Sparkles className="h-3 w-3" /> View AI
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="px-5 py-12 text-center text-sm text-muted-foreground">
            No calls match your filters.
          </div>
        )}
      </Card>

      {/* Full AI Insights Modal */}
      <CallAiInsightsModal call={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
