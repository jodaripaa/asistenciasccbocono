import type { APIContext, AstroCookies } from "astro";
import { verifyToken, type TokenPayload } from "@shared/utils/jwt";
import { UnauthorizedError } from "@shared/errors/app-error";
import { errorJson } from "@shared/utils/response";

const TOKEN_COOKIE = "auth_token";

export function getTokenFromCookies(cookies: AstroCookies): string | undefined {
  return cookies.get(TOKEN_COOKIE)?.value;
}

export function setTokenCookie(cookies: AstroCookies, token: string): void {
  cookies.set(TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function removeTokenCookie(cookies: AstroCookies): void {
  cookies.delete(TOKEN_COOKIE, { path: "/" });
}

export type AuthenticatedHandler = (_ctx: APIContext, _user: TokenPayload) => Promise<Response>;

export function authenticate(handler: AuthenticatedHandler) {
  return async (ctx: APIContext): Promise<Response> => {
    try {
      const token = getTokenFromCookies(ctx.cookies);
      if (!token) {
        throw new UnauthorizedError();
      }
      const user = await verifyToken(token);
      return handler(ctx, user);
    } catch (e) {
      if (e instanceof UnauthorizedError) {
        return errorJson(401, "UNAUTHORIZED", "No autorizado");
      }
      return errorJson(401, "TOKEN_INVALID", "Token inválido o expirado");
    }
  };
}

export function requireRole(...roles: string[]) {
  return (handler: AuthenticatedHandler) => {
    return async (ctx: APIContext): Promise<Response> => {
      try {
        const token = getTokenFromCookies(ctx.cookies);
        if (!token) {
          throw new UnauthorizedError();
        }
        const user = await verifyToken(token);
        if (!roles.includes(user.role)) {
          return errorJson(403, "FORBIDDEN", "No tienes permisos para esta acción");
        }
        return handler(ctx, user);
      } catch (e) {
        if (e instanceof UnauthorizedError) {
          return errorJson(401, "UNAUTHORIZED", "No autorizado");
        }
        return errorJson(401, "TOKEN_INVALID", "Token inválido o expirado");
      }
    };
  };
}
