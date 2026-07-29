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
    const espaco = await prisma.espacoFinanceiro.findUniqueOrThrow({
      where: { id: req.espacoId },
    });

    res.json({ usuario: req.usuario, espaco });
  }),
);
