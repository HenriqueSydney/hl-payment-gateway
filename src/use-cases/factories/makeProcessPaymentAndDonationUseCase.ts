import { makePaymentRepository } from "../../repositories/factories/makePaymentRepository";
import { PaymentService } from "../../services/implementations/PaymentService";
import {
  IProcessPaymentAndDonationUseCase,
  ProcessPaymentAndDonationUseCase,
} from "../processPaymentAndDonationUseCase";

export function makeProcessPaymentAndDonationUseCase(): IProcessPaymentAndDonationUseCase {
  const paymentRepository = makePaymentRepository();
  const paymentService = new PaymentService();
  return new ProcessPaymentAndDonationUseCase(
    paymentRepository,
    paymentService
  );
}
