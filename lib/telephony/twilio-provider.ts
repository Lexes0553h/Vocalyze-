import { TelephonyProvider, CallSession, CallDirection, CallStatus } from './provider';

export interface TwilioConfig {
  accountSid?: string;
  authToken?: string;
  fromPhoneNumber?: string;
  isTestMode?: boolean;
}

export class TwilioTelephonyProvider implements TelephonyProvider {
  readonly name = 'Twilio Voice (Test/Live)';
  readonly connected = true;
  private sessions = new Map<string, CallSession>();
  private accountSid: string;
  private fromPhoneNumber: string;
  private isTestMode: boolean;

  constructor(config?: TwilioConfig) {
    this.accountSid = config?.accountSid || process.env.NEXT_PUBLIC_TWILIO_ACCOUNT_SID || 'AC_TEST_ACCOUNT_SID';
    this.fromPhoneNumber = config?.fromPhoneNumber || process.env.TWILIO_PHONE_NUMBER || '+15550192834';
    this.isTestMode = config?.isTestMode ?? (this.accountSid.startsWith('AC_TEST') || !process.env.TWILIO_AUTH_TOKEN);
  }

  private makeSession(number: string, contactName: string, direction: CallDirection, status: CallStatus): CallSession {
    const id = `tw_call_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const session: CallSession = {
      id,
      contactName,
      phoneNumber: number,
      direction,
      status,
      muted: false,
      speaker: false,
      startedAt: Date.now(),
    };
    this.sessions.set(id, session);
    return session;
  }

  async dial(number: string, contactName = 'Unknown'): Promise<CallSession> {
    const cleanNumber = number.trim();
    if (!cleanNumber || cleanNumber.replace(/\D/g, '').length < 3) {
      throw new Error('Please enter a valid phone number (at least 3 digits).');
    }

    const session = this.makeSession(cleanNumber, contactName, 'outbound', 'ringing');

    try {
      // Initiate call via backend proxy endpoint if server API is reachable
      const response = await fetch('/api/calls/twilio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: cleanNumber,
          contactName,
          accountSid: this.accountSid,
          from: this.fromPhoneNumber,
          isTestMode: this.isTestMode,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.callSid) {
          session.id = data.callSid;
          this.sessions.set(data.callSid, session);
        }
      }
    } catch {
      // In case offline / preview environment fallback to local session state
    }

    // Auto connect ringing call after brief delay
    setTimeout(() => {
      const cur = this.sessions.get(session.id);
      if (cur && cur.status === 'ringing') {
        cur.status = 'connected';
        cur.startedAt = Date.now();
      }
    }, 1200);

    return session;
  }

  async answer(sessionId: string): Promise<CallSession> {
    const s = this.sessions.get(sessionId);
    if (!s) throw new Error('Call session not found.');
    s.status = 'connected';
    s.startedAt = Date.now();
    return s;
  }

  async hold(sessionId: string): Promise<CallSession> {
    const s = this.sessions.get(sessionId);
    if (!s) throw new Error('Call session not found.');
    s.status = 'on_hold';
    return s;
  }

  async resume(sessionId: string): Promise<CallSession> {
    const s = this.sessions.get(sessionId);
    if (!s) throw new Error('Call session not found.');
    s.status = 'connected';
    return s;
  }

  async mute(sessionId: string, muted: boolean): Promise<CallSession> {
    const s = this.sessions.get(sessionId);
    if (!s) throw new Error('Call session not found.');
    s.muted = muted;
    return s;
  }

  async speaker(sessionId: string, on: boolean): Promise<CallSession> {
    const s = this.sessions.get(sessionId);
    if (!s) throw new Error('Call session not found.');
    s.speaker = on;
    return s;
  }

  async transfer(sessionId: string, target: string): Promise<CallSession> {
    const s = this.sessions.get(sessionId);
    if (!s) throw new Error('Call session not found.');
    s.transferredTo = target;
    s.status = 'ended';
    return s;
  }

  async hangup(sessionId: string): Promise<{ session: CallSession; durationSec: number }> {
    const s = this.sessions.get(sessionId);
    if (!s) throw new Error('Call session not found.');
    s.status = 'ended';
    const durationSec = Math.max(1, Math.floor((Date.now() - s.startedAt) / 1000));
    return { session: s, durationSec };
  }
}
