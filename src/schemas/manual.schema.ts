import { z } from "zod";

export const manualPaymentSchema = z.object({
  id: z.string(),
  paidAt: z.date(),
  amount: z.number().int().positive(),
  currency: z.string().length(3),
  costumer_email: z.email().nullable().optional(),
  costumer_name: z.string().min(3),
  costumer_doc: z.string().min(3).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  payment_method: z.enum([
    "CREDIT_CARD",
    "DEBIT_CARD",
    "PIX",
    "BITCOIN_ONCHAIN",
    "BITCOIN_LIGHTNING",
    "PAYPAL_BALANCE",
  ]),
});

export type ManualPaymentDTO = z.infer<typeof manualPaymentSchema>;
