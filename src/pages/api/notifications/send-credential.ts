import type { APIRoute } from "astro";
import { NotificationsService } from "@modules/notifications/services/notifications.service";
import { z } from "zod";
import { handleError } from "@shared/middleware/error-handler";
import { authenticate } from "@shared/middleware/auth";

const sendSchema = z.object({
  memberId: z.string().uuid(),
  method: z.enum(["email", "whatsapp"]),
});

export const POST: APIRoute = authenticate(async (_ctx, _user) => {
  try {
    const body = await _ctx.request.json();
    const { memberId, method } = sendSchema.parse(body);

    const service = new NotificationsService();
    let result: { sent: boolean; to: string };

    if (method === "email") {
      result = await service.sendCredentialEmail(memberId);
    } else {
      result = await service.sendCredentialWhatsApp(memberId);
    }

    return Response.json({ ok: true, data: result }, { status: 200 });
  } catch (err) {
    return handleError(err);
  }
});
