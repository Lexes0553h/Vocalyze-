import { requireAuth, ok, badRequest, unauthorized, notFound } from '@/lib/server/middleware';
import { CrmService } from '@/lib/server/services';
import type { NextRequest } from 'next/server';

export interface CrudConfig {
  tableName: string;
  ownerColumn?: string;
  adminOnlyDelete?: boolean;
}

const TABLE_TO_SERVICE: Record<string, keyof CrmService> = {
  leads: 'leads',
  contacts: 'contacts',
  companies: 'companies',
  deals: 'deals',
  calls: 'calls',
  tasks: 'tasks',
  notifications: 'notifications',
  whatsapp_conversations: 'whatsappConversations',
  whatsapp_messages: 'whatsappMessages',
  sms_conversations: 'smsConversations',
  sms_messages: 'smsMessages',
  emails: 'emails',
  calendar_events: 'calendarEvents',
  ai_suggestions: 'aiSuggestions',
  ai_chat_messages: 'aiChatMessages',
  activity_timeline: 'activityTimeline',
  documents: 'documents',
  invoices: 'invoices',
  profiles: 'profiles',
  call_favorites: 'callFavorites',
  message_templates: 'messageTemplates',
  customer_notes: 'customerNotes',
  tenants: 'tenants',
  departments: 'departments',
  teams: 'teams',
  team_members: 'teamMembers',
  audit_logs: 'auditLogs',
  subscription_plans: 'subscriptionPlans',
  tenant_subscriptions: 'tenantSubscriptions',
  feature_flags: 'featureFlags',
  invitations: 'invitations',
  announcements: 'announcements',
  ai_conversations: 'aiConversations',
  ai_messages: 'aiMessages',
  ai_settings: 'aiSettings',
  ai_call_analysis: 'aiCallAnalysis',
  ai_lead_scores: 'aiLeadScores',
  ai_automation_flows: 'aiAutomationFlows',
};

export function createCrudHandlers(config: CrudConfig) {
  async function GET(req: NextRequest) {
    const ctx = await requireAuth(req);
    if (!ctx.isAuthenticated) return unauthorized();
    const service = new CrmService(ctx);
    const serviceKey = TABLE_TO_SERVICE[config.tableName] ?? config.tableName as keyof CrmService;
    const repo = service[serviceKey] as unknown as {
      list: (opts?: Record<string, unknown>) => Promise<unknown[]>;
      find: (id: string) => Promise<unknown | null>;
    };

    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    const limit = url.searchParams.get('limit');
    const offset = url.searchParams.get('offset');
    const orderBy = url.searchParams.get('orderBy') ?? 'created_at';

    if (id) {
      const row = await repo.find(id);
      if (!row) return notFound();
      return ok(row);
    }

    const eq: Record<string, string> = {};
    Array.from(url.searchParams.entries()).forEach(([k, v]) => {
      if (!['id', 'limit', 'offset', 'orderBy'].includes(k)) {
        eq[k] = v;
      }
    });

    const rows = await repo.list({
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
      orderBy,
      ascending: false,
      eq: Object.keys(eq).length ? eq : undefined,
    });
    return ok(rows);
  }

  async function POST(req: NextRequest) {
    const ctx = await requireAuth(req);
    if (!ctx.isAuthenticated) return unauthorized();
    const service = new CrmService(ctx);
    const serviceKey = TABLE_TO_SERVICE[config.tableName] ?? config.tableName as keyof CrmService;
    const repo = service[serviceKey] as unknown as {
      create: (p: Record<string, unknown>) => Promise<unknown>;
    };
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return badRequest('Invalid JSON body');
    }
    if (config.ownerColumn && ctx.userId && body[config.ownerColumn] === undefined) {
      body[config.ownerColumn] = ctx.userId;
    }
    const row = await repo.create(body);
    return ok(row);
  }

  async function PATCH(req: NextRequest) {
    const ctx = await requireAuth(req);
    if (!ctx.isAuthenticated) return unauthorized();
    const service = new CrmService(ctx);
    const serviceKey = TABLE_TO_SERVICE[config.tableName] ?? config.tableName as keyof CrmService;
    const repo = service[serviceKey] as unknown as {
      update: (id: string, p: Record<string, unknown>) => Promise<unknown | null>;
      find: (id: string) => Promise<unknown | null>;
    };
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) return badRequest('Missing id parameter');
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return badRequest('Invalid JSON body');
    }
    const row = await repo.update(id, body);
    if (!row) return notFound();
    return ok(row);
  }

  async function DELETE(req: NextRequest) {
    const ctx = await requireAuth(req);
    if (!ctx.isAuthenticated) return unauthorized();
    if (config.adminOnlyDelete && !ctx.isAdminOrManager) {
      return Response.json({ error: 'Admin or manager role required' }, { status: 403 });
    }
    const service = new CrmService(ctx);
    const serviceKey = TABLE_TO_SERVICE[config.tableName] ?? config.tableName as keyof CrmService;
    const repo = service[serviceKey] as unknown as {
      remove: (id: string) => Promise<void>;
    };
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) return badRequest('Missing id parameter');
    await repo.remove(id);
    return ok({ deleted: id });
  }

  return { GET, POST, PATCH, DELETE };
}
