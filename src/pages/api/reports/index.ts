import type { APIRoute } from "astro";
import { ReportsService } from "@modules/reports/services/reports.service";
import { ExportService } from "@modules/reports/services/export.service";
import { handleError } from "@shared/middleware/error-handler";
import { authenticate } from "@shared/middleware/auth";

export const GET: APIRoute = authenticate(async (ctx, _user) => {
  try {
    const type = ctx.url.searchParams.get("type") as string;
    const format = ctx.url.searchParams.get("format") ?? "json";
    const params: Record<string, string> = {};

    ctx.url.searchParams.forEach((value, key) => {
      if (key !== "type" && key !== "format") params[key] = value;
    });

    const service = new ReportsService();
    const data = await service.generate(type as any, params);

    if (format === "xlsx") {
      const exportService = new ExportService();
      const buffer = await exportService.toExcel(data);
      return new Response(new Uint8Array(buffer), {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="reporte-${type}-${Date.now()}.xlsx"`,
        },
      });
    }

    if (format === "html") {
      const exportService = new ExportService();
      const html = exportService.toHtml(data);
      return new Response(html, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    return Response.json({ ok: true, data });
  } catch (err) {
    return handleError(err);
  }
});
