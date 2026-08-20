import type { NextFunction, Request, Response } from "express";
import { verifySupabaseToken } from "../lib/jwt.js";
import { HttpError } from "./errorHandler.js";

declare global {
  namespace Express {
    interface Request {
      auth?: { userId: string; email?: string; nome?: string };
    }
  }
}

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const header = req.header("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    next(new HttpError(401, "Token de autenticação ausente"));
    return;
  }

  try {
    const payload = await verifySupabaseToken(token);
    req.auth = { userId: payload.sub, email: payload.email, nome: payload.nome };
    next();
  } catch {
    next(new HttpError(401, "Token de autenticação inválido"));
  }
}
