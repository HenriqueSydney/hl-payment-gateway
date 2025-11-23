export type PayPalVerifySignatureParams = {
  authAlgo: string;
  certUrl: string;
  transmissionId: string;
  transmissionSig: string;
  transmissionTime: string;
  webhookEvent: any;
};

export type PayPalCaptureDetails = {
  gross_amount: number;
  paypal_fee: number;
  net_amount: number;
  currency_code: string;
};

export interface IPayPalService {
  verifyWebhookSignature(params: PayPalVerifySignatureParams): Promise<boolean>;
  getCaptureDetails(captureId: string): Promise<PayPalCaptureDetails>;
}
