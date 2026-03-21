export interface WebhookEvent<T = any> {
  type: string;
  data: T;
}

export interface WebhookResponse {
  success: boolean;
  message: string;
}