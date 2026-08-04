import { Router } from "express";
import { prisma } from "../../lib/prisma.js";
import { authenticate } from "../../middlewares/authenticate.js";
import { asyncHandler } from "../../middlewares/asyncHandler.js";
import { resolveEspaco } from "../../middlewares/resolveEspaco.js";

export const authRouter = Router();

authRouter.post(
  "/sync",
  authenticate,
  resolveEspaco,
  asyncHandler(async (req, res) => {
    const { userId, email } = req.auth!;

    const [usuario, espaco] = await Promise.all([
      prisma.usuario.upsert({
        where: { id: userId },
        update: email ? { email } : {},
        create: { id: userId, email: email ?? `${userId}@desconhecido.local` },
      }),
      prisma.espacoFinanceiro.findUniqueOrThrow({ where: { id: req.espacoId } }),
    ]);

    res.json({ usuario, espaco });
  }),
);
