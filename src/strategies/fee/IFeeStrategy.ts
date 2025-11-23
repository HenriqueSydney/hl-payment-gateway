export type FeeCalculationInput = {
  grossAmount: number;
  providerTxId?: string;
  providedFee?: number;
};

export type FeeCalculationOutput = {
  feeAmount: number;
  netAmount: number;
};

export interface IFeeStrategy {
  calculate(data: FeeCalculationInput): Promise<FeeCalculationOutput>;
}
