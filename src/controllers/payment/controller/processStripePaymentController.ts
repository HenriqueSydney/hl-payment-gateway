import { StripeWebhookDTO } from "../../../schemas/stripe.schema";
import { FastifyReply, FastifyRequest } from "fastify";
import { makeProcessPaymentAndDonationUseCase } from "../../../use-cases/factories/makeProcessPaymentAndDonationUseCase";

export async function processStripePaymentController(
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

  const amountInDecimal = paymentIntent.amount / 100;

  const eventDate = new Date(event.created * 1000);

  const projectId = paymentIntent.metadata?.projectId || null;

  const processPaymentUseCase = makeProcessPaymentAndDonationUseCase();

  await processPaymentUseCase.execute({
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
      paymentType: "FREELANCE_JOB",
      method:
        paymentIntent.payment_method_types?.[0]?.toUpperCase() === "PIX"
          ? "PIX"
          : "CREDIT_CARD",
      rawMetadata: paymentIntent.metadata || {},
      referenceId: projectId,
      paidAt: eventDate,
      businessMeta: {
        projectId: projectId,
        origin: "stripe_webhook",
      },
    },
  });

  return reply.status(201).send({
    message: "Payment registered.",
    received: true,
    ignored: false,
  });
}
