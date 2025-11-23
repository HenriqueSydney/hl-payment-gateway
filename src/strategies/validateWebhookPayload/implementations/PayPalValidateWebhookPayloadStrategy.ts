import { makePayPalService } from "../../../services/factories/makePayPalService";
import { IValidateWebhookPayloadStrategy } from "../IValidateWebhookPayloadStrategy";

export class PayPalValidateWebhookPayloadStrategy
  implements IValidateWebhookPayloadStrategy
{
  async validate(payload: any, headers: any): Promise<boolean> {
    const transmissionId = headers["paypal-transmission-id"];
    const transmissionTime = headers["paypal-transmission-time"];
    const transmissionSig = headers["paypal-transmission-sig"];
    const certUrl = headers["paypal-cert-url"];
    const authAlgo = headers["paypal-auth-algo"];

    // Validação básica de existência
    if (
      !transmissionId ||
      !transmissionTime ||
      !transmissionSig ||
      !certUrl ||
      !authAlgo
    ) {
      console.error("[PayPal Strategy] Headers de segurança ausentes.");
      return false;
    }

    // 2. Instancia o serviço via Factory
    const paypalService = makePayPalService();

    // 3. Delega a verificação para o serviço
    return await paypalService.verifyWebhookSignature({
      authAlgo,
      certUrl,
      transmissionId,
      transmissionSig,
      transmissionTime,
      webhookEvent: payload,
    });
  }
}
