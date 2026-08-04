'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Smartphone, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/crm/crm-ui';
import { useAuth } from '@/lib/auth/auth-context';
import { getDashboardPath } from '@/lib/auth/permissions';

export default function AppComingSoonPage() {
  const router = useRouter();
  const { user } = useAuth();

  const handleBack = () => {
    if (user?.role) {
      const dashboardPath = getDashboardPath(user.role);
      router.push(dashboardPath);
    } else if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/app/dashboard');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex min-h-[75vh] flex-col items-center justify-center p-6 text-center"
    >
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/60">
          <Smartphone className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            📱 App Coming Soon
          </h1>
          <p className="text-sm leading-relaxed text-slate-500">
            Our mobile application is currently under development and will be available soon. Stay tuned for future updates.
          </p>
        </div>

        <div className="pt-2">
          <Button
            variant="primary"
            className="w-full gap-2 justify-center"
            onClick={handleBack}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
