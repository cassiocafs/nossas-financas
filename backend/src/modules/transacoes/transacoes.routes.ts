import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { asyncHandler } from "../../middlewares/asyncHandler.js";
import { resolveEspaco } from "../../middlewares/resolveEspaco.js";
import { idSchema } from "../../lib/schemas.js";
import {
  categorizarLoteSchema,
  consolidarLoteSchema,
  criarTransacaoSchema,
  criarTransferenciaSchema,
  editarTransacaoSchema,
  evolucaoSaldoQuerySchema,
  excluirLoteSchema,
  listarTransacoesQuerySchema,
  resumoQuerySchema,
} from "./transacoes.schemas.js";
import * as transacoesService from "./transacoes.service.js";

export const transacoesRouter = Router();

transacoesRouter.use(authenticate, resolveEspaco);

transacoesRouter.get(
  "/resumo",
  asyncHandler(async (req, res) => {
    const { ano, mes, contaIds } = resumoQuerySchema.parse(req.query);
    const resumo = await transacoesService.buscarResumoMensal(req.espacoId!, ano, mes, contaIds);
    res.json(resumo);
  }),
);

transacoesRouter.get(
  "/evolucao-saldo",
  asyncHandler(async (req, res) => {
    const { anoInicio, mesInicio, anoFim, mesFim, contaIds } = evolucaoSaldoQuerySchema.parse(
      req.query,
    );
    const evolucao = await transacoesService.buscarEvolucaoSaldo(
      req.espacoId!,
      { ano: anoInicio, mes: mesInicio },
      { ano: anoFim, mes: mesFim },
      contaIds,
    );
    res.json(evolucao);
  }),
);

transacoesRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const filtros = listarTransacoesQuerySchema.parse(req.query);
    const resultado = await transacoesService.listarTransacoesMes(req.espacoId!, filtros);
    res.json(resultado);
  }),
);

transacoesRouter.get(
  "/transferencias/:grupoId",
  asyncHandler(async (req, res) => {
    const grupoId = idSchema.parse(req.params.grupoId);
    const transferencia = await transacoesService.buscarTransferencia(req.espacoId!, grupoId);
    res.json(transferencia);
  }),
);

transacoesRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = idSchema.parse(req.params.id);
    const transacao = await transacoesService.buscarTransacao(req.espacoId!, id);
    res.json(transacao);
  }),
);

transacoesRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const input = criarTransacaoSchema.parse(req.body);
    const transacao = await transacoesService.criarTransacao(req.espacoId!, input);
    res.status(201).json(transacao);
  }),
);

transacoesRouter.post(
  "/transferencias",
  asyncHandler(async (req, res) => {
    const input = criarTransferenciaSchema.parse(req.body);
    const resultado = await transacoesService.criarTransferencia(req.espacoId!, input);
    res.status(201).json(resultado);
  }),
);

transacoesRouter.post(
  "/excluir-lote",
  asyncHandler(async (req, res) => {
    const { ids } = excluirLoteSchema.parse(req.body);
    const resultado = await transacoesService.excluirTransacoesLote(req.espacoId!, ids);
    res.json(resultado);
  }),
);

transacoesRouter.post(
  "/consolidar-lote",
  asyncHandler(async (req, res) => {
    const { ids, consolidado } = consolidarLoteSchema.parse(req.body);
    const resultado = await transacoesService.consolidarLote(req.espacoId!, ids, consolidado);
    res.json(resultado);
  }),
);

transacoesRouter.post(
  "/categorizar-lote",
  asyncHandler(async (req, res) => {
    const { ids, categoriaId } = categorizarLoteSchema.parse(req.body);
    const resultado = await transacoesService.categorizarLote(req.espacoId!, ids, categoriaId);
    res.json(resultado);
  }),
);

transacoesRouter.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = idSchema.parse(req.params.id);
    const input = editarTransacaoSchema.parse(req.body);
    const transacao = await transacoesService.editarTransacao(req.espacoId!, id, input);
    res.json(transacao);
  }),
);

transacoesRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = idSchema.parse(req.params.id);
    await transacoesService.excluirTransacao(req.espacoId!, id);
    res.status(204).send();
  }),
);
