import type { APIRoute } from "astro";
import { EventsService } from "@modules/events/services/events.service";
import { handleError } from "@shared/middleware/error-handler";
import { authenticate } from "@shared/middleware/auth";

export const GET: APIRoute = authenticate(async (_ctx, _user) => {
  try {
    const service = new EventsService();
    const event = await service.getActive();
    return Response.json({ ok: true, data: event ?? null });
  } catch (err) {
    return handleError(err);
  }
});
