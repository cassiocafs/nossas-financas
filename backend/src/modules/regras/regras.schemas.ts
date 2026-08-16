import { z } from "zod";
import { idSchema } from "../../lib/schemas.js";

export const criarRegraTransacaoSchema = z.object({
  descricao: z.string().trim().min(1, "Descrição é obrigatória"),
  contaId: idSchema,
  categoriaId: idSchema.nullable().optional(),
});
export type CriarRegraTransacaoInput = z.infer<typeof criarRegraTransacaoSchema>;

export const editarRegraTransacaoSchema = z.object({
  descricao: z.string().trim().min(1).optional(),
  contaId: idSchema.optional(),
  categoriaId: idSchema.nullable().optional(),
});
export type EditarRegraTransacaoInput = z.infer<typeof editarRegraTransacaoSchema>;

export const sugestaoTransacaoQuerySchema = z.object({
  descricao: z.string().trim().min(1),
});
