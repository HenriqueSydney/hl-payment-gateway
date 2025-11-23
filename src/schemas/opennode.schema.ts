import { z } from "zod";

const openNodeTransactionSchema = z.object({
  address: z.string().optional(),
  created_at: z.string().optional(), 
  settled_at: z.string().optional(),
  tx: z.string().optional(), 
  status: z.string().optional(),
  amount: z.coerce.number().optional(),
});

export const openNodeWebhookSchema = z.object({
  id: z.string(),
  status: z.enum([
    "paid",
    "underpaid",
    "processing",
    "pending",
    "expired",
    "refunded"
  ]),
  
  order_id: z.string().optional().nullable(),
  
  description: z.string().optional(),
  
  price: z.coerce.number(), 
  fee: z.coerce.number(),
  
  auto_settle: z.coerce.number().optional(), 
  hashed_order: z.string(), 
   
  address: z.string().optional(), 
  missing_amt: z.coerce.number().optional().default(0), 
  overpaid_by: z.coerce.number().optional().default(0),
  
  transactions: z.array(openNodeTransactionSchema).optional().default([]),
  
  callback_url: z.string().optional(),
  success_url: z.string().optional(),
});

export type OpenNodeWebhookDTO = z.infer<typeof openNodeWebhookSchema>;