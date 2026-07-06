import type { APIRoute } from "astro";
import { EventsService } from "@modules/events/services/events.service";
import { createEventSchema, eventQuerySchema } from "@modules/events/schemas/events.schema";
import { handleError } from "@shared/middleware/error-handler";
import { authenticate } from "@shared/middleware/auth";

export const GET: APIRoute = authenticate(async (ctx, _user) => {
  try {
    const query = eventQuerySchema.parse(Object.fromEntries(ctx.url.searchParams));
    const service = new EventsService();
    const result = await service.list(query);
    return Response.json({ ok: true, data: result });
  } catch (err) {
    return handleError(err);
  }
});

export const POST: APIRoute = authenticate(async (ctx, user) => {
  try {
    const body = await ctx.request.json();
    const input = createEventSchema.parse(body);
    const service = new EventsService();
    const event = await service.create(input, user.userId);
    return Response.json({ ok: true, data: event }, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
});
