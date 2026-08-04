'use client';

import { motion } from 'framer-motion';
import { Tag, ToggleLeft, ToggleRight, Globe } from 'lucide-react';
import { PageHeader, Card, Badge, Button } from '@/components/crm/crm-ui';
import { useFeatureFlags } from '@/lib/data/enterprise-hooks';
import { cn } from '@/lib/utils';

export default function FeatureFlagsPage() {
  const { data: flags = [] } = useFeatureFlags();

  return (
    <div className="space-y-6">
      <PageHeader title="Feature Flags" subtitle={`${flags.length} flags configured`} actions={<Button variant="primary"><Tag className="h-4 w-4" />New Flag</Button>} />

      <Card>
        {flags.length > 0 ? (
          <div className="space-y-2">
            {flags.map((f, i) => (
              <motion.div key={f.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: i * 0.04 }} className="flex items-center gap-3 rounded-xl bg-white/[0.03] p-3">
                <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', f.enabled ? 'bg-green-500/15 text-green-400' : 'bg-white/5 text-muted-foreground')}>
                  {f.enabled ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium">{f.label || f.key}</p>
                    {f.isGlobal && <Badge variant="cyan"><Globe className="h-3 w-3" />Global</Badge>}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">{f.description || f.key}</p>
                </div>
                <button className={cn('h-6 w-11 rounded-full transition-colors', f.enabled ? 'bg-primary' : 'bg-white/15')}>
                  <span className={cn('block h-5 w-5 rounded-full bg-white transition-transform', f.enabled ? 'translate-x-5' : 'translate-x-0.5')} style={{ marginTop: '2px' }} />
                </button>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-sm text-muted-foreground">No feature flags configured. Create flags to control feature availability per company.</div>
        )}
      </Card>
    </div>
  );
}
