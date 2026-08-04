'use client';

import { motion } from 'framer-motion';
import { CreditCard, Download, Check, Zap, Crown } from 'lucide-react';
import { PageHeader, Card, Badge, Button, ProgressBar } from '@/components/crm/crm-ui';
import { useInvoices } from '@/lib/data/hooks';
import { cn } from '@/lib/utils';

const PLANS = [
  { name: 'Starter', price: 29, period: '/seat/mo', seats: 'Up to 10 seats', features: ['Lead management', 'Call recording', 'Basic analytics', 'Email support'], current: false, popular: false },
  { name: 'Growth', price: 79, period: '/seat/mo', seats: 'Up to 100 seats', features: ['Everything in Starter', 'AI follow-ups', 'WhatsApp + SMS', 'Advanced analytics', 'Priority support'], current: true, popular: true },
  { name: 'Enterprise', price: 0, period: 'Custom', seats: 'Unlimited seats', features: ['Everything in Growth', 'SSO + SAML', 'Custom integrations', 'Dedicated CSM', '99.99% SLA'], current: false, popular: false },
];

const USAGE = [
  { label: 'Calls', used: 1284, total: 2000, unit: '' },
  { label: 'Storage', used: 4.2, total: 10, unit: ' GB' },
  { label: 'Seats', used: 25, total: 100, unit: '' },
  { label: 'AI Credits', used: 850, total: 1000, unit: '' },
];

export default function BillingPage() {
  const { data: INVOICES = [] } = useInvoices();
  return (
    <div className="space-y-6">
      <PageHeader title="Billing" subtitle="Manage your subscription" />

      {/* Current plan + usage */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Current Plan" delay={0.05}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/20">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-semibold">Growth</p>
                  <Badge variant="primary"><Crown className="mr-1 h-3 w-3" />Current</Badge>
                </div>
                <p className="text-sm text-muted-foreground">$79/seat/mo • 25 seats</p>
              </div>
            </div>
            <Button variant="primary">Upgrade</Button>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/5 pt-4">
            <div><p className="text-xs text-muted-foreground">Renewal Date</p><p className="text-sm font-medium">Aug 24, 2026</p></div>
            <div><p className="text-xs text-muted-foreground">Next Invoice</p><p className="text-sm font-medium">$1,975.00</p></div>
          </div>
        </Card>

        <Card title="Usage" delay={0.1}>
          <div className="space-y-4">
            {USAGE.map((u) => (
              <div key={u.label}>
                <div className="mb-1.5 flex justify-between text-sm">
                  <span className="text-muted-foreground">{u.label}</span>
                  <span className="font-medium">{u.used}{u.unit} / {u.total}{u.unit}</span>
                </div>
                <ProgressBar value={(u.used / u.total) * 100} color={u.used / u.total > 0.8 ? 'cyan' : 'primary'} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Plan comparison */}
      <div className="grid gap-4 sm:grid-cols-3">
        {PLANS.map((p, i) => (
          <motion.div
            key={p.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={cn('rounded-2xl p-5', p.current ? 'glass-strong ring-1 ring-primary/30' : 'glass-card')}
          >
            {p.popular && <Badge variant="primary" className="mb-3">Most Popular</Badge>}
            <h3 className="text-lg font-semibold">{p.name}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{p.seats}</p>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-2xl font-semibold">{p.price === 0 ? 'Custom' : `$${p.price}`}</span>
              {p.price !== 0 && <span className="text-xs text-muted-foreground">{p.period}</span>}
            </div>
            <div className="my-4 space-y-2">
              {p.features.map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">{f}</span>
                </div>
              ))}
            </div>
            <Button variant={p.current ? 'secondary' : 'primary'} className="w-full" disabled={p.current}>
              {p.current ? 'Current Plan' : p.name === 'Enterprise' ? 'Contact Sales' : 'Upgrade'}
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Invoices + payment */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card title="Invoice History" delay={0.15}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-xs text-muted-foreground">
                  <th className="pb-3 font-medium">Invoice</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium text-right">Download</th>
                </tr>
              </thead>
              <tbody>
                {INVOICES.map((inv) => (
                  <tr key={inv.id} className="border-b border-white/5 last:border-0">
                    <td className="py-3 font-medium">{inv.id}</td>
                    <td className="py-3 text-muted-foreground">{inv.date}</td>
                    <td className="py-3">${inv.amount.toLocaleString()}</td>
                    <td className="py-3"><Badge variant="green">{inv.status}</Badge></td>
                    <td className="py-3 text-right">
                      <Button variant="ghost" size="sm"><Download className="h-3.5 w-3.5" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Payment Method" delay={0.2} className="h-fit">
          <div className="flex items-center gap-3 rounded-xl bg-white/5 p-4">
            <div className="flex h-10 w-14 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium">Visa ending in 4242</p>
              <p className="text-xs text-muted-foreground">Expires 08/28</p>
            </div>
          </div>
          <Button variant="outline" className="mt-4 w-full">Update Payment</Button>
        </Card>
      </div>
    </div>
  );
}
