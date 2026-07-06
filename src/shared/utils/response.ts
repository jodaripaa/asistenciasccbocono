export interface ApiResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
    totalPages?: number;
  };
}

export function successJson<T>(data: T, status = 200, meta?: ApiResponse["meta"]) {
  return Response.json({ ok: true, data, ...(meta ? { meta } : {}) } satisfies ApiResponse<T>, { status });
}

export function createdJson<T>(data: T) {
  return successJson(data, 201);
}

export function noContent() {
  return new Response(null, { status: 204 });
}

export function errorJson(status: number, code: string, message: string, details?: Record<string, string[]>) {
  return Response.json(
    { ok: false, error: { code, message, ...(details ? { details } : {}) } } satisfies ApiResponse,
    { status }
  );
}
