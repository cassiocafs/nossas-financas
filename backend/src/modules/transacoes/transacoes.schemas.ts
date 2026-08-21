import { z } from "zod";
import { dataSchema, idSchema } from "../../lib/schemas.js";

export const tipoTransacaoSchema = z.enum(["DESPESA", "RECEITA"]);

export const criarTransacaoSchema = z.object({
  id: idSchema.optional(),
  tipo: tipoTransacaoSchema,
  data: dataSchema,
  descricao: z.string().trim().min(1, "Descrição é obrigatória"),
  contaId: idSchema,
  categoriaId: idSchema.nullable().optional(),
  valor: z.number().positive("Valor deve ser maior que zero"),
  consolidado: z.boolean().default(false),
  nota: z.string().trim().optional(),
});
export type CriarTransacaoInput = z.infer<typeof criarTransacaoSchema>;

export const editarTransacaoSchema = z.object({
  tipo: tipoTransacaoSchema.optional(),
  data: dataSchema.optional(),
  descricao: z.string().trim().min(1).optional(),
  contaId: idSchema.optional(),
  categoriaId: idSchema.nullable().optional(),
  valor: z.number().positive().optional(),
  consolidado: z.boolean().optional(),
  nota: z.string().trim().optional(),
});
export type EditarTransacaoInput = z.infer<typeof editarTransacaoSchema>;

export const criarTransferenciaSchema = z
  .object({
    transferenciaGrupoId: idSchema.optional(),
    data: dataSchema,
    descricao: z.string().trim().optional(),
    contaOrigemId: idSchema,
    contaDestinoId: idSchema,
    valor: z.number().positive("Valor deve ser maior que zero"),
    consolidado: z.boolean().default(false),
    nota: z.string().trim().optional(),
  })
  .refine((d) => d.contaOrigemId !== d.contaDestinoId, {
    message: "Conta de origem e destino devem ser diferentes",
    path: ["contaDestinoId"],
  });
export type CriarTransferenciaInput = z.infer<typeof criarTransferenciaSchema>;

const contaIdsSchema = z
  .string()
  .optional()
  .transform((v) => (v ? v.split(",").filter(Boolean) : undefined));

export const listarTransacoesQuerySchema = z.object({
  ano: z.coerce.number().int(),
  mes: z.coerce.number().int().min(1).max(12),
  contaIds: contaIdsSchema,
  categoriaIds: z
    .string()
    .optional()
    .transform((v) => (v ? v.split(",").filter(Boolean) : undefined)),
  status: z.enum(["todas", "consolidadas", "pendentes"]).default("todas"),
  texto: z.string().trim().optional(),
  dataInicio: dataSchema.optional(),
  dataFim: dataSchema.optional(),
});
export type ListarTransacoesQuery = z.infer<typeof listarTransacoesQuerySchema>;

export const resumoQuerySchema = z.object({
  ano: z.coerce.number().int(),
  mes: z.coerce.number().int().min(1).max(12),
  contaIds: contaIdsSchema,
});

export const evolucaoSaldoQuerySchema = z
  .object({
    anoInicio: z.coerce.number().int(),
    mesInicio: z.coerce.number().int().min(1).max(12),
    anoFim: z.coerce.number().int(),
    mesFim: z.coerce.number().int().min(1).max(12),
    contaIds: contaIdsSchema,
  })
  .refine((v) => v.anoInicio * 12 + v.mesInicio <= v.anoFim * 12 + v.mesFim, {
    message: "Início deve ser anterior ou igual ao fim",
    path: ["anoInicio"],
  });

export const excluirLoteSchema = z.object({ ids: z.array(idSchema).min(1) });
export const consolidarLoteSchema = z.object({
  ids: z.array(idSchema).min(1),
  consolidado: z.boolean(),
});
export const categorizarLoteSchema = z.object({
  ids: z.array(idSchema).min(1),
  categoriaId: idSchema.nullable(),
});
