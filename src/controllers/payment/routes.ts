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
import { processOpenNodePaymentController } from "./controller/processOpenNodePaymentController";
import { processStripePaymentController } from "./controller/processStripePaymentController";
import { openNodeWebhookSchema } from "../../schemas/opennode.schema";

export async function paymentRoutes(app: FastifyInstance) {
  app.post(
    "/payment/manual",
    {
      config: {
        provider: "DEFAULT",
      },
      schema: {
        tags: ["Payments"],
        description: "Endpoint for Manual Payments Includes",
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

  app.post(
    "/payment/stripe",
    {
      config: {
        rawBody: true,
        provider: "STRIPE",
      },
      schema: {
        tags: ["Payments"],
        description: "Endpoint for Stripe Payments",
        body: stripeWebhookSchema,
        response: {
          200: responseStatusCode200,
          201: responseStatusCode201,
          400: responseStatusCode400,
          401: responseStatusCode401,
          500: responseStatusCode500,
        },
      },
    },
    processStripePaymentController
  );

  app.post(
    "/payment/opennode",
    {
      config: {
        provider: "OPENNODE",
      },
      schema: {
        tags: ["Payments"],
        description: "Endpoint for OpenNode (Bitcoin) Payments",
        body: openNodeWebhookSchema,
        response: {
          200: responseStatusCode200,
          201: responseStatusCode201,
          400: responseStatusCode400,
          401: responseStatusCode401,
          500: responseStatusCode500,
        },
      },
    },
    processOpenNodePaymentController
  );
}
