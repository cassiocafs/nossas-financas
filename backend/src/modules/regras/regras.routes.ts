import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { asyncHandler } from "../../middlewares/asyncHandler.js";
import { resolveEspaco } from "../../middlewares/resolveEspaco.js";
import { idSchema } from "../../lib/schemas.js";
import {
  criarRegraTransacaoSchema,
  editarRegraTransacaoSchema,
  sugestaoTransacaoQuerySchema,
} from "./regras.schemas.js";
import * as regrasService from "./regras.service.js";

export const regrasRouter = Router();

regrasRouter.use(authenticate, resolveEspaco);

regrasRouter.get(
  "/sugestao",
  asyncHandler(async (req, res) => {
    const { descricao } = sugestaoTransacaoQuerySchema.parse(req.query);
    const sugestao = await regrasService.sugerirParaTransacao(req.espacoId!, descricao);
    res.json(sugestao);
  }),
);

regrasRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const regras = await regrasService.listarRegras(req.espacoId!);
    res.json(regras);
  }),
);

regrasRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const input = criarRegraTransacaoSchema.parse(req.body);
    const regra = await regrasService.criarRegra(req.espacoId!, input);
    res.status(201).json(regra);
  }),
);

regrasRouter.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = idSchema.parse(req.params.id);
    const input = editarRegraTransacaoSchema.parse(req.body);
    const regra = await regrasService.editarRegra(req.espacoId!, id, input);
    res.json(regra);
  }),
);

regrasRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = idSchema.parse(req.params.id);
    await regrasService.excluirRegra(req.espacoId!, id);
    res.status(204).send();
  }),
);
