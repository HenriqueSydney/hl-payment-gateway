import { z } from "zod";

const stripeObjectSchema = z.object({
  id: z.string(), // Ex: "pi_3MtwPdLkdIwHg7..."
  object: z.literal("payment_intent"),
  amount: z.number().int().positive(), // ATENÇÃO: Vem em centavos (ex: 1000 = R$ 10,00)
  amount_received: z.number().int(),
  currency: z.string().length(3), // "brl", "usd"
  status: z.string(), // "succeeded"
  receipt_email: z.string().nullable().optional(),
  metadata: z.record(z.string(), z.any()).optional(), // Seus metadados customizados

  // O Stripe pode mandar latest_charge como string (ID) ou objeto expandido
  // Geralmente no webhook vem apenas o ID ou null
  latest_charge: z.union([z.string(), z.null()]).optional(),

  payment_method_types: z.array(z.string()).optional(), // ["card"] ou ["pix"]
});

// A estrutura "Envelope" do evento do Stripe
export const stripeWebhookSchema = z.object({
  id: z.string(), // ID do evento (evt_...)
  type: z.string(), // O tipo do evento, ex: "payment_intent.succeeded"
  api_version: z.string().optional(),
  created: z.number(),
  data: z.object({
    object: stripeObjectSchema,
  }),
});

// Este é o tipo que você usará no Controller
export type StripeWebhookDTO = z.infer<typeof stripeWebhookSchema>;
