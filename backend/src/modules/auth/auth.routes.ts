import { Router } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { authenticate } from "../../middlewares/authenticate.js";
import { asyncHandler } from "../../middlewares/asyncHandler.js";
import { resolveEspaco } from "../../middlewares/resolveEspaco.js";
import { HttpError } from "../../middlewares/errorHandler.js";
import { excluirContaUsuario } from "./auth.service.js";

export const authRouter = Router();

authRouter.post(
  "/sync",
  authenticate,
  resolveEspaco,
  asyncHandler(async (req, res) => {
    const { userId, email, nome } = req.auth!;

    let usuario;
    try {
      usuario = await prisma.usuario.upsert({
        where: { id: userId },
        update: { ...(email ? { email } : {}), ...(nome ? { nome } : {}) },
        create: {
          id: userId,
          email: email ?? `${userId}@desconhecido.local`,
          nome: nome ?? null,
        },
      });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002" &&
        (err.meta?.target as string[] | undefined)?.includes("email")
      ) {
        throw new HttpError(
          409,
          "Já existe uma conta com esse e-mail. Entre com e-mail e senha.",
        );
      }
      throw err;
    }

    const espaco = await prisma.espacoFinanceiro.findUniqueOrThrow({
      where: { id: req.espacoId },
    });

    res.json({ usuario, espaco });
  }),
);

authRouter.delete(
  "/me",
  authenticate,
  asyncHandler(async (req, res) => {
    await excluirContaUsuario(req.auth!.userId);
    res.status(204).end();
  }),
);
