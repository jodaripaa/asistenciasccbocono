import type { APIRoute } from "astro";
import { AttendanceService } from "@modules/attendance/services/attendance.service";
import { scanAttendanceSchema } from "@modules/attendance/schemas/attendance.schema";
import { handleError } from "@shared/middleware/error-handler";
import { authenticate } from "@shared/middleware/auth";

export const POST: APIRoute = authenticate(async (ctx, user) => {
  try {
    const body = await ctx.request.json();
    const { qrToken, eventId } = scanAttendanceSchema.parse(body);
    const service = new AttendanceService();
    const attendance = await service.scan(qrToken, eventId, user.userId);
    return Response.json({ ok: true, data: attendance }, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
});
