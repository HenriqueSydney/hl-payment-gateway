import { StripeWebhookDTO } from "../../../schemas/stripe.schema";
import { FastifyReply, FastifyRequest } from "fastify";
import { makeProcessPaymentAndDonationUseCase } from "../../../use-cases/factories/makeProcessPaymentAndDonationUseCase";

export async function processStripeDonationController(
  request: FastifyRequest<{
    Body: StripeWebhookDTO;
  }>,
  reply: FastifyReply
) {
  const event = request.body;

  if (event.type !== "payment_intent.succeeded") {
    return reply
      .status(200)
      .send({ message: "Payload ignored", received: true, ignored: true });
  }

  const paymentIntent = event.data.object;

  const processDonationUseCase = makeProcessPaymentAndDonationUseCase();

  const amountInDecimal = paymentIntent.amount / 100;

  const eventDate = new Date(event.created * 1000);

  await processDonationUseCase.execute({
    payment: {
      provider: "STRIPE",
      providerTxId: paymentIntent.id,
      currency: paymentIntent.currency.toUpperCase(),
      grossAmount: amountInDecimal,
      feeAmount: 0,
      netAmount: amountInDecimal,
      payerEmail: paymentIntent.receipt_email || null,
      payerName: null,
      payerDoc: "",
      status: paymentIntent.status === "succeeded" ? "COMPLETED" : "PENDING",
      paymentType: "DONATION",
      method:
        paymentIntent.payment_method_types?.[0]?.toUpperCase() === "PIX"
          ? "PIX"
          : "CREDIT_CARD",
      rawMetadata: paymentIntent.metadata || {},
      referenceId: (paymentIntent.metadata as any)?.projectId || null,
      paidAt: eventDate,
      businessMeta: { projectId: "file-safe-hub" },
    },
  });

  return reply.status(201).send({
    message: "Donation registered.",
    received: true,
    ignored: false,
  });
}
