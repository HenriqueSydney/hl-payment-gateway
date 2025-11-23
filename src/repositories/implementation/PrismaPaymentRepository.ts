import { Payment, Prisma } from "../../database/generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { IPaymentRepository } from "../IPaymentRepository";

export class PrismaPaymentRepository implements IPaymentRepository {
  async upsert(data: Prisma.PaymentUncheckedCreateInput): Promise<Payment> {
    const payment = await prisma.payment.upsert({
      where: {
        providerTxId: data.providerTxId,
      },
      create: data,
      update: {
        status: data.status,
        paidAt: data.paidAt,
        rawMetadata: data.rawMetadata,
        businessMeta: data.businessMeta,
        feeAmount: data.feeAmount,
        netAmount: data.netAmount,
        updatedAt: new Date(),
      },
    });

    return payment;
  }

  async update(
    paymentId: string,
    data: Prisma.PaymentUncheckedUpdateInput
  ): Promise<Payment> {
    const payment = await prisma.payment.update({
      where: { id: paymentId },
      data: data,
    });

    return payment;
  }
  async findById(id: string): Promise<Payment | null> {
    const payment = await prisma.payment.findUnique({
      where: { id },
    });

    return payment;
  }
}
