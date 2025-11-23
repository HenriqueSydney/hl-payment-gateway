import {
  IFeeStrategy,
  FeeCalculationInput,
  FeeCalculationOutput,
} from "../IFeeStrategy";

export class DefaultFeeStrategy implements IFeeStrategy {
  async calculate(data: FeeCalculationInput): Promise<FeeCalculationOutput> {
    const fee = data.providedFee || 0;

    return {
      feeAmount: fee,
      netAmount: data.grossAmount - fee,
    };
  }
}
