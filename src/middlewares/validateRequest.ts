import { FastifyReply, FastifyRequest } from "fastify";
import { StripeValidateWebhookPayloadStrategy } from "../strategies/validateWebhookPayload/implementations/StripeValidateWebhookPayloadStrategy";
import { OpenNodeValidateWebhookPayloadStrategy } from "../strategies/validateWebhookPayload/implementations/OpenNodeValidateWebhookPayloadStrategy";
import { DefaultValidateWebhookPayloadStrategy } from "../strategies/validateWebhookPayload/implementations/DefaultValidateWebhookPayloadStrategy";
import { IValidateWebhookPayloadStrategy } from "../strategies/validateWebhookPayload/IValidateWebhookPayloadStrategy";
import { PayPalValidateWebhookPayloadStrategy } from "../strategies/validateWebhookPayload/implementations/PayPalValidateWebhookPayloadStrategy";

const strategies: Record<string, IValidateWebhookPayloadStrategy> = {
  STRIPE: new StripeValidateWebhookPayloadStrategy(),
  OPENNODE: new OpenNodeValidateWebhookPayloadStrategy(),
  PAYPAL: new PayPalValidateWebhookPayloadStrategy(),
  DEFAULT: new DefaultValidateWebhookPayloadStrategy(),
};

export async function validateRequestMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const provider = request.routeOptions.config.provider || "DEFAULT";

  const strategy = strategies[provider] || strategies["DEFAULT"];

  let payloadToValidate: any;

  if (provider === "STRIPE") {
    payloadToValidate = request.rawBody;
  } else {
    payloadToValidate = request.body;
  }

  const isValid = await strategy.validate(payloadToValidate, request.headers);

  if (!isValid) {
    return reply
      .status(401)
      .send({ message: "Webhook Signature Verification Failed" });
  }
}
