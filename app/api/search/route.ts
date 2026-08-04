import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, unauthorized } from '@/lib/server/middleware';

export async function GET(req: NextRequest) {
  const ctx = await requireAuth(req);
  if (!ctx.isAuthenticated) return unauthorized();
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim().toLowerCase();
  if (!q || q.length < 1) return NextResponse.json({ results: [] });

  const c = ctx.client;
  const like = `%${q}%`;

  const [leads, contacts, companies, calls, wa, sms, emails, tasks] = await Promise.all([
    c.from('leads').select('id,name,company,email,phone,status').or(`name.ilike.${like},company.ilike.${like},email.ilike.${like}`).limit(5),
    c.from('contacts').select('id,name,email,phone,company').or(`name.ilike.${like},email.ilike.${like},company.ilike.${like}`).limit(5),
    c.from('companies').select('id,name,industry,location').or(`name.ilike.${like},industry.ilike.${like}`).limit(5),
    c.from('calls').select('id,contact,company,direction,call_date').or(`contact.ilike.${like},company.ilike.${like}`).limit(5),
    c.from('whatsapp_conversations').select('id,name,company,last_msg').or(`name.ilike.${like},company.ilike.${like},last_msg.ilike.${like}`).limit(5),
    c.from('sms_conversations').select('id,name,company,phone,last_msg').or(`name.ilike.${like},phone.ilike.${like}`).limit(5),
    c.from('emails').select('id,from_name,subject,preview').or(`from_name.ilike.${like},subject.ilike.${like}`).limit(5),
    c.from('tasks').select('id,title,description,status').or(`title.ilike.${like},description.ilike.${like}`).limit(5),
  ]);

  const results = [
    ...(leads.data ?? []).map((r: Record<string, string>) => ({ type: 'Lead', id: r.id, title: r.name, subtitle: r.company || r.email || '', href: '/app/leads' })),
    ...(contacts.data ?? []).map((r: Record<string, string>) => ({ type: 'Contact', id: r.id, title: r.name, subtitle: r.email || r.phone || '', href: '/app/contacts' })),
    ...(companies.data ?? []).map((r: Record<string, string>) => ({ type: 'Company', id: r.id, title: r.name, subtitle: r.industry || r.location || '', href: '/app/companies' })),
    ...(calls.data ?? []).map((r: Record<string, string>) => ({ type: 'Call', id: r.id, title: r.contact, subtitle: `${r.company} • ${r.direction}`, href: '/app/call-history' })),
    ...(wa.data ?? []).map((r: Record<string, string>) => ({ type: 'WhatsApp', id: r.id, title: r.name, subtitle: r.last_msg || r.company || '', href: '/app/whatsapp' })),
    ...(sms.data ?? []).map((r: Record<string, string>) => ({ type: 'SMS', id: r.id, title: r.name, subtitle: r.phone || r.last_msg || '', href: '/app/sms' })),
    ...(emails.data ?? []).map((r: Record<string, string>) => ({ type: 'Email', id: r.id, title: r.subject || '(no subject)', subtitle: r.from_name || '', href: '/app/email' })),
    ...(tasks.data ?? []).map((r: Record<string, string>) => ({ type: 'Task', id: r.id, title: r.title, subtitle: r.description || r.status || '', href: '/app/tasks' })),
  ];

  return NextResponse.json({ results });
}
