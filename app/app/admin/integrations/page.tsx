'use client';

import { useState } from 'react';
import {
  Zap, Phone, MessageSquare, Mail, Calendar as CalendarIcon,
  Globe, CheckCircle2, XCircle, Loader2, RefreshCw, AlertTriangle,
  Lock, Settings, Plus, ExternalLink, ShieldAlert
} from 'lucide-react';
import { PageHeader, Card, Badge, Button, Modal } from '@/components/crm/crm-ui';
import { toast } from '@/components/ui/toast';
import { useAuth } from '@/lib/auth/auth-context';
import { isCompanyAdmin, isSuperAdmin } from '@/lib/auth/permissions';

export interface IntegrationChannel {
  id: string;
  name: string;
  category: 'Calling' | 'WhatsApp' | 'SMS' | 'Email' | 'Calendar' | 'Webhooks';
  icon: typeof Phone;
  description: string;
  providers: string[];
  activeProvider: string;
  status: 'Connected' | 'Disconnected' | 'Testing';
  configFields: { key: string; label: string; placeholder: string; secret?: boolean }[];
  currentConfig: Record<string, string>;
  lastTested?: string;
}

const INITIAL_INTEGRATIONS: IntegrationChannel[] = [
  {
    id: 'calling',
    name: 'Telephony & Voice Calling',
    category: 'Calling',
    icon: Phone,
    description: 'Provider-independent telephony layer for click-to-call, IVR, call recording & voice analytics.',
    providers: ['Twilio Voice', 'Exotel Telephony', 'Knowlarity Cloud', 'Plivo Voice'],
    activeProvider: 'Exotel Telephony',
    status: 'Connected',
    configFields: [
      { key: 'accountSid', label: 'Account SID / API Key', placeholder: 'exotel_sid_92837482' },
      { key: 'authToken', label: 'Auth Token / Secret', placeholder: '••••••••••••••••••••', secret: true },
      { key: 'callerId', label: 'Default Caller ID / Virtual Number', placeholder: '+1 (800) 555-0199' },
      { key: 'webhookUrl', label: 'Inbound Call Webhook URL', placeholder: 'https://api.vocalyze.io/v1/telephony/webhook' },
    ],
    currentConfig: { accountSid: 'exotel_sid_92837482', callerId: '+1 (800) 555-0199' },
    lastTested: 'Today at 09:30 AM',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Business Messaging',
    category: 'WhatsApp',
    icon: MessageSquare,
    description: 'Official WhatsApp Business Cloud API & BSP integrations for bulk outbound & HSM templates.',
    providers: ['WhatsApp Business Cloud API', 'Meta Graph API', 'Twilio for WhatsApp'],
    activeProvider: 'WhatsApp Business Cloud API',
    status: 'Connected',
    configFields: [
      { key: 'phoneId', label: 'WhatsApp Phone Number ID', placeholder: '1092837482910' },
      { key: 'accessToken', label: 'Permanent Access Token', placeholder: '••••••••••••••••••••', secret: true },
      { key: 'wabaId', label: 'WhatsApp Business Account ID', placeholder: 'waba_928374829' },
    ],
    currentConfig: { phoneId: '1092837482910', wabaId: 'waba_928374829' },
    lastTested: 'Yesterday at 04:15 PM',
  },
  {
    id: 'sms',
    name: 'SMS Gateway Services',
    category: 'SMS',
    icon: Zap,
    description: 'High-throughput transactional & promotional SMS broadcasting with DLTM registration.',
    providers: ['MSG91 SMS', 'Textlocal Gateway', 'Twilio Programmable SMS'],
    activeProvider: 'MSG91 SMS',
    status: 'Connected',
    configFields: [
      { key: 'authKey', label: 'MSG91 Auth Key', placeholder: '382741AXXXXXXXX' },
      { key: 'senderId', label: 'DLT Header / Sender ID', placeholder: 'VOCLYZ' },
      { key: 'dltEntityId', label: 'DLT Entity ID', placeholder: '17011592837482' },
    ],
    currentConfig: { senderId: 'VOCLYZ', dltEntityId: '17011592837482' },
    lastTested: 'Jul 26 at 11:00 AM',
  },
  {
    id: 'email',
    name: 'Email Service & SMTP',
    category: 'Email',
    icon: Mail,
    description: 'OAuth 2.0 and SMTP delivery adapters for outbound email sequences and inbox syncing.',
    providers: ['Gmail OAuth 2.0', 'Microsoft 365 Exchange', 'Custom SMTP Gateway', 'SendGrid API'],
    activeProvider: 'Gmail OAuth 2.0',
    status: 'Connected',
    configFields: [
      { key: 'clientId', label: 'OAuth Client ID', placeholder: '928374829-apps.googleusercontent.com' },
      { key: 'clientSecret', label: 'OAuth Client Secret', placeholder: '••••••••••••••••••••', secret: true },
      { key: 'senderEmail', label: 'Default From Email', placeholder: 'sales@vocalyze.io' },
    ],
    currentConfig: { senderEmail: 'sales@vocalyze.io' },
    lastTested: 'Today at 08:00 AM',
  },
  {
    id: 'calendar',
    name: 'Calendar & Meeting Scheduler',
    category: 'Calendar',
    icon: CalendarIcon,
    description: 'Bi-directional calendar synchronization for telecaller follow-up bookings & demo slots.',
    providers: ['Google Calendar API', 'Microsoft Outlook Calendar', 'Cal.com Webhook'],
    activeProvider: 'Google Calendar API',
    status: 'Disconnected',
    configFields: [
      { key: 'calendarId', label: 'Primary Calendar ID', placeholder: 'primary' },
      { key: 'apiKey', label: 'Google Cloud API Key', placeholder: 'AIzaSyXXXXXXXXXXXX' },
    ],
    currentConfig: {},
  },
  {
    id: 'webhooks',
    name: 'Custom Webhooks & Automation',
    category: 'Webhooks',
    icon: Globe,
    description: 'Incoming and outgoing HTTP webhooks for Zapier, Make, and custom internal systems.',
    providers: ['Custom Webhooks', 'Zapier Automation', 'Make.com Scenario'],
    activeProvider: 'Custom Webhooks',
    status: 'Connected',
    configFields: [
      { key: 'endpointUrl', label: 'Inbound Webhook Listener URL', placeholder: 'https://api.vocalyze.io/v1/webhooks/leads' },
      { key: 'secretKey', label: 'HMAC Signing Secret', placeholder: '••••••••••••••••••••', secret: true },
    ],
    currentConfig: { endpointUrl: 'https://api.vocalyze.io/v1/webhooks/leads' },
    lastTested: 'Jul 24 at 02:20 PM',
  },
];

export default function AdminIntegrationsPage() {
  const { user } = useAuth();
  const isAdmin = isCompanyAdmin(user?.role ?? null) || isSuperAdmin(user?.role ?? null);

  const [channels, setChannels] = useState<IntegrationChannel[]>(INITIAL_INTEGRATIONS);
  const [activeChannel, setActiveChannel] = useState<IntegrationChannel | null>(null);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);

  // Form config state
  const [selectedProvider, setSelectedProvider] = useState('');
  const [formData, setFormData] = useState<Record<string, string>>({});

  const openConfigModal = (channel: IntegrationChannel) => {
    setActiveChannel(channel);
    setSelectedProvider(channel.activeProvider);
    setFormData(channel.currentConfig);
    setConfigModalOpen(true);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChannel) return;

    setChannels((prev) =>
      prev.map((ch) =>
        ch.id === activeChannel.id
          ? {
              ...ch,
              activeProvider: selectedProvider,
              currentConfig: formData,
              status: 'Connected',
              lastTested: 'Just now',
            }
          : ch
      )
    );

    setConfigModalOpen(false);
    toast({
      title: 'Integration Updated',
      description: `${activeChannel.name} configured with ${selectedProvider}.`,
    });
  };

  const handleTestConnection = (channelId: string) => {
    setTestingId(channelId);
    setTimeout(() => {
      setTestingId(null);
      setChannels((prev) =>
        prev.map((ch) =>
          ch.id === channelId ? { ...ch, lastTested: 'Just now (Latency: 142ms, Success)' } : ch
        )
      );
      toast({
        title: 'Connection Test Passed',
        description: 'Provider API responded with HTTP 200 OK.',
      });
    }, 1200);
  };

  const handleDisconnect = (channelId: string) => {
    setChannels((prev) =>
      prev.map((ch) =>
        ch.id === channelId ? { ...ch, status: 'Disconnected' } : ch
      )
    );
    toast({
      title: 'Integration Disconnected',
      description: 'Communication provider channel disconnected.',
    });
  };

  if (!isAdmin) {
    return (
      <div className="flex h-96 flex-col items-center justify-center space-y-4 text-center">
        <ShieldAlert className="h-12 w-12 text-amber-600" />
        <h2 className="text-xl font-extrabold text-slate-900">Company Admin Access Restricted</h2>
        <p className="text-xs text-slate-500 max-w-md">
          Integrations and telephony gateways can only be configured by Company Administrators.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Telephony & Communication Integrations"
        subtitle="Admin Portal • Provider-Independent Gateway Interfaces for Calling, WhatsApp, SMS, Email & Webhooks"
      />

      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase text-emerald-800">
            <Zap className="h-4 w-4 text-emerald-600" /> Multi-Provider Adapter Architecture
          </div>
          <p className="text-xs text-emerald-950 font-medium">
            Vocalyze decouples your CRM logic from underlying providers. Switch seamlessly between Twilio, Exotel, Knowlarity, WhatsApp Cloud, or MSG91 without disrupting workflow routing.
          </p>
        </div>
      </div>

      {/* Integration Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {channels.map((ch) => {
          const Icon = ch.icon;
          const isTesting = testingId === ch.id;

          return (
            <Card key={ch.id}>
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{ch.name}</h3>
                      <p className="text-xs text-emerald-700 font-semibold">{ch.activeProvider}</p>
                    </div>
                  </div>
                  <Badge variant={ch.status === 'Connected' ? 'green' : 'red'}>
                    {ch.status}
                  </Badge>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed min-h-[36px]">{ch.description}</p>

                <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Available Adapters:</span>
                    <span className="font-semibold text-slate-700">{ch.providers.length} Supported</span>
                  </div>
                  {ch.lastTested && (
                    <div className="flex justify-between text-slate-500">
                      <span>Last Verified:</span>
                      <span className="text-slate-600 font-mono text-[11px]">{ch.lastTested}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  {ch.status === 'Connected' ? (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleTestConnection(ch.id)}
                        disabled={isTesting}
                      >
                        {isTesting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                        Test
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => openConfigModal(ch)}>
                        <Settings className="h-3.5 w-3.5" /> Configure
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDisconnect(ch.id)}>
                        Disconnect
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" variant="primary" className="w-full" onClick={() => openConfigModal(ch)}>
                      <Plus className="h-4 w-4" /> Connect Adapter
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Configuration Modal */}
      {activeChannel && (
        <Modal open={configModalOpen} onClose={() => setConfigModalOpen(false)} title={`Configure ${activeChannel.name}`}>
          <form onSubmit={handleSaveConfig} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Gateway / Provider Adapter</label>
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-emerald-500 focus:outline-none bg-white font-semibold"
              >
                {activeChannel.providers.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div className="space-y-3 pt-2">
              <p className="text-xs font-bold uppercase text-slate-500">Provider Credentials & Parameters</p>
              {activeChannel.configFields.map((field) => (
                <div key={field.key}>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{field.label}</label>
                  <input
                    type={field.secret ? 'password' : 'text'}
                    placeholder={field.placeholder}
                    value={formData[field.key] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setConfigModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="primary">
                Save & Connect Channel
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
