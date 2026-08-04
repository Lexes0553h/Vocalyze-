/*
# Enterprise RBAC — Step 2: helper functions

Defines user_tenant_id(), is_super_admin(), is_company_admin(), is_manager_or_above().
These are used by RLS policies in subsequent steps.
*/

create or replace function public.user_tenant_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select tenant_id from public.profiles where id = auth.uid();
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.user_role() = 'super_admin', false);
$$;

create or replace function public.is_company_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.user_role() in ('company_admin','admin'), false);
$$;

create or replace function public.is_manager_or_above()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    public.is_super_admin() or
    public.is_company_admin() or
    public.user_role() in ('manager','team_leader'),
    false
  );
$$;
