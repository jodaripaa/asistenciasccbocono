import type { APIRoute } from "astro";
import { AttendanceService } from "@modules/attendance/services/attendance.service";
import { attendanceQuerySchema, manualAttendanceSchema } from "@modules/attendance/schemas/attendance.schema";
import { handleError } from "@shared/middleware/error-handler";
import { authenticate } from "@shared/middleware/auth";

export const GET: APIRoute = authenticate(async (ctx, _user) => {
  try {
    const query = attendanceQuerySchema.parse(Object.fromEntries(ctx.url.searchParams));
    const service = new AttendanceService();
    const result = await service.list(query);
    return Response.json({ ok: true, data: result });
  } catch (err) {
    return handleError(err);
  }
});

export const POST: APIRoute = authenticate(async (ctx, user) => {
  try {
    const body = await ctx.request.json();
    const input = manualAttendanceSchema.parse(body);
    const service = new AttendanceService();
    const attendance = await service.register(input, user.userId);
    return Response.json({ ok: true, data: attendance }, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
});
