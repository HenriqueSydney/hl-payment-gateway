import z from "zod";

export const responseStatusCode200 = z.object({
  message: z.string().describe("Message associated with the response"),
  receive: z.boolean().describe("Inform if data was received"),
  ignored: z.boolean().describe("Inform if the payload was ignored"),
});

export const responseStatusCode201 = z.object({
  message: z.string().describe("Success message"),
  receive: z.boolean().describe("Inform if data was received"),
  ignored: z.boolean().describe("Inform if the payload was ignored"),
});

export const responseStatusCode400 = z.object({
  message: z.string().describe("Custom error message"),
  fields: z.array(z.string()).optional(),
});

export const responseStatusCode401 = z.object({
  message: z.string().describe("Webhook/Request Signature Verification Failed"),
});

export const responseStatusCode500 = z.object({
  message: z.string().describe("Internal server error"),
});
