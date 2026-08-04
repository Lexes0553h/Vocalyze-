'use client';

import { PageHeader, Card, Badge, Button } from '@/components/crm/crm-ui';
import { Database, Globe, Shield, Activity, Save } from 'lucide-react';

export default function PlatformSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Platform Settings" subtitle="Configure global platform preferences." actions={<Button variant="primary"><Save className="h-4 w-4" />Save</Button>} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="General">
          <div className="space-y-4">
            <SettingRow icon={<Globe className="h-4 w-4" />} label="Platform Name" value="Vocalyze CRM" />
            <SettingRow icon={<Shield className="h-4 w-4" />} label="Default Role" value="Employee" />
            <SettingRow icon={<Activity className="h-4 w-4" />} label="Maintenance Mode" value="Disabled" badge="green" />
          </div>
        </Card>
        <Card title="API & Limits">
          <div className="space-y-4">
            <SettingRow icon={<Database className="h-4 w-4" />} label="Rate Limit" value="1000 req/min" />
            <SettingRow icon={<Activity className="h-4 w-4" />} label="Max Companies" value="Unlimited" />
            <SettingRow icon={<Globe className="h-4 w-4" />} label="Default Timezone" value="UTC" />
          </div>
        </Card>
      </div>
    </div>
  );
}

function SettingRow({ icon, label, value, badge }: { icon: React.ReactNode; label: string; value: string; badge?: 'green' | 'yellow' | 'red' }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-white/5 p-3">
      <div className="flex items-center gap-2 text-sm"><span className="text-muted-foreground">{icon}</span>{label}</div>
      {badge ? <Badge variant={badge}>{value}</Badge> : <span className="text-sm font-medium">{value}</span>}
    </div>
  );
}
