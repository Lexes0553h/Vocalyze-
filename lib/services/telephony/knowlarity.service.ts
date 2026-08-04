/**
 * Knowlarity Cloud Telephony Integration Service Interface
 */
export interface KnowlarityConfig {
  apiKey: string;
  authorizationToken: string;
  channelKey: string;
  virtualNumber: string;
}

export class KnowlarityService {
  private config: KnowlarityConfig | null = null;

  constructor(config?: KnowlarityConfig) {
    if (config) this.config = config;
  }

  public isConfigured(): boolean {
    return !!(this.config?.apiKey && this.config?.virtualNumber);
  }

  public async makeClickToCall(agentNumber: string, customerNumber: string): Promise<{ callId: string; status: string }> {
    return {
      callId: `KNOW_${Date.now()}`,
      status: 'success',
    };
  }
}
