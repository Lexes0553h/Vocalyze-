// Centralized demo data for the CRM application. All mock — no backend.

export interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: 'New' | 'Contacted' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Won' | 'Lost';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  tags: string[];
  agent: string;
  avatar: string;
  value: number;
  source: string;
  lastContact: string;
  createdAt: string;
  notes: string;
  role?: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  role: string;
  avatar: string;
  tags: string[];
  lastSeen: string;
}

export interface Company {
  id: string;
  name: string;
  logo: string;
  industry: string;
  website: string;
  employees: number;
  revenue: string;
  location: string;
  deals: number;
  dealValue: number;
  status: 'Active' | 'Prospect' | 'Churned';
}

export interface Call {
  id: string;
  contact: string;
  company: string;
  agent: string;
  direction: 'inbound' | 'outbound' | 'missed';
  duration: string;
  time: string;
  date: string;
  disposition: string;
  recording: boolean;
  notes: string;
  phone?: string;
  status?: string;
  muted?: boolean;
  speaker?: boolean;
  recordingUrl?: string;
  transferredTo?: string;
  followUp?: boolean;
  followUpDate?: string;
  isFavorite?: boolean;
  contactPhone?: string;
  summary?: string;
  // Phase 4 - AI Insights & Follow-up Fields
  transcript?: string;
  shortSummary?: string;
  detailedSummary?: string;
  sentiment?: 'Positive' | 'Neutral' | 'Negative' | string;
  sentimentReason?: string;
  intent?: string;
  importantPoints?: string[];
  objections?: string[];
  followUpTasks?: string[];
  suggestedAction?: string;
  leadScore?: number;
  generatedEmail?: string;
  generatedWhatsapp?: string;
  processedAt?: string;
  aiStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  aiError?: string;
}

export interface Deal {
  id: string;
  title: string;
  company: string;
  contact: string;
  value: number;
  stage: 'Lead' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Closed';
  probability: number;
  agent: string;
  expectedClose: string;
  phone?: string;
  email?: string;
  tags?: string[];
  priority?: string;
  notes?: string;
  nextActivity?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Backlog' | 'In Progress' | 'Review' | 'Done';
  assignee: string;
  dueDate: string;
  tags: string[];
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  avatar: string;
  status: 'online' | 'away' | 'offline';
  callsToday: number;
  dealsClosed: number;
  revenue: number;
  conversion: number;
  attendance: number;
}

export interface Notification {
  id: string;
  type: 'call' | 'lead' | 'deal' | 'task' | 'message' | 'system';
  title: string;
  description: string;
  time: string;
  read: boolean;
  link?: string;
  priority?: 'low' | 'normal' | 'high';
}

const AVATARS = [
  'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
  'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
  'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
  'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
  'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
  'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
  'https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
  'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
];

export const CURRENT_USER = {
  name: 'Sarah Chen',
  role: 'VP Sales',
  email: 'sarah.chen@vocalyze.io',
  avatar: AVATARS[0],
};

export const LEADS: Lead[] = [];
export const CONTACTS: Contact[] = [];
export const COMPANIES: Company[] = [];
export const CALLS: Call[] = [];
export const DEALS: Deal[] = [];
export const TASKS: Task[] = [];
export const TEAM: TeamMember[] = [];
export const NOTIFICATIONS: Notification[] = [];
export const WHATSAPP_CONVERSATIONS: any[] = [];
export const WHATSAPP_MESSAGES: any[] = [];
export const SMS_CONVERSATIONS: any[] = [];
export const EMAILS: any[] = [];
export const CALENDAR_EVENTS: any[] = [];
export const AI_SUGGESTIONS: any[] = [];
export const AI_CHAT: any[] = [];
export const ACTIVITY_TIMELINE: any[] = [];

export const DASHBOARD_STATS = [
  { label: 'Calls Today', value: 0, change: 0, icon: 'phone', format: 'number' },
  { label: 'Active Leads', value: 0, change: 0, icon: 'users', format: 'number' },
  { label: 'Revenue (MTD)', value: 0, change: 0, icon: 'dollar', format: 'currency' },
  { label: 'Conversion Rate', value: 0, change: 0, icon: 'percent', format: 'percent' },
];

export const PIPELINE_STAGES = [
  { id: 'lead', name: 'Lead', color: 'muted', count: 0 },
  { id: 'qualified', name: 'Qualified', color: 'cyan', count: 0 },
  { id: 'proposal', name: 'Proposal', color: 'primary', count: 0 },
  { id: 'negotiation', name: 'Negotiation', color: 'primary', count: 0 },
  { id: 'closed', name: 'Closed', color: 'primary', count: 0 },
];

export const REVENUE_DATA = [
  { month: 'Jan', value: 0 },
  { month: 'Feb', value: 0 },
  { month: 'Mar', value: 0 },
  { month: 'Apr', value: 0 },
  { month: 'May', value: 0 },
  { month: 'Jun', value: 0 },
  { month: 'Jul', value: 0 },
];

export const CALL_ANALYTICS = [
  { day: 'Mon', inbound: 0, outbound: 0, missed: 0 },
  { day: 'Tue', inbound: 0, outbound: 0, missed: 0 },
  { day: 'Wed', inbound: 0, outbound: 0, missed: 0 },
  { day: 'Thu', inbound: 0, outbound: 0, missed: 0 },
  { day: 'Fri', inbound: 0, outbound: 0, missed: 0 },
  { day: 'Sat', inbound: 0, outbound: 0, missed: 0 },
  { day: 'Sun', inbound: 0, outbound: 0, missed: 0 },
];

export const FUNNEL_DATA = [
  { stage: 'Leads', value: 0, percent: 0 },
  { stage: 'Contacted', value: 0, percent: 0 },
  { stage: 'Qualified', value: 0, percent: 0 },
  { stage: 'Proposal', value: 0, percent: 0 },
  { stage: 'Negotiation', value: 0, percent: 0 },
  { stage: 'Won', value: 0, percent: 0 },
];

export const HEATMAP_DATA = Array.from({ length: 7 }, () =>
  Array.from({ length: 24 }, () => 0)
);

export const SALES_PERFORMANCE: any[] = [];

export const INVOICES: any[] = [];

export const DOCUMENTS: any[] = [];

export const DOCUMENT_FOLDERS = ['Contracts', 'Proposals', 'Reports', 'Templates', 'Marketing', 'Legal'];

export const FAQ_SUPPORT = [
  { q: 'How do I port my existing phone number?', a: 'Go to Settings → Phone Numbers → Port Number. Enter your current carrier details and we handle the rest. Porting typically takes 3-5 business days.' },
  { q: 'Can I customize the dispositions after a call?', a: 'Yes. Navigate to Settings → Call Settings → Dispositions. You can add, edit, or reorder dispositions anytime. Changes apply instantly across your team.' },
  { q: 'How does the AI follow-up work?', a: 'After each recorded call, our AI transcribes the conversation, identifies action items, and drafts a follow-up email or SMS you can review and send with one click.' },
  { q: 'What happens when I hit my call limit?', a: 'You\'ll get a notification at 80% and 100% usage. You can upgrade your plan instantly in Billing, or enable overage billing to keep calling without interruption.' },
  { q: 'How do I add team members?', a: 'Go to Team → Invite Member. Enter their email and assign a role. They\'ll get an invite link valid for 7 days.' },
];

export const PLANS = [
  { name: 'Starter', price: 29, period: '/seat/mo', seats: 'Up to 10 seats', features: ['Lead management', 'Call recording', 'Basic analytics', 'Email support'], current: false, popular: false },
  { name: 'Growth', price: 79, period: '/seat/mo', seats: 'Up to 100 seats', features: ['Everything in Starter', 'AI follow-ups', 'WhatsApp + SMS', 'Advanced analytics', 'Priority support'], current: true, popular: true },
  { name: 'Enterprise', price: 0, period: 'Custom', seats: 'Unlimited seats', features: ['Everything in Growth', 'SSO + SAML', 'Custom integrations', 'Dedicated CSM', '99.99% SLA'], current: false, popular: false },
];
