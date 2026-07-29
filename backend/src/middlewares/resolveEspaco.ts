import type { NextFunction, Request, Response } from "express";
import type { Usuario } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { HttpError } from "./errorHandler.js";

declare global {
  namespace Express {
    interface Request {
      espacoId?: string;
      usuario?: Usuario;
    }
  }
}

export async function resolveEspaco(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  if (!req.auth) {
    next(new HttpError(401, "Não autenticado"));
    return;
  }

  const { userId, email } = req.auth;

  const usuario = await prisma.usuario.upsert({
    where: { id: userId },
    update: email ? { email } : {},
    create: { id: userId, email: email ?? `${userId}@desconhecido.local` },
  });

  let membro = await prisma.membroEspaco.findFirst({
    where: { usuarioId: usuario.id },
    orderBy: { criadoEm: "desc" },
  });

  if (!membro) {
    const espaco = await prisma.espacoFinanceiro.create({
      data: { nome: `Espaço de ${usuario.email}` },
    });
    membro = await prisma.membroEspaco.create({
      data: { usuarioId: usuario.id, espacoId: espaco.id, papel: "PROPRIETARIO" },
    });
  }

  req.usuario = usuario;
  req.espacoId = membro.espacoId;
  next();
}
