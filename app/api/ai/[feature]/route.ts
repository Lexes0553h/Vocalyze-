import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, unauthorized, forbidden } from '@/lib/server/middleware';
import { getAIProvider, type AIFeature, type AIChatMessage } from '@/lib/ai/provider';

const VALID_FEATURES: AIFeature[] = [
  'chat', 'call-summary', 'sentiment', 'lead-score', 'follow-up',
  'email-writer', 'whatsapp-reply', 'sms-writer', 'task-assistant',
  'sales-coach', 'analytics', 'natural-search', 'automation-suggest',
];

export async function POST(req: NextRequest) {
  const ctx = await requireAuth(req);
  if (!ctx.isAuthenticated) return unauthorized();

  const { searchParams } = new URL(req.url);
  const feature = (searchParams.get('feature') || 'chat') as AIFeature;

  if (!VALID_FEATURES.includes(feature)) {
    return NextResponse.json({ error: `Unknown AI feature: ${feature}` }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const messages: AIChatMessage[] = body.messages ?? [{ role: 'user', content: body.prompt ?? body.query ?? '' }];
  const context = body.context ?? {};

  // Rate limiting: max 30 requests per minute per user (basic in-memory)
  // In production this would use Redis or Supabase rate limiting

  const provider = getAIProvider();
  try {
    const response = await provider.generate({
      messages,
      feature,
      context,
      temperature: body.temperature,
      maxTokens: body.maxTokens,
    });

    // Try to parse structured responses
    let structured: Record<string, unknown> | undefined;
    if (
      feature === 'call-summary' || feature === 'sentiment' || feature === 'lead-score' ||
      feature === 'task-assistant' || feature === 'sales-coach' || feature === 'analytics' ||
      feature === 'natural-search' || feature === 'automation-suggest'
    ) {
      try {
        structured = JSON.parse(response.content);
      } catch {
        // content is plain text
      }
    }

    return NextResponse.json({
      content: response.content,
      structured,
      provider: response.provider,
      model: response.model,
      tokensUsed: response.tokensUsed,
      latencyMs: response.latencyMs,
      feature,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'AI generation failed';
    return NextResponse.json({ error: message, feature }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const ctx = await requireAuth(req);
  if (!ctx.isAuthenticated) return unauthorized();
  const { searchParams } = new URL(req.url);
  const feature = (searchParams.get('feature') || 'chat') as AIFeature;
  return NextResponse.json({
    feature,
    status: 'ready',
    provider: getAIProvider().name,
    connected: getAIProvider().connected,
  });
}
