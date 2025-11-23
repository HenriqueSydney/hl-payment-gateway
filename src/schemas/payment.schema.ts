import { z } from "zod";

export const PaymentIngestSchema = z.object({
  provider: z.enum(["PAYPAL", "STRIPE", "OPENNODE", "MERCADO_PAGO", "MANUAL"]),
  providerTxId: z.string().min(1),
  payerEmail: z.string().email().optional().nullable(),
  payerName: z.string().optional().nullable(),
  grossAmount: z.coerce.number().positive(),
  feeAmount: z.coerce.number().min(0),
  netAmount: z.coerce.number(), // Pode ser negativo se houver estorno/taxa alta
  currency: z.string().length(3).toUpperCase(),
  status: z.enum(["PENDING", "COMPLETED", "FAILED", "REFUNDED"]),
  rawMetadata: z.record(z.string(), z.any()).optional(),
  businessMeta: z.record(z.string(), z.any()).optional().default({}),
  method: z.enum([
    "CREDIT_CARD",
    "DEBIT_CARD",
    "PIX",
    "BITCOIN_ONCHAIN",
    "BITCOIN_LIGHTNING",
    "PAYPAL_BALANCE",
  ]),
  paymentType: z.enum(["DONATION", "FREELANCE_JOB", "FREELANCE_ESCROW"]),
  paidAt: z.date().nullable().optional(),
  payerDoc: z.string(),
  referenceId: z.string(),
});

export type PaymentIngestDTO = z.infer<typeof PaymentIngestSchema>;
