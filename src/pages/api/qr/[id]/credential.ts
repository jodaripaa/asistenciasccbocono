import type { APIRoute } from "astro";
import { CredentialService } from "@modules/qr/services/credential.service";
import { handleError } from "@shared/middleware/error-handler";
import { authenticate } from "@shared/middleware/auth";

export const GET: APIRoute = authenticate(async (_ctx, _user) => {
  try {
    const service = new CredentialService();
    const data = await service.getCredentialData(_ctx.params.id!);
    return Response.json({ ok: true, data });
  } catch (err) {
    return handleError(err);
  }
});
