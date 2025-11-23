import { PaymentService } from "../implementations/PaymentService";

export function makePaymentService() {
  return new PaymentService();
}
