import Stripe from "stripe";
import {
  IFeeStrategy,
  FeeCalculationInput,
  FeeCalculationOutput,
} from "../IFeeStrategy";
import { stripe } from "../../../../lib/stripe";

export class StripeFeeStrategy implements IFeeStrategy {
  async calculate(data: FeeCalculationInput): Promise<FeeCalculationOutput> {
    let fee = data.providedFee || 0;

    if (fee === 0 && data.providerTxId) {
      try {
        console.log(
          `[StripeFeeStrategy] Buscando taxa real para ${data.providerTxId}...`
        );

        const paymentIntent = await stripe.paymentIntents.retrieve(
          data.providerTxId,
          {
            expand: ["latest_charge.balance_transaction"],
          }
        );

        const charge = paymentIntent.latest_charge as Stripe.Charge;

        if (charge && charge.balance_transaction) {
          const balanceTransaction =
            charge.balance_transaction as Stripe.BalanceTransaction;

          fee = balanceTransaction.fee / 100;
        }
      } catch (error) {
        console.error(`[StripeFeeStrategy] Erro ao buscar taxa:`, error);
        throw new Error("Failed to retrieve Stripe Fee details");
      }
    }

    return {
      feeAmount: fee,
      netAmount: Number((data.grossAmount - fee).toFixed(2)), // Garante precisão JS
    };
  }
}
