import { Router } from "express";
import multer from "multer";
import { authenticate } from "../../middlewares/authenticate.js";
import { asyncHandler } from "../../middlewares/asyncHandler.js";
import { resolveEspaco } from "../../middlewares/resolveEspaco.js";
import { HttpError } from "../../middlewares/errorHandler.js";
import * as importacaoService from "./importacao.service.js";

export const importacaoRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

importacaoRouter.use(authenticate, resolveEspaco);

importacaoRouter.post(
  "/transacoes",
  upload.single("arquivo"),
  asyncHandler(async (req, res) => {
    if (!req.file) throw new HttpError(400, "Nenhum arquivo enviado");

    const resultado = await importacaoService.importarTransacoesXls(
      req.espacoId!,
      req.file.buffer,
    );
    res.json(resultado);
  }),
);
