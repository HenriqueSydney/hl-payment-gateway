import { FastifyReply, FastifyRequest } from "fastify";
import { makeProcessPaymentAndDonationUseCase } from "../../../use-cases/factories/makeProcessPaymentAndDonationUseCase";
import { OpenNodeWebhookDTO } from "../../../schemas/opennode.schema";
import { mapOpenNodeStatus } from "../../../mappers/openNodeStatus";

export async function processOpenNodeDonationController(
  request: FastifyRequest<{
    Body: OpenNodeWebhookDTO;
  }>,
  reply: FastifyReply
) {
  const body = request.body;

  const amountInBTC = body.price / 100_000_000;

  const processDonationUseCase = makeProcessPaymentAndDonationUseCase();

  await processDonationUseCase.execute({
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
      paymentType: "DONATION",
      method:
        body.transactions.length > 0 ? "BITCOIN_ONCHAIN" : "BITCOIN_LIGHTNING",
      rawMetadata: {},
      referenceId: body.order_id !== "N/A" ? body.order_id : null,
      paidAt: new Date(),
      businessMeta: { projectId: "file-safe-hub" },
    },
  });

  return reply.status(201).send({
    message: "Donation registered.",
    received: true,
    ignored: false,
  });
}
