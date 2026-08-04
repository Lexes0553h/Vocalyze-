/**
 * Push Notification Service Interface
 */
export interface PushNotificationConfig {
  firebaseServerKey?: string;
  vapidKey?: string;
}

export class PushNotificationService {
  private config: PushNotificationConfig | null = null;

  constructor(config?: PushNotificationConfig) {
    if (config) this.config = config;
  }

  public async sendPush(userId: string, title: string, body: string, data?: Record<string, string>): Promise<{ pushId: string; status: string }> {
    return {
      pushId: `PUSH_${Date.now()}`,
      status: 'delivered',
    };
  }
}
