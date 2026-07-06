import type { APIRoute } from "astro";
import { AuthService } from "@modules/auth/services/auth.service";
import { loginSchema } from "@modules/auth/schemas/auth.schema";
import { handleError } from "@shared/middleware/error-handler";
import { setTokenCookie } from "@shared/middleware/auth";

export const POST: APIRoute = async (ctx) => {
  try {
    const body = await ctx.request.json();
    const input = loginSchema.parse(body);
    const service = new AuthService();
    const result = await service.login(input);

    setTokenCookie(ctx.cookies, result.token);

    return Response.json({ ok: true, data: { user: result.user } }, { status: 200 });
  } catch (err) {
    return handleError(err);
  }
};
