/**
 * AI Provider Abstraction Layer
 *
 * Provider-agnostic interface for LLM-powered features. To connect a real
 * provider (OpenAI, Google Gemini, Anthropic Claude, Azure OpenAI, or a local
 * LLM), implement the `AIProvider` interface and register it via
 * `setAIProvider()`. The default `SimulatedAIProvider` returns rich, realistic
 * placeholder responses so every AI feature is fully interactive without an
 * API key.
 *
 * API keys are NEVER exposed to the client. The provider reads them from
 * server-side environment variables only.
 */

export type AIProviderName = 'openai' | 'gemini' | 'claude' | 'azure' | 'local' | 'simulated';

export interface AIChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIRequest {
  messages: AIChatMessage[];
  feature: AIFeature;
  context?: Record<string, unknown>;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface AIResponse {
  content: string;
  provider: AIProviderName;
  model: string;
  tokensUsed: number;
  latencyMs: number;
  structured?: Record<string, unknown>;
}

export type AIFeature =
  | 'chat' | 'call-summary' | 'sentiment' | 'lead-score' | 'follow-up'
  | 'email-writer' | 'whatsapp-reply' | 'sms-writer' | 'task-assistant'
  | 'sales-coach' | 'analytics' | 'natural-search' | 'automation-suggest';

export interface AIProvider {
  readonly name: AIProviderName;
  readonly connected: boolean;
  generate(req: AIRequest): Promise<AIResponse>;
  generateStream?(req: AIRequest): AsyncGenerator<string, void, unknown>;
}

// ============================================================
// Simulated Provider — rich contextual placeholders
// ============================================================

class SimulatedAIProvider implements AIProvider {
  readonly name: AIProviderName = 'simulated';
  readonly connected = true;
  private model = 'vocalyze-simulated-v1';

  async generate(req: AIRequest): Promise<AIResponse> {
    const start = Date.now();
    await new Promise((r) => setTimeout(r, 400 + Math.random() * 600));
    const content = this.buildResponse(req);
    return {
      content,
      provider: this.name,
      model: this.model,
      tokensUsed: Math.ceil(content.length / 4),
      latencyMs: Date.now() - start,
    };
  }

  async *generateStream(req: AIRequest): AsyncGenerator<string, void, unknown> {
    const content = this.buildResponse(req);
    const words = content.split(' ');
    for (let i = 0; i < words.length; i++) {
      await new Promise((r) => setTimeout(r, 30 + Math.random() * 40));
      yield (i === 0 ? '' : ' ') + words[i];
    }
  }

  private buildResponse(req: AIRequest): string {
    const lastMsg = req.messages[req.messages.length - 1]?.content ?? '';
    const ctx = req.context ?? {};

    switch (req.feature) {
      case 'chat':
        return this.chatResponse(lastMsg, ctx);
      case 'call-summary':
        return JSON.stringify(this.callSummary(ctx));
      case 'sentiment':
        return JSON.stringify(this.sentiment(ctx));
      case 'lead-score':
        return JSON.stringify(this.leadScore(ctx));
      case 'follow-up':
        return this.followUp(ctx);
      case 'email-writer':
        return this.emailWriter(ctx);
      case 'whatsapp-reply':
        return this.whatsappReply(ctx);
      case 'sms-writer':
        return this.smsWriter(ctx);
      case 'task-assistant':
        return JSON.stringify(this.taskAssistant(ctx));
      case 'sales-coach':
        return JSON.stringify(this.salesCoach(ctx));
      case 'analytics':
        return JSON.stringify(this.analytics(ctx));
      case 'natural-search':
        return JSON.stringify(this.naturalSearch(lastMsg, ctx));
      case 'automation-suggest':
        return JSON.stringify(this.automationSuggest(lastMsg));
      default:
        return "I'm ready to help. Connect an AI provider to unlock full capabilities.";
    }
  }

  private chatResponse(msg: string, ctx: Record<string, unknown>): string {
    const lower = msg.toLowerCase();
    if (lower.includes('lead') && lower.includes('hot')) {
      return "Here are your **hot leads** right now:\n\n1. **Jordan Avery** — Acme Corp, 40-seat deal, engaged this week. Score: 92/100.\n2. **Elena Vasquez** — Helios Energy, 60 seats, inbound inquiry. Score: 88/100.\n3. **Marcus Reid** — Vertex.io, proposal under legal review. Score: 85/100.\n\nI recommend prioritizing follow-ups with Jordan and Elena today. Want me to draft outreach messages?";
    }
    if (lower.includes('missed') && lower.includes('call')) {
      return "You have **3 missed calls** from yesterday:\n\n- **Priya Sharma** (TechFlow) at 2:15 PM\n- **David Kim** (Nimbus) at 4:42 PM\n- **Sarah Williams** (Catalyst) at 5:30 PM\n\nShall I suggest follow-up actions for each?";
    }
    if (lower.includes('meeting') && lower.includes('today')) {
      return "Your meetings today:\n\n- **10:00 AM** — Demo call with Acme Corp\n- **2:00 PM** — Pipeline review with Sales Team A\n- **4:00 PM** — Follow-up with Helios Energy\n\nAll are confirmed. Would you like me to prepare briefing notes for any of these?";
    }
    if (lower.includes('forecast') || lower.includes('revenue')) {
      return "Based on current pipeline velocity, I project **$285K in closed revenue** this quarter — a **15% increase** over last quarter. Key drivers: 3 enterprise deals in final negotiation and a 22% improvement in lead-to-close time.\n\nGrowth opportunities: expanding the Helios Energy deal from 60 to 80 seats, and re-engaging 12 cold leads with high buying intent signals.";
    }
    return `I understand you're asking about "${msg}". When an AI provider is connected, I'll provide detailed, contextual responses using your live CRM data. I can analyze leads, summarize calls, draft messages, forecast revenue, and much more. Try asking me about your hot leads, missed calls, today's meetings, or revenue forecast.`;
  }

  private callSummary(ctx: Record<string, unknown>): Record<string, unknown> {
    const contact = (ctx.contactName as string) ?? 'the customer';
    return {
      summary: `Discussion with ${contact} about team plan expansion. Customer expressed interest in scaling from 20 to 40 seats. Budget approved for Q3. Needs pricing breakdown and security documentation before final decision.`,
      keyDiscussion: [
        'Current usage at 20 seats, looking to scale to 40',
        'Budget approved for Q3 deployment',
        'Security review required — needs SOC 2 documentation',
        'Interested in annual billing for discount',
      ],
      sentiment: 'positive',
      sentimentScore: 78,
      objections: [
        'Concerned about onboarding time for 20 new users',
        'Wants clarity on data residency for EU team members',
      ],
      nextActions: [
        'Send pricing breakdown for 40 seats with annual discount',
        'Provide SOC 2 compliance documentation',
        'Schedule technical review with their IT team',
        'Follow up by Friday with proposal v2',
      ],
      followUpReminder: '2025-01-17T10:00:00Z',
      riskLevel: 'low',
      importantKeywords: ['scaling', 'annual billing', 'SOC 2', 'data residency', 'Q3 deployment'],
      callScore: 8.5,
      agentPerformance: {
        rating: 'excellent',
        talkRatio: 42,
        questionCount: 12,
        objectionHandling: 'strong',
        notes: 'Agent asked insightful discovery questions and addressed concerns proactively.',
      },
    };
  }

  private sentiment(ctx: Record<string, unknown>): Record<string, unknown> {
    return {
      overall: 'positive',
      score: 78,
      confidence: 0.91,
      emotionTimeline: [
        { time: '0:00', emotion: 'neutral', score: 50 },
        { time: '1:30', emotion: 'interested', score: 65 },
        { time: '3:00', emotion: 'positive', score: 72 },
        { time: '5:00', emotion: 'concerned', score: 45 },
        { time: '7:00', emotion: 'positive', score: 80 },
        { time: '9:00', emotion: 'enthusiastic', score: 88 },
      ],
      moodIndicator: 'receptive',
      breakdown: {
        positive: 68,
        neutral: 22,
        negative: 10,
      },
      keyEmotions: ['interested', 'enthusiastic', 'slightly concerned about onboarding'],
    };
  }

  private leadScore(ctx: Record<string, unknown>): Record<string, unknown> {
    const name = (ctx.leadName as string) ?? 'this lead';
    return {
      leadName: name,
      score: 87,
      tier: 'hot',
      buyingIntent: 'high',
      intentSignals: [
        'Visited pricing page 3 times in last week',
        'Downloaded enterprise comparison guide',
        'Attended product demo',
        'Email open rate: 85%',
      ],
      recommendedPriority: 'high',
      bestTimeToContact: 'Tuesday 10:00 AM',
      recommendedAction: 'Send personalized proposal with case studies relevant to their industry',
      conversionProbability: 0.72,
    };
  }

  private followUp(ctx: Record<string, unknown>): string {
    const name = (ctx.contactName as string) ?? 'there';
    const tone = (ctx.tone as string) ?? 'professional';
    if (tone === 'whatsapp') {
      return `Hi ${name}! 👋 Just following up on our conversation about expanding your team plan. I've prepared a pricing breakdown for 40 seats with the annual discount we discussed. Let me know if you have any questions — happy to jump on a quick call! 📞`;
    }
    if (tone === 'sms') {
      return `Hi ${name}, following up re: 40-seat team plan. Pricing breakdown ready. Reply to schedule a call. - Vocalyze`;
    }
    if (tone === 'friendly') {
      return `Hey ${name}!\n\nHope your week is going well! I wanted to follow up on our chat about scaling your team to 40 seats. I've got the pricing breakdown ready with the annual discount we talked about.\n\nNo rush at all — just wanted to make sure you have everything you need. Let me know if any questions come up!\n\nBest,\nSarah`;
    }
    return `Dear ${name},\n\nThank you for your time on our recent call. I'm following up regarding the 40-seat team plan expansion we discussed.\n\nAs promised, I've prepared a detailed pricing breakdown including the annual billing discount. I've also attached our SOC 2 compliance documentation for your security review.\n\nI'm available to schedule a technical review with your IT team at your convenience. Please let me know if you have any questions.\n\nBest regards,\nSarah Chen\nVocalyze CRM`;
  }

  private emailWriter(ctx: Record<string, unknown>): string {
    const type = (ctx.emailType as string) ?? 'sales';
    const recipient = (ctx.recipientName as string) ?? 'there';
    if (type === 'follow-up') {
      return `Subject: Following up — 40-seat team plan\n\nHi ${recipient},\n\nI wanted to follow up on our conversation about expanding your Vocalyze deployment to 40 seats. As discussed, I've prepared a customized pricing proposal with annual billing savings of 15%.\n\nKey highlights:\n• 40 seats at $79/seat/month (annual)\n• Dedicated onboarding specialist\n• Priority support included\n• SOC 2 documentation attached\n\nI'm confident this plan aligns with your Q3 timeline. Shall we schedule a brief call this week to finalize?\n\nBest regards,\nSarah Chen`;
    }
    if (type === 'reminder') {
      return `Subject: Reminder: Proposal expires in 3 days\n\nHi ${recipient},\n\nThis is a friendly reminder that the pricing proposal we shared expires in 3 days. I'd be happy to extend it if you need more time for internal review.\n\nLet me know how I can help move things forward.\n\nBest,\nSarah`;
    }
    if (type === 'meeting') {
      return `Subject: Meeting invitation: Vocalyze demo\n\nHi ${recipient},\n\nYou're invited to a personalized Vocalyze CRM demo.\n\nDate: Thursday, January 18\nTime: 10:00 AM PST\nDuration: 45 minutes\n\nIn this session, we'll cover:\n• Team management and roles\n• Call center and telephony integration\n• AI-powered lead scoring and insights\n• Custom workflow automation\n\nLooking forward to showing you the platform!\n\nSarah`;
    }
    return `Subject: Transform your sales team with Vocalyze\n\nHi ${recipient},\n\nI noticed your team is growing rapidly — congratulations! Many companies like yours are choosing Vocalyze to streamline their sales operations.\n\nWith Vocalyze, your team gets:\n• AI-powered lead scoring and prioritization\n• Integrated calling, WhatsApp, SMS, and email\n• Real-time analytics and forecasting\n• Enterprise-grade security (SOC 2)\n\nI'd love to show you how Vocalyze can help your team close more deals. Are you available for a 30-minute demo this week?\n\nBest regards,\nSarah Chen\nVocalyze CRM`;
  }

  private whatsappReply(ctx: Record<string, unknown>): string {
    const type = (ctx.replyType as string) ?? 'quick';
    if (type === 'auto') return "Thank you for reaching out! I'll get back to you within a few hours. For urgent matters, please call us directly. 🙏";
    if (type === 'sales') return "Great to hear from you! 🎉 Based on your interest, I think our Professional plan would be perfect for your team. Want me to share a quick pricing breakdown?";
    if (type === 'support') return "I'm sorry to hear you're experiencing an issue. Can you share more details about what's happening? I'll get this resolved for you right away. 🛠️";
    return "Thanks for your message! I'll follow up with the details shortly. 😊";
  }

  private smsWriter(ctx: Record<string, unknown>): string {
    const type = (ctx.smsType as string) ?? 'short';
    if (type === 'reminder') return "Reminder: Your Vocalyze demo is tomorrow at 10 AM. Reply C to confirm or R to reschedule.";
    if (type === 'promo') return "🎉 Limited time: 20% off Vocalyze Professional plan! Upgrade now to unlock AI features. Reply STOP to opt out.";
    if (type === 'professional') return "Hi, this is Sarah from Vocalyze. Following up on our discussion. Please call back at your convenience.";
    return "Hi! Following up on our chat. Let me know if you have any questions. - Sarah";
  }

  private taskAssistant(ctx: Record<string, unknown>): Record<string, unknown> {
    return {
      priorities: [
        { task: 'Follow up with Jordan Avery (Acme Corp)', priority: 'urgent', reason: 'Hot lead, responded 2h ago' },
        { task: 'Send pricing breakdown to Elena Vasquez', priority: 'high', reason: 'Promised by end of day' },
        { task: 'Schedule technical review with Vertex.io', priority: 'high', reason: 'Legal review completing' },
        { task: 'Re-engage 3 cold leads with high intent', priority: 'medium', reason: 'AI detected buying signals' },
      ],
      importantLeads: ['Jordan Avery (score 92)', 'Elena Vasquez (score 88)', 'Marcus Reid (score 85)'],
      missedFollowUps: [
        { lead: 'Priya Sharma', overdue: '2 days', impact: 'medium' },
        { lead: 'David Kim', overdue: '1 day', impact: 'low' },
      ],
      urgentCalls: [
        { contact: 'Sarah Williams', reason: 'Missed call yesterday, high-value lead' },
        { contact: 'Tom Anderson', reason: 'Requested callback, demo interest' },
      ],
      pendingTasks: 7,
      completedToday: 5,
    };
  }

  private salesCoach(ctx: Record<string, unknown>): Record<string, unknown> {
    return {
      performanceScore: 82,
      conversionRate: 24,
      avgTalkTime: '6:32',
      strengths: [
        'Excellent discovery questioning — asks 40% more questions than team average',
        'Strong objection handling on pricing concerns',
        'High follow-up discipline (94% completion rate)',
      ],
      weaknesses: [
        'Talk ratio slightly high at 55% (target: 45%)',
        'Misses buying signals in 15% of calls',
        'Slow to send post-call emails (avg 4h delay)',
      ],
      improvementSuggestions: [
        'Practice active listening — aim for 45% talk ratio',
        'Send follow-up emails within 1 hour of call completion',
        'Use the AI sentiment analysis to catch missed buying signals',
      ],
      dailyTips: [
        '🔥 Start your day by calling your 3 hottest leads while energy is high',
        '📝 Use the follow-up generator to save 15 minutes per lead',
        '🎯 Focus on discovery questions that uncover budget timeline',
      ],
      weeklyProgress: { calls: 42, deals: 8, revenue: 45000 },
    };
  }

  private analytics(ctx: Record<string, unknown>): Record<string, unknown> {
    return {
      revenueForecast: {
        thisMonth: 95000,
        nextMonth: 112000,
        thisQuarter: 285000,
        confidence: 0.84,
        trend: 'upward',
      },
      leadForecast: {
        expectedNew: 45,
        expectedConversion: 0.24,
        pipelineValue: 420000,
      },
      salesPrediction: {
        dealsExpected: 12,
        avgDealSize: 9500,
        closingProbability: 0.68,
      },
      monthlyInsights: [
        'Revenue up 15% vs last month — driven by 3 enterprise deals',
        'Lead response time improved by 22%',
        'WhatsApp engagement rate at 68% (industry avg: 45%)',
      ],
      weeklyInsights: [
        'Tuesday is your highest-conversion day (32% close rate)',
        'Calls under 5 minutes have 40% lower conversion',
        'AI-scored hot leads convert 3.2x faster than cold leads',
      ],
      growthOpportunities: [
        { opportunity: 'Expand Helios Energy deal to 80 seats', potentialValue: 18000, probability: 0.65 },
        { opportunity: 'Re-engage 12 cold leads with high intent', potentialValue: 95000, probability: 0.35 },
        { opportunity: 'Upsell automation features to 8 current customers', potentialValue: 24000, probability: 0.55 },
      ],
    };
  }

  private naturalSearch(query: string, ctx: Record<string, unknown>): Record<string, unknown> {
    const lower = query.toLowerCase();
    if (lower.includes('hot lead')) {
      return { intent: 'show_hot_leads', results: [{ type: 'lead', title: 'Jordan Avery', subtitle: 'Score: 92 • Acme Corp', href: '/app/leads' }, { type: 'lead', title: 'Elena Vasquez', subtitle: 'Score: 88 • Helios Energy', href: '/app/leads' }] };
    }
    if (lower.includes('missed') && lower.includes('call')) {
      return { intent: 'show_missed_calls', results: [{ type: 'call', title: 'Priya Sharma', subtitle: 'Missed at 2:15 PM', href: '/app/call-history' }, { type: 'call', title: 'David Kim', subtitle: 'Missed at 4:42 PM', href: '/app/call-history' }] };
    }
    if (lower.includes('bangalore') || lower.includes('location')) {
      return { intent: 'search_by_location', results: [{ type: 'contact', title: 'Arjun Patel', subtitle: 'Bangalore • TechFlow', href: '/app/contacts' }, { type: 'company', title: 'TechFlow India', subtitle: 'Bangalore, IN', href: '/app/companies' }] };
    }
    if (lower.includes('meeting') || lower.includes('today')) {
      return { intent: 'show_today_meetings', results: [{ type: 'event', title: 'Demo: Acme Corp', subtitle: '10:00 AM', href: '/app/calendar' }, { type: 'event', title: 'Pipeline Review', subtitle: '2:00 PM', href: '/app/calendar' }] };
    }
    return { intent: 'general_search', results: [], message: "I can search for leads, contacts, calls, meetings, and more. Try: 'Show my hot leads', 'Find missed calls from yesterday', or 'Show today's meetings'." };
  }

  private automationSuggest(query: string): Record<string, unknown> {
    return {
      suggestedFlow: {
        trigger: { type: 'lead_created', label: 'When a new lead is created' },
        steps: [
          { type: 'action', label: 'Assign to round-robin manager' },
          { type: 'condition', label: 'If lead score > 80' },
          { type: 'action', label: 'Send WhatsApp welcome message' },
          { type: 'action', label: 'Schedule follow-up call in 2 days' },
          { type: 'action', label: 'Create task: Prepare proposal' },
        ],
      },
    };
  }
}

// ============================================================
// Provider registry
// ============================================================

let activeProvider: AIProvider = new SimulatedAIProvider();

export function getAIProvider(): AIProvider {
  return activeProvider;
}

export function setAIProvider(provider: AIProvider) {
  activeProvider = provider;
}

export function getProviderInfo(): { name: AIProviderName; connected: boolean } {
  return { name: activeProvider.name, connected: activeProvider.connected };
}
