import { makePaymentQueue } from "../../queues/factories/makePaymentQueue";
import { makePaymentRepository } from "../../repositories/factories/makePaymentRepository";
import {
  IProcessPaymentAndDonationUseCase,
  ProcessPaymentAndDonationUseCase,
} from "../processPaymentAndDonationUseCase";

export function makeProcessPaymentAndDonationUseCase(): IProcessPaymentAndDonationUseCase {
  const paymentRepository = makePaymentRepository();
  const paymentQueue = makePaymentQueue();
  return new ProcessPaymentAndDonationUseCase(paymentRepository, paymentQueue);
}
