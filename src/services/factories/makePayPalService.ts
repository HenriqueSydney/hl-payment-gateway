import { PayPalService } from "../implementations/PayPalService";

export function makePayPalService() {
  return new PayPalService();
}
