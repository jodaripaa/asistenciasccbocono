import type { APIRoute } from "astro";
import { MembersService } from "@modules/members/services/members.service";
import { createMemberSchema, memberQuerySchema } from "@modules/members/schemas/members.schema";
import { handleError } from "@shared/middleware/error-handler";
import { authenticate } from "@shared/middleware/auth";

export const GET: APIRoute = authenticate(async (ctx, _user) => {
  try {
    const query = memberQuerySchema.parse(Object.fromEntries(ctx.url.searchParams));
    const service = new MembersService();
    const result = await service.list(query);
    return Response.json({ ok: true, data: result });
  } catch (err) {
    return handleError(err);
  }
});

export const POST: APIRoute = authenticate(async (ctx, user) => {
  try {
    const body = await ctx.request.json();
    const input = createMemberSchema.parse(body);
    const service = new MembersService();
    const member = await service.create(input, user.userId);
    return Response.json({ ok: true, data: member }, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
});
