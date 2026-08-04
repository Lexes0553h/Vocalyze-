-- ========================================================
-- VOCALYZE CRM - PRODUCTION SUPABASE DATABASE MIGRATION
-- ========================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Universal updated_at timestamp trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. Tenants & Subscriptions
CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  logo TEXT,
  industry TEXT,
  website TEXT,
  location TEXT,
  brand_color TEXT DEFAULT '#06b6d4',
  timezone TEXT DEFAULT 'UTC',
  currency TEXT DEFAULT 'USD',
  working_days TEXT[] DEFAULT ARRAY['Mon','Tue','Wed','Thu','Fri'],
  working_hours TEXT DEFAULT '09:00 - 18:00',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'trial', 'cancelled')),
  plan_id UUID,
  max_users INTEGER DEFAULT 10,
  storage_used_mb NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('free', 'starter', 'professional', 'enterprise')),
  price_monthly NUMERIC DEFAULT 0,
  price_yearly NUMERIC DEFAULT 0,
  max_users INTEGER DEFAULT 5,
  max_storage_mb INTEGER DEFAULT 1000,
  features JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tenant_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'cancelled', 'trialing')),
  billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
  amount NUMERIC DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  renews_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Organization Hierarchy (Departments & Teams)
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  head_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  manager_id UUID,
  team_leader_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Profiles & Team Members
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'employee' CHECK (role IN ('super_admin', 'company_admin', 'manager', 'team_leader', 'employee', 'admin', 'agent')),
  avatar TEXT,
  status TEXT DEFAULT 'online' CHECK (status IN ('online', 'away', 'offline')),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  title TEXT,
  last_login TIMESTAMPTZ,
  disabled BOOLEAN DEFAULT false,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'leader', 'manager')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- 4. B2B Client Records (Companies, Contacts, Leads, Deals)
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  logo TEXT,
  industry TEXT,
  website TEXT,
  employees INTEGER DEFAULT 0,
  revenue TEXT,
  location TEXT,
  deals INTEGER DEFAULT 0,
  deal_value NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Prospect', 'Churned')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  company TEXT,
  role TEXT,
  avatar TEXT,
  tags TEXT[] DEFAULT '{}',
  last_seen TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  company TEXT,
  email TEXT,
  phone TEXT,
  status TEXT DEFAULT 'New',
  priority TEXT DEFAULT 'Medium',
  tags TEXT[] DEFAULT '{}',
  agent TEXT,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  avatar TEXT,
  value NUMERIC DEFAULT 0,
  source TEXT,
  last_contact TEXT,
  notes TEXT,
  role TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  company TEXT,
  contact TEXT,
  value NUMERIC DEFAULT 0,
  stage TEXT DEFAULT 'Lead',
  probability INTEGER DEFAULT 50,
  agent TEXT,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  expected_close TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Calls & Phase 4 AI Insights
CREATE TABLE IF NOT EXISTS public.calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
  contact TEXT NOT NULL,
  company TEXT,
  agent TEXT,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  direction TEXT NOT NULL DEFAULT 'outbound',
  duration TEXT DEFAULT '0:00',
  call_time TEXT,
  call_date TEXT,
  disposition TEXT DEFAULT 'Connected',
  recording BOOLEAN DEFAULT false,
  notes TEXT,
  phone TEXT,
  status TEXT DEFAULT 'ended',
  muted BOOLEAN DEFAULT false,
  speaker BOOLEAN DEFAULT false,
  recording_url TEXT,
  recording_duration_sec INTEGER DEFAULT 0,
  transferred_to TEXT,
  follow_up BOOLEAN DEFAULT false,
  follow_up_date TEXT,
  is_favorite BOOLEAN DEFAULT false,
  contact_phone TEXT,
  summary TEXT,
  -- Phase 4 AI Fields
  transcript TEXT,
  short_summary TEXT,
  detailed_summary TEXT,
  sentiment TEXT DEFAULT 'Neutral',
  sentiment_reason TEXT,
  intent TEXT,
  important_points TEXT[],
  objections TEXT[],
  follow_up_tasks TEXT[],
  suggested_action TEXT,
  lead_score INTEGER DEFAULT 50,
  generated_email TEXT,
  generated_whatsapp TEXT,
  processed_at TIMESTAMPTZ,
  ai_status TEXT DEFAULT 'pending',
  ai_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Apply ALTER TABLE statements if calls already exists
ALTER TABLE public.calls ADD COLUMN IF NOT EXISTS transcript TEXT;
ALTER TABLE public.calls ADD COLUMN IF NOT EXISTS short_summary TEXT;
ALTER TABLE public.calls ADD COLUMN IF NOT EXISTS detailed_summary TEXT;
ALTER TABLE public.calls ADD COLUMN IF NOT EXISTS sentiment TEXT DEFAULT 'Neutral';
ALTER TABLE public.calls ADD COLUMN IF NOT EXISTS sentiment_reason TEXT;
ALTER TABLE public.calls ADD COLUMN IF NOT EXISTS intent TEXT;
ALTER TABLE public.calls ADD COLUMN IF NOT EXISTS important_points TEXT[];
ALTER TABLE public.calls ADD COLUMN IF NOT EXISTS objections TEXT[];
ALTER TABLE public.calls ADD COLUMN IF NOT EXISTS follow_up_tasks TEXT[];
ALTER TABLE public.calls ADD COLUMN IF NOT EXISTS suggested_action TEXT;
ALTER TABLE public.calls ADD COLUMN IF NOT EXISTS lead_score INTEGER DEFAULT 50;
ALTER TABLE public.calls ADD COLUMN IF NOT EXISTS generated_email TEXT;
ALTER TABLE public.calls ADD COLUMN IF NOT EXISTS generated_whatsapp TEXT;
ALTER TABLE public.calls ADD COLUMN IF NOT EXISTS processed_at TIMESTAMPTZ;
ALTER TABLE public.calls ADD COLUMN IF NOT EXISTS ai_status TEXT DEFAULT 'pending';
ALTER TABLE public.calls ADD COLUMN IF NOT EXISTS ai_error TEXT;

-- 6. Tasks & Notifications
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'Medium',
  status TEXT DEFAULT 'In Progress',
  assignee TEXT,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  due_date TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'system',
  title TEXT NOT NULL,
  description TEXT,
  time TEXT,
  read BOOLEAN DEFAULT false,
  link TEXT,
  priority TEXT DEFAULT 'normal',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Messaging (WhatsApp & SMS)
CREATE TABLE IF NOT EXISTS public.whatsapp_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  company TEXT,
  avatar TEXT,
  last_msg TEXT,
  last_time TEXT,
  unread INTEGER DEFAULT 0,
  pinned BOOLEAN DEFAULT false,
  online BOOLEAN DEFAULT false,
  labels TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'open',
  auto_reply BOOLEAN DEFAULT false,
  last_msg_status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.whatsapp_conversations(id) ON DELETE CASCADE,
  from_me BOOLEAN DEFAULT false,
  text TEXT NOT NULL,
  msg_time TEXT,
  status TEXT DEFAULT 'delivered',
  kind TEXT DEFAULT 'text',
  media_url TEXT,
  duration_sec INTEGER,
  is_template BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sms_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  avatar TEXT,
  last_msg TEXT,
  last_time TEXT,
  unread INTEGER DEFAULT 0,
  labels TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'open',
  pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sms_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.sms_conversations(id) ON DELETE CASCADE,
  from_me BOOLEAN DEFAULT false,
  text TEXT NOT NULL,
  msg_time TEXT,
  status TEXT DEFAULT 'sent',
  kind TEXT DEFAULT 'text',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Emails, Calendar Events, AI Logs & Supporting Entities
CREATE TABLE IF NOT EXISTS public.emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  from_name TEXT,
  from_email TEXT,
  subject TEXT,
  preview TEXT,
  body TEXT,
  folder TEXT DEFAULT 'inbox' CHECK (folder IN ('inbox', 'sent', 'drafts', 'archive', 'trash')),
  unread BOOLEAN DEFAULT true,
  starred BOOLEAN DEFAULT false,
  avatar TEXT,
  sent_at TIMESTAMPTZ,
  labels TEXT[] DEFAULT '{}',
  has_attachment BOOLEAN DEFAULT false,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  event_time TIMESTAMPTZ,
  duration INTEGER DEFAULT 30,
  type TEXT DEFAULT 'meeting' CHECK (type IN ('call', 'meeting', 'task')),
  attendees INTEGER DEFAULT 1,
  color TEXT DEFAULT '#06b6d4',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ai_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  acted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ai_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('ai', 'user')),
  text TEXT NOT NULL,
  msg_time TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.activity_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  icon TEXT,
  title TEXT NOT NULL,
  description TEXT,
  time TEXT,
  color TEXT DEFAULT '#06b6d4',
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  source TEXT CHECK (source IN ('call', 'whatsapp', 'sms', 'email', 'note', 'meeting', 'task', 'document')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'other' CHECK (type IN ('pdf', 'sheet', 'doc', 'image', 'other')),
  size TEXT,
  folder TEXT DEFAULT 'General',
  modified TIMESTAMPTZ,
  url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  invoice_no TEXT UNIQUE NOT NULL,
  invoice_date TIMESTAMPTZ,
  amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Paid', 'Pending', 'Overdue')),
  plan TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.call_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  call_id UUID NOT NULL REFERENCES public.calls(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, call_id)
);

CREATE TABLE IF NOT EXISTS public.message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'Sales',
  channel TEXT DEFAULT 'whatsapp' CHECK (channel IN ('whatsapp', 'sms', 'email')),
  content TEXT NOT NULL,
  variables TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.customer_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_name TEXT,
  user_role TEXT,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  description TEXT,
  ip_address TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  key TEXT UNIQUE NOT NULL,
  label TEXT,
  description TEXT,
  enabled BOOLEAN DEFAULT true,
  is_global BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'employee',
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  invited_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  audience TEXT DEFAULT 'all',
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Row Level Security (RLS) & Security Policies
DO $$
DECLARE
  tbl TEXT;
  tbls TEXT[] := ARRAY[
    'tenants', 'subscription_plans', 'tenant_subscriptions', 'departments', 'teams',
    'profiles', 'team_members', 'companies', 'contacts', 'leads', 'deals', 'calls',
    'tasks', 'notifications', 'whatsapp_conversations', 'whatsapp_messages',
    'sms_conversations', 'sms_messages', 'emails', 'calendar_events', 'ai_suggestions',
    'ai_chat_messages', 'activity_timeline', 'documents', 'invoices', 'call_favorites',
    'message_templates', 'customer_notes', 'audit_logs', 'feature_flags', 'invitations',
    'announcements'
  ];
BEGIN
  FOREACH tbl IN ARRAY tbls LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);
    EXECUTE format('DROP POLICY IF EXISTS "Public full access on %I" ON public.%I;', tbl, tbl);
    EXECUTE format('CREATE POLICY "Public full access on %I" ON public.%I FOR ALL USING (true) WITH CHECK (true);', tbl, tbl);
  END LOOP;
END $$;

-- 10. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_calls_tenant_id ON public.calls(tenant_id);
CREATE INDEX IF NOT EXISTS idx_calls_created_at ON public.calls(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_tenant_id ON public.leads(tenant_id);
CREATE INDEX IF NOT EXISTS idx_contacts_company_id ON public.contacts(company_id);
CREATE INDEX IF NOT EXISTS idx_deals_stage ON public.deals(stage);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
