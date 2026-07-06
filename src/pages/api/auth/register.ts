import type { APIRoute } from "astro";
import { AuthService } from "@modules/auth/services/auth.service";
import { registerSchema } from "@modules/auth/schemas/auth.schema";
import { handleError } from "@shared/middleware/error-handler";
import { requireRole } from "@shared/middleware/auth";

export const POST: APIRoute = requireRole("ADMIN")(async (ctx, _user) => {
  try {
    const body = await ctx.request.json();
    const input = registerSchema.parse(body);
    const service = new AuthService();
    const user = await service.register(input);

    return Response.json({ ok: true, data: { user } }, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
});
