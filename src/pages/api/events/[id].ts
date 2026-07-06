import type { APIRoute } from "astro";
import { EventsService } from "@modules/events/services/events.service";
import { updateEventSchema } from "@modules/events/schemas/events.schema";
import { handleError } from "@shared/middleware/error-handler";
import { authenticate } from "@shared/middleware/auth";

export const GET: APIRoute = authenticate(async (ctx, _user) => {
  try {
    const service = new EventsService();
    const event = await service.getById(ctx.params.id!);
    return Response.json({ ok: true, data: event });
  } catch (err) {
    return handleError(err);
  }
});

export const PUT: APIRoute = authenticate(async (ctx, _user) => {
  try {
    const body = await ctx.request.json();
    const input = updateEventSchema.parse(body);
    const service = new EventsService();
    const event = await service.update(ctx.params.id!, input);
    return Response.json({ ok: true, data: event });
  } catch (err) {
    return handleError(err);
  }
});
