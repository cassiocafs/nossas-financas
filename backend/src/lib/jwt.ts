import { createRemoteJWKSet, jwtVerify } from "jose";
import { env } from "../env.js";

const remoteJwks = env.SUPABASE_JWT_SECRET
  ? null
  : createRemoteJWKSet(
      new URL(`${env.SUPABASE_URL}/auth/v1/.well-known/jwks.json`),
    );

export interface SupabaseJwtPayload {
  sub: string;
  email?: string;
}

export async function verifySupabaseToken(
  token: string,
): Promise<SupabaseJwtPayload> {
  const { payload } = env.SUPABASE_JWT_SECRET
    ? await jwtVerify(token, new TextEncoder().encode(env.SUPABASE_JWT_SECRET))
    : await jwtVerify(token, remoteJwks!);

  if (typeof payload.sub !== "string") {
    throw new Error("Token sem claim 'sub' válida");
  }

  return { sub: payload.sub, email: payload.email as string | undefined };
}
