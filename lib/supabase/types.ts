// Row shapes for the Vocalyze CRM schema. Mirror the DB columns the UI reads.

export type UserRole = 'super_admin' | 'company_admin' | 'manager' | 'team_leader' | 'employee' | 'admin' | 'agent';

export interface ProfileRow {
  id: string;
  name: string;
  role: UserRole;
  avatar: string | null;
  status: 'online' | 'away' | 'offline';
  tenant_id: string | null;
  department_id: string | null;
  team_id: string | null;
  title: string | null;
  last_login: string | null;
  disabled: boolean;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface CompanyRow {
  id: string;
  name: string;
  logo: string | null;
  industry: string | null;
  website: string | null;
  employees: number | null;
  revenue: string | null;
  location: string | null;
  deals: number;
  deal_value: number;
  status: 'Active' | 'Prospect' | 'Churned';
  created_at: string;
  updated_at: string;
}

export interface ContactRow {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company_id: string | null;
  company: string | null;
  role: string | null;
  avatar: string | null;
  tags: string[];
  last_seen: string | null;
  created_at: string;
  updated_at: string;
}

export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Won' | 'Lost';
export type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface LeadRow {
  id: string;
  name: string;
  company_id: string | null;
  company: string | null;
  email: string | null;
  phone: string | null;
  status: LeadStatus;
  priority: Priority;
  tags: string[];
  agent: string | null;
  assigned_to: string | null;
  avatar: string | null;
  value: number;
  source: string | null;
  last_contact: string | null;
  notes: string | null;
  role: string | null;
  created_at: string;
  updated_at: string;
}

export type DealStage = 'Lead' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Closed';

export interface DealRow {
  id: string;
  title: string;
  company_id: string | null;
  company: string | null;
  contact: string | null;
  value: number;
  stage: DealStage;
  probability: number;
  agent: string | null;
  assigned_to: string | null;
  expected_close: string | null;
  created_at: string;
  updated_at: string;
}

export type CallDirection = 'inbound' | 'outbound' | 'missed';

export type CallStatus = 'ringing' | 'connected' | 'on_hold' | 'ended' | 'missed' | 'failed';

export interface CallRow {
  id: string;
  contact: string;
  company: string | null;
  agent: string | null;
  assigned_to: string | null;
  direction: CallDirection;
  duration: string;
  call_time: string | null;
  call_date: string | null;
  disposition: string | null;
  recording: boolean;
  notes: string | null;
  phone: string | null;
  status: CallStatus;
  muted: boolean;
  speaker: boolean;
  recording_url: string | null;
  recording_duration_sec: number | null;
  transferred_to: string | null;
  follow_up: boolean;
  follow_up_date: string | null;
  is_favorite: boolean;
  contact_phone: string | null;
  summary: string | null;
  // Phase 4 AI fields
  transcript?: string | null;
  short_summary?: string | null;
  detailed_summary?: string | null;
  sentiment?: string | null;
  sentiment_reason?: string | null;
  intent?: string | null;
  important_points?: string[] | null;
  objections?: string[] | null;
  follow_up_tasks?: string[] | null;
  suggested_action?: string | null;
  lead_score?: number | null;
  generated_email?: string | null;
  generated_whatsapp?: string | null;
  processed_at?: string | null;
  ai_status?: string | null;
  ai_error?: string | null;
  created_at: string;
  updated_at: string;
}

export type TaskStatus = 'Backlog' | 'In Progress' | 'Review' | 'Done';

export interface TaskRow {
  id: string;
  title: string;
  description: string | null;
  priority: Priority;
  status: TaskStatus;
  assignee: string | null;
  assigned_to: string | null;
  due_date: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface NotificationRow {
  id: string;
  user_id: string;
  type: 'call' | 'lead' | 'deal' | 'task' | 'message' | 'system';
  title: string;
  description: string | null;
  time: string | null;
  read: boolean;
  link: string | null;
  priority: 'low' | 'normal' | 'high';
  created_at: string;
}

export interface WhatsappConversationRow {
  id: string;
  name: string;
  company: string | null;
  avatar: string | null;
  last_msg: string | null;
  last_time: string | null;
  unread: number;
  pinned: boolean;
  online: boolean;
  labels: string[];
  status: 'open' | 'pending' | 'resolved';
  auto_reply: boolean;
  last_msg_status: 'sent' | 'delivered' | 'read' | null;
  created_at: string;
  updated_at: string;
}

export interface WhatsappMessageRow {
  id: string;
  conversation_id: string;
  from_me: boolean;
  text: string;
  msg_time: string | null;
  status: 'sent' | 'delivered' | 'read' | null;
  kind: 'text' | 'image' | 'video' | 'document' | 'voice' | 'audio';
  media_url: string | null;
  duration_sec: number | null;
  is_template: boolean;
  created_at: string;
}

export interface SmsConversationRow {
  id: string;
  name: string;
  company: string | null;
  phone: string | null;
  avatar: string | null;
  last_msg: string | null;
  last_time: string | null;
  unread: number;
  labels: string[];
  status: 'open' | 'pending' | 'resolved';
  pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface SmsMessageRow {
  id: string;
  conversation_id: string;
  from_me: boolean;
  text: string;
  msg_time: string | null;
  status: 'queued' | 'sent' | 'delivered' | 'failed' | null;
  kind: 'text' | 'template' | 'bulk';
  created_at: string;
}

export interface EmailRow {
  id: string;
  from_name: string | null;
  from_email: string | null;
  subject: string | null;
  preview: string | null;
  body: string | null;
  folder: 'inbox' | 'sent' | 'drafts' | 'archive' | 'trash';
  unread: boolean;
  starred: boolean;
  avatar: string | null;
  sent_at: string | null;
  labels: string[];
  has_attachment: boolean;
  attachments: unknown[] | null;
  created_at: string;
  updated_at: string;
}

export interface CalendarEventRow {
  id: string;
  title: string;
  event_time: string | null;
  duration: number;
  type: 'call' | 'meeting' | 'task';
  attendees: number;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface AiSuggestionRow {
  id: string;
  type: string;
  title: string;
  description: string | null;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  acted: boolean;
  created_at: string;
}

export interface AiChatMessageRow {
  id: string;
  user_id: string;
  role: 'ai' | 'user';
  text: string;
  msg_time: string | null;
  created_at: string;
}

export interface ActivityTimelineRow {
  id: string;
  icon: string;
  title: string;
  description: string | null;
  time: string | null;
  color: string;
  contact_id: string | null;
  source: 'call' | 'whatsapp' | 'sms' | 'email' | 'note' | 'meeting' | 'task' | 'document' | null;
  created_at: string;
}

export interface DocumentRow {
  id: string;
  name: string;
  type: 'pdf' | 'sheet' | 'doc' | 'image' | 'other';
  size: string | null;
  folder: string;
  modified: string | null;
  url: string | null;
  created_at: string;
  updated_at: string;
}

export interface InvoiceRow {
  id: string;
  invoice_no: string;
  invoice_date: string | null;
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
  plan: string | null;
  created_at: string;
}

export interface TenantRow {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  industry: string | null;
  website: string | null;
  location: string | null;
  brand_color: string;
  timezone: string;
  currency: string;
  working_days: string[];
  working_hours: string;
  status: 'active' | 'suspended' | 'trial' | 'cancelled';
  plan_id: string | null;
  max_users: number;
  storage_used_mb: number;
  created_at: string;
  updated_at: string;
}

export interface DepartmentRow {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  head_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface TeamRow {
  id: string;
  tenant_id: string;
  department_id: string | null;
  name: string;
  manager_id: string | null;
  team_leader_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface TeamMemberRow {
  id: string;
  team_id: string;
  user_id: string;
  role: 'member' | 'leader' | 'manager';
  created_at: string;
}

export interface AuditLogRow {
  id: string;
  tenant_id: string | null;
  user_id: string | null;
  user_name: string | null;
  user_role: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  description: string | null;
  ip_address: string | null;
  metadata: unknown;
  created_at: string;
}

export interface SubscriptionPlanRow {
  id: string;
  name: string;
  tier: 'free' | 'starter' | 'professional' | 'enterprise';
  price_monthly: number;
  price_yearly: number;
  max_users: number;
  max_storage_mb: number;
  features: Record<string, unknown>;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface TenantSubscriptionRow {
  id: string;
  tenant_id: string;
  plan_id: string;
  status: 'active' | 'past_due' | 'cancelled' | 'trialing';
  billing_cycle: 'monthly' | 'yearly';
  amount: number;
  started_at: string;
  renews_at: string | null;
  created_at: string;
}

export interface FeatureFlagRow {
  id: string;
  tenant_id: string | null;
  key: string;
  label: string | null;
  description: string | null;
  enabled: boolean;
  is_global: boolean;
  created_at: string;
  updated_at: string;
}

export interface InvitationRow {
  id: string;
  tenant_id: string;
  email: string;
  name: string | null;
  role: 'company_admin' | 'manager' | 'team_leader' | 'employee';
  department_id: string | null;
  team_id: string | null;
  token: string;
  invited_by: string | null;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
  expires_at: string;
  created_at: string;
}

export interface AnnouncementRow {
  id: string;
  title: string;
  body: string;
  type: 'info' | 'success' | 'warning' | 'error';
  audience: 'all' | 'admins' | 'managers' | 'employees';
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export const TABLES = [
  'profiles', 'companies', 'contacts', 'leads', 'deals', 'calls', 'tasks',
  'notifications', 'whatsapp_conversations', 'whatsapp_messages',
  'sms_conversations', 'sms_messages', 'emails', 'calendar_events',
  'ai_suggestions', 'ai_chat_messages', 'activity_timeline', 'documents',
  'invoices', 'call_favorites', 'message_templates', 'customer_notes',
  'tenants', 'departments', 'teams', 'team_members', 'audit_logs',
  'subscription_plans', 'tenant_subscriptions', 'feature_flags',
  'invitations', 'announcements',
] as const;

export type TableName = (typeof TABLES)[number];
