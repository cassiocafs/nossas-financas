import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { asyncHandler } from "../../middlewares/asyncHandler.js";
import { resolveEspaco } from "../../middlewares/resolveEspaco.js";
import { idSchema } from "../../lib/schemas.js";
import {
  criarMetaSchema,
  editarMetaSchema,
  excluirMetaQuerySchema,
  listarMetasQuerySchema,
  registrarAporteSchema,
} from "./metas.schemas.js";
import * as metasService from "./metas.service.js";

export const metasRouter = Router();

metasRouter.use(authenticate, resolveEspaco);

metasRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const { incluirArquivadas } = listarMetasQuerySchema.parse(req.query);
    const metas = await metasService.listarMetas(req.espacoId!, incluirArquivadas ?? false);
    res.json(metas);
  }),
);

metasRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const input = criarMetaSchema.parse(req.body);
    const meta = await metasService.criarMeta(req.espacoId!, input);
    res.status(201).json(meta);
  }),
);

metasRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = idSchema.parse(req.params.id);
    const meta = await metasService.buscarMeta(req.espacoId!, id);
    res.json(meta);
  }),
);

metasRouter.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = idSchema.parse(req.params.id);
    const input = editarMetaSchema.parse(req.body);
    const meta = await metasService.editarMeta(req.espacoId!, id, input);
    res.json(meta);
  }),
);

metasRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = idSchema.parse(req.params.id);
    const { confirmar } = excluirMetaQuerySchema.parse(req.query);
    await metasService.excluirMeta(req.espacoId!, id, confirmar ?? false);
    res.status(204).send();
  }),
);

metasRouter.post(
  "/:id/aportes",
  asyncHandler(async (req, res) => {
    const id = idSchema.parse(req.params.id);
    const input = registrarAporteSchema.parse(req.body);
    const resultado = await metasService.registrarAporte(req.espacoId!, id, input);
    res.status(201).json(resultado);
  }),
);

metasRouter.delete(
  "/:id/aportes/:aporteId",
  asyncHandler(async (req, res) => {
    const id = idSchema.parse(req.params.id);
    const aporteId = idSchema.parse(req.params.aporteId);
    const resultado = await metasService.removerAporte(req.espacoId!, id, aporteId);
    res.json(resultado);
  }),
);
