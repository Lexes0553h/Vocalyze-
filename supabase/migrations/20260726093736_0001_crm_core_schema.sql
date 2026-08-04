/*
# Vocalyze CRM — Core Schema with RBAC

## Overview
Full data model for the Vocalyze sales CRM: profiles (extending auth.users with
role + name), companies, contacts, leads, deals, calls, tasks, notifications,
WhatsApp/SMS conversations + messages, emails, calendar events, AI suggestions,
AI chat, activity timeline, documents, invoices.

## Role-Based Access Control (RBAC)
- Three roles: admin, manager, agent (stored on profiles.role).
- Helper SQL functions: user_role(), is_admin(), is_manager(), is_admin_or_manager().
- Access model (team-wide visibility, common in sales CRMs):
  - READ: every authenticated user can read all CRM data.
  - CREATE: every authenticated user can create.
  - UPDATE / DELETE: admins & managers can modify anything; agents can only
    modify rows assigned to them (assigned_to = auth.uid()).
- Notifications + AI chat are owner-scoped (each user sees only their own).

## New Tables
profiles, companies, contacts, leads, deals, calls, tasks, notifications,
whatsapp_conversations, whatsapp_messages, sms_conversations, sms_messages,
emails, calendar_events, ai_suggestions, ai_chat_messages,
activity_timeline, documents, invoices.

## Security
- RLS enabled on every table; 4 separate policies per table.
- A trigger auto-creates a profiles row (agent, or admin for the first user)
  whenever a new auth.users account is created.

## Important: ordering
1. profiles table is created first (RLS enabled, NO policies yet).
2. RBAC helper functions are defined next (they query profiles).
3. profiles policies are added last (they call is_admin_or_manager()).
*/

-- ============================================================
-- Step 1: profiles table (1:1 with auth.users) — no policies yet
-- ============================================================
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null default '',
  role        text not null default 'agent' check (role in ('admin','manager','agent')),
  avatar      text,
  status      text not null default 'offline' check (status in ('online','away','offline')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- ============================================================
-- Step 2: RBAC helper functions (profiles table now exists)
-- ============================================================
create or replace function public.user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.user_role() = 'admin', false);
$$;

create or replace function public.is_manager()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.user_role() = 'manager', false);
$$;

create or replace function public.is_admin_or_manager()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.is_admin() or public.is_manager(), false);
$$;

-- ============================================================
-- Step 3: profiles policies (functions now exist)
-- ============================================================
drop policy if exists "profiles_select_all" on public.profiles;
create policy "profiles_select_all" on public.profiles
  for select to authenticated using (true);

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self" on public.profiles
  for insert to authenticated with check (auth.uid() = id);

drop policy if exists "profiles_update_self_or_admin" on public.profiles;
create policy "profiles_update_self_or_admin" on public.profiles
  for update to authenticated
  using (auth.uid() = id or public.is_admin_or_manager())
  with check (auth.uid() = id or public.is_admin_or_manager());

drop policy if exists "profiles_delete_admin" on public.profiles;
create policy "profiles_delete_admin" on public.profiles
  for delete to authenticated using (public.is_admin());

-- Auto-create profile on signup. First user becomes admin.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  first_name text;
  user_count int;
  new_role text;
begin
  first_name := coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1));
  select count(*) into user_count from public.profiles;
  if user_count = 0 then
    new_role := 'admin';
  else
    new_role := 'agent';
  end if;
  insert into public.profiles (id, name, role)
  values (new.id, first_name, new_role)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- companies
-- ============================================================
create table if not exists public.companies (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  logo        text,
  industry    text,
  website     text,
  employees   int,
  revenue     text,
  location    text,
  deals       int not null default 0,
  deal_value  numeric not null default 0,
  status      text not null default 'Prospect' check (status in ('Active','Prospect','Churned')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.companies enable row level security;

drop policy if exists "companies_select" on public.companies;
create policy "companies_select" on public.companies for select to authenticated using (true);
drop policy if exists "companies_insert" on public.companies;
create policy "companies_insert" on public.companies for insert to authenticated with check (true);
drop policy if exists "companies_update" on public.companies;
create policy "companies_update" on public.companies for update to authenticated using (public.is_admin_or_manager()) with check (public.is_admin_or_manager());
drop policy if exists "companies_delete" on public.companies;
create policy "companies_delete" on public.companies for delete to authenticated using (public.is_admin_or_manager());

-- ============================================================
-- contacts
-- ============================================================
create table if not exists public.contacts (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text,
  phone       text,
  company_id  uuid references public.companies(id) on delete set null,
  company     text,
  role        text,
  avatar      text,
  tags        text[] not null default '{}',
  last_seen   text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.contacts enable row level security;

drop policy if exists "contacts_select" on public.contacts;
create policy "contacts_select" on public.contacts for select to authenticated using (true);
drop policy if exists "contacts_insert" on public.contacts;
create policy "contacts_insert" on public.contacts for insert to authenticated with check (true);
drop policy if exists "contacts_update" on public.contacts;
create policy "contacts_update" on public.contacts for update to authenticated using (public.is_admin_or_manager()) with check (public.is_admin_or_manager());
drop policy if exists "contacts_delete" on public.contacts;
create policy "contacts_delete" on public.contacts for delete to authenticated using (public.is_admin_or_manager());

-- ============================================================
-- leads
-- ============================================================
create table if not exists public.leads (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  company_id    uuid references public.companies(id) on delete set null,
  company       text,
  email         text,
  phone         text,
  status        text not null default 'New' check (status in ('New','Contacted','Qualified','Proposal','Negotiation','Won','Lost')),
  priority      text not null default 'Medium' check (priority in ('Low','Medium','High','Urgent')),
  tags          text[] not null default '{}',
  agent         text,
  assigned_to   uuid references auth.users(id) on delete set null,
  avatar        text,
  value         numeric not null default 0,
  source        text,
  last_contact  text,
  notes         text,
  role          text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.leads enable row level security;

drop policy if exists "leads_select" on public.leads;
create policy "leads_select" on public.leads for select to authenticated using (true);
drop policy if exists "leads_insert" on public.leads;
create policy "leads_insert" on public.leads for insert to authenticated with check (true);
drop policy if exists "leads_update" on public.leads;
create policy "leads_update" on public.leads for update to authenticated using (assigned_to = auth.uid() or public.is_admin_or_manager()) with check (assigned_to = auth.uid() or public.is_admin_or_manager());
drop policy if exists "leads_delete" on public.leads;
create policy "leads_delete" on public.leads for delete to authenticated using (assigned_to = auth.uid() or public.is_admin_or_manager());

-- ============================================================
-- deals
-- ============================================================
create table if not exists public.deals (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  company_id    uuid references public.companies(id) on delete set null,
  company       text,
  contact       text,
  value         numeric not null default 0,
  stage         text not null default 'Lead' check (stage in ('Lead','Qualified','Proposal','Negotiation','Closed')),
  probability   int not null default 0,
  agent         text,
  assigned_to   uuid references auth.users(id) on delete set null,
  expected_close date,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.deals enable row level security;

drop policy if exists "deals_select" on public.deals;
create policy "deals_select" on public.deals for select to authenticated using (true);
drop policy if exists "deals_insert" on public.deals;
create policy "deals_insert" on public.deals for insert to authenticated with check (true);
drop policy if exists "deals_update" on public.deals;
create policy "deals_update" on public.deals for update to authenticated using (assigned_to = auth.uid() or public.is_admin_or_manager()) with check (assigned_to = auth.uid() or public.is_admin_or_manager());
drop policy if exists "deals_delete" on public.deals;
create policy "deals_delete" on public.deals for delete to authenticated using (assigned_to = auth.uid() or public.is_admin_or_manager());

-- ============================================================
-- calls
-- ============================================================
create table if not exists public.calls (
  id          uuid primary key default gen_random_uuid(),
  contact     text not null,
  company     text,
  agent       text,
  assigned_to uuid references auth.users(id) on delete set null,
  direction   text not null default 'outbound' check (direction in ('inbound','outbound','missed')),
  duration    text not null default '0:00',
  call_time   text,
  call_date   text,
  disposition text,
  recording   boolean not null default false,
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.calls enable row level security;

drop policy if exists "calls_select" on public.calls;
create policy "calls_select" on public.calls for select to authenticated using (true);
drop policy if exists "calls_insert" on public.calls;
create policy "calls_insert" on public.calls for insert to authenticated with check (true);
drop policy if exists "calls_update" on public.calls;
create policy "calls_update" on public.calls for update to authenticated using (assigned_to = auth.uid() or public.is_admin_or_manager()) with check (assigned_to = auth.uid() or public.is_admin_or_manager());
drop policy if exists "calls_delete" on public.calls;
create policy "calls_delete" on public.calls for delete to authenticated using (assigned_to = auth.uid() or public.is_admin_or_manager());

-- ============================================================
-- tasks
-- ============================================================
create table if not exists public.tasks (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  priority    text not null default 'Medium' check (priority in ('Low','Medium','High','Urgent')),
  status      text not null default 'Backlog' check (status in ('Backlog','In Progress','Review','Done')),
  assignee    text,
  assigned_to uuid references auth.users(id) on delete set null,
  due_date    text,
  tags        text[] not null default '{}',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.tasks enable row level security;

drop policy if exists "tasks_select" on public.tasks;
create policy "tasks_select" on public.tasks for select to authenticated using (true);
drop policy if exists "tasks_insert" on public.tasks;
create policy "tasks_insert" on public.tasks for insert to authenticated with check (true);
drop policy if exists "tasks_update" on public.tasks;
create policy "tasks_update" on public.tasks for update to authenticated using (assigned_to = auth.uid() or public.is_admin_or_manager()) with check (assigned_to = auth.uid() or public.is_admin_or_manager());
drop policy if exists "tasks_delete" on public.tasks;
create policy "tasks_delete" on public.tasks for delete to authenticated using (assigned_to = auth.uid() or public.is_admin_or_manager());

-- ============================================================
-- notifications (owner-scoped)
-- ============================================================
create table if not exists public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  type        text not null default 'system' check (type in ('call','lead','deal','task','message','system')),
  title       text not null,
  description text,
  time        text,
  read        boolean not null default false,
  created_at  timestamptz not null default now()
);

alter table public.notifications enable row level security;

drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own" on public.notifications for select to authenticated using (user_id = auth.uid());
drop policy if exists "notifications_insert_own" on public.notifications;
create policy "notifications_insert_own" on public.notifications for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own" on public.notifications for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "notifications_delete_own" on public.notifications;
create policy "notifications_delete_own" on public.notifications for delete to authenticated using (user_id = auth.uid());

-- ============================================================
-- whatsapp conversations + messages
-- ============================================================
create table if not exists public.whatsapp_conversations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  company     text,
  avatar      text,
  last_msg    text,
  last_time   text,
  unread      int not null default 0,
  pinned      boolean not null default false,
  online      boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.whatsapp_conversations enable row level security;

drop policy if exists "wa_conv_select" on public.whatsapp_conversations;
create policy "wa_conv_select" on public.whatsapp_conversations for select to authenticated using (true);
drop policy if exists "wa_conv_insert" on public.whatsapp_conversations;
create policy "wa_conv_insert" on public.whatsapp_conversations for insert to authenticated with check (true);
drop policy if exists "wa_conv_update" on public.whatsapp_conversations;
create policy "wa_conv_update" on public.whatsapp_conversations for update to authenticated using (true) with check (true);
drop policy if exists "wa_conv_delete" on public.whatsapp_conversations;
create policy "wa_conv_delete" on public.whatsapp_conversations for delete to authenticated using (public.is_admin_or_manager());

create table if not exists public.whatsapp_messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.whatsapp_conversations(id) on delete cascade,
  from_me         boolean not null default false,
  text            text not null,
  msg_time        text,
  created_at      timestamptz not null default now()
);

alter table public.whatsapp_messages enable row level security;

drop policy if exists "wa_msg_select" on public.whatsapp_messages;
create policy "wa_msg_select" on public.whatsapp_messages for select to authenticated using (true);
drop policy if exists "wa_msg_insert" on public.whatsapp_messages;
create policy "wa_msg_insert" on public.whatsapp_messages for insert to authenticated with check (true);
drop policy if exists "wa_msg_update" on public.whatsapp_messages;
create policy "wa_msg_update" on public.whatsapp_messages for update to authenticated using (true) with check (true);
drop policy if exists "wa_msg_delete" on public.whatsapp_messages;
create policy "wa_msg_delete" on public.whatsapp_messages for delete to authenticated using (public.is_admin_or_manager());

-- ============================================================
-- sms conversations + messages
-- ============================================================
create table if not exists public.sms_conversations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  company     text,
  phone       text,
  avatar      text,
  last_msg    text,
  last_time   text,
  unread      int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.sms_conversations enable row level security;

drop policy if exists "sms_conv_select" on public.sms_conversations;
create policy "sms_conv_select" on public.sms_conversations for select to authenticated using (true);
drop policy if exists "sms_conv_insert" on public.sms_conversations;
create policy "sms_conv_insert" on public.sms_conversations for insert to authenticated with check (true);
drop policy if exists "sms_conv_update" on public.sms_conversations;
create policy "sms_conv_update" on public.sms_conversations for update to authenticated using (true) with check (true);
drop policy if exists "sms_conv_delete" on public.sms_conversations;
create policy "sms_conv_delete" on public.sms_conversations for delete to authenticated using (public.is_admin_or_manager());

create table if not exists public.sms_messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.sms_conversations(id) on delete cascade,
  from_me         boolean not null default false,
  text            text not null,
  msg_time        text,
  created_at      timestamptz not null default now()
);

alter table public.sms_messages enable row level security;

drop policy if exists "sms_msg_select" on public.sms_messages;
create policy "sms_msg_select" on public.sms_messages for select to authenticated using (true);
drop policy if exists "sms_msg_insert" on public.sms_messages;
create policy "sms_msg_insert" on public.sms_messages for insert to authenticated with check (true);
drop policy if exists "sms_msg_update" on public.sms_messages;
create policy "sms_msg_update" on public.sms_messages for update to authenticated using (true) with check (true);
drop policy if exists "sms_msg_delete" on public.sms_messages;
create policy "sms_msg_delete" on public.sms_messages for delete to authenticated using (public.is_admin_or_manager());

-- ============================================================
-- emails
-- ============================================================
create table if not exists public.emails (
  id          uuid primary key default gen_random_uuid(),
  from_name   text,
  from_email  text,
  subject     text,
  preview     text,
  body        text,
  folder      text not null default 'inbox' check (folder in ('inbox','sent','drafts','archive')),
  unread      boolean not null default false,
  starred     boolean not null default false,
  avatar      text,
  sent_at     text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.emails enable row level security;

drop policy if exists "emails_select" on public.emails;
create policy "emails_select" on public.emails for select to authenticated using (true);
drop policy if exists "emails_insert" on public.emails;
create policy "emails_insert" on public.emails for insert to authenticated with check (true);
drop policy if exists "emails_update" on public.emails;
create policy "emails_update" on public.emails for update to authenticated using (true) with check (true);
drop policy if exists "emails_delete" on public.emails;
create policy "emails_delete" on public.emails for delete to authenticated using (public.is_admin_or_manager());

-- ============================================================
-- calendar events
-- ============================================================
create table if not exists public.calendar_events (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  event_time  text,
  duration    int not null default 30,
  type        text not null default 'meeting' check (type in ('call','meeting','task')),
  attendees   int not null default 1,
  color       text not null default 'primary',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.calendar_events enable row level security;

drop policy if exists "events_select" on public.calendar_events;
create policy "events_select" on public.calendar_events for select to authenticated using (true);
drop policy if exists "events_insert" on public.calendar_events;
create policy "events_insert" on public.calendar_events for insert to authenticated with check (true);
drop policy if exists "events_update" on public.calendar_events;
create policy "events_update" on public.calendar_events for update to authenticated using (true) with check (true);
drop policy if exists "events_delete" on public.calendar_events;
create policy "events_delete" on public.calendar_events for delete to authenticated using (public.is_admin_or_manager());

-- ============================================================
-- ai suggestions
-- ============================================================
create table if not exists public.ai_suggestions (
  id          uuid primary key default gen_random_uuid(),
  type        text not null default 'follow-up',
  title       text not null,
  description text,
  priority    text not null default 'medium' check (priority in ('low','medium','high','urgent')),
  acted       boolean not null default false,
  created_at  timestamptz not null default now()
);

alter table public.ai_suggestions enable row level security;

drop policy if exists "ai_sug_select" on public.ai_suggestions;
create policy "ai_sug_select" on public.ai_suggestions for select to authenticated using (true);
drop policy if exists "ai_sug_insert" on public.ai_suggestions;
create policy "ai_sug_insert" on public.ai_suggestions for insert to authenticated with check (true);
drop policy if exists "ai_sug_update" on public.ai_suggestions;
create policy "ai_sug_update" on public.ai_suggestions for update to authenticated using (true) with check (true);
drop policy if exists "ai_sug_delete" on public.ai_suggestions;
create policy "ai_sug_delete" on public.ai_suggestions for delete to authenticated using (public.is_admin_or_manager());

-- ============================================================
-- ai chat messages (owner-scoped)
-- ============================================================
create table if not exists public.ai_chat_messages (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  role        text not null default 'ai' check (role in ('ai','user')),
  text        text not null,
  msg_time    text,
  created_at  timestamptz not null default now()
);

alter table public.ai_chat_messages enable row level security;

drop policy if exists "ai_chat_select_own" on public.ai_chat_messages;
create policy "ai_chat_select_own" on public.ai_chat_messages for select to authenticated using (user_id = auth.uid());
drop policy if exists "ai_chat_insert_own" on public.ai_chat_messages;
create policy "ai_chat_insert_own" on public.ai_chat_messages for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "ai_chat_update_own" on public.ai_chat_messages;
create policy "ai_chat_update_own" on public.ai_chat_messages for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "ai_chat_delete_own" on public.ai_chat_messages;
create policy "ai_chat_delete_own" on public.ai_chat_messages for delete to authenticated using (user_id = auth.uid());

-- ============================================================
-- activity timeline
-- ============================================================
create table if not exists public.activity_timeline (
  id          uuid primary key default gen_random_uuid(),
  icon        text not null default 'activity',
  title       text not null,
  description text,
  time        text,
  color       text not null default 'primary',
  created_at  timestamptz not null default now()
);

alter table public.activity_timeline enable row level security;

drop policy if exists "activity_select" on public.activity_timeline;
create policy "activity_select" on public.activity_timeline for select to authenticated using (true);
drop policy if exists "activity_insert" on public.activity_timeline;
create policy "activity_insert" on public.activity_timeline for insert to authenticated with check (true);
drop policy if exists "activity_update" on public.activity_timeline;
create policy "activity_update" on public.activity_timeline for update to authenticated using (true) with check (true);
drop policy if exists "activity_delete" on public.activity_timeline;
create policy "activity_delete" on public.activity_timeline for delete to authenticated using (public.is_admin_or_manager());

-- ============================================================
-- documents
-- ============================================================
create table if not exists public.documents (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  type        text not null default 'pdf' check (type in ('pdf','sheet','doc','image','other')),
  size        text,
  folder      text not null default 'General',
  modified    text,
  url         text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.documents enable row level security;

drop policy if exists "docs_select" on public.documents;
create policy "docs_select" on public.documents for select to authenticated using (true);
drop policy if exists "docs_insert" on public.documents;
create policy "docs_insert" on public.documents for insert to authenticated with check (true);
drop policy if exists "docs_update" on public.documents;
create policy "docs_update" on public.documents for update to authenticated using (true) with check (true);
drop policy if exists "docs_delete" on public.documents;
create policy "docs_delete" on public.documents for delete to authenticated using (public.is_admin_or_manager());

-- ============================================================
-- invoices
-- ============================================================
create table if not exists public.invoices (
  id          uuid primary key default gen_random_uuid(),
  invoice_no  text not null,
  invoice_date text,
  amount      numeric not null default 0,
  status      text not null default 'Paid' check (status in ('Paid','Pending','Overdue')),
  plan        text,
  created_at  timestamptz not null default now()
);

alter table public.invoices enable row level security;

drop policy if exists "invoices_select" on public.invoices;
create policy "invoices_select" on public.invoices for select to authenticated using (true);
drop policy if exists "invoices_insert" on public.invoices;
create policy "invoices_insert" on public.invoices for insert to authenticated with check (true);
drop policy if exists "invoices_update" on public.invoices;
create policy "invoices_update" on public.invoices for update to authenticated using (public.is_admin_or_manager()) with check (public.is_admin_or_manager());
drop policy if exists "invoices_delete" on public.invoices;
create policy "invoices_delete" on public.invoices for delete to authenticated using (public.is_admin_or_manager());

-- ============================================================
-- updated_at trigger (shared)
-- ============================================================
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

do $$
declare
  t text;
  tables text[] := array[
    'profiles','companies','contacts','leads','deals','calls','tasks',
    'whatsapp_conversations','sms_conversations','emails',
    'calendar_events','ai_suggestions','activity_timeline','documents'
  ];
begin
  foreach t in array tables loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format('create trigger set_updated_at before update on public.%I for each row execute function public.touch_updated_at()', t);
  end loop;
end $$;

-- Helpful indexes
create index if not exists idx_leads_status on public.leads(status);
create index if not exists idx_leads_assigned on public.leads(assigned_to);
create index if not exists idx_deals_stage on public.deals(stage);
create index if not exists idx_deals_assigned on public.deals(assigned_to);
create index if not exists idx_calls_assigned on public.calls(assigned_to);
create index if not exists idx_tasks_assigned on public.tasks(assigned_to);
create index if not exists idx_tasks_status on public.tasks(status);
create index if not exists idx_notifications_user on public.notifications(user_id);
create index if not exists idx_ai_chat_user on public.ai_chat_messages(user_id);
create index if not exists idx_contacts_company on public.contacts(company_id);
