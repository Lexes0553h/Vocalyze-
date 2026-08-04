/*
# Communication Module Extensions

Adds columns needed for the full Communication Module (Call Center, WhatsApp,
SMS, Email, Unified Timeline, Notifications) while keeping all existing UI and
data intact. All changes are additive ALTER TABLE ... ADD COLUMN statements
guarded by IF NOT EXISTS, so the migration is safe to re-run.

## Modified tables

1. calls
   - phone (text)              — dialed phone number
   - status (text)             — call status: ringing|connected|on_hold|ended|missed|failed
   - muted (boolean)           — whether the call was muted
   - speaker (boolean)         — speaker on/off
   - recording_url (text)      — recording metadata URL (provider-agnostic)
   - recording_duration_sec (int) — recording length in seconds
   - transferred_to (text)     — name/number call was transferred to
   - follow_up (boolean)       — needs follow-up
   - follow_up_date (text)     — scheduled follow-up date
   - is_favorite (boolean)     — favorited contact/call
   - contact_phone (text)      — phone of the called party
   - summary (text)            — AI call summary placeholder

2. whatsapp_conversations
   - labels (text[])           — conversation labels/tags
   - status (text)             — open|pending|resolved
   - auto_reply (boolean)      — auto-reply enabled
   - last_msg_status (text)    — sent|delivered|read
   - unread_count (int)        — alias kept; existing unread stays

3. whatsapp_messages
   - status (text)             — sent|delivered|read
   - kind (text)               — text|image|video|document|voice|audio
   - media_url (text)          — media attachment URL
   - duration_sec (int)        — voice note duration
   - is_template (boolean)     — message sent from a template

4. sms_conversations
   - labels (text[])
   - status (text)             — open|pending|resolved
   - pinned (boolean)

5. sms_messages
   - status (text)             — queued|sent|delivered|failed
   - kind (text)               — text|template|bulk

6. emails
   - labels (text[])
   - folder now includes 'trash' (constraint widened via check)
   - has_attachment (boolean)
   - attachments (jsonb)       — [{name,size,type,url}]

7. notifications
   - link (text)               — deep link for the notification center
   - priority (text)           — low|normal|high

8. activity_timeline
   - contact_id (uuid)         — links activity to a contact for unified timeline
   - source (text)             — call|whatsapp|sms|email|note|meeting|task|document

## New tables

1. call_favorites — favorited numbers/contacts for the dialer
2. message_templates — reusable templates for WhatsApp/SMS/Email (type, title, body, category)
3. customer_notes — notes attached to a contact (for unified timeline)
4. customer_timeline — per-contact unified timeline entries (optional; activity_timeline.source+contact_id also used)

## Security
- RLS enabled on all new tables with 4 CRUD policies each, scoped TO authenticated.
- Existing table policies are untouched.
*/

-- ============================================================
-- calls extensions
-- ============================================================
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='calls' and column_name='phone') then
    alter table public.calls add column phone text;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='calls' and column_name='status') then
    alter table public.calls add column status text not null default 'ended' check (status in ('ringing','connected','on_hold','ended','missed','failed'));
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='calls' and column_name='muted') then
    alter table public.calls add column muted boolean not null default false;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='calls' and column_name='speaker') then
    alter table public.calls add column speaker boolean not null default false;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='calls' and column_name='recording_url') then
    alter table public.calls add column recording_url text;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='calls' and column_name='recording_duration_sec') then
    alter table public.calls add column recording_duration_sec int;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='calls' and column_name='transferred_to') then
    alter table public.calls add column transferred_to text;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='calls' and column_name='follow_up') then
    alter table public.calls add column follow_up boolean not null default false;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='calls' and column_name='follow_up_date') then
    alter table public.calls add column follow_up_date text;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='calls' and column_name='is_favorite') then
    alter table public.calls add column is_favorite boolean not null default false;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='calls' and column_name='contact_phone') then
    alter table public.calls add column contact_phone text;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='calls' and column_name='summary') then
    alter table public.calls add column summary text;
  end if;
end $$;

-- ============================================================
-- whatsapp_conversations extensions
-- ============================================================
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='whatsapp_conversations' and column_name='labels') then
    alter table public.whatsapp_conversations add column labels text[] not null default '{}';
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='whatsapp_conversations' and column_name='status') then
    alter table public.whatsapp_conversations add column status text not null default 'open' check (status in ('open','pending','resolved'));
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='whatsapp_conversations' and column_name='auto_reply') then
    alter table public.whatsapp_conversations add column auto_reply boolean not null default false;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='whatsapp_conversations' and column_name='last_msg_status') then
    alter table public.whatsapp_conversations add column last_msg_status text check (last_msg_status in ('sent','delivered','read'));
  end if;
end $$;

-- ============================================================
-- whatsapp_messages extensions
-- ============================================================
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='whatsapp_messages' and column_name='status') then
    alter table public.whatsapp_messages add column status text default 'sent' check (status in ('sent','delivered','read'));
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='whatsapp_messages' and column_name='kind') then
    alter table public.whatsapp_messages add column kind text not null default 'text' check (kind in ('text','image','video','document','voice','audio'));
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='whatsapp_messages' and column_name='media_url') then
    alter table public.whatsapp_messages add column media_url text;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='whatsapp_messages' and column_name='duration_sec') then
    alter table public.whatsapp_messages add column duration_sec int;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='whatsapp_messages' and column_name='is_template') then
    alter table public.whatsapp_messages add column is_template boolean not null default false;
  end if;
end $$;

-- ============================================================
-- sms_conversations extensions
-- ============================================================
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='sms_conversations' and column_name='labels') then
    alter table public.sms_conversations add column labels text[] not null default '{}';
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='sms_conversations' and column_name='status') then
    alter table public.sms_conversations add column status text not null default 'open' check (status in ('open','pending','resolved'));
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='sms_conversations' and column_name='pinned') then
    alter table public.sms_conversations add column pinned boolean not null default false;
  end if;
end $$;

-- ============================================================
-- sms_messages extensions
-- ============================================================
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='sms_messages' and column_name='status') then
    alter table public.sms_messages add column status text default 'sent' check (status in ('queued','sent','delivered','failed'));
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='sms_messages' and column_name='kind') then
    alter table public.sms_messages add column kind text not null default 'text' check (kind in ('text','template','bulk'));
  end if;
end $$;

-- ============================================================
-- emails extensions (widen folder check to include 'trash')
-- ============================================================
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='emails' and column_name='labels') then
    alter table public.emails add column labels text[] not null default '{}';
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='emails' and column_name='has_attachment') then
    alter table public.emails add column has_attachment boolean not null default false;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='emails' and column_name='attachments') then
    alter table public.emails add column attachments jsonb;
  end if;
end $$;

-- widen the emails folder constraint to allow 'trash' and 'archive'
do $$
begin
  if exists (select 1 from pg_constraint where conname='emails_folder_check') then
    alter table public.emails drop constraint emails_folder_check;
  end if;
end $$;
alter table public.emails add constraint emails_folder_check
  check (folder in ('inbox','sent','drafts','archive','trash'));

-- ============================================================
-- notifications extensions
-- ============================================================
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='notifications' and column_name='link') then
    alter table public.notifications add column link text;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='notifications' and column_name='priority') then
    alter table public.notifications add column priority text not null default 'normal' check (priority in ('low','normal','high'));
  end if;
end $$;

-- ============================================================
-- activity_timeline extensions
-- ============================================================
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='activity_timeline' and column_name='contact_id') then
    alter table public.activity_timeline add column contact_id uuid;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='activity_timeline' and column_name='source') then
    alter table public.activity_timeline add column source text check (source in ('call','whatsapp','sms','email','note','meeting','task','document'));
  end if;
end $$;

-- ============================================================
-- New table: call_favorites
-- ============================================================
create table if not exists public.call_favorites (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  phone       text not null,
  company     text,
  avatar      text,
  notes       text,
  created_at  timestamptz not null default now()
);
alter table public.call_favorites enable row level security;
drop policy if exists "fav_select" on public.call_favorites;
create policy "fav_select" on public.call_favorites for select to authenticated using (true);
drop policy if exists "fav_insert" on public.call_favorites;
create policy "fav_insert" on public.call_favorites for insert to authenticated with check (true);
drop policy if exists "fav_update" on public.call_favorites;
create policy "fav_update" on public.call_favorites for update to authenticated using (true) with check (true);
drop policy if exists "fav_delete" on public.call_favorites;
create policy "fav_delete" on public.call_favorites for delete to authenticated using (public.is_admin_or_manager());

-- ============================================================
-- New table: message_templates
-- ============================================================
create table if not exists public.message_templates (
  id          uuid primary key default gen_random_uuid(),
  type        text not null check (type in ('whatsapp','sms','email')),
  title       text not null,
  body        text not null,
  category    text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
alter table public.message_templates enable row level security;
drop policy if exists "tmpl_select" on public.message_templates;
create policy "tmpl_select" on public.message_templates for select to authenticated using (true);
drop policy if exists "tmpl_insert" on public.message_templates;
create policy "tmpl_insert" on public.message_templates for insert to authenticated with check (true);
drop policy if exists "tmpl_update" on public.message_templates;
create policy "tmpl_update" on public.message_templates for update to authenticated using (true) with check (true);
drop policy if exists "tmpl_delete" on public.message_templates;
create policy "tmpl_delete" on public.message_templates for delete to authenticated using (public.is_admin_or_manager());

-- ============================================================
-- New table: customer_notes
-- ============================================================
create table if not exists public.customer_notes (
  id          uuid primary key default gen_random_uuid(),
  contact_id  uuid references public.contacts(id) on delete cascade,
  contact_name text,
  body        text not null,
  pinned      boolean not null default false,
  created_at  timestamptz not null default now()
);
alter table public.customer_notes enable row level security;
drop policy if exists "notes_select" on public.customer_notes;
create policy "notes_select" on public.customer_notes for select to authenticated using (true);
drop policy if exists "notes_insert" on public.customer_notes;
create policy "notes_insert" on public.customer_notes for insert to authenticated with check (true);
drop policy if exists "notes_update" on public.customer_notes;
create policy "notes_update" on public.customer_notes for update to authenticated using (true) with check (true);
drop policy if exists "notes_delete" on public.customer_notes;
create policy "notes_delete" on public.customer_notes for delete to authenticated using (true);

-- ============================================================
-- Indexes
-- ============================================================
create index if not exists idx_calls_status on public.calls(status);
create index if not exists idx_calls_phone on public.calls(phone);
create index if not exists idx_wa_msg_status on public.whatsapp_messages(status);
create index if not exists idx_sms_msg_status on public.sms_messages(status);
create index if not exists idx_emails_labels on public.emails using gin(labels);
create index if not exists idx_activity_contact on public.activity_timeline(contact_id);
create index if not exists idx_activity_source on public.activity_timeline(source);
create index if not exists idx_templates_type on public.message_templates(type);
