import type { APIRoute } from "astro";
import { EventsService } from "@modules/events/services/events.service";
import { handleError } from "@shared/middleware/error-handler";
import { authenticate } from "@shared/middleware/auth";

export const POST: APIRoute = authenticate(async (ctx, _user) => {
  try {
    const service = new EventsService();
    const event = await service.setActive(ctx.params.id!);
    return Response.json({ ok: true, data: event });
  } catch (err) {
    return handleError(err);
  }
});
