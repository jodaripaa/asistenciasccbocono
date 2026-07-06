import type { APIRoute } from "astro";
import { removeTokenCookie } from "@shared/middleware/auth";

export const POST: APIRoute = async (ctx) => {
  removeTokenCookie(ctx.cookies);
  return Response.json({ ok: true, data: { message: "Sesión cerrada" } });
};
