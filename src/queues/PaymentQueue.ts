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
      console.error(`FALHA AO ENFILEIRAR DOAÇÃO ${paymentId}`, error);
    }
  }
}
