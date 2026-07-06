import type { APIRoute } from "astro";
import { DashboardService } from "@modules/dashboard/services/dashboard.service";
import { handleError } from "@shared/middleware/error-handler";
import { authenticate } from "@shared/middleware/auth";

export const GET: APIRoute = authenticate(async (_ctx, _user) => {
  try {
    const service = new DashboardService();
    const stats = await service.getStats();
    return Response.json({ ok: true, data: stats });
  } catch (err) {
    return handleError(err);
  }
});
