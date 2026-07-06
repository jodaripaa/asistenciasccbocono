import type { APIRoute } from "astro";
import { MembersService } from "@modules/members/services/members.service";
import { updateMemberSchema } from "@modules/members/schemas/members.schema";
import { handleError } from "@shared/middleware/error-handler";
import { authenticate } from "@shared/middleware/auth";

export const GET: APIRoute = authenticate(async (ctx, _user) => {
  try {
    const service = new MembersService();
    const member = await service.getById(ctx.params.id!);
    return Response.json({ ok: true, data: member });
  } catch (err) {
    return handleError(err);
  }
});

export const PUT: APIRoute = authenticate(async (ctx, _user) => {
  try {
    const body = await ctx.request.json();
    const input = updateMemberSchema.parse(body);
    const service = new MembersService();
    const member = await service.update(ctx.params.id!, input);
    return Response.json({ ok: true, data: member });
  } catch (err) {
    return handleError(err);
  }
});

export const DELETE: APIRoute = authenticate(async (ctx, _user) => {
  try {
    const service = new MembersService();
    const member = await service.deactivate(ctx.params.id!);
    return Response.json({ ok: true, data: member });
  } catch (err) {
    return handleError(err);
  }
});
