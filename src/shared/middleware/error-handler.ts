import { AppError, ValidationError } from "@shared/errors/app-error";
import { errorJson } from "@shared/utils/response";

export function handleError(err: unknown): Response {
  if (err instanceof ValidationError) {
    return errorJson(400, "VALIDATION_ERROR", "Error de validación", err.errors);
  }

  if (err instanceof AppError) {
    return errorJson(err.statusCode, err.code, err.message);
  }

  if (err instanceof SyntaxError) {
    return errorJson(400, "INVALID_JSON", "JSON inválido en el cuerpo de la solicitud");
  }

  console.error("[UNEXPECTED_ERROR]", err);
  return errorJson(500, "INTERNAL_ERROR", "Error interno del servidor");
}
