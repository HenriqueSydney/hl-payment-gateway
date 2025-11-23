import Stripe from "stripe";
import { env } from "../../../../env";
import { IValidateWebhookPayloadStrategy } from "../IValidateWebhookPayloadStrategy";

export class StripeValidateWebhookPayloadStrategy
  implements IValidateWebhookPayloadStrategy
{
  async validate(payload: any, headers: any): Promise<boolean> {
    const signature = headers["stripe-signature"];
    if (!signature || !payload) return false;

    try {
      Stripe.webhooks.constructEvent(
        payload,
        signature,
        env.STRIPE_WEBHOOK_SECRET
      );

      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}
