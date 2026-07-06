import { SignJWT, jwtVerify, type JWTPayload } from "jose";

const getSecret = () => new TextEncoder().encode(process.env.JWT_SECRET);

export interface TokenPayload extends JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export async function signToken(payload: Omit<TokenPayload, "exp" | "iat">): Promise<string> {
  const expiresIn = process.env.JWT_EXPIRES_IN ?? "7d";

  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<TokenPayload> {
  const { payload } = await jwtVerify(token, getSecret());
  return payload as unknown as TokenPayload;
}
