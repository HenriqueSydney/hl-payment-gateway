import { makePayPalService } from "../../../services/factories/makePayPalService";
import {
  IFeeStrategy,
  FeeCalculationInput,
  FeeCalculationOutput,
} from "../IFeeStrategy";

export class PayPalFeeStrategy implements IFeeStrategy {
  async calculate(data: FeeCalculationInput): Promise<FeeCalculationOutput> {
    let fee = data.providedFee || 0;

    if (fee === 0 && data.providerTxId) {
      const paypalService = makePayPalService();

      console.log(
        `[PayPalFeeStrategy] Buscando taxa real para ${data.providerTxId}...`
      );

      const details = await paypalService.getCaptureDetails(data.providerTxId);

      fee = details.paypal_fee;
    }

    return {
      feeAmount: fee,
      netAmount: Number((data.grossAmount - fee).toFixed(2)),
    };
  }
}
