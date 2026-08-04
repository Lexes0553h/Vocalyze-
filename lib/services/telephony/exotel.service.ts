/**
 * Exotel Telephony Integration Service Interface
 */
export interface ExotelConfig {
  accountSid: string;
  apiKey: string;
  apiToken: string;
  subdomain: string;
  callerId: string;
}

export class ExotelService {
  private config: ExotelConfig | null = null;

  constructor(config?: ExotelConfig) {
    if (config) this.config = config;
  }

  public isConfigured(): boolean {
    return !!(this.config?.accountSid && this.config?.apiKey);
  }

  public async initiateConnect(agentPhone: string, customerPhone: string): Promise<{ callSid: string; status: string }> {
    return {
      callSid: `EX_${Date.now()}`,
      status: 'initiated',
    };
  }

  public async getCallDetails(callSid: string): Promise<{ duration: number; recordingUrl: string }> {
    return {
      duration: 245,
      recordingUrl: 'https://exotel.com/recordings/sample.mp3',
    };
  }
}
