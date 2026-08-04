/*
# Enterprise AI Platform Schema

Adds tables for AI conversation persistence, AI settings, call analysis,
lead scores, and automation flows. All tenant-scoped with RLS.
*/

-- ============================================================
-- ai_conversations: chat sessions with the AI assistant
-- ============================================================
create table if not exists public.ai_conversations (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid references public.tenants(id) on delete cascade,
  user_id     uuid references public.profiles(id) on delete cascade,
  title       text not null default 'New Conversation',
  pinned      boolean not null default false,
  metadata    jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
alter table public.ai_conversations enable row level security;

drop policy if exists "ai_conv_select" on public.ai_conversations;
create policy "ai_conv_select" on public.ai_conversations for select to authenticated using (tenant_id = public.user_tenant_id() or public.is_super_admin());
drop policy if exists "ai_conv_insert" on public.ai_conversations;
create policy "ai_conv_insert" on public.ai_conversations for insert to authenticated with check (tenant_id = public.user_tenant_id() or public.is_super_admin());
drop policy if exists "ai_conv_update" on public.ai_conversations;
create policy "ai_conv_update" on public.ai_conversations for update to authenticated using (tenant_id = public.user_tenant_id() or public.is_super_admin()) with check (tenant_id = public.user_tenant_id() or public.is_super_admin());
drop policy if exists "ai_conv_delete" on public.ai_conversations;
create policy "ai_conv_delete" on public.ai_conversations for delete to authenticated using (tenant_id = public.user_tenant_id() or public.is_super_admin());

-- ============================================================
-- ai_messages: individual messages within a conversation
-- ============================================================
create table if not exists public.ai_messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.ai_conversations(id) on delete cascade,
  tenant_id       uuid references public.tenants(id) on delete cascade,
  role            text not null check (role in ('user','assistant','system')),
  content         text not null,
  feature         text,
  feedback        text check (feedback in ('liked','disliked',null)),
  tokens_used     int,
  latency_ms      int,
  created_at      timestamptz not null default now()
);
alter table public.ai_messages enable row level security;

drop policy if exists "ai_msg_select" on public.ai_messages;
create policy "ai_msg_select" on public.ai_messages for select to authenticated using (tenant_id = public.user_tenant_id() or public.is_super_admin());
drop policy if exists "ai_msg_insert" on public.ai_messages;
create policy "ai_msg_insert" on public.ai_messages for insert to authenticated with check (tenant_id = public.user_tenant_id() or public.is_super_admin());
drop policy if exists "ai_msg_update" on public.ai_messages;
create policy "ai_msg_update" on public.ai_messages for update to authenticated using (tenant_id = public.user_tenant_id() or public.is_super_admin()) with check (tenant_id = public.user_tenant_id() or public.is_super_admin());
drop policy if exists "ai_msg_delete" on public.ai_messages;
create policy "ai_msg_delete" on public.ai_messages for delete to authenticated using (tenant_id = public.user_tenant_id() or public.is_super_admin());

create index if not exists idx_ai_msg_conv on public.ai_messages(conversation_id);
create index if not exists idx_ai_conv_tenant on public.ai_conversations(tenant_id);

-- ============================================================
-- ai_settings: per-tenant AI configuration
-- ============================================================
create table if not exists public.ai_settings (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null unique references public.tenants(id) on delete cascade,
  provider        text not null default 'simulated' check (provider in ('openai','gemini','claude','azure','local','simulated')),
  model           text not null default 'gpt-4o',
  temperature     numeric not null default 0.7 check (temperature >= 0 and temperature <= 2),
  max_tokens      int not null default 2048,
  language        text not null default 'en',
  response_length text not null default 'medium' check (response_length in ('short','medium','long')),
  creativity      text not null default 'balanced' check (creativity in ('conservative','balanced','creative')),
  auto_summary    boolean not null default true,
  auto_suggestions boolean not null default true,
  voice_enabled   boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
alter table public.ai_settings enable row level security;

drop policy if exists "ai_sett_select" on public.ai_settings;
create policy "ai_sett_select" on public.ai_settings for select to authenticated using (tenant_id = public.user_tenant_id() or public.is_super_admin());
drop policy if exists "ai_sett_insert" on public.ai_settings;
create policy "ai_sett_insert" on public.ai_settings for insert to authenticated with check (tenant_id = public.user_tenant_id() or public.is_super_admin());
drop policy if exists "ai_sett_update" on public.ai_settings;
create policy "ai_sett_update" on public.ai_settings for update to authenticated using (tenant_id = public.user_tenant_id() or public.is_super_admin()) with check (tenant_id = public.user_tenant_id() or public.is_super_admin());
drop policy if exists "ai_sett_delete" on public.ai_settings;
create policy "ai_sett_delete" on public.ai_settings for delete to authenticated using (tenant_id = public.user_tenant_id() or public.is_super_admin());

-- ============================================================
-- ai_call_analysis: AI analysis of completed calls
-- ============================================================
create table if not exists public.ai_call_analysis (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid references public.tenants(id) on delete cascade,
  call_id         uuid references public.calls(id) on delete cascade,
  summary         text,
  key_discussion  jsonb,
  sentiment       text,
  sentiment_score int,
  objections      jsonb,
  next_actions    jsonb,
  follow_up_date  timestamptz,
  risk_level      text check (risk_level in ('low','medium','high')),
  keywords        jsonb,
  call_score      numeric,
  agent_perf      jsonb,
  emotion_timeline jsonb,
  confidence      numeric,
  created_at      timestamptz not null default now()
);
alter table public.ai_call_analysis enable row level security;

drop policy if exists "ai_call_select" on public.ai_call_analysis;
create policy "ai_call_select" on public.ai_call_analysis for select to authenticated using (tenant_id = public.user_tenant_id() or public.is_super_admin());
drop policy if exists "ai_call_insert" on public.ai_call_analysis;
create policy "ai_call_insert" on public.ai_call_analysis for insert to authenticated with check (tenant_id = public.user_tenant_id() or public.is_super_admin());
drop policy if exists "ai_call_update" on public.ai_call_analysis;
create policy "ai_call_update" on public.ai_call_analysis for update to authenticated using (tenant_id = public.user_tenant_id() or public.is_super_admin()) with check (tenant_id = public.user_tenant_id() or public.is_super_admin());
drop policy if exists "ai_call_delete" on public.ai_call_analysis;
create policy "ai_call_delete" on public.ai_call_analysis for delete to authenticated using (tenant_id = public.user_tenant_id() or public.is_super_admin());

create index if not exists idx_ai_call_tenant on public.ai_call_analysis(tenant_id);
create index if not exists idx_ai_call_callid on public.ai_call_analysis(call_id);

-- ============================================================
-- ai_lead_scores: AI-calculated lead scores
-- ============================================================
create table if not exists public.ai_lead_scores (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid references public.tenants(id) on delete cascade,
  lead_id         uuid references public.leads(id) on delete cascade,
  score           int not null check (score >= 0 and score <= 100),
  tier            text not null check (tier in ('hot','warm','cold')),
  buying_intent   text not null check (buying_intent in ('high','medium','low')),
  intent_signals  jsonb,
  priority        text not null check (priority in ('high','medium','low')),
  best_contact_time text,
  recommended_action text,
  conversion_prob numeric,
  scored_at       timestamptz not null default now(),
  created_at      timestamptz not null default now()
);
alter table public.ai_lead_scores enable row level security;

drop policy if exists "ai_lead_select" on public.ai_lead_scores;
create policy "ai_lead_select" on public.ai_lead_scores for select to authenticated using (tenant_id = public.user_tenant_id() or public.is_super_admin());
drop policy if exists "ai_lead_insert" on public.ai_lead_scores;
create policy "ai_lead_insert" on public.ai_lead_scores for insert to authenticated with check (tenant_id = public.user_tenant_id() or public.is_super_admin());
drop policy if exists "ai_lead_update" on public.ai_lead_scores;
create policy "ai_lead_update" on public.ai_lead_scores for update to authenticated using (tenant_id = public.user_tenant_id() or public.is_super_admin()) with check (tenant_id = public.user_tenant_id() or public.is_super_admin());
drop policy if exists "ai_lead_delete" on public.ai_lead_scores;
create policy "ai_lead_delete" on public.ai_lead_scores for delete to authenticated using (tenant_id = public.user_tenant_id() or public.is_super_admin());

create index if not exists idx_ai_lead_tenant on public.ai_lead_scores(tenant_id);
create index if not exists idx_ai_lead_leadid on public.ai_lead_scores(lead_id);

-- ============================================================
-- ai_automation_flows: visual automation builder
-- ============================================================
create table if not exists public.ai_automation_flows (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid references public.tenants(id) on delete cascade,
  name        text not null,
  description text,
  trigger     jsonb not null,
  steps       jsonb not null default '[]',
  is_active   boolean not null default false,
  executions  int not null default 0,
  created_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
alter table public.ai_automation_flows enable row level security;

drop policy if exists "ai_flow_select" on public.ai_automation_flows;
create policy "ai_flow_select" on public.ai_automation_flows for select to authenticated using (tenant_id = public.user_tenant_id() or public.is_super_admin());
drop policy if exists "ai_flow_insert" on public.ai_automation_flows;
create policy "ai_flow_insert" on public.ai_automation_flows for insert to authenticated with check (tenant_id = public.user_tenant_id() or public.is_super_admin());
drop policy if exists "ai_flow_update" on public.ai_automation_flows;
create policy "ai_flow_update" on public.ai_automation_flows for update to authenticated using (tenant_id = public.user_tenant_id() or public.is_super_admin()) with check (tenant_id = public.user_tenant_id() or public.is_super_admin());
drop policy if exists "ai_flow_delete" on public.ai_automation_flows;
create policy "ai_flow_delete" on public.ai_automation_flows for delete to authenticated using (tenant_id = public.user_tenant_id() or public.is_super_admin());

create index if not exists idx_ai_flow_tenant on public.ai_automation_flows(tenant_id);

-- ============================================================
-- updated_at triggers
-- ============================================================
do $$
declare t text; tables text[] := array['ai_conversations','ai_settings','ai_automation_flows'];
begin
  foreach t in array tables loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format('create trigger set_updated_at before update on public.%I for each row execute function public.touch_updated_at()', t);
  end loop;
end $$;

-- Insert default ai_settings for existing tenants
insert into public.ai_settings (tenant_id) 
select id from public.tenants 
where not exists (select 1 from public.ai_settings where ai_settings.tenant_id = tenants.id);
