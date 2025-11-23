import { SQSEvent } from "aws-lambda";
import { prisma } from "../lib/prisma";
import { PaymentService } from "../services/implementations/PaymentService";
import { makePaymentRepository } from "../repositories/factories/makePaymentRepository";

const paymentService = new PaymentService();
const paymentRepository = makePaymentRepository();

export const handler = async (event: SQSEvent) => {
  for (const record of event.Records) {
    try {
      const body = JSON.parse(record.body);

      const { paymentId, currency } = body;

      console.log(`Processing donation: ${paymentId}`);

      const payment = await paymentRepository.findById(paymentId);

      if (!payment) {
        console.error(`Payment ${paymentId} not found.`);
        continue;
      }

      const { feeAmount, netAmount } =
        await paymentService.getFeeAmountAndCalculateNetAmount({
          grossAmount: Number(payment.grossAmount), // Garante number
          provider: payment.provider,
          providedFee: Number(payment.feeAmount), // O que veio no webhook (geralmente 0)
          providerTxId: payment.providerTxId, // Necessário para buscar no Stripe
        });

      const { brlAmount, exchangeRate } = await paymentService.convertCurrency({
        amount: netAmount,
        from: currency,
        to: "BRL",
      });

      await paymentRepository.update(paymentId, {
        feeAmount: feeAmount,
        netAmount: netAmount,
        netAmountBrl: brlAmount,
        exchangeRate: exchangeRate,
        businessMeta: {
          ...(payment.businessMeta as object),
          processedAt: new Date().toISOString(),
          processor: "sqs-worker-v1",
        },
      });

      console.log(`Donation ${paymentId} fully processed (Fee & Currency).`);
    } catch (error) {
      console.error("Error processing record:", error);
      // Jogar o erro faz o SQS tentar de novo (Retry)
      throw error;
    }
  }
};
