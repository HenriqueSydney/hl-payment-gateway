import { createHmac } from "node:crypto";
import { IValidateWebhookPayloadStrategy } from "../IValidateWebhookPayloadStrategy";
import { env } from "../../../../env";

export class OpenNodeValidateWebhookPayloadStrategy
  implements IValidateWebhookPayloadStrategy
{
  async validate(payload: any): Promise<boolean> {
    if (!payload?.hashed_order || !payload?.id) return false;

    const received = payload.hashed_order;
    const calculated = createHmac("sha256", env.OPEN_NODE_WEBHOOK_SECRET)
      .update(payload.id)
      .digest("hex");

    return received === calculated;
  }
}
