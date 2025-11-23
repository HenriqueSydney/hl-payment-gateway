import { FastifyReply, FastifyRequest } from "fastify";
import { ManualPaymentDTO } from "../../../schemas/manual.schema";
import { randomUUID } from "crypto";
import { makeProcessPaymentAndDonationUseCase } from "../../../use-cases/factories/makeProcessPaymentAndDonationUseCase";

export async function processManualPaymentController(
  request: FastifyRequest<{
    Body: ManualPaymentDTO;
  }>,
  reply: FastifyReply
) {
  const body = request.body;

  const processDonationUseCase = makeProcessPaymentAndDonationUseCase();

  await processDonationUseCase.execute({
    payment: {
      businessMeta: { projectId: body.id },
      provider: "MANUAL",
      providerTxId: randomUUID(),
      currency: body.currency.toUpperCase(),
      grossAmount: body.amount,
      feeAmount: 0,
      netAmount: body.amount,
      payerEmail: body.costumer_email,
      payerName: body.costumer_name,
      payerDoc: body.costumer_doc,
      status: "COMPLETED",
      paymentType: "FREELANCE_JOB",
      method: body.payment_method,
      rawMetadata: body.metadata || {},
      paidAt: new Date(body.paidAt),
      referenceId: body.id,
    },
  });

  return reply.status(201).send({
    message: "Payment registered.",
    received: true,
    ignored: false,
  });
}
