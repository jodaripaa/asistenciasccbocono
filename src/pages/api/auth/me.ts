import type { APIRoute } from "astro";
import { AuthService } from "@modules/auth/services/auth.service";
import { authenticate } from "@shared/middleware/auth";

export const GET: APIRoute = authenticate(async (_ctx, user) => {
  const service = new AuthService();
  const userData = await service.me(user.userId);
  return Response.json({ ok: true, data: userData });
});
