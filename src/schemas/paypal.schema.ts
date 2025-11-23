import { z } from "zod";

// Estrutura de valor do PayPal (Sempre String e Currency)
const paypalAmountSchema = z.object({
  currency_code: z.string().length(3), // "BRL", "USD"
  value: z.string(), // ATENÇÃO: Vem como string decimal, ex: "10.00"
});

// O objeto "Resource" (O Pagamento em si)
// Baseado no evento: PAYMENT.CAPTURE.COMPLETED
const paypalResourceSchema = z.object({
  id: z.string(), // ID da Transação (Capture ID)
  status: z.string(), // "COMPLETED", "PENDING"

  amount: paypalAmountSchema,

  final_capture: z.boolean().optional(),
  create_time: z.string(), // ISO String: "2024-01-01T12:00:00Z"

  // No PayPal, o ProjectId deve ser enviado no campo 'custom_id' na criação do pedido
  custom_id: z.string().optional().nullable(),

  // Informações do pagador (vêm aninhadas em alguns casos, mas no capture simplificado pode variar)
  // Geralmente confiamos no link do pedido, mas aqui focamos no financeiro
  seller_protection: z
    .object({
      status: z.string().optional(),
      dispute_categories: z.array(z.string()).optional(),
    })
    .optional(),
});

// A estrutura "Envelope" do Webhook do PayPal
export const paypalWebhookSchema = z.object({
  id: z.string(), // ID do Evento (WH-...)
  event_type: z.string(), // O principal é "PAYMENT.CAPTURE.COMPLETED"
  create_time: z.string(), // Data do evento
  resource_type: z.string(), // "capture"
  summary: z.string().optional(), // Texto resumo
  resource: paypalResourceSchema,
});

// DTO para uso no Controller
export type PayPalWebhookDTO = z.infer<typeof paypalWebhookSchema>;
