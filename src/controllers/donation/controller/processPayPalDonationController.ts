import { PayPalWebhookDTO } from "../../../schemas/paypal.schema";
import { FastifyReply, FastifyRequest } from "fastify";
import { makeProcessPaymentAndDonationUseCase } from "../../../use-cases/factories/makeProcessPaymentAndDonationUseCase";

export async function processPayPalDonationController(
  request: FastifyRequest<{
    Body: PayPalWebhookDTO;
  }>,
  reply: FastifyReply
) {
  const body = request.body;

  if (body.event_type !== "PAYMENT.CAPTURE.COMPLETED") {
    return reply
      .status(200)
      .send({ message: "Payload ignored", received: true, ignored: true });
  }

  const resource = body.resource;

  const amount = parseFloat(resource.amount.value);
  const paidAt = new Date(resource.create_time);

  const projectId = resource.custom_id || null;

  const processDonationUseCase = makeProcessPaymentAndDonationUseCase();

  await processDonationUseCase.execute({
    payment: {
      provider: "PAYPAL",
      providerTxId: resource.id,
      currency: resource.amount.currency_code.toUpperCase(),
      grossAmount: amount,
      feeAmount: 0,
      netAmount: amount,
      payerEmail: null,
      payerName: null,
      payerDoc: "",
      status: "COMPLETED",
      paymentType: "DONATION",
      method: "PAYPAL_BALANCE",
      rawMetadata: resource as any,
      referenceId: projectId,
      paidAt: paidAt,
      businessMeta: {
        projectId: "file-safe-hub",
        origin: "paypal_webhook",
      },
    },
  });

  return reply.status(201).send({
    message: "Donation registered.",
    received: true,
    ignored: false,
  });
}
