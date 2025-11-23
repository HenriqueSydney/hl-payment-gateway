import { IPaymentRepository } from "../IPaymentRepository";
import { PrismaPaymentRepository } from "../implementation/PrismaPaymentRepository";

export function makePaymentRepository(): IPaymentRepository {
  return new PrismaPaymentRepository();
}
