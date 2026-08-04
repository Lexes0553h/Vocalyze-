'use client';

import { useState } from 'react';
import { Sparkles, Play, Bot, Mail, MessageCircle, ChevronRight } from 'lucide-react';
import { Card, Badge, Button, Avatar } from '@/components/crm/crm-ui';
import type { Call } from '@/lib/crm-data';
import { CallAiInsightsModal } from '@/components/ai/call-ai-insights-modal';

interface AiCallInsightsCardProps {
  calls: Call[];
  title?: string;
  subtitle?: string;
  employeeOnlyName?: string;
}

export function AiCallInsightsCard({
  calls,
  title = 'AI Call Intelligence & Follow-up Insights',
  subtitle = 'Automated transcriptions, summaries, sentiment analysis, and generated follow-up drafts.',
  employeeOnlyName,
}: AiCallInsightsCardProps) {
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);

  const displayCalls = employeeOnlyName
    ? calls.filter((c) => c.agent.toLowerCase().includes(employeeOnlyName.toLowerCase()))
    : calls;

  const leadScoreBadge = (score: number) => {
    if (score >= 75) return 'text-green-400 bg-green-500/10 border-green-500/20';
    if (score >= 50) return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
    return 'text-red-400 bg-red-500/10 border-red-500/20';
  };

  return (
    <>
      <Card
        title={title}
        action={
          <div className="flex items-center gap-1 text-xs text-primary font-medium">
            <Sparkles className="h-3.5 w-3.5" /> Gemini 3.6 Flash Active
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">{subtitle}</p>

          {displayCalls.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {displayCalls.slice(0, 4).map((call) => (
                <div
                  key={call.id}
                  onClick={() => setSelectedCall(call)}
                  className="group relative cursor-pointer rounded-2xl bg-white/[0.03] p-4 border border-white/5 transition-all hover:bg-white/[0.06] hover:border-primary/30 shadow-md"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={call.contact} size={36} ring />
                      <div>
                        <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                          {call.contact}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {call.company} • {call.agent}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
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
                      <span className={`px-2 py-0.5 rounded-md border text-[11px] font-bold ${leadScoreBadge(call.leadScore || 50)}`}>
                        {call.leadScore || 50}/100
                      </span>
                    </div>
                  </div>

                  <div className="rounded-xl bg-black/20 p-3 mb-3 border border-white/5">
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      &quot;{call.shortSummary || call.summary || 'Call completed successfully with customer inquiry.'}&quot;
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      {call.recording && (
                        <span className="flex items-center gap-1 text-cyan font-medium">
                          <Play className="h-3 w-3" /> Audio Player
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-primary">
                        <Mail className="h-3 w-3" /> Email Draft
                      </span>
                      <span className="flex items-center gap-1 text-green-400">
                        <MessageCircle className="h-3 w-3" /> WhatsApp
                      </span>
                    </div>

                    <span className="flex items-center gap-1 text-primary font-semibold group-hover:translate-x-1 transition-transform">
                      View AI <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-muted-foreground bg-white/5 rounded-2xl border border-white/5">
              <Bot className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="font-medium text-foreground">No call AI insights recorded yet</p>
              <p className="mt-1 text-muted-foreground">Make or complete calls using the dialer to generate automated AI transcripts and follow-up drafts.</p>
            </div>
          )}
        </div>
      </Card>

      <CallAiInsightsModal call={selectedCall} onClose={() => setSelectedCall(null)} />
    </>
  );
}
