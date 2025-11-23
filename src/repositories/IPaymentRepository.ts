import { Payment, Prisma } from "../database/generated/prisma/client";

export interface IPaymentRepository {
  upsert(data: Prisma.PaymentUncheckedCreateInput): Promise<Payment>;
  update(
    paymentId: string,
    data: Prisma.PaymentUncheckedUpdateInput
  ): Promise<Payment>;
  findById(id: string): Promise<Payment | null>;
}