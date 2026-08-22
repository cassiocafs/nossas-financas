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

importacaoRouter.get(
  "/transacoes/modelo",
  asyncHandler(async (_req, res) => {
    const planilha = importacaoService.gerarPlanilhaModelo();
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="modelo-importacao-transacoes.xlsx"',
    );
    res.send(planilha);
  }),
);

importacaoRouter.post(
  "/transacoes/preview",
  upload.array("arquivos", 10),
  asyncHandler(async (req, res) => {
    const arquivos = req.files as Express.Multer.File[] | undefined;
    if (!arquivos || arquivos.length === 0) throw new HttpError(400, "Nenhum arquivo enviado");

    const preview = await importacaoService.gerarPreviewImportacao(
      req.espacoId!,
      arquivos.map((arquivo) => ({ nome: arquivo.originalname, buffer: arquivo.buffer })),
    );
    res.json(preview);
  }),
);

importacaoRouter.post(
  "/transacoes",
  upload.array("arquivos", 10),
  asyncHandler(async (req, res) => {
    const arquivos = req.files as Express.Multer.File[] | undefined;
    if (!arquivos || arquivos.length === 0) throw new HttpError(400, "Nenhum arquivo enviado");

    res.setHeader("Content-Type", "application/x-ndjson; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");

    try {
      const resultado = await importacaoService.importarTransacoesXls(
        req.espacoId!,
        arquivos.map((arquivo) => ({ nome: arquivo.originalname, buffer: arquivo.buffer })),
        (processadas, total) => {
          res.write(`${JSON.stringify({ tipo: "progresso", processadas, total })}\n`);
        },
      );
      res.write(`${JSON.stringify({ tipo: "concluido", resultado })}\n`);
    } catch (err) {
      const mensagem =
        err instanceof HttpError ? err.message : "Erro ao importar arquivo";
      res.write(`${JSON.stringify({ tipo: "erro", mensagem })}\n`);
    } finally {
      res.end();
    }
  }),
);
