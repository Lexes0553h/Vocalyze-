import type { SupabaseClient } from '@supabase/supabase-js';
import { Repository } from './repository';
import type { AuthContext } from './middleware';

export class CrmService {
  readonly leads: Repository<Record<string, unknown>>;
  readonly contacts: Repository<Record<string, unknown>>;
  readonly companies: Repository<Record<string, unknown>>;
  readonly deals: Repository<Record<string, unknown>>;
  readonly calls: Repository<Record<string, unknown>>;
  readonly tasks: Repository<Record<string, unknown>>;
  readonly notifications: Repository<Record<string, unknown>>;
  readonly whatsappConversations: Repository<Record<string, unknown>>;
  readonly whatsappMessages: Repository<Record<string, unknown>>;
  readonly smsConversations: Repository<Record<string, unknown>>;
  readonly smsMessages: Repository<Record<string, unknown>>;
  readonly emails: Repository<Record<string, unknown>>;
  readonly calendarEvents: Repository<Record<string, unknown>>;
  readonly aiSuggestions: Repository<Record<string, unknown>>;
  readonly aiChatMessages: Repository<Record<string, unknown>>;
  readonly activityTimeline: Repository<Record<string, unknown>>;
  readonly documents: Repository<Record<string, unknown>>;
  readonly invoices: Repository<Record<string, unknown>>;
  readonly profiles: Repository<Record<string, unknown>>;
  readonly callFavorites: Repository<Record<string, unknown>>;
  readonly messageTemplates: Repository<Record<string, unknown>>;
  readonly customerNotes: Repository<Record<string, unknown>>;
  readonly tenants: Repository<Record<string, unknown>>;
  readonly departments: Repository<Record<string, unknown>>;
  readonly teams: Repository<Record<string, unknown>>;
  readonly teamMembers: Repository<Record<string, unknown>>;
  readonly auditLogs: Repository<Record<string, unknown>>;
  readonly subscriptionPlans: Repository<Record<string, unknown>>;
  readonly tenantSubscriptions: Repository<Record<string, unknown>>;
  readonly featureFlags: Repository<Record<string, unknown>>;
  readonly invitations: Repository<Record<string, unknown>>;
  readonly announcements: Repository<Record<string, unknown>>;
  readonly aiConversations: Repository<Record<string, unknown>>;
  readonly aiMessages: Repository<Record<string, unknown>>;
  readonly aiSettings: Repository<Record<string, unknown>>;
  readonly aiCallAnalysis: Repository<Record<string, unknown>>;
  readonly aiLeadScores: Repository<Record<string, unknown>>;
  readonly aiAutomationFlows: Repository<Record<string, unknown>>;

  constructor(public ctx: AuthContext) {
    const c = ctx.client;
    this.leads = new Repository(c, 'leads');
    this.contacts = new Repository(c, 'contacts');
    this.companies = new Repository(c, 'companies');
    this.deals = new Repository(c, 'deals');
    this.calls = new Repository(c, 'calls');
    this.tasks = new Repository(c, 'tasks');
    this.notifications = new Repository(c, 'notifications');
    this.whatsappConversations = new Repository(c, 'whatsapp_conversations');
    this.whatsappMessages = new Repository(c, 'whatsapp_messages');
    this.smsConversations = new Repository(c, 'sms_conversations');
    this.smsMessages = new Repository(c, 'sms_messages');
    this.emails = new Repository(c, 'emails');
    this.calendarEvents = new Repository(c, 'calendar_events');
    this.aiSuggestions = new Repository(c, 'ai_suggestions');
    this.aiChatMessages = new Repository(c, 'ai_chat_messages');
    this.activityTimeline = new Repository(c, 'activity_timeline');
    this.documents = new Repository(c, 'documents');
    this.invoices = new Repository(c, 'invoices');
    this.profiles = new Repository(c, 'profiles');
    this.callFavorites = new Repository(c, 'call_favorites');
    this.messageTemplates = new Repository(c, 'message_templates');
    this.customerNotes = new Repository(c, 'customer_notes');
    this.tenants = new Repository(c, 'tenants');
    this.departments = new Repository(c, 'departments');
    this.teams = new Repository(c, 'teams');
    this.teamMembers = new Repository(c, 'team_members');
    this.auditLogs = new Repository(c, 'audit_logs');
    this.subscriptionPlans = new Repository(c, 'subscription_plans');
    this.tenantSubscriptions = new Repository(c, 'tenant_subscriptions');
    this.featureFlags = new Repository(c, 'feature_flags');
    this.invitations = new Repository(c, 'invitations');
    this.announcements = new Repository(c, 'announcements');
    this.aiConversations = new Repository(c, 'ai_conversations');
    this.aiMessages = new Repository(c, 'ai_messages');
    this.aiSettings = new Repository(c, 'ai_settings');
    this.aiCallAnalysis = new Repository(c, 'ai_call_analysis');
    this.aiLeadScores = new Repository(c, 'ai_lead_scores');
    this.aiAutomationFlows = new Repository(c, 'ai_automation_flows');
  }

  ensureAuth() {
    if (!this.ctx.isAuthenticated) {
      const err = new Error('Authentication required');
      (err as unknown as { status: number }).status = 401;
      throw err;
    }
  }

  ensureAdminOrManager() {
    this.ensureAuth();
    if (!this.ctx.isAdminOrManager) {
      const err = new Error('Insufficient permissions: admin or manager role required');
      (err as unknown as { status: number }).status = 403;
      throw err;
    }
  }
}
