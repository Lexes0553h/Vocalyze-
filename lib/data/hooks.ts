'use client';

import { useSupabaseQueryWithDefault } from './use-supabase-query';
import { createBrowserClient } from '@/lib/supabase/client';
import {
  mapLead, mapContact, mapCompany, mapCall, mapDeal, mapTask,
  mapNotification, mapWhatsappConv, mapWhatsappMsg, mapSmsConv,
  mapEmail, mapCalendarEvent, mapAiSuggestion, mapAiChatMessage,
  mapActivity, mapDocument, mapInvoice,
} from './mappers';
import type { MessageTemplate } from './derived-hooks';
import type {
  Lead, Contact, Company, Call, Deal, Task, Notification,
} from '@/lib/crm-data';
import type {
  WhatsappConversation, WhatsappMessage, SmsConversation, Email,
  CalendarEvent, AiSuggestion, AiChatMessage, ActivityItem,
  DocumentItem, Invoice,
} from './mappers';

export function useLeads() {
  return useSupabaseQueryWithDefault<Lead[]>(async (c) => {
    const { data, error } = await c.from('leads').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapLead);
  }, []);
}

export function useContacts() {
  return useSupabaseQueryWithDefault<Contact[]>(async (c) => {
    const { data, error } = await c.from('contacts').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapContact);
  }, []);
}

export function useCompanies() {
  return useSupabaseQueryWithDefault<Company[]>(async (c) => {
    const { data, error } = await c.from('companies').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapCompany);
  }, []);
}

export function useCalls() {
  return useSupabaseQueryWithDefault<Call[]>(async (c) => {
    const { data, error } = await c.from('calls').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapCall);
  }, []);
}

export function useDeals() {
  return useSupabaseQueryWithDefault<Deal[]>(async (c) => {
    const { data, error } = await c.from('deals').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapDeal);
  }, []);
}

export function useTasks() {
  return useSupabaseQueryWithDefault<Task[]>(async (c) => {
    const { data, error } = await c.from('tasks').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapTask);
  }, []);
}

export function useNotifications() {
  return useSupabaseQueryWithDefault<Notification[]>(async (c) => {
    const { data, error } = await c.from('notifications').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapNotification);
  }, []);
}

export function useWhatsappConversations() {
  return useSupabaseQueryWithDefault<WhatsappConversation[]>(async (c) => {
    const { data, error } = await c.from('whatsapp_conversations').select('*').order('pinned', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapWhatsappConv);
  }, []);
}

export function useWhatsappMessages(conversationId: string | null) {
  return useSupabaseQueryWithDefault<WhatsappMessage[]>(async (c) => {
    if (!conversationId) return [];
    const { data, error } = await c.from('whatsapp_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data ?? []).map(mapWhatsappMsg);
  }, [], [conversationId]);
}

export function useSmsConversations() {
  return useSupabaseQueryWithDefault<SmsConversation[]>(async (c) => {
    const { data, error } = await c.from('sms_conversations').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapSmsConv);
  }, []);
}

export function useEmails(folder?: string) {
  return useSupabaseQueryWithDefault<Email[]>(async (c) => {
    let q = c.from('emails').select('*').order('created_at', { ascending: false });
    if (folder) q = q.eq('folder', folder);
    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []).map(mapEmail);
  }, [], [folder]);
}

export function useCalendarEvents() {
  return useSupabaseQueryWithDefault<CalendarEvent[]>(async (c) => {
    const { data, error } = await c.from('calendar_events').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapCalendarEvent);
  }, []);
}

export function useAiSuggestions() {
  return useSupabaseQueryWithDefault<AiSuggestion[]>(async (c) => {
    const { data, error } = await c.from('ai_suggestions').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapAiSuggestion);
  }, []);
}

export function useAiChat() {
  return useSupabaseQueryWithDefault<AiChatMessage[]>(async (c) => {
    const { data, error } = await c.from('ai_chat_messages').select('*').order('created_at', { ascending: true });
    if (error) throw error;
    return (data ?? []).map(mapAiChatMessage);
  }, []);
}

export function useActivity() {
  return useSupabaseQueryWithDefault<ActivityItem[]>(async (c) => {
    const { data, error } = await c.from('activity_timeline').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapActivity);
  }, []);
}

export function useDocuments() {
  return useSupabaseQueryWithDefault<DocumentItem[]>(async (c) => {
    const { data, error } = await c.from('documents').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapDocument);
  }, []);
}

export function useInvoices() {
  return useSupabaseQueryWithDefault<Invoice[]>(async (c) => {
    const { data, error } = await c.from('invoices').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapInvoice);
  }, []);
}

export { createBrowserClient };

type SmsMessageRow = {
  id: string;
  conversation_id: string;
  from_me: boolean;
  text: string;
  msg_time: string | null;
  status: 'queued' | 'sent' | 'delivered' | 'failed' | null;
  kind: 'text' | 'template' | 'bulk';
};

export interface SmsMessage {
  id: string;
  fromMe: boolean;
  text: string;
  time: string;
  status: 'queued' | 'sent' | 'delivered' | 'failed' | null;
  kind: 'text' | 'template' | 'bulk';
}

export function useSmsMessages(conversationId: string | null) {
  return useSupabaseQueryWithDefault<SmsMessage[]>(async (c) => {
    if (!conversationId) return [];
    const { data, error } = await c.from('sms_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data ?? []).map((r: SmsMessageRow) => ({
      id: r.id,
      fromMe: r.from_me,
      text: r.text,
      time: r.msg_time ?? '',
      status: r.status ?? null,
      kind: r.kind,
    }));
  }, [], [conversationId]);
}

export function useCallFavorites() {
  return useSupabaseQueryWithDefault<{ id: string; name: string; phone: string; company: string; avatar: string; notes: string }[]>(async (c) => {
    const { data, error } = await c.from('call_favorites').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((r: { id: string; name: string; phone: string; company: string | null; avatar: string | null; notes: string | null }) => ({
      id: r.id,
      name: r.name,
      phone: r.phone,
      company: r.company ?? '',
      avatar: r.avatar ?? '',
      notes: r.notes ?? '',
    }));
  }, []);
}

export function useMessageTemplates(type?: 'whatsapp' | 'sms' | 'email') {
  return useSupabaseQueryWithDefault<MessageTemplate[]>(async (c) => {
    let q = c.from('message_templates').select('*').order('created_at', { ascending: false });
    if (type) q = q.eq('type', type);
    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []).map((r: { id: string; type: string; title: string; body: string; category: string | null }) => ({
      id: r.id,
      type: r.type as 'whatsapp' | 'sms' | 'email',
      title: r.title,
      body: r.body,
      category: r.category ?? '',
    }));
  }, [], [type]);
}

export function useCustomerNotes(contactId: string | null) {
  return useSupabaseQueryWithDefault<{ id: string; body: string; pinned: boolean; time: string }[]>(async (c) => {
    if (!contactId) return [];
    const { data, error } = await c.from('customer_notes')
      .select('*')
      .eq('contact_id', contactId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((r: { id: string; body: string; pinned: boolean; created_at: string }) => ({
      id: r.id,
      body: r.body,
      pinned: r.pinned,
      time: r.created_at,
    }));
  }, [], [contactId]);
}
