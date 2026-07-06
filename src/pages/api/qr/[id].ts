import type { APIRoute } from "astro";
import { QrService } from "@modules/qr/services/qr.service";
import { handleError } from "@shared/middleware/error-handler";
import { authenticate } from "@shared/middleware/auth";

export const GET: APIRoute = authenticate(async (ctx, _user) => {
  try {
    const service = new QrService();
    const qrBuffer = await service.generateForMember(ctx.params.id!);
    return new Response(new Uint8Array(qrBuffer), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    return handleError(err);
  }
});
