import { FastifyReply, FastifyRequest } from "fastify";
import { makeProcessPaymentAndDonationUseCase } from "../../../use-cases/factories/makeProcessPaymentAndDonationUseCase";
import { OpenNodeWebhookDTO } from "../../../schemas/opennode.schema";
import { mapOpenNodeStatus } from "../../../mappers/openNodeStatus";

export async function processOpenNodePaymentController(
  request: FastifyRequest<{
    Body: OpenNodeWebhookDTO;
  }>,
  reply: FastifyReply
) {
  const body = request.body;

  const amountInBTC = body.price / 100_000_000;

  const projectId = body.order_id !== "N/A" ? body.order_id : null;

  const processPaymentUseCase = makeProcessPaymentAndDonationUseCase();

  await processPaymentUseCase.execute({
    payment: {
      provider: "OPENNODE",
      providerTxId: body.id,
      currency: "BTC",
      grossAmount: amountInBTC,
      feeAmount: body.fee / 100_000_000,
      netAmount: (body.price - body.fee) / 100_000_000,
      payerEmail: null,
      payerName: null,
      payerDoc: "",
      status: mapOpenNodeStatus(body.status),
      paymentType: "FREELANCE_JOB",
      method:
        body.transactions.length > 0 ? "BITCOIN_ONCHAIN" : "BITCOIN_LIGHTNING",
      rawMetadata: body as any,
      referenceId: projectId,
      paidAt: new Date(),
      businessMeta: {
        projectId,
        origin: "opennode_webhook",
        description: body.description,
      },
    },
  });

  return reply.status(201).send({
    message: "Payment registered.",
    received: true,
    ignored: false,
  });
}
