export interface IValidateWebhookPayloadStrategy {
  validate(payload: any, headers?: any): Promise<boolean>;
}
