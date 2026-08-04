/**
 * SMS Provider Integration Service Interface
 */
export interface SmsConfig {
  provider: 'twilio' | 'msg91' | 'plivo' | 'aws_sns';
  apiKey: string;
  senderId: string;
}

export class SmsService {
  private config: SmsConfig | null = null;

  constructor(config?: SmsConfig) {
    if (config) this.config = config;
  }

  public async sendSms(to: string, body: string): Promise<{ smsId: string; status: 'sent' | 'queued' }> {
    return {
      smsId: `SMS_${Date.now()}`,
      status: 'sent',
    };
  }
}
