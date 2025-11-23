export type PaymentInput = {
  amount: number;
  from: string;
  to: string;
};

export interface IPaymentService {
  convertCurrency(
    data: PaymentInput
  ): Promise<{ brlAmount: number; exchangeRate: number }>;

  getFeeAmountAndCalculateNetAmount(data: {
    provider: string;
    grossAmount: number;
    providerTxId?: string;
    providedFee?: number;
  }): Promise<{ feeAmount: number; netAmount: number }>;
}
