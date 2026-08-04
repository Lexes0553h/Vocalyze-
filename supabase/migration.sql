-- Vocalyze CRM Production Migration for Supabase
-- Target DB: PostgreSQL 15+ (Supabase)
-- Strict Tenant-Isolated Row Level Security (RLS) & Production-Ready Schema

-- 1. EXTENSIONS & UTILITY FUNCTIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Function for automatically updating updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. TENANTS TABLE (Organizations / Companies)
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    logo TEXT,
    industry TEXT,
    website TEXT,
    location TEXT,
    brand_color TEXT DEFAULT '#0F5C4A',
    timezone TEXT DEFAULT 'UTC',
    currency TEXT DEFAULT 'USD',
    working_days TEXT[] DEFAULT ARRAY['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    working_hours TEXT DEFAULT '09:00-18:00',
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'trial', 'cancelled')),
    plan_id TEXT DEFAULT 'growth_pro',
    max_users INT DEFAULT 50,
    storage_used_mb INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PROFILES TABLE (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'employee' CHECK (role IN ('super_admin', 'company_admin', 'manager', 'team_leader', 'employee', 'admin', 'agent')),
    avatar TEXT,
    status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'away', 'offline')),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
    department_id UUID,
    team_id UUID,
    title TEXT,
    phone TEXT,
    last_login TIMESTAMPTZ,
    disabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. HELPER FUNCTION FOR RLS (Security Definer to read user tenant)
CREATE OR REPLACE FUNCTION public.get_auth_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 5. DEPARTMENTS & TEAMS
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    head_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    manager_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    team_leader_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CRM COMPANIES
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    logo TEXT,
    industry TEXT,
    website TEXT,
    employees INT DEFAULT 0,
    revenue TEXT,
    location TEXT,
    deals INT DEFAULT 0,
    deal_value NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'Prospect' CHECK (status IN ('Active', 'Prospect', 'Churned')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. CRM CONTACTS
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
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    last_seen TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. CRM LEADS
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
    company TEXT,
    email TEXT,
    phone TEXT,
    status TEXT DEFAULT 'New' CHECK (status IN ('New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost')),
    priority TEXT DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent')),
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    agent TEXT,
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    avatar TEXT,
    value NUMERIC DEFAULT 0,
    source TEXT,
    last_contact TIMESTAMPTZ,
    notes TEXT,
    role TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. DEALS / PIPELINE
CREATE TABLE IF NOT EXISTS public.deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
    company TEXT,
    contact TEXT,
    value NUMERIC DEFAULT 0,
    stage TEXT DEFAULT 'Lead' CHECK (stage IN ('Lead', 'Qualified', 'Proposal', 'Negotiation', 'Closed')),
    probability INT DEFAULT 20,
    agent TEXT,
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    expected_close TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. CALL HISTORY & LOGS
CREATE TABLE IF NOT EXISTS public.calls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    contact TEXT NOT NULL,
    company TEXT,
    agent TEXT,
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    direction TEXT DEFAULT 'outbound' CHECK (direction IN ('inbound', 'outbound', 'missed')),
    duration TEXT DEFAULT '0s',
    call_time TEXT,
    call_date TIMESTAMPTZ DEFAULT NOW(),
    disposition TEXT,
    recording BOOLEAN DEFAULT FALSE,
    recording_url TEXT,
    recording_duration_sec INT DEFAULT 0,
    notes TEXT,
    phone TEXT,
    status TEXT DEFAULT 'ended' CHECK (status IN ('ringing', 'connected', 'on_hold', 'ended', 'missed', 'failed')),
    muted BOOLEAN DEFAULT FALSE,
    speaker BOOLEAN DEFAULT FALSE,
    transferred_to TEXT,
    follow_up BOOLEAN DEFAULT FALSE,
    follow_up_date TIMESTAMPTZ,
    is_favorite BOOLEAN DEFAULT FALSE,
    summary TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. TASKS
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent')),
    status TEXT DEFAULT 'Backlog' CHECK (status IN ('Backlog', 'In Progress', 'Review', 'Done')),
    assignee TEXT,
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    due_date TIMESTAMPTZ,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT DEFAULT 'system',
    title TEXT NOT NULL,
    description TEXT,
    time TEXT,
    read BOOLEAN DEFAULT FALSE,
    link TEXT,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. WHATSAPP & COMMUNICATION MESSAGES
CREATE TABLE IF NOT EXISTS public.whatsapp_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    company TEXT,
    avatar TEXT,
    last_msg TEXT,
    last_time TIMESTAMPTZ DEFAULT NOW(),
    unread INT DEFAULT 0,
    pinned BOOLEAN DEFAULT FALSE,
    online BOOLEAN DEFAULT FALSE,
    labels TEXT[] DEFAULT ARRAY[]::TEXT[],
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'pending', 'resolved')),
    auto_reply BOOLEAN DEFAULT FALSE,
    last_msg_status TEXT CHECK (last_msg_status IN ('sent', 'delivered', 'read')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES public.whatsapp_conversations(id) ON DELETE CASCADE,
    from_me BOOLEAN DEFAULT TRUE,
    text TEXT NOT NULL,
    msg_time TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read')),
    kind TEXT DEFAULT 'text' CHECK (kind IN ('text', 'image', 'video', 'document', 'voice', 'audio')),
    media_url TEXT,
    duration_sec INT,
    is_template BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. INVITATIONS SYSTEM
CREATE TABLE IF NOT EXISTS public.invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT,
    role TEXT NOT NULL DEFAULT 'employee' CHECK (role IN ('company_admin', 'manager', 'team_leader', 'employee')),
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    token TEXT UNIQUE NOT NULL,
    invited_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. AUDIT LOGS
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
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. AUTOMATIC PROFILE CREATION TRIGGER FOR AUTH.USERS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_name TEXT;
    user_role TEXT;
    target_tenant_id UUID;
BEGIN
    user_name := COALESCE(NEW.raw_user_meta_data->>'name', SPLIT_PART(NEW.email, '@', 1));
    user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'employee');
    
    IF (NEW.raw_user_meta_data->>'tenant_id') IS NOT NULL THEN
        target_tenant_id := (NEW.raw_user_meta_data->>'tenant_id')::UUID;
    ELSE
        target_tenant_id := NULL;
    END IF;

    INSERT INTO public.profiles (id, name, role, avatar, tenant_id, disabled)
    VALUES (
        NEW.id,
        user_name,
        user_role,
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
        target_tenant_id,
        FALSE
    )
    ON CONFLICT (id) DO UPDATE
    SET name = EXCLUDED.name,
        tenant_id = COALESCE(public.profiles.tenant_id, EXCLUDED.tenant_id),
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger attached to Supabase Auth
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 17. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_profiles_tenant_id ON public.profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_companies_tenant_id ON public.companies(tenant_id);
CREATE INDEX IF NOT EXISTS idx_contacts_tenant_id ON public.contacts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_leads_tenant_id ON public.leads(tenant_id);
CREATE INDEX IF NOT EXISTS idx_deals_tenant_id ON public.deals(tenant_id);
CREATE INDEX IF NOT EXISTS idx_calls_tenant_id ON public.calls(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tasks_tenant_id ON public.tasks(tenant_id);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON public.invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON public.invitations(email);

-- 18. SECURE TENANT-ISOLATED ROW LEVEL SECURITY (RLS)
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Tenants Policies
DROP POLICY IF EXISTS "Select Tenant for Authenticated Users" ON public.tenants;
CREATE POLICY "Select Tenant for Authenticated Users" ON public.tenants
    FOR SELECT USING (id = public.get_auth_tenant_id() OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Update Tenant for Admin Users" ON public.tenants;
CREATE POLICY "Update Tenant for Admin Users" ON public.tenants
    FOR UPDATE USING (id = public.get_auth_tenant_id()) WITH CHECK (id = public.get_auth_tenant_id());

DROP POLICY IF EXISTS "Insert Tenants for Company Registration" ON public.tenants;
CREATE POLICY "Insert Tenants for Company Registration" ON public.tenants
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Profiles Policies
DROP POLICY IF EXISTS "Select Profiles in Same Tenant" ON public.profiles;
CREATE POLICY "Select Profiles in Same Tenant" ON public.profiles
    FOR SELECT USING (id = auth.uid() OR tenant_id = public.get_auth_tenant_id());

DROP POLICY IF EXISTS "Insert Own Profile" ON public.profiles;
CREATE POLICY "Insert Own Profile" ON public.profiles
    FOR INSERT WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Update Own Profile or Tenant Admin" ON public.profiles;
CREATE POLICY "Update Own Profile or Tenant Admin" ON public.profiles
    FOR UPDATE USING (id = auth.uid() OR tenant_id = public.get_auth_tenant_id());

-- Departments & Teams Policies
DROP POLICY IF EXISTS "Tenant Departments Policy" ON public.departments;
CREATE POLICY "Tenant Departments Policy" ON public.departments
    FOR ALL USING (tenant_id = public.get_auth_tenant_id()) WITH CHECK (tenant_id = public.get_auth_tenant_id());

DROP POLICY IF EXISTS "Tenant Teams Policy" ON public.teams;
CREATE POLICY "Tenant Teams Policy" ON public.teams
    FOR ALL USING (tenant_id = public.get_auth_tenant_id()) WITH CHECK (tenant_id = public.get_auth_tenant_id());

-- Workspace Entities Policies
DROP POLICY IF EXISTS "Tenant Companies Policy" ON public.companies;
CREATE POLICY "Tenant Companies Policy" ON public.companies
    FOR ALL USING (tenant_id = public.get_auth_tenant_id()) WITH CHECK (tenant_id = public.get_auth_tenant_id());

DROP POLICY IF EXISTS "Tenant Contacts Policy" ON public.contacts;
CREATE POLICY "Tenant Contacts Policy" ON public.contacts
    FOR ALL USING (tenant_id = public.get_auth_tenant_id()) WITH CHECK (tenant_id = public.get_auth_tenant_id());

DROP POLICY IF EXISTS "Tenant Leads Policy" ON public.leads;
CREATE POLICY "Tenant Leads Policy" ON public.leads
    FOR ALL USING (tenant_id = public.get_auth_tenant_id()) WITH CHECK (tenant_id = public.get_auth_tenant_id());

DROP POLICY IF EXISTS "Tenant Deals Policy" ON public.deals;
CREATE POLICY "Tenant Deals Policy" ON public.deals
    FOR ALL USING (tenant_id = public.get_auth_tenant_id()) WITH CHECK (tenant_id = public.get_auth_tenant_id());

DROP POLICY IF EXISTS "Tenant Calls Policy" ON public.calls;
CREATE POLICY "Tenant Calls Policy" ON public.calls
    FOR ALL USING (tenant_id = public.get_auth_tenant_id()) WITH CHECK (tenant_id = public.get_auth_tenant_id());

DROP POLICY IF EXISTS "Tenant Tasks Policy" ON public.tasks;
CREATE POLICY "Tenant Tasks Policy" ON public.tasks
    FOR ALL USING (tenant_id = public.get_auth_tenant_id()) WITH CHECK (tenant_id = public.get_auth_tenant_id());

DROP POLICY IF EXISTS "User Notifications Policy" ON public.notifications;
CREATE POLICY "User Notifications Policy" ON public.notifications
    FOR ALL USING (user_id = auth.uid() OR tenant_id = public.get_auth_tenant_id()) WITH CHECK (user_id = auth.uid() OR tenant_id = public.get_auth_tenant_id());

DROP POLICY IF EXISTS "Tenant WhatsApp Conversations Policy" ON public.whatsapp_conversations;
CREATE POLICY "Tenant WhatsApp Conversations Policy" ON public.whatsapp_conversations
    FOR ALL USING (tenant_id = public.get_auth_tenant_id()) WITH CHECK (tenant_id = public.get_auth_tenant_id());

DROP POLICY IF EXISTS "Tenant WhatsApp Messages Policy" ON public.whatsapp_messages;
CREATE POLICY "Tenant WhatsApp Messages Policy" ON public.whatsapp_messages
    FOR ALL USING (tenant_id = public.get_auth_tenant_id()) WITH CHECK (tenant_id = public.get_auth_tenant_id());

DROP POLICY IF EXISTS "Tenant Invitations Policy" ON public.invitations;
CREATE POLICY "Tenant Invitations Policy" ON public.invitations
    FOR ALL USING (tenant_id = public.get_auth_tenant_id()) WITH CHECK (tenant_id = public.get_auth_tenant_id());

DROP POLICY IF EXISTS "Tenant Audit Logs Policy" ON public.audit_logs;
CREATE POLICY "Tenant Audit Logs Policy" ON public.audit_logs
    FOR ALL USING (tenant_id = public.get_auth_tenant_id()) WITH CHECK (tenant_id = public.get_auth_tenant_id());

-- 19. SUPABASE STORAGE BUCKETS & POLICIES
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('avatars', 'avatars', true),
    ('logos', 'logos', true),
    ('recordings', 'recordings', true),
    ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
DROP POLICY IF EXISTS "Authenticated Storage Read" ON storage.objects;
CREATE POLICY "Authenticated Storage Read" ON storage.objects FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated Storage Insert" ON storage.objects;
CREATE POLICY "Authenticated Storage Insert" ON storage.objects FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated Storage Update" ON storage.objects;
CREATE POLICY "Authenticated Storage Update" ON storage.objects FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated Storage Delete" ON storage.objects;
CREATE POLICY "Authenticated Storage Delete" ON storage.objects FOR DELETE USING (auth.role() = 'authenticated');
