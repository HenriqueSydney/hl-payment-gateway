import { verify } from "jsonwebtoken";
import { IValidateWebhookPayloadStrategy } from "../IValidateWebhookPayloadStrategy";
import { env } from "../../../env";


export class DefaultValidateWebhookPayloadStrategy
  implements IValidateWebhookPayloadStrategy
{
  async validate(_: any, headers: any): Promise<boolean> {
    const authHeader = headers["authorization"] || headers["Authorization"];

    if (!authHeader) {
      return false;
    }

    const parts = authHeader.split(" ");

    if (parts.length !== 2) {
      return false;
    }

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) {
      return false;
    }

    try {
      verify(token, env.JWT_SECRET);

      return true;
    } catch (error) {
      console.error("JWT Validation Strategy Failed:", error);
      return false;
    }
  }
}
