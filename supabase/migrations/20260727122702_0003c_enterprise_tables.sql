/*
# Enterprise RBAC — Step 3: tenants, departments, teams, audit_logs, plans, flags, invitations, announcements

Creates all new enterprise tables with tenant-scoped RLS policies.
Also adds tenant_id to all CRM tables for multi-tenant isolation.
*/

-- ============================================================
-- tenants
-- ============================================================
create table if not exists public.tenants (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  slug            text unique not null,
  logo            text,
  industry        text,
  website         text,
  location        text,
  brand_color     text not null default '#10b981',
  timezone        text not null default 'UTC',
  currency        text not null default 'USD',
  working_days    text[] not null default '{Mon,Tue,Wed,Thu,Fri}',
  working_hours   text not null default '09:00-17:00',
  status          text not null default 'active' check (status in ('active','suspended','trial','cancelled')),
  plan_id         uuid,
  max_users       int not null default 10,
  storage_used_mb numeric not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
alter table public.tenants enable row level security;

drop policy if exists "tenants_select_own_or_super" on public.tenants;
create policy "tenants_select_own_or_super" on public.tenants
  for select to authenticated
  using (id = public.user_tenant_id() or public.is_super_admin());

drop policy if exists "tenants_insert_super" on public.tenants;
create policy "tenants_insert_super" on public.tenants
  for insert to authenticated with check (public.is_super_admin());

drop policy if exists "tenants_update_own_or_super" on public.tenants;
create policy "tenants_update_own_or_super" on public.tenants
  for update to authenticated
  using (id = public.user_tenant_id() or public.is_super_admin())
  with check (id = public.user_tenant_id() or public.is_super_admin());

drop policy if exists "tenants_delete_super" on public.tenants;
create policy "tenants_delete_super" on public.tenants
  for delete to authenticated using (public.is_super_admin());

-- FK profiles.tenant_id -> tenants
do $$
begin
  if not exists (select 1 from information_schema.table_constraints where constraint_name='profiles_tenant_id_fkey' and table_name='profiles') then
    alter table public.profiles add constraint profiles_tenant_id_fkey foreign key (tenant_id) references public.tenants(id) on delete set null;
  end if;
end $$;

-- ============================================================
-- Add tenant_id to all CRM tables
-- ============================================================
do $$
declare t text;
crm_tables text[] := array['companies','contacts','leads','deals','calls','tasks','notifications','whatsapp_conversations','whatsapp_messages','sms_conversations','sms_messages','emails','calendar_events','ai_suggestions','activity_timeline','documents','invoices','call_favorites','message_templates','customer_notes'];
begin
  foreach t in array crm_tables loop
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name=t and column_name='tenant_id') then
      execute format('alter table public.%I add column tenant_id uuid', t);
    end if;
  end loop;
end $$;

-- ============================================================
-- departments
-- ============================================================
create table if not exists public.departments (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references public.tenants(id) on delete cascade,
  name        text not null,
  description text,
  head_id     uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique(tenant_id, name)
);
alter table public.departments enable row level security;

drop policy if exists "dept_select" on public.departments;
create policy "dept_select" on public.departments for select to authenticated using (tenant_id = public.user_tenant_id() or public.is_super_admin());
drop policy if exists "dept_insert" on public.departments;
create policy "dept_insert" on public.departments for insert to authenticated with check (tenant_id = public.user_tenant_id() or public.is_super_admin());
drop policy if exists "dept_update" on public.departments;
create policy "dept_update" on public.departments for update to authenticated using (tenant_id = public.user_tenant_id() or public.is_super_admin()) with check (tenant_id = public.user_tenant_id() or public.is_super_admin());
drop policy if exists "dept_delete" on public.departments;
create policy "dept_delete" on public.departments for delete to authenticated using (tenant_id = public.user_tenant_id() or public.is_super_admin());

-- ============================================================
-- teams
-- ============================================================
create table if not exists public.teams (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references public.tenants(id) on delete cascade,
  department_id   uuid references public.departments(id) on delete set null,
  name            text not null,
  manager_id      uuid references public.profiles(id) on delete set null,
  team_leader_id  uuid references public.profiles(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique(tenant_id, name)
);
alter table public.teams enable row level security;

drop policy if exists "teams_select" on public.teams;
create policy "teams_select" on public.teams for select to authenticated using (tenant_id = public.user_tenant_id() or public.is_super_admin());
drop policy if exists "teams_insert" on public.teams;
create policy "teams_insert" on public.teams for insert to authenticated with check (tenant_id = public.user_tenant_id() or public.is_super_admin());
drop policy if exists "teams_update" on public.teams;
create policy "teams_update" on public.teams for update to authenticated using (tenant_id = public.user_tenant_id() or public.is_super_admin()) with check (tenant_id = public.user_tenant_id() or public.is_super_admin());
drop policy if exists "teams_delete" on public.teams;
create policy "teams_delete" on public.teams for delete to authenticated using (tenant_id = public.user_tenant_id() or public.is_super_admin());

-- ============================================================
-- team_members
-- ============================================================
create table if not exists public.team_members (
  id          uuid primary key default gen_random_uuid(),
  team_id     uuid not null references public.teams(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  role        text not null default 'member' check (role in ('member','leader','manager')),
  created_at  timestamptz not null default now(),
  unique(team_id, user_id)
);
alter table public.team_members enable row level security;

drop policy if exists "tm_select" on public.team_members;
create policy "tm_select" on public.team_members for select to authenticated using (exists(select 1 from public.teams where teams.id = team_members.team_id and (teams.tenant_id = public.user_tenant_id() or public.is_super_admin())));
drop policy if exists "tm_insert" on public.team_members;
create policy "tm_insert" on public.team_members for insert to authenticated with check (exists(select 1 from public.teams where teams.id = team_members.team_id and (teams.tenant_id = public.user_tenant_id() or public.is_super_admin())));
drop policy if exists "tm_update" on public.team_members;
create policy "tm_update" on public.team_members for update to authenticated using (exists(select 1 from public.teams where teams.id = team_members.team_id and (teams.tenant_id = public.user_tenant_id() or public.is_super_admin())));
drop policy if exists "tm_delete" on public.team_members;
create policy "tm_delete" on public.team_members for delete to authenticated using (exists(select 1 from public.teams where teams.id = team_members.team_id and (teams.tenant_id = public.user_tenant_id() or public.is_super_admin())));

-- ============================================================
-- audit_logs
-- ============================================================
create table if not exists public.audit_logs (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid references public.tenants(id) on delete cascade,
  user_id     uuid references public.profiles(id) on delete set null,
  user_name   text,
  user_role   text,
  action      text not null,
  entity_type text,
  entity_id   text,
  description text,
  ip_address  text,
  metadata    jsonb,
  created_at  timestamptz not null default now()
);
alter table public.audit_logs enable row level security;

drop policy if exists "audit_select" on public.audit_logs;
create policy "audit_select" on public.audit_logs for select to authenticated using (tenant_id = public.user_tenant_id() or public.is_super_admin());
drop policy if exists "audit_insert" on public.audit_logs;
create policy "audit_insert" on public.audit_logs for insert to authenticated with check (tenant_id = public.user_tenant_id() or tenant_id is null or public.is_super_admin());
drop policy if exists "audit_delete" on public.audit_logs;
create policy "audit_delete" on public.audit_logs for delete to authenticated using (public.is_super_admin());

-- ============================================================
-- subscription_plans
-- ============================================================
create table if not exists public.subscription_plans (
  id              uuid primary key default gen_random_uuid(),
  name            text not null unique,
  tier            text not null check (tier in ('free','starter','professional','enterprise')),
  price_monthly   numeric not null default 0,
  price_yearly    numeric not null default 0,
  max_users       int not null default 5,
  max_storage_mb  numeric not null default 500,
  features        jsonb not null default '{}',
  is_active       boolean not null default true,
  sort_order      int not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
alter table public.subscription_plans enable row level security;

drop policy if exists "plans_select" on public.subscription_plans;
create policy "plans_select" on public.subscription_plans for select to authenticated using (true);
drop policy if exists "plans_insert" on public.subscription_plans;
create policy "plans_insert" on public.subscription_plans for insert to authenticated with check (public.is_super_admin());
drop policy if exists "plans_update" on public.subscription_plans;
create policy "plans_update" on public.subscription_plans for update to authenticated using (public.is_super_admin()) with check (public.is_super_admin());
drop policy if exists "plans_delete" on public.subscription_plans;
create policy "plans_delete" on public.subscription_plans for delete to authenticated using (public.is_super_admin());

do $$
begin
  if not exists (select 1 from information_schema.table_constraints where constraint_name='tenants_plan_id_fkey' and table_name='tenants') then
    alter table public.tenants add constraint tenants_plan_id_fkey foreign key (plan_id) references public.subscription_plans(id) on delete set null;
  end if;
end $$;

-- ============================================================
-- tenant_subscriptions (billing history)
-- ============================================================
create table if not exists public.tenant_subscriptions (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references public.tenants(id) on delete cascade,
  plan_id         uuid not null references public.subscription_plans(id) on delete restrict,
  status          text not null default 'active' check (status in ('active','past_due','cancelled','trialing')),
  billing_cycle   text not null default 'monthly' check (billing_cycle in ('monthly','yearly')),
  amount          numeric not null default 0,
  started_at      timestamptz not null default now(),
  renews_at       timestamptz,
  created_at      timestamptz not null default now()
);
alter table public.tenant_subscriptions enable row level security;

drop policy if exists "sub_select" on public.tenant_subscriptions;
create policy "sub_select" on public.tenant_subscriptions for select to authenticated using (tenant_id = public.user_tenant_id() or public.is_super_admin());
drop policy if exists "sub_insert" on public.tenant_subscriptions;
create policy "sub_insert" on public.tenant_subscriptions for insert to authenticated with check (tenant_id = public.user_tenant_id() or public.is_super_admin());
drop policy if exists "sub_update" on public.tenant_subscriptions;
create policy "sub_update" on public.tenant_subscriptions for update to authenticated using (tenant_id = public.user_tenant_id() or public.is_super_admin()) with check (tenant_id = public.user_tenant_id() or public.is_super_admin());
drop policy if exists "sub_delete" on public.tenant_subscriptions;
create policy "sub_delete" on public.tenant_subscriptions for delete to authenticated using (public.is_super_admin());

-- ============================================================
-- feature_flags
-- ============================================================
create table if not exists public.feature_flags (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid references public.tenants(id) on delete cascade,
  key         text not null,
  label       text,
  description text,
  enabled     boolean not null default false,
  is_global   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique(tenant_id, key)
);
alter table public.feature_flags enable row level security;

drop policy if exists "flags_select" on public.feature_flags;
create policy "flags_select" on public.feature_flags for select to authenticated using (tenant_id = public.user_tenant_id() or is_global or public.is_super_admin());
drop policy if exists "flags_insert" on public.feature_flags;
create policy "flags_insert" on public.feature_flags for insert to authenticated with check (public.is_super_admin() or tenant_id = public.user_tenant_id());
drop policy if exists "flags_update" on public.feature_flags;
create policy "flags_update" on public.feature_flags for update to authenticated using (public.is_super_admin() or tenant_id = public.user_tenant_id()) with check (public.is_super_admin() or tenant_id = public.user_tenant_id());
drop policy if exists "flags_delete" on public.feature_flags;
create policy "flags_delete" on public.feature_flags for delete to authenticated using (public.is_super_admin());

-- ============================================================
-- invitations
-- ============================================================
create table if not exists public.invitations (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references public.tenants(id) on delete cascade,
  email       text not null,
  name        text,
  role        text not null default 'employee' check (role in ('company_admin','manager','team_leader','employee')),
  department_id uuid references public.departments(id) on delete set null,
  team_id     uuid references public.teams(id) on delete set null,
  token       text not null unique default gen_random_uuid()::text,
  invited_by  uuid references public.profiles(id) on delete set null,
  status      text not null default 'pending' check (status in ('pending','accepted','expired','revoked')),
  expires_at  timestamptz not null default (now() + interval '7 days'),
  created_at  timestamptz not null default now()
);
alter table public.invitations enable row level security;

drop policy if exists "inv_select" on public.invitations;
create policy "inv_select" on public.invitations for select to authenticated using (tenant_id = public.user_tenant_id() or public.is_super_admin());
drop policy if exists "inv_insert" on public.invitations;
create policy "inv_insert" on public.invitations for insert to authenticated with check (tenant_id = public.user_tenant_id() or public.is_super_admin());
drop policy if exists "inv_update" on public.invitations;
create policy "inv_update" on public.invitations for update to authenticated using (tenant_id = public.user_tenant_id() or public.is_super_admin()) with check (tenant_id = public.user_tenant_id() or public.is_super_admin());
drop policy if exists "inv_delete" on public.invitations;
create policy "inv_delete" on public.invitations for delete to authenticated using (tenant_id = public.user_tenant_id() or public.is_super_admin());

-- ============================================================
-- announcements
-- ============================================================
create table if not exists public.announcements (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  body        text not null,
  type        text not null default 'info' check (type in ('info','success','warning','error')),
  audience    text not null default 'all' check (audience in ('all','admins','managers','employees')),
  is_active   boolean not null default true,
  created_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
alter table public.announcements enable row level security;

drop policy if exists "ann_select" on public.announcements;
create policy "ann_select" on public.announcements for select to authenticated using (is_active);
drop policy if exists "ann_insert" on public.announcements;
create policy "ann_insert" on public.announcements for insert to authenticated with check (public.is_super_admin());
drop policy if exists "ann_update" on public.announcements;
create policy "ann_update" on public.announcements for update to authenticated using (public.is_super_admin()) with check (public.is_super_admin());
drop policy if exists "ann_delete" on public.announcements;
create policy "ann_delete" on public.announcements for delete to authenticated using (public.is_super_admin());

-- ============================================================
-- updated_at triggers for new tables
-- ============================================================
do $$
declare t text; new_tables text[] := array['tenants','departments','teams','subscription_plans','feature_flags','announcements'];
begin
  foreach t in array new_tables loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format('create trigger set_updated_at before update on public.%I for each row execute function public.touch_updated_at()', t);
  end loop;
end $$;

-- ============================================================
-- Indexes
-- ============================================================
create index if not exists idx_profiles_tenant on public.profiles(tenant_id);
create index if not exists idx_departments_tenant on public.departments(tenant_id);
create index if not exists idx_teams_tenant on public.teams(tenant_id);
create index if not exists idx_team_members_team on public.team_members(team_id);
create index if not exists idx_team_members_user on public.team_members(user_id);
create index if not exists idx_tenants_status on public.tenants(status);
create index if not exists idx_invitations_tenant on public.invitations(tenant_id);
create index if not exists idx_invitations_email on public.invitations(email);
create index if not exists idx_feature_flags_tenant on public.feature_flags(tenant_id);
create index if not exists idx_audit_tenant on public.audit_logs(tenant_id);
create index if not exists idx_audit_created on public.audit_logs(created_at desc);

do $$
declare t text; crm_tables text[] := array['companies','contacts','leads','deals','calls','tasks','notifications','whatsapp_conversations','sms_conversations','emails','calendar_events','documents','invoices','activity_timeline'];
begin
  foreach t in array crm_tables loop
    execute format('create index if not exists idx_%I_tenant on public.%I(tenant_id)', t, t);
  end loop;
end $$;

-- ============================================================
-- Audit log helper
-- ============================================================
create or replace function public.log_audit(p_action text, p_entity_type text default null, p_entity_id text default null, p_description text default null, p_metadata jsonb default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare log_id uuid; p_tenant_id uuid; p_user_name text; p_user_role text;
begin
  select tenant_id, name, role into p_tenant_id, p_user_name, p_user_role from public.profiles where id = auth.uid();
  insert into public.audit_logs (tenant_id, user_id, user_name, user_role, action, entity_type, entity_id, description, metadata)
  values (p_tenant_id, auth.uid(), p_user_name, p_user_role, p_action, p_entity_type, p_entity_id, p_description, p_metadata)
  returning id into log_id;
  return log_id;
end;
$$;
