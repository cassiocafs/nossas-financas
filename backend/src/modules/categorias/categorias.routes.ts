import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { asyncHandler } from "../../middlewares/asyncHandler.js";
import { resolveEspaco } from "../../middlewares/resolveEspaco.js";
import { idSchema } from "../../lib/schemas.js";
import {
  criarCategoriaSchema,
  criarGrupoSchema,
  criarRegraSchema,
  criarSubgrupoSchema,
  editarCategoriaSchema,
  editarGrupoSchema,
  editarSubgrupoSchema,
  excluirCategoriaSchema,
  sugestaoQuerySchema,
} from "./categorias.schemas.js";
import * as categoriasService from "./categorias.service.js";

export const categoriasRouter = Router();

categoriasRouter.use(authenticate, resolveEspaco);

categoriasRouter.get(
  "/grupos",
  asyncHandler(async (req, res) => {
    const resultado = await categoriasService.listarGrupos(req.espacoId!);
    res.json(resultado);
  }),
);

categoriasRouter.post(
  "/grupos",
  asyncHandler(async (req, res) => {
    const input = criarGrupoSchema.parse(req.body);
    const grupo = await categoriasService.criarGrupo(req.espacoId!, input);
    res.status(201).json(grupo);
  }),
);

categoriasRouter.patch(
  "/grupos/:id",
  asyncHandler(async (req, res) => {
    const id = idSchema.parse(req.params.id);
    const input = editarGrupoSchema.parse(req.body);
    const grupo = await categoriasService.editarGrupo(req.espacoId!, id, input);
    res.json(grupo);
  }),
);

categoriasRouter.delete(
  "/grupos/:id",
  asyncHandler(async (req, res) => {
    const id = idSchema.parse(req.params.id);
    await categoriasService.excluirGrupo(req.espacoId!, id);
    res.status(204).send();
  }),
);

categoriasRouter.post(
  "/subgrupos",
  asyncHandler(async (req, res) => {
    const input = criarSubgrupoSchema.parse(req.body);
    const subgrupo = await categoriasService.criarSubgrupo(req.espacoId!, input);
    res.status(201).json(subgrupo);
  }),
);

categoriasRouter.patch(
  "/subgrupos/:id",
  asyncHandler(async (req, res) => {
    const id = idSchema.parse(req.params.id);
    const input = editarSubgrupoSchema.parse(req.body);
    const subgrupo = await categoriasService.editarSubgrupo(req.espacoId!, id, input);
    res.json(subgrupo);
  }),
);

categoriasRouter.delete(
  "/subgrupos/:id",
  asyncHandler(async (req, res) => {
    const id = idSchema.parse(req.params.id);
    await categoriasService.excluirSubgrupo(req.espacoId!, id);
    res.status(204).send();
  }),
);

categoriasRouter.get(
  "/sugestao",
  asyncHandler(async (req, res) => {
    const { descricao } = sugestaoQuerySchema.parse(req.query);
    const sugestao = await categoriasService.sugerirCategoria(req.espacoId!, descricao);
    res.json(sugestao);
  }),
);

categoriasRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const input = criarCategoriaSchema.parse(req.body);
    const categoria = await categoriasService.criarCategoria(req.espacoId!, input);
    res.status(201).json(categoria);
  }),
);

categoriasRouter.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = idSchema.parse(req.params.id);
    const input = editarCategoriaSchema.parse(req.body);
    const categoria = await categoriasService.editarCategoria(req.espacoId!, id, input);
    res.json(categoria);
  }),
);

categoriasRouter.get(
  "/:id/impacto-exclusao",
  asyncHandler(async (req, res) => {
    const id = idSchema.parse(req.params.id);
    const impacto = await categoriasService.buscarImpactoExclusaoCategoria(req.espacoId!, id);
    res.json(impacto);
  }),
);

categoriasRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = idSchema.parse(req.params.id);
    const opts = excluirCategoriaSchema.parse(req.body ?? {});
    await categoriasService.excluirCategoria(req.espacoId!, id, opts);
    res.status(204).send();
  }),
);

categoriasRouter.post(
  "/:id/regras",
  asyncHandler(async (req, res) => {
    const id = idSchema.parse(req.params.id);
    const { palavraChave } = criarRegraSchema.parse(req.body);
    const regra = await categoriasService.criarRegra(req.espacoId!, id, palavraChave);
    res.status(201).json(regra);
  }),
);

categoriasRouter.delete(
  "/:id/regras/:regraId",
  asyncHandler(async (req, res) => {
    const id = idSchema.parse(req.params.id);
    const regraId = idSchema.parse(req.params.regraId);
    await categoriasService.removerRegra(req.espacoId!, id, regraId);
    res.status(204).send();
  }),
);
