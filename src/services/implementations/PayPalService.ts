import {
  IPayPalService,
  PayPalCaptureDetails,
  PayPalVerifySignatureParams,
} from "../IPayPalService";
import { env } from "../../env";

export class PayPalService implements IPayPalService {
  async getCaptureDetails(captureId: string): Promise<PayPalCaptureDetails> {
    try {
      const accessToken = await this.getAccessToken();

      const response = await fetch(
        `${env.PAYPAL_API_URL}/v2/payments/captures/${captureId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Erro ao buscar Capture PayPal: ${response.statusText}`
        );
      }

      const data = await response.json();

      const breakdown = data.seller_receivable_breakdown;

      if (!breakdown) {       
        console.warn(
          `[PayPalService] Breakdown não encontrado para ${captureId}`
        );
        return {
          gross_amount: parseFloat(data.amount.value),
          paypal_fee: 0,
          net_amount: parseFloat(data.amount.value),
          currency_code: data.amount.currency_code,
        };
      }

      return {
        gross_amount: parseFloat(breakdown.gross_amount.value),
        paypal_fee: parseFloat(breakdown.paypal_fee.value),
        net_amount: parseFloat(breakdown.net_amount.value),
        currency_code: breakdown.gross_amount.currency_code,
      };
    } catch (error) {
      console.error("[PayPalService] Erro ao buscar detalhes:", error);
      throw error;
    }
  }

  async verifyWebhookSignature(
    params: PayPalVerifySignatureParams
  ): Promise<boolean> {
    try {
      const accessToken = await this.getAccessToken();

      const verificationBody = {
        auth_algo: params.authAlgo,
        cert_url: params.certUrl,
        transmission_id: params.transmissionId,
        transmission_sig: params.transmissionSig,
        transmission_time: params.transmissionTime,
        webhook_id: env.PAYPAL_WEBHOOK_ID,
        webhook_event: params.webhookEvent,
      };

      // 3. Chamar a API de Verificação do PayPal
      const response = await fetch(
        `${env.PAYPAL_API_URL}/v1/notifications/verify-webhook-signature`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(verificationBody),
        }
      );

      if (!response.ok) {
        const err = await response.text();
        console.error("[PayPalService] Erro na API de verificação:", err);
        return false;
      }

      const data = await response.json();

      return data.verification_status === "SUCCESS";
    } catch (error) {
      console.error("[PayPalService] Exceção na validação:", error);
      return false;
    }
  }

  private async getAccessToken(): Promise<string> {
    const auth = Buffer.from(
      `${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`
    ).toString("base64");

    const response = await fetch(`${env.PAYPAL_API_URL}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    if (!response.ok) {
      throw new Error("Falha ao autenticar com PayPal");
    }

    const data = await response.json();
    return data.access_token;
  }
}
