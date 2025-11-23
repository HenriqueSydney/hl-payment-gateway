import { z } from "zod";

const envSchema = z.object({
  OPEN_NODE_WEBHOOK_SECRET: z.string(),
  STRIPE_WEBHOOK_SECRET: z.string(),
  STRIPE_SECRET_KEY: z.string(),
  PAYPAL_CLIENT_ID: z.string(),
  PAYPAL_CLIENT_SECRET: z.string(),
  PAYPAL_WEBHOOK_ID: z.string(),
  PAYPAL_API_URL: z.url(),
  JWT_SECRET: z.string(),
});

const _env = envSchema.safeParse(process.env);

if (_env.success === false) {
  console.error("Invalid environment variables!", _env.error.message);
  console.error("Invalid environment variables!", _env.error.format());

  throw new Error("Invalid environment variables!");
}

export const env = _env.data;
