/**
 * Telephony provider abstraction.
 *
 * The UI calls only these interfaces, never a specific carrier. To connect a
 * real provider (Twilio, a SIM bridge, a SIP trunk, etc.), implement
 * `TelephonyProvider` and swap the instance exported by `getTelephonyProvider`.
 *
 * The default `SimulatedTelephonyProvider` mirrors the real lifecycle in-memory
 * so the dialer is fully interactive without an external service.
 */

export type CallDirection = 'inbound' | 'outbound' | 'missed';
export type CallStatus = 'ringing' | 'connected' | 'on_hold' | 'ended' | 'missed' | 'failed';

export interface CallSession {
  id: string;
  contactName: string;
  phoneNumber: string;
  direction: CallDirection;
  status: CallStatus;
  muted: boolean;
  speaker: boolean;
  startedAt: number;
  transferredTo?: string;
}

export interface TelephonyProvider {
  readonly name: string;
  readonly connected: boolean;
  dial(number: string, contactName?: string): Promise<CallSession>;
  answer(sessionId: string): Promise<CallSession>;
  hold(sessionId: string): Promise<CallSession>;
  resume(sessionId: string): Promise<CallSession>;
  mute(sessionId: string, muted: boolean): Promise<CallSession>;
  speaker(sessionId: string, on: boolean): Promise<CallSession>;
  transfer(sessionId: string, target: string): Promise<CallSession>;
  hangup(sessionId: string): Promise<{ session: CallSession; durationSec: number }>;
  onIncoming?(handler: (session: CallSession) => void): void;
}

class SimulatedTelephonyProvider implements TelephonyProvider {
  readonly name = 'Simulated';
  readonly connected = true;
  private sessions = new Map<string, CallSession>();
  private incomingHandler?: (s: CallSession) => void;

  private makeSession(number: string, contactName: string, direction: CallDirection, status: CallStatus): CallSession {
    const id = `call_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
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
    const s = this.makeSession(number, contactName, 'outbound', 'ringing');
    setTimeout(() => {
      const cur = this.sessions.get(s.id);
      if (cur && cur.status === 'ringing') {
        cur.status = 'connected';
        cur.startedAt = Date.now();
      }
    }, 1500);
    return s;
  }

  async answer(sessionId: string): Promise<CallSession> {
    const s = this.sessions.get(sessionId);
    if (!s) throw new Error('Session not found');
    s.status = 'connected';
    s.startedAt = Date.now();
    return s;
  }

  async hold(sessionId: string): Promise<CallSession> {
    const s = this.sessions.get(sessionId);
    if (!s) throw new Error('Session not found');
    s.status = 'on_hold';
    return s;
  }

  async resume(sessionId: string): Promise<CallSession> {
    const s = this.sessions.get(sessionId);
    if (!s) throw new Error('Session not found');
    s.status = 'connected';
    return s;
  }

  async mute(sessionId: string, muted: boolean): Promise<CallSession> {
    const s = this.sessions.get(sessionId);
    if (!s) throw new Error('Session not found');
    s.muted = muted;
    return s;
  }

  async speaker(sessionId: string, on: boolean): Promise<CallSession> {
    const s = this.sessions.get(sessionId);
    if (!s) throw new Error('Session not found');
    s.speaker = on;
    return s;
  }

  async transfer(sessionId: string, target: string): Promise<CallSession> {
    const s = this.sessions.get(sessionId);
    if (!s) throw new Error('Session not found');
    s.transferredTo = target;
    s.status = 'ended';
    return s;
  }

  async hangup(sessionId: string): Promise<{ session: CallSession; durationSec: number }> {
    const s = this.sessions.get(sessionId);
    if (!s) throw new Error('Session not found');
    s.status = 'ended';
    const durationSec = Math.floor((Date.now() - s.startedAt) / 1000);
    return { session: s, durationSec };
  }

  onIncoming(handler: (s: CallSession) => void) {
    this.incomingHandler = handler;
  }
}

import { TwilioTelephonyProvider } from './twilio-provider';

let provider: TelephonyProvider = new TwilioTelephonyProvider();

export function getTelephonyProvider(): TelephonyProvider {
  return provider;
}

export function setTelephonyProvider(p: TelephonyProvider) {
  provider = p;
}

