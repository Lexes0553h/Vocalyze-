'use client';

import { useState } from 'react';
import { Disc, Play, Pause, Download, Volume2, Search, Filter, MessageSquare, Shield } from 'lucide-react';
import { PageHeader, Card, Badge, Button, Avatar } from '@/components/crm/crm-ui';
import { toast } from '@/components/ui/toast';

import { useCalls } from '@/lib/data/hooks';

export default function CallRecordingsPage() {
  const { data: calls = [] } = useCalls();
  const [playingId, setPlayingId] = useState<string | null>(null);

  const recordings = calls.filter((c) => c.status === 'Completed' || c.duration || c.notes);

  const togglePlay = (id: string) => {
    if (playingId === id) {
      setPlayingId(null);
    } else {
      setPlayingId(id);
      toast({ title: 'Playing Recording', description: 'Audio playback started.' });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Call Recordings & QA Transcripts"
        subtitle="Admin Portal • Listen to Telecaller Call Recordings, Sentiment & AI Transcripts"
      />

      <Card padding={false}>
        {recordings.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {recordings.map((rec) => (
              <div key={rec.id} className="p-4 sm:p-5 hover:bg-slate-50/80 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Button
                      size="sm"
                      variant={playingId === rec.id ? 'primary' : 'outline'}
                      onClick={() => togglePlay(rec.id)}
                      className="h-10 w-10 rounded-full p-0 flex items-center justify-center shrink-0"
                    >
                      {playingId === rec.id ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                    </Button>
                    <div>
                      <p className="font-bold text-slate-900">{rec.contact || 'Unknown Contact'}</p>
                      <p className="text-xs text-slate-500">Agent: <span className="font-semibold text-slate-700">{rec.agent || 'Telecaller'}</span> • {rec.phone || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <span className="font-medium text-slate-600">{rec.date || 'Today'}</span>
                    <Badge variant="green"><Volume2 className="h-3 w-3 mr-1 inline" /> {rec.duration || '0m 00s'}</Badge>
                    <Badge variant="green">Positive</Badge>
                    <Button size="sm" variant="ghost" onClick={() => toast({ title: 'Downloading', description: 'Exporting audio file MP3.' })}>
                      <Download className="h-4 w-4 text-slate-500" />
                    </Button>
                  </div>
                </div>

                {/* Transcript Preview */}
                <div className="mt-3 rounded-lg bg-slate-100/70 p-3 text-xs text-slate-700 font-mono">
                  💬 <span className="font-semibold text-slate-900">AI Transcript Preview:</span> &ldquo;{rec.notes || 'No transcript notes available for this recording.'}&rdquo;
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-slate-500">
            No call recordings available.
          </div>
        )}
      </Card>
    </div>
  );
}
