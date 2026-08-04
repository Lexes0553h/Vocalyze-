/**
 * Twilio Integration Service Interface & Adapter
 */
export interface TwilioConfig {
  accountSid: string;
  authToken: string;
  phoneNumber: string;
}

export interface TwilioCallResponse {
  callSid: string;
  status: 'queued' | 'ringing' | 'in-progress' | 'completed' | 'failed';
  direction: 'outbound-api' | 'inbound';
}

export class TwilioService {
  private config: TwilioConfig | null = null;

  constructor(config?: TwilioConfig) {
    if (config) this.config = config;
  }

  public isConfigured(): boolean {
    return !!(this.config?.accountSid && this.config?.authToken && this.config?.phoneNumber);
  }

  public async makeCall(to: string, customData?: Record<string, unknown>): Promise<TwilioCallResponse> {
    if (!this.isConfigured()) {
      return {
        callSid: `CA_mock_${Date.now()}`,
        status: 'queued',
        direction: 'outbound-api',
      };
    }
    // Future production API call using Twilio SDK / REST API
    return {
      callSid: `CA_${Math.random().toString(36).substring(2, 10)}`,
      status: 'ringing',
      direction: 'outbound-api',
    };
  }

  public async getRecordingUrl(recordingSid: string): Promise<string> {
    return `https://api.twilio.com/2010-04-01/Accounts/${this.config?.accountSid || 'AC_mock'}/Recordings/${recordingSid}.mp3`;
  }

  public async fetchCallLogs(limit = 20): Promise<Array<{ callSid: string; from: string; to: string; duration: number }>> {
    return [
      { callSid: 'CA_1001', from: '+15550192834', to: '+15550182811', duration: 320 },
      { callSid: 'CA_1002', from: '+15550192834', to: '+15550143899', duration: 180 },
    ];
  }
}
