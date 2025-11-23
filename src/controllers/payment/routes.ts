import { z } from "zod";
import { FastifyInstance } from "fastify";
import { stripeWebhookSchema } from "../../schemas/stripe.schema";
import { processManualPaymentController } from "./controller/processManualPaymentController";
import { manualPaymentSchema } from "../../schemas/manual.schema";
import {
  responseStatusCode200,
  responseStatusCode201,
  responseStatusCode400,
  responseStatusCode401,
  responseStatusCode500,
} from "../../schemas/fastifyResponse.schema";

export async function paymentRoutes(app: FastifyInstance) {
  app.post(
    "/payment/manual",
    {
      config: {
        provider: "DEFAULT",
      },
      schema: {
        tags: ["Donations"],
        description: "Endpoint for Stripe Donations",
        body: manualPaymentSchema,
        response: {
          200: responseStatusCode200,
          201: responseStatusCode201,
          400: responseStatusCode400,
          401: responseStatusCode401,
          500: responseStatusCode500,
        },
      },
    },
    processManualPaymentController
  );
}
