/**
 * WhatsApp Cloud API Integration Service Interface
 */
export interface WhatsAppConfig {
  phoneNumberId: string;
  accessToken: string;
  businessAccountId: string;
}

export class WhatsAppService {
  private config: WhatsAppConfig | null = null;

  constructor(config?: WhatsAppConfig) {
    if (config) this.config = config;
  }

  public isConfigured(): boolean {
    return !!(this.config?.phoneNumberId && this.config?.accessToken);
  }

  public async sendMessage(to: string, message: string): Promise<{ messageId: string; status: 'sent' | 'delivered' | 'failed' }> {
    return {
      messageId: `WAM_${Date.now()}`,
      status: 'sent',
    };
  }

  public async sendTemplateMessage(to: string, templateName: string, languageCode = 'en_US', components: unknown[] = []): Promise<{ messageId: string }> {
    return {
      messageId: `WAM_TPL_${Date.now()}`,
    };
  }
}
