import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { asyncHandler } from "../../middlewares/asyncHandler.js";
import { resolveEspaco } from "../../middlewares/resolveEspaco.js";
import { idSchema } from "../../lib/schemas.js";
import {
  criarContaSchema,
  editarContaSchema,
  excluirContaSchema,
  listarContasQuerySchema,
} from "./contas.schemas.js";
import * as contasService from "./contas.service.js";

export const contasRouter = Router();

contasRouter.use(authenticate, resolveEspaco);

contasRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const { incluirInativas } = listarContasQuerySchema.parse(req.query);
    const contas = await contasService.listarContas(req.espacoId!, incluirInativas ?? false);
    res.json(contas);
  }),
);

contasRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const input = criarContaSchema.parse(req.body);
    const conta = await contasService.criarConta(req.espacoId!, input);
    res.status(201).json(conta);
  }),
);

contasRouter.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = idSchema.parse(req.params.id);
    const input = editarContaSchema.parse(req.body);
    const conta = await contasService.editarConta(req.espacoId!, id, input);
    res.json(conta);
  }),
);

contasRouter.get(
  "/:id/impacto-exclusao",
  asyncHandler(async (req, res) => {
    const id = idSchema.parse(req.params.id);
    const impacto = await contasService.buscarImpactoExclusao(req.espacoId!, id);
    res.json(impacto);
  }),
);

contasRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = idSchema.parse(req.params.id);
    const opts = excluirContaSchema.parse(req.body ?? {});
    await contasService.excluirConta(req.espacoId!, id, opts);
    res.status(204).send();
  }),
);
