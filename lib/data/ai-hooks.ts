'use client';

import { useSupabaseQueryWithDefault } from './use-supabase-query';
import { useState, useCallback } from 'react';

export interface AiConversation {
  id: string;
  title: string;
  pinned: boolean;
  createdAt: string;
}

export interface AiMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  feature: string;
  feedback: 'liked' | 'disliked' | null;
  tokensUsed: number;
  latencyMs: number;
  createdAt: string;
}

export interface AiCallAnalysis {
  id: string;
  callId: string;
  summary: string;
  keyDiscussion: string[];
  sentiment: string;
  sentimentScore: number;
  objections: string[];
  nextActions: string[];
  followUpDate: string;
  riskLevel: 'low' | 'medium' | 'high';
  keywords: string[];
  callScore: number;
  emotionTimeline: { time: string; emotion: string; score: number }[];
  confidence: number;
}

export interface AiLeadScore {
  id: string;
  leadId: string;
  score: number;
  tier: 'hot' | 'warm' | 'cold';
  buyingIntent: 'high' | 'medium' | 'low';
  intentSignals: string[];
  priority: 'high' | 'medium' | 'low';
  bestContactTime: string;
  recommendedAction: string;
  conversionProb: number;
}

export interface AiAutomationFlow {
  id: string;
  name: string;
  description: string;
  trigger: { type: string; label: string };
  steps: { type: string; label: string }[];
  isActive: boolean;
  executions: number;
  createdAt: string;
}

export interface AiSettings {
  provider: string;
  model: string;
  temperature: number;
  maxTokens: number;
  language: string;
  responseLength: string;
  creativity: string;
  autoSummary: boolean;
  autoSuggestions: boolean;
  voiceEnabled: boolean;
}

export function useAiConversations() {
  return useSupabaseQueryWithDefault<AiConversation[]>(async (c) => {
    const { data, error } = await c.from('ai_conversations').select('*').order('updated_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((r: Record<string, unknown>) => ({
      id: r.id as string, title: r.title as string, pinned: (r.pinned as boolean) ?? false, createdAt: r.created_at as string,
    }));
  }, []);
}

export function useAiMessages(conversationId: string | null) {
  return useSupabaseQueryWithDefault<AiMessage[]>(async (c) => {
    if (!conversationId) return [];
    const { data, error } = await c.from('ai_messages').select('*').eq('conversation_id', conversationId).order('created_at', { ascending: true });
    if (error) throw error;
    return (data ?? []).map((r: Record<string, unknown>) => ({
      id: r.id as string, conversationId: r.conversation_id as string, role: r.role as AiMessage['role'],
      content: r.content as string, feature: (r.feature as string) ?? 'chat', feedback: (r.feedback as AiMessage['feedback']) ?? null,
      tokensUsed: (r.tokens_used as number) ?? 0, latencyMs: (r.latency_ms as number) ?? 0, createdAt: r.created_at as string,
    }));
  }, [], [conversationId]);
}

export function useAiCallAnalysis() {
  return useSupabaseQueryWithDefault<AiCallAnalysis[]>(async (c) => {
    const { data, error } = await c.from('ai_call_analysis').select('*').order('created_at', { ascending: false }).limit(20);
    if (error) throw error;
    return (data ?? []).map((r: Record<string, unknown>) => ({
      id: r.id as string, callId: (r.call_id as string) ?? '', summary: (r.summary as string) ?? '',
      keyDiscussion: (r.key_discussion as string[]) ?? [], sentiment: (r.sentiment as string) ?? 'neutral',
      sentimentScore: (r.sentiment_score as number) ?? 50, objections: (r.objections as string[]) ?? [],
      nextActions: (r.next_actions as string[]) ?? [], followUpDate: (r.follow_up_date as string) ?? '',
      riskLevel: (r.risk_level as AiCallAnalysis['riskLevel']) ?? 'low', keywords: (r.keywords as string[]) ?? [],
      callScore: Number(r.call_score ?? 0), emotionTimeline: (r.emotion_timeline as AiCallAnalysis['emotionTimeline']) ?? [],
      confidence: Number(r.confidence ?? 0),
    }));
  }, []);
}

export function useAiLeadScores() {
  return useSupabaseQueryWithDefault<AiLeadScore[]>(async (c) => {
    const { data, error } = await c.from('ai_lead_scores').select('*').order('score', { ascending: false }).limit(20);
    if (error) throw error;
    return (data ?? []).map((r: Record<string, unknown>) => ({
      id: r.id as string, leadId: (r.lead_id as string) ?? '', score: (r.score as number) ?? 0,
      tier: (r.tier as AiLeadScore['tier']) ?? 'warm', buyingIntent: (r.buying_intent as AiLeadScore['buyingIntent']) ?? 'medium',
      intentSignals: (r.intent_signals as string[]) ?? [], priority: (r.priority as AiLeadScore['priority']) ?? 'medium',
      bestContactTime: (r.best_contact_time as string) ?? '', recommendedAction: (r.recommended_action as string) ?? '',
      conversionProb: Number(r.conversion_prob ?? 0),
    }));
  }, []);
}

export function useAiAutomationFlows() {
  return useSupabaseQueryWithDefault<AiAutomationFlow[]>(async (c) => {
    const { data, error } = await c.from('ai_automation_flows').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((r: Record<string, unknown>) => ({
      id: r.id as string, name: r.name as string, description: (r.description as string) ?? '',
      trigger: r.trigger as AiAutomationFlow['trigger'], steps: (r.steps as AiAutomationFlow['steps']) ?? [],
      isActive: (r.is_active as boolean) ?? false, executions: (r.executions as number) ?? 0,
      createdAt: r.created_at as string,
    }));
  }, []);
}

export function useAiSettings() {
  return useSupabaseQueryWithDefault<AiSettings | null>(async (c) => {
    const { data: { user } } = await c.auth.getUser();
    if (!user) return null;
    const { data: profile } = await c.from('profiles').select('tenant_id').eq('id', user.id).maybeSingle();
    if (!profile?.tenant_id) return null;
    const { data, error } = await c.from('ai_settings').select('*').eq('tenant_id', profile.tenant_id).maybeSingle();
    if (error || !data) return null;
    return {
      provider: data.provider ?? 'simulated', model: data.model ?? 'gpt-4o',
      temperature: Number(data.temperature ?? 0.7), maxTokens: (data.max_tokens as number) ?? 2048,
      language: data.language ?? 'en', responseLength: data.response_length ?? 'medium',
      creativity: data.creativity ?? 'balanced', autoSummary: (data.auto_summary as boolean) ?? true,
      autoSuggestions: (data.auto_suggestions as boolean) ?? true, voiceEnabled: (data.voice_enabled as boolean) ?? true,
    } as AiSettings;
  }, null);
}

/**
 * Client-side AI request helper. Calls the unified /api/ai/[feature] endpoint.
 * Returns structured content when available.
 */
export function useAiRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const request = useCallback(async (feature: string, prompt: string, context?: Record<string, unknown>) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/ai/${feature}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          context,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(err.error || 'AI request failed');
      }
      const data = await res.json();
      return data;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { request, loading, error };
}
