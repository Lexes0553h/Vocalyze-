/*
# Enterprise RBAC — Step 1: profiles column expansion + role constraint widening

Adds tenant_id, department_id, team_id, title, last_login, disabled, phone columns
to profiles, and widens the role check to accept new enterprise roles.
This is a prerequisite for all subsequent enterprise migrations.
*/

do $$
begin
  if exists (select 1 from pg_constraint where conname='profiles_role_check') then
    alter table public.profiles drop constraint profiles_role_check;
  end if;
end $$;
alter table public.profiles add constraint profiles_role_check
  check (role in ('super_admin','company_admin','manager','team_leader','employee','admin','agent'));

do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='profiles' and column_name='tenant_id') then
    alter table public.profiles add column tenant_id uuid;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='profiles' and column_name='department_id') then
    alter table public.profiles add column department_id uuid;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='profiles' and column_name='team_id') then
    alter table public.profiles add column team_id uuid;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='profiles' and column_name='title') then
    alter table public.profiles add column title text;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='profiles' and column_name='last_login') then
    alter table public.profiles add column last_login timestamptz;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='profiles' and column_name='disabled') then
    alter table public.profiles add column disabled boolean not null default false;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='profiles' and column_name='phone') then
    alter table public.profiles add column phone text;
  end if;
end $$;
