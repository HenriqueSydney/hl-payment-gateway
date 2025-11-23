import { PaymentQueue } from "../queues/PaymentQueue";
import { IPaymentRepository } from "../repositories/IPaymentRepository";
import { PaymentIngestDTO } from "../schemas/payment.schema";
import { PaymentService } from "../services/implementations/PaymentService";

export interface IProcessPaymentAndDonationUseCase {
  execute({ payment }: { payment: PaymentIngestDTO }): Promise<void>;
}

export class ProcessPaymentAndDonationUseCase
  implements IProcessPaymentAndDonationUseCase
{
  private paymentRepository: IPaymentRepository;
  private paymentQueue: PaymentQueue;
  constructor(
    paymentRepository: IPaymentRepository,
    paymentQueue: PaymentQueue
  ) {
    this.paymentRepository = paymentRepository;
    this.paymentQueue = paymentQueue;
  }

  async execute({ payment }: { payment: PaymentIngestDTO }): Promise<void> {
    const businessMeta = {
      ...payment.businessMeta,
      origin: "webhook_integration",
    };

    const savedPayment = await this.paymentRepository.upsert({
      currency: payment.currency,
      grossAmount: payment.grossAmount,
      feeAmount: payment.feeAmount || 0,
      netAmount: payment.netAmount || payment.grossAmount,
      provider: payment.provider,
      providerTxId: payment.providerTxId,
      payerEmail: payment.payerEmail,
      payerName: payment.payerName,
      rawMetadata: payment.rawMetadata,
      status: payment.status,
      paymentType: payment.paymentType,
      businessMeta: businessMeta,
      exchangeRate: 1,
      netAmountBrl: 0,
      method: payment.method,
      payerDoc: payment.payerDoc,
      referenceId: payment.referenceId,
      paidAt: payment.paidAt || new Date(),
    });

    if (
      savedPayment.status === "COMPLETED" ||
      savedPayment.status === "PENDING"
    ) {
      await this.paymentQueue.enqueueDonationProcessing(
        savedPayment.id,
        savedPayment.currency,
        Number(savedPayment.grossAmount)
      );
    }
  }
}
