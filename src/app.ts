import Fastify from "fastify";
import fastifyRawBody from "fastify-raw-body";
import awsLambdaFastify from "@fastify/aws-lambda";
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from "fastify-type-provider-zod";
import { donationRoutes } from "./controllers/donation/routes";
import formBody from "@fastify/formbody";
import { validateRequestMiddleware } from "./middlewares/validateRequest";

const app = Fastify({
  logger: true,
});
app.register(formBody);

app.register(fastifyRawBody, {
  field: "rawBody",
  global: false,
  encoding: "utf8",
  runFirst: true,
});

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);
app.addHook("preHandler", validateRequestMiddleware);
const fastify = app.withTypeProvider<ZodTypeProvider>();

fastify.register(donationRoutes, { prefix: "webhook" });

app.setErrorHandler((error: any, _, reply) => {
  if (error.code === "FST_ERR_VALIDATION") {
    const errorContent = (error.validation ?? []).reduce(
      (acc, field) => ({
        message: acc.message
          ? `${acc.message}; ${
              field.message || "Erro de validação desconhecido"
            }`
          : field.message || "Erro de validação desconhecido",
        fields: [...acc.fields, field.instancePath || "(unknown field)"],
      }),
      {
        message: "",
        fields: [] as string[],
      }
    );

    return reply.status(400).send({
      message: errorContent.message,
      fields: errorContent.fields,
    });
  }

  if (error?.name === "AppError" || error?.constructor?.name === "AppError") {
    return reply
      .status((error as any).statusCode ? (error as any).statusCode : 400)
      .send({
        message: error.message,
      });
  }

  app.log.error(error);

  return reply.status(500).send({
    message: "Internal Server Error",
  });
});

// 4. Exporta o Handler para o Lambda
export const handler = awsLambdaFastify(app);
