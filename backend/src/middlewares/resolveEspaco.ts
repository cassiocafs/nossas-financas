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

  // Caminho comum: o usuário já tem espaço, então evitamos abrir transação
  // e tirar lock a cada requisição.
  const existente = await prisma.membroEspaco.findFirst({
    where: { usuarioId: userId },
    orderBy: { criadoEm: "desc" },
  });

  if (existente) {
    req.espacoId = existente.espacoId;
    next();
    return;
  }

  // Caminho raro: primeiro acesso do usuário. Usa transação + lock para
  // evitar que duas requisições concorrentes criem espaços duplicados.
  const membro = await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${userId})::bigint)`;

    const existenteAposLock = await tx.membroEspaco.findFirst({
      where: { usuarioId: userId },
      orderBy: { criadoEm: "desc" },
    });
    if (existenteAposLock) {
      return existenteAposLock;
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
