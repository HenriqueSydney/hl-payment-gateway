import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

export class PaymentQueue {
  private sqs = new SQSClient({ region: "us-east-1" });
  private queueUrl = process.env.DonationQueueUrl;

  async enqueueDonationProcessing(
    paymentId: string,
    currency: string,
    amount: number
  ) {
    if (!this.queueUrl) {
      console.error("DonationQueueUrl is not defined.");
      return;
    }

    try {
      await this.sqs.send(
        new SendMessageCommand({
          QueueUrl: this.queueUrl,
          MessageBody: JSON.stringify({
            paymentId,
            currency,
            amount,
            attempt: 1,
          }),
        })
      );
    } catch (error) {
      // Se falhar o envio para fila, LOGUE IMEDIATAMENTE.
      // Isso é crítico pois o dinheiro entrou mas o processamento falhou.
      console.error(`FALHA AO ENFILEIRAR DOAÇÃO ${paymentId}`, error);
    }
  }
}
