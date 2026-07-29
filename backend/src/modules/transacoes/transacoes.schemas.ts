import { z } from "zod";
import { dataSchema, idSchema } from "../../lib/schemas.js";

export const tipoTransacaoSchema = z.enum(["DESPESA", "RECEITA"]);

export const criarTransacaoSchema = z.object({
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

export const listarTransacoesQuerySchema = z.object({
  ano: z.coerce.number().int(),
  mes: z.coerce.number().int().min(1).max(12),
  contaIds: z
    .string()
    .optional()
    .transform((v) => (v ? v.split(",").filter(Boolean) : undefined)),
  categoriaIds: z
    .string()
    .optional()
    .transform((v) => (v ? v.split(",").filter(Boolean) : undefined)),
  status: z.enum(["todas", "consolidadas", "pendentes"]).default("todas"),
  texto: z.string().trim().optional(),
});
export type ListarTransacoesQuery = z.infer<typeof listarTransacoesQuerySchema>;

export const resumoQuerySchema = z.object({
  ano: z.coerce.number().int(),
  mes: z.coerce.number().int().min(1).max(12),
});

export const evolucaoSaldoQuerySchema = z.object({
  meses: z.coerce.number().int().min(1).max(24).default(6),
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
