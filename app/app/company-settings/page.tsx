'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, Globe, DollarSign, Clock, Palette, Save, Upload, FileText, Mail, Phone, MapPin } from 'lucide-react';
import { PageHeader, Card, Button, Badge } from '@/components/crm/crm-ui';
import { useAuth } from '@/lib/auth/auth-context';
import { toast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';

const TIMEZONES = ['UTC', 'America/New_York', 'America/Chicago', 'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Asia/Tokyo', 'Asia/Singapore', 'Asia/Kolkata', 'Australia/Sydney'];
const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'INR', 'SGD'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function CompanySettingsPage() {
  const { user, updateTenant } = useAuth();
  const tenant = user?.tenant;

  const [name, setName] = useState(tenant?.name ?? 'My Company');
  const [logo, setLogo] = useState(tenant?.logo ?? '');
  const [website, setWebsite] = useState(user?.email ? `https://${user.email.split('@')[1] || 'mycompany.com'}` : 'https://mycompany.com');
  const [gstNumber, setGstNumber] = useState('27AABCU9603R1ZN');
  const [address, setAddress] = useState('100 Enterprise Way, Suite 400, San Francisco, CA 94105');
  const [timezone, setTimezone] = useState(tenant?.timezone ?? 'America/Los_Angeles');
  const [currency, setCurrency] = useState(tenant?.currency ?? 'USD');
  const [workingDays, setWorkingDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const [workingHours, setWorkingHours] = useState('09:00 - 18:00');
  const [supportEmail, setSupportEmail] = useState(user?.email || 'support@mycompany.com');
  const [supportPhone, setSupportPhone] = useState('+1 (800) 555-0199');
  const [brandColor, setBrandColor] = useState(tenant?.brand_color ?? '#10b981');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (tenant?.name) setName(tenant.name);
    if (tenant?.logo) setLogo(tenant.logo);
    if (tenant?.brand_color) setBrandColor(tenant.brand_color);
    if (tenant?.timezone) setTimezone(tenant.timezone);
  }, [tenant]);

  const toggleDay = (day: string) => setWorkingDays((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setLogo(url);
      toast({ title: 'Logo Uploaded', description: 'Company logo preview updated.' });
    }
  };

  const handleSave = () => {
    updateTenant({
      name,
      logo,
      brand_color: brandColor,
      timezone,
      currency,
    });
    setSaved(true);
    toast({ title: 'Company Settings Saved', description: 'Your company details and branding have been updated across the CRM.' });
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Company & Tenant Settings"
        subtitle="Manage organization profile, logo, support contact, and global preferences."
        actions={
          <Button variant="primary" onClick={handleSave}>
            <Save className="h-4 w-4" />{saved ? 'Saved!' : 'Save Changes'}
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Company Profile */}
        <Card title="Company Profile">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              {logo ? (
                <img src={logo} alt="Logo" className="h-16 w-16 rounded-2xl object-cover ring-2 ring-primary/30" />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                  <Building2 className="h-8 w-8" />
                </div>
              )}
              <div className="flex-1">
                <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-slate-100 dark:bg-white/10 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/15 transition-colors">
                  <Upload className="h-3.5 w-3.5" /> Upload Logo
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </label>
                <p className="mt-1.5 text-xs text-muted-foreground">PNG, SVG, or JPG, max 2MB</p>
              </div>
            </div>

            <Field label="Company Name *" value={name} onChange={setName} placeholder="e.g. Acme Corporation" />
            <Field label="Website URL" value={website} onChange={setWebsite} placeholder="https://example.com" />
            <Field label="GST / Tax Identification Number" value={gstNumber} onChange={setGstNumber} placeholder="e.g. 27AABCU9603R1ZN" />
            <Field label="Office Address" value={address} onChange={setAddress} placeholder="Street address, City, Country" />
          </div>
        </Card>

        {/* Support & Contact Details */}
        <Card title="Support & Business Contact">
          <div className="space-y-4">
            <Field label="Support Email Address" value={supportEmail} onChange={setSupportEmail} placeholder="support@company.com" />
            <Field label="Support Phone Number" value={supportPhone} onChange={setSupportPhone} placeholder="+1 (800) 000-0000" />
            
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground"><Palette className="h-3.5 w-3.5" />Brand Accent Color</p>
              <div className="flex items-center gap-3">
                <input type="color" value={brandColor} onChange={(e) => setBrandColor(e.target.value)} className="h-10 w-16 cursor-pointer rounded-lg border border-slate-200 bg-transparent" />
                <input value={brandColor} onChange={(e) => setBrandColor(e.target.value)} className="flex-1 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-4 py-2.5 text-sm focus:border-primary/50 focus:outline-none" />
              </div>
              <div className="mt-3 flex gap-2">
                {['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#0f5c4a'].map((c) => (
                  <button key={c} onClick={() => setBrandColor(c)} className={cn('h-8 w-8 rounded-lg ring-2 transition-all', brandColor === c ? 'ring-primary ring-offset-2' : 'ring-transparent')} style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>

            <div className="rounded-xl bg-primary/10 p-4 border border-primary/20">
              <p className="text-xs font-semibold text-primary">Live CRM Branding Preview</p>
              <div className="mt-2 flex items-center gap-3">
                {logo ? (
                  <img src={logo} alt="Preview" className="h-8 w-8 rounded-lg object-cover" />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg text-white font-bold" style={{ backgroundColor: brandColor }}>
                    {name.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="font-bold text-sm text-slate-900 dark:text-white">{name || 'Company Name'}</p>
                  <p className="text-xs text-muted-foreground">{website}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Localization */}
        <Card title="Localization & Currency">
          <div className="space-y-4">
            <SelectField icon={<Globe className="h-4 w-4" />} label="Timezone" value={timezone} onChange={setTimezone} options={TIMEZONES} />
            <SelectField icon={<DollarSign className="h-4 w-4" />} label="Default Currency" value={currency} onChange={setCurrency} options={CURRENCIES} />
          </div>
        </Card>

        {/* Business Hours */}
        <Card title="Business Operating Hours">
          <div className="space-y-4">
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground"><Clock className="h-3.5 w-3.5" />Working Days</p>
              <div className="flex flex-wrap gap-2">
                {DAYS.map((day) => (
                  <button key={day} onClick={() => toggleDay(day)} className={cn('rounded-lg px-3 py-1.5 text-xs font-medium transition-colors', workingDays.includes(day) ? 'bg-primary/20 text-primary ring-1 ring-primary/30' : 'bg-slate-100 dark:bg-white/5 text-muted-foreground hover:bg-slate-200 dark:hover:bg-white/10')}>{day}</button>
                ))}
              </div>
            </div>
            <Field label="Working Hours" value={workingHours} onChange={setWorkingHours} placeholder="e.g. 09:00 - 18:00 EST" />
          </div>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">{label}</p>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-4 py-2.5 text-sm focus:border-primary/50 focus:outline-none" />
    </div>
  );
}

function SelectField({ icon, label, value, onChange, options }: { icon: React.ReactNode; label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">{icon}{label}</p>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-4 py-2.5 text-sm focus:border-primary/50 focus:outline-none">
        {options.map((o) => <option key={o} value={o} className="bg-background text-foreground">{o}</option>)}
      </select>
    </div>
  );
}
