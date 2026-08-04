import type { NextFunction, Request, Response } from "express";
import { asyncHandler } from "./asyncHandler.js";
import { prisma } from "../lib/prisma.js";
import { HttpError } from "./errorHandler.js";

declare global {
  namespace Express {
    interface Request {
      espacoId?: string;
    }
  }
}

export const resolveEspaco = asyncHandler(async function resolveEspaco(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  if (!req.auth) {
    next(new HttpError(401, "Não autenticado"));
    return;
  }

  const { userId, email } = req.auth;

  const membro = await prisma.$transaction(async (tx) => {
    // Serializa requisições concorrentes do mesmo usuário para que duas não
    // passem juntas pelo "findFirst" antes de qualquer uma criar o espaço.
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${userId})::bigint)`;

    const existente = await tx.membroEspaco.findFirst({
      where: { usuarioId: userId },
      orderBy: { criadoEm: "desc" },
    });
    if (existente) {
      return existente;
    }

    const usuario = await tx.usuario.upsert({
      where: { id: userId },
      update: email ? { email } : {},
      create: { id: userId, email: email ?? `${userId}@desconhecido.local` },
    });
    const espaco = await tx.espacoFinanceiro.create({
      data: { nome: `Espaço de ${usuario.email}` },
    });
    return tx.membroEspaco.create({
      data: { usuarioId: usuario.id, espacoId: espaco.id, papel: "PROPRIETARIO" },
    });
  });

  req.espacoId = membro.espacoId;
  next();
});
