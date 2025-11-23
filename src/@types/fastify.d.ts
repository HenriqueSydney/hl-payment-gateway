import "fastify";

declare module "fastify" {
  interface FastifyContextConfig {
    provider?: string;
    rawBody?: boolean;
  }
}
