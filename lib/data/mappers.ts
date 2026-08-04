// Maps DB snake_case rows to the camelCase shapes the UI expects.
// This lets pages keep using lead.lastContact, deal.expectedClose, etc.

import type {
  LeadRow, ContactRow, CompanyRow, CallRow, DealRow, TaskRow,
  NotificationRow, WhatsappConversationRow, WhatsappMessageRow,
  SmsConversationRow, EmailRow, CalendarEventRow, AiSuggestionRow,
  AiChatMessageRow, ActivityTimelineRow, DocumentRow, InvoiceRow,
  ProfileRow,
} from '@/lib/supabase/types';

import type {
  Lead, Contact, Company, Call, Deal, Task, Notification, TeamMember,
} from '@/lib/crm-data';

export function mapLead(r: LeadRow): Lead {
  return {
    id: r.id,
    name: r.name,
    company: r.company ?? '',
    email: r.email ?? '',
    phone: r.phone ?? '',
    status: r.status,
    priority: r.priority,
    tags: r.tags ?? [],
    agent: r.agent ?? '',
    avatar: r.avatar ?? '',
    value: Number(r.value),
    source: r.source ?? '',
    lastContact: r.last_contact ?? '',
    createdAt: r.created_at,
    notes: r.notes ?? '',
    role: r.role ?? undefined,
  };
}

export function mapContact(r: ContactRow): Contact {
  return {
    id: r.id,
    name: r.name,
    email: r.email ?? '',
    phone: r.phone ?? '',
    company: r.company ?? '',
    role: r.role ?? '',
    avatar: r.avatar ?? '',
    tags: r.tags ?? [],
    lastSeen: r.last_seen ?? '',
  };
}

export function mapCompany(r: CompanyRow): Company {
  return {
    id: r.id,
    name: r.name,
    logo: r.logo ?? r.name.charAt(0),
    industry: r.industry ?? '',
    website: r.website ?? '',
    employees: r.employees ?? 0,
    revenue: r.revenue ?? '',
    location: r.location ?? '',
    deals: r.deals,
    dealValue: Number(r.deal_value),
    status: r.status,
  };
}

export function mapCall(r: CallRow): Call {
  return {
    id: r.id,
    contact: r.contact,
    company: r.company ?? '',
    agent: r.agent ?? '',
    direction: r.direction,
    duration: r.duration,
    time: r.call_time ?? '',
    date: r.call_date ?? '',
    disposition: r.disposition ?? '',
    recording: r.recording,
    notes: r.notes ?? '',
    phone: r.phone ?? '',
    status: r.status,
    muted: r.muted,
    speaker: r.speaker,
    recordingUrl: r.recording_url ?? '',
    transferredTo: r.transferred_to ?? '',
    followUp: r.follow_up,
    followUpDate: r.follow_up_date ?? '',
    isFavorite: r.is_favorite,
    contactPhone: r.contact_phone ?? '',
    summary: r.summary ?? '',
    // Phase 4 - AI fields
    transcript: r.transcript ?? '',
    shortSummary: r.short_summary ?? '',
    detailedSummary: r.detailed_summary ?? '',
    sentiment: r.sentiment ?? 'Neutral',
    sentimentReason: r.sentiment_reason ?? '',
    intent: r.intent ?? '',
    importantPoints: r.important_points ?? [],
    objections: r.objections ?? [],
    followUpTasks: r.follow_up_tasks ?? [],
    suggestedAction: r.suggested_action ?? '',
    leadScore: r.lead_score ?? 50,
    generatedEmail: r.generated_email ?? '',
    generatedWhatsapp: r.generated_whatsapp ?? '',
    processedAt: r.processed_at ?? '',
    aiStatus: (r.ai_status as Call['aiStatus']) ?? (r.summary ? 'completed' : 'pending'),
    aiError: r.ai_error ?? '',
  };
}

export function mapDeal(r: DealRow): Deal {
  return {
    id: r.id,
    title: r.title,
    company: r.company ?? '',
    contact: r.contact ?? '',
    value: Number(r.value),
    stage: r.stage,
    probability: r.probability,
    agent: r.agent ?? '',
    expectedClose: r.expected_close ?? '',
  };
}

export function mapTask(r: TaskRow): Task {
  return {
    id: r.id,
    title: r.title,
    description: r.description ?? '',
    priority: r.priority,
    status: r.status,
    assignee: r.assignee ?? '',
    dueDate: r.due_date ?? '',
    tags: r.tags ?? [],
  };
}

export function mapNotification(r: NotificationRow): Notification {
  return {
    id: r.id,
    type: r.type,
    title: r.title,
    description: r.description ?? '',
    time: r.time ?? '',
    read: r.read,
    link: r.link ?? '',
    priority: r.priority,
  };
}

export interface WhatsappConversation {
  id: string;
  name: string;
  company: string;
  avatar: string;
  lastMsg: string;
  time: string;
  unread: number;
  pinned: boolean;
  online: boolean;
  labels: string[];
  status: 'open' | 'pending' | 'resolved';
  autoReply: boolean;
  lastMsgStatus: 'sent' | 'delivered' | 'read' | null;
}

export interface WhatsappMessage {
  id: string;
  fromMe: boolean;
  text: string;
  time: string;
  status: 'sent' | 'delivered' | 'read' | null;
  kind: 'text' | 'image' | 'video' | 'document' | 'voice' | 'audio';
  mediaUrl: string;
  durationSec: number | null;
  isTemplate: boolean;
}

export function mapWhatsappConv(r: WhatsappConversationRow): WhatsappConversation {
  return {
    id: r.id,
    name: r.name,
    company: r.company ?? '',
    avatar: r.avatar ?? '',
    lastMsg: r.last_msg ?? '',
    time: r.last_time ?? '',
    unread: r.unread,
    pinned: r.pinned,
    online: r.online,
    labels: r.labels ?? [],
    status: r.status,
    autoReply: r.auto_reply,
    lastMsgStatus: r.last_msg_status ?? null,
  };
}

export function mapWhatsappMsg(r: WhatsappMessageRow): WhatsappMessage {
  return {
    id: r.id,
    fromMe: r.from_me,
    text: r.text,
    time: r.msg_time ?? '',
    status: r.status ?? null,
    kind: r.kind,
    mediaUrl: r.media_url ?? '',
    durationSec: r.duration_sec ?? null,
    isTemplate: r.is_template,
  };
}

export interface SmsConversation {
  id: string;
  name: string;
  company: string;
  phone: string;
  lastMsg: string;
  time: string;
  unread: number;
  labels: string[];
  status: 'open' | 'pending' | 'resolved';
  pinned: boolean;
}

export function mapSmsConv(r: SmsConversationRow): SmsConversation {
  return {
    id: r.id,
    name: r.name,
    company: r.company ?? '',
    phone: r.phone ?? '',
    lastMsg: r.last_msg ?? '',
    time: r.last_time ?? '',
    unread: r.unread,
    labels: r.labels ?? [],
    status: r.status,
    pinned: r.pinned,
  };
}

export interface Email {
  id: string;
  from: string;
  fromEmail: string;
  subject: string;
  preview: string;
  time: string;
  folder: string;
  unread: boolean;
  starred: boolean;
  avatar: string;
  labels: string[];
  hasAttachment: boolean;
  attachments: { name: string; size: string; type: string }[];
}

export function mapEmail(r: EmailRow): Email {
  return {
    id: r.id,
    from: r.from_name ?? '',
    fromEmail: r.from_email ?? '',
    subject: r.subject ?? '',
    preview: r.preview ?? '',
    time: r.sent_at ?? '',
    folder: r.folder,
    unread: r.unread,
    starred: r.starred,
    avatar: r.avatar ?? '',
    labels: r.labels ?? [],
    hasAttachment: r.has_attachment,
    attachments: (r.attachments as { name: string; size: string; type: string }[]) ?? [],
  };
}

export interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  duration: number;
  type: string;
  attendees: number;
  color: string;
}

export function mapCalendarEvent(r: CalendarEventRow): CalendarEvent {
  return {
    id: r.id,
    title: r.title,
    time: r.event_time ?? '',
    duration: r.duration,
    type: r.type,
    attendees: r.attendees,
    color: r.color,
  };
}

export interface AiSuggestion {
  id: string;
  type: string;
  title: string;
  desc: string;
  priority: string;
}

export function mapAiSuggestion(r: AiSuggestionRow): AiSuggestion {
  return {
    id: r.id,
    type: r.type,
    title: r.title,
    desc: r.description ?? '',
    priority: r.priority,
  };
}

export interface AiChatMessage {
  id: string;
  role: 'ai' | 'user';
  text: string;
  time: string;
}

export function mapAiChatMessage(r: AiChatMessageRow): AiChatMessage {
  return {
    id: r.id,
    role: r.role,
    text: r.text,
    time: r.msg_time ?? '',
  };
}

export interface ActivityItem {
  id: string;
  icon: string;
  title: string;
  desc: string;
  time: string;
  color: string;
  source: 'call' | 'whatsapp' | 'sms' | 'email' | 'note' | 'meeting' | 'task' | 'document' | null;
  contactId: string | null;
}

export function mapActivity(r: ActivityTimelineRow): ActivityItem {
  return {
    id: r.id,
    icon: r.icon,
    title: r.title,
    desc: r.description ?? '',
    time: r.time ?? '',
    color: r.color,
    source: r.source ?? null,
    contactId: r.contact_id ?? null,
  };
}

export interface DocumentItem {
  id: string;
  name: string;
  type: string;
  size: string;
  folder: string;
  modified: string;
}

export function mapDocument(r: DocumentRow): DocumentItem {
  return {
    id: r.id,
    name: r.name,
    type: r.type,
    size: r.size ?? '',
    folder: r.folder,
    modified: r.modified ?? '',
  };
}

export interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: string;
  plan: string;
}

export function mapInvoice(r: InvoiceRow): Invoice {
  return {
    id: r.invoice_no,
    date: r.invoice_date ?? '',
    amount: Number(r.amount),
    status: r.status,
    plan: r.plan ?? '',
  };
}

export function mapTeamMember(
  p: ProfileRow,
  stats: { callsToday: number; dealsClosed: number; revenue: number; conversion: number; attendance: number }
): TeamMember {
  return {
    id: p.id,
    name: p.name,
    role: p.role === 'admin' ? 'VP Sales' : p.role === 'manager' ? 'Senior AE' : 'Account Executive',
    email: '',
    avatar: p.avatar ?? '',
    status: p.status,
    callsToday: stats.callsToday,
    dealsClosed: stats.dealsClosed,
    revenue: stats.revenue,
    conversion: stats.conversion,
    attendance: stats.attendance,
  };
}
