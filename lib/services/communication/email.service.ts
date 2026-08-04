/**
 * Email Provider Integration Service Interface
 */
export interface EmailConfig {
  provider: 'sendgrid' | 'resend' | 'postmark' | 'smtp';
  apiKey: string;
  fromEmail: string;
  fromName: string;
}

export class EmailService {
  private config: EmailConfig | null = null;

  constructor(config?: EmailConfig) {
    if (config) this.config = config;
  }

  public async sendEmail(to: string, subject: string, htmlContent: string): Promise<{ emailId: string; status: 'sent' | 'queued' }> {
    return {
      emailId: `EMAIL_${Date.now()}`,
      status: 'sent',
    };
  }
}
