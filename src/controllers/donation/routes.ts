import { z } from "zod";
import { FastifyInstance } from "fastify";
import { processStripeDonationController } from "./controller/processStripeDonationController";
import { stripeWebhookSchema } from "../../schemas/stripe.schema";
import {
  responseStatusCode200,
  responseStatusCode201,
  responseStatusCode400,
  responseStatusCode401,
  responseStatusCode500,
} from "../../schemas/fastifyResponse.schema";
import { processOpenNodeDonationController } from "./controller/processOpenNodeDonationController";

export async function donationRoutes(app: FastifyInstance) {
  app.post(
    "/donation/stripe",
    {
      config: {
        rawBody: true,
        provider: "STRIPE",
      },
      schema: {
        tags: ["Donations"],
        description: "Endpoint for Stripe Donations",
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
    processStripeDonationController
  );

  app.post(
    "/donation/opennode",
    {
      config: {
        provider: "OPENNODE",
      },
      schema: {
        tags: ["Donations"],
        description: "Endpoint for OpenNode (Bitcoin) Donations",
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
    processOpenNodeDonationController
  );
}
