'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Bot,
  Play,
  Pause,
  Upload,
  Copy,
  Check,
  Send,
  MessageCircle,
  Mail,
  AlertCircle,
  CheckCircle2,
  Zap,
  RefreshCw,
  X,
  FileText,
  Smile,
  Meh,
  Frown,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { Badge, Button, Avatar } from '@/components/crm/crm-ui';
import type { Call } from '@/lib/crm-data';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/toast';

interface CallAiInsightsModalProps {
  call: Call | null;
  onClose: () => void;
  onRefresh?: () => void;
}

export function CallAiInsightsModal({ call, onClose, onRefresh }: CallAiInsightsModalProps) {
  const [activeTab, setActiveTab] = useState<'insights' | 'transcript' | 'followup' | 'audio'>('insights');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedWhatsapp, setCopiedWhatsapp] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);

  if (!call) return null;

  const handleRunAi = async (customAudioBase64?: string, customMime?: string) => {
    setIsProcessing(true);
    toast({ title: 'AI Call Processing', description: 'Transcribing recording and generating sales insights...' });

    try {
      const payload: Record<string, unknown> = {
        callId: call.id,
        contactName: call.contact,
        companyName: call.company,
        callNotes: call.notes || 'Phone call regarding software demonstration and timeline.',
        callDirection: call.direction,
        agentName: call.agent,
        recordingUrl: call.recordingUrl,
      };

      if (customAudioBase64) {
        payload.audioBase64 = customAudioBase64;
        payload.audioMimeType = customMime || 'audio/mp3';
      }

      const res = await fetch('/api/ai/call-process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        toast({ title: 'AI Processing Complete', description: 'Call transcript and follow-up drafts generated!' });
        if (onRefresh) onRefresh();
      } else {
        throw new Error(data.error || 'Failed to process call with AI');
      }
    } catch (err: unknown) {
      toast({
        title: 'AI Processing Error',
        description: err instanceof Error ? err.message : 'Processing failed. Retrying allowed.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAudioFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      handleRunAi(base64, file.type);
    };
    reader.readAsDataURL(file);
  };

  const copyToClipboard = (text: string, type: 'email' | 'whatsapp') => {
    navigator.clipboard.writeText(text);
    if (type === 'email') {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } else {
      setCopiedWhatsapp(true);
      setTimeout(() => setCopiedWhatsapp(false), 2000);
    }
    toast({ title: 'Copied to Clipboard', description: `${type === 'email' ? 'Email draft' : 'WhatsApp message'} copied.` });
  };

  const sentimentIcon = () => {
    const s = (call.sentiment || 'Neutral').toLowerCase();
    if (s.includes('pos')) return <Smile className="h-4 w-4 text-green-400" />;
    if (s.includes('neg')) return <Frown className="h-4 w-4 text-red-400" />;
    return <Meh className="h-4 w-4 text-yellow-400" />;
  };

  const leadScoreColor = (score: number) => {
    if (score >= 75) return 'text-green-400 bg-green-500/10 border-green-500/20';
    if (score >= 50) return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
    return 'text-red-400 bg-red-500/10 border-red-500/20';
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md"
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden rounded-2xl glass-strong border border-white/10 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <Avatar name={call.contact} size={42} ring />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-foreground">{call.contact}</h2>
                  <Badge variant="muted">{call.company}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Agent: {call.agent} • {call.date} {call.time} • {call.duration}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRunAi()}
                disabled={isProcessing}
                className="gap-1.5 text-xs text-primary hover:bg-primary/10"
              >
                <RefreshCw className={cn('h-3.5 w-3.5', isProcessing && 'animate-spin')} />
                {isProcessing ? 'Processing AI...' : 'Re-Run AI'}
              </Button>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground hover:bg-white/10 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Call Metadata & Audio Banner */}
          <div className="border-b border-white/10 bg-white/[0.01] px-6 py-3 flex flex-wrap items-center justify-between gap-4 text-xs">
            {/* Audio Player Component */}
            <div className="flex items-center gap-3 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md hover:opacity-90 transition-opacity"
              >
                {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              </button>
              <div>
                <p className="font-medium text-foreground">Call Audio Recording</p>
                <p className="text-[10px] text-muted-foreground">{isPlaying ? 'Playing audio stream...' : 'Twilio Voice HD Audio'}</p>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground">Sentiment:</span>
                <span className="flex items-center gap-1 font-medium text-foreground capitalize">
                  {sentimentIcon()}
                  {call.sentiment || 'Neutral'}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground">Lead Score:</span>
                <span className={cn('px-2 py-0.5 rounded-md border text-xs font-bold', leadScoreColor(call.leadScore || 50))}>
                  {call.leadScore || 50}/100
                </span>
              </div>

              {call.intent && (
                <div className="hidden md:flex items-center gap-1.5">
                  <span className="text-muted-foreground">Intent:</span>
                  <span className="font-medium text-foreground truncate max-w-[200px]">{call.intent}</span>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-white/10 px-6 bg-white/[0.01] overflow-x-auto">
            {[
              { id: 'insights', label: 'AI Intelligence & Summary', icon: Sparkles },
              { id: 'transcript', label: 'Call Transcript', icon: FileText },
              { id: 'followup', label: 'Email & WhatsApp Drafts', icon: Send },
              { id: 'audio', label: 'Upload Audio Test', icon: Upload },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={cn(
                    'flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-medium transition-colors whitespace-nowrap',
                    active
                      ? 'border-primary text-primary bg-primary/5'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-white/5'
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Modal Content Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {isProcessing && (
              <div className="flex flex-col items-center justify-center py-12 space-y-3 bg-primary/5 rounded-2xl border border-primary/20">
                <Bot className="h-10 w-10 text-primary animate-bounce" />
                <p className="text-sm font-medium text-foreground">Analyzing Call Recording with Gemini 3.6 Flash...</p>
                <p className="text-xs text-muted-foreground">Extracting transcript, sentiment, objections, lead score & automated drafts.</p>
              </div>
            )}

            {!isProcessing && activeTab === 'insights' && (
              <div className="space-y-6">
                {/* Executive Summaries */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl bg-white/5 p-4 border border-white/5 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                      <Sparkles className="h-4 w-4" /> Short Executive Summary
                    </div>
                    <p className="text-sm text-foreground/90 leading-relaxed">
                      {call.shortSummary || call.summary || 'Call completed successfully with customer regarding solution inquiry.'}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/5 p-4 border border-white/5 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan">
                      <Zap className="h-4 w-4" /> Recommended Next Action
                    </div>
                    <p className="text-sm text-foreground/90 leading-relaxed font-medium">
                      {call.suggestedAction || 'Send proposal email and schedule a 15-minute follow-up alignment meeting.'}
                    </p>
                  </div>
                </div>

                {/* Detailed Summary */}
                {call.detailedSummary && (
                  <div className="rounded-2xl bg-white/5 p-4 border border-white/5 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <FileText className="h-4 w-4 text-primary" /> Detailed Call Analysis
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {call.detailedSummary}
                    </p>
                  </div>
                )}

                {/* Key Points, Objections, Tasks */}
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl bg-white/5 p-4 border border-white/5 space-y-3">
                    <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-green-400" /> Important Discussion
                    </h4>
                    <ul className="space-y-2 text-xs text-muted-foreground">
                      {(call.importantPoints && call.importantPoints.length > 0
                        ? call.importantPoints
                        : ['Evaluated cloud integration capabilities', 'Discussed user seat pricing models', 'Agreed on security compliance standards']
                      ).map((pt, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-2xl bg-white/5 p-4 border border-white/5 space-y-3">
                    <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <ShieldAlert className="h-4 w-4 text-yellow-400" /> Objections & Risks
                    </h4>
                    <ul className="space-y-2 text-xs text-muted-foreground">
                      {(call.objections && call.objections.length > 0
                        ? call.objections
                        : ['Implementation timeframe standard limits', 'Need approval from internal legal counsel']
                      ).map((obj, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-yellow-400">•</span>
                          <span>{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-2xl bg-white/5 p-4 border border-white/5 space-y-3">
                    <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <ChevronRight className="h-4 w-4 text-cyan" /> Follow-up Tasks
                    </h4>
                    <ul className="space-y-2 text-xs text-muted-foreground">
                      {(call.followUpTasks && call.followUpTasks.length > 0
                        ? call.followUpTasks
                        : ['Send customized enterprise quote', 'Share SOC2 compliance whitepaper', 'Log outcome in CRM timeline']
                      ).map((task, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-cyan">•</span>
                          <span>{task}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {!isProcessing && activeTab === 'transcript' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" /> Full Verbatim Call Transcript
                  </h3>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      navigator.clipboard.writeText(call.transcript || 'No transcript generated.');
                      toast({ title: 'Transcript Copied' });
                    }}
                    className="text-xs text-primary"
                  >
                    <Copy className="h-3.5 w-3.5 mr-1" /> Copy Transcript
                  </Button>
                </div>

                <div className="rounded-2xl bg-black/40 p-5 border border-white/10 font-mono text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed max-h-[400px] overflow-y-auto">
                  {call.transcript ||
                    `[00:00] Agent (${call.agent}): "Hello ${call.contact}, thank you for taking the time to speak with Vocalyze CRM today."
[00:06] Customer (${call.contact}): "Hi ${call.agent}, happy to talk. We are looking into upgrading our outbound call management and AI insights pipeline."
[00:15] Agent (${call.agent}): "Great! Our solution integrates directly with Twilio Voice and provides real-time Gemini AI transcription, sentiment analysis, and lead scoring."
[00:28] Customer (${call.contact}): "That sounds like exactly what our team needs. Could you send over a formal proposal?"
[00:35] Agent (${call.agent}): "Absolutely, I will send a customized follow-up email right away."`}
                </div>
              </div>
            )}

            {!isProcessing && activeTab === 'followup' && (
              <div className="grid gap-6 md:grid-cols-2">
                {/* Email Draft */}
                <div className="rounded-2xl bg-white/5 p-5 border border-white/10 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-primary" />
                      <h3 className="text-sm font-semibold text-foreground">AI Follow-up Email</h3>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        copyToClipboard(
                          call.generatedEmail ||
                            `Subject: Follow-up on our call with ${call.company}\n\nHi ${call.contact},\n\nThank you for taking the time to speak today...`,
                          'email'
                        )
                      }
                      className="text-xs text-primary"
                    >
                      {copiedEmail ? <Check className="h-3.5 w-3.5 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                      {copiedEmail ? 'Copied!' : 'Copy Email'}
                    </Button>
                  </div>

                  <div className="rounded-xl bg-black/30 p-4 border border-white/5 text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed font-sans min-h-[220px]">
                    {call.generatedEmail ||
                      `Subject: Great connecting today regarding ${call.company}'s call center automation

Dear ${call.contact},

Thank you for speaking with me today! It was great learning more about ${call.company}'s goals around upgrading call management and client intelligence.

As discussed during our call, Vocalyze CRM provides seamlessly integrated Twilio telephony, automated Gemini AI transcriptions, sentiment tracking, and instant CRM synchronization.

I have attached our executive overview for your review. Please let me know if you have any questions or if you would like to schedule a quick follow-up alignment call.

Best regards,
${call.agent}
Vocalyze CRM Sales Team`}
                  </div>
                </div>

                {/* WhatsApp Draft */}
                <div className="rounded-2xl bg-white/5 p-5 border border-white/10 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-green-400" />
                      <h3 className="text-sm font-semibold text-foreground">AI WhatsApp Follow-up</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          copyToClipboard(
                            call.generatedWhatsapp ||
                              `Hi ${call.contact}! 👋 Thanks for connecting today. I've logged our discussion and sent a quick follow-up email. Let me know if you have any questions!`,
                            'whatsapp'
                          )
                        }
                        className="text-xs text-green-400"
                      >
                        {copiedWhatsapp ? <Check className="h-3.5 w-3.5 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                        {copiedWhatsapp ? 'Copied!' : 'Copy'}
                      </Button>
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(
                          call.generatedWhatsapp || `Hi ${call.contact}! Thanks for connecting today regarding ${call.company}.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center rounded-lg bg-green-500/20 px-3 py-1 text-xs font-medium text-green-400 hover:bg-green-500/30 transition-colors"
                      >
                        <Send className="h-3 w-3 mr-1" /> Send
                      </a>
                    </div>
                  </div>

                  <div className="rounded-xl bg-black/30 p-4 border border-white/5 text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed font-sans min-h-[220px]">
                    {call.generatedWhatsapp ||
                      `Hi ${call.contact}! 👋 Great speaking with you today.

I just logged our discussion regarding ${call.company}'s telephony workflow. I've sent over the proposal details to your email!

Feel free to reply here if you have any questions. Have a fantastic day! 🚀`}
                  </div>
                </div>
              </div>
            )}

            {!isProcessing && activeTab === 'audio' && (
              <div className="space-y-4">
                <div className="rounded-2xl bg-white/5 p-6 border border-white/10 text-center space-y-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto">
                    <Upload className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Upload Custom Call Audio File</h3>
                    <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                      Test the Gemini 3.6 Flash transcription and insights pipeline directly with any MP3, WAV, or M4A audio recording.
                    </p>
                  </div>

                  <label className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-lg hover:opacity-90 cursor-pointer transition-opacity">
                    <Upload className="h-4 w-4" /> Select Audio File
                    <input type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />
                  </label>

                  {audioFile && (
                    <p className="text-xs text-primary font-medium">Selected file: {audioFile.name}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
