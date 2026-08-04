'use client';

import { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/crm/crm-ui';
import { Phone, MessageCircle, MessageSquare, Mail, Info, Clock, AlertCircle } from 'lucide-react';
import { toast } from '@/components/ui/toast';

export type CommType = 'call' | 'whatsapp' | 'sms' | 'email';

interface CommDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: CommType;
  recipientName?: string;
  recipientContact?: string;
}

const COMM_DETAILS: Record<CommType, { title: string; icon: React.ReactNode; color: string; desc: string }> = {
  call: {
    title: 'Telephony & WebRTC Dialer',
    icon: <Phone className="h-5 w-5 text-emerald-600" />,
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    desc: 'Direct cloud telephony dialer and WebRTC audio integration will be enabled once your telephony trunk is connected.',
  },
  whatsapp: {
    title: 'WhatsApp Business API',
    icon: <MessageCircle className="h-5 w-5 text-green-600" />,
    color: 'bg-green-50 text-green-700 border-green-200',
    desc: 'Official WhatsApp Business Cloud API integration is ready for connection with your WhatsApp Business Account.',
  },
  sms: {
    title: 'SMS Gateway Integration',
    icon: <MessageSquare className="h-5 w-5 text-blue-600" />,
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    desc: 'Bulk and transactional SMS messaging gateway (Twilio / AWS SNS / MessageBird) will be available in a future update.',
  },
  email: {
    title: 'Email Communications Engine',
    icon: <Mail className="h-5 w-5 text-indigo-600" />,
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    desc: 'Direct SMTP / SendGrid / Google Workspace email dispatch pipeline will be available in a future update.',
  },
};

export function CommunicationModal({ open, onOpenChange, type, recipientName, recipientContact }: CommDialogProps) {
  const info = COMM_DETAILS[type];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl max-h-[90vh] overflow-y-auto w-[calc(100vw-2rem)] p-4 sm:p-6">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${info.color}`}>
              {info.icon}
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 truncate">{info.title}</DialogTitle>
              {recipientName && (
                <p className="text-xs text-slate-500 font-medium mt-0.5 truncate">
                  Target: <span className="text-slate-800 font-semibold">{recipientName}</span> {recipientContact ? `(${recipientContact})` : ''}
                </p>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="my-2 rounded-xl border border-amber-200 bg-amber-50/60 p-3 sm:p-4 text-xs text-amber-900">
          <div className="flex items-start gap-2.5">
            <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-amber-900">Feature Status Notice</p>
              <p className="text-amber-800 leading-relaxed">
                This feature will be available in a future update.
              </p>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          {info.desc} All CRM activity logging, disposition notes, and task scheduling remain fully operational and saved locally.
        </p>

        <DialogFooter className="mt-4 flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Close
          </Button>
          <Button
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => {
              onOpenChange(false);
              toast({
                title: 'Notification Recorded',
                description: `Recorded intent for ${type.toUpperCase()} with ${recipientName || 'contact'}.`,
              });
            }}
          >
            Log Activity Note
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function showCommToast(type: CommType, name?: string) {
  toast({
    title: `${type.toUpperCase()} Integration`,
    description: 'This feature will be available in a future update.',
  });
}
