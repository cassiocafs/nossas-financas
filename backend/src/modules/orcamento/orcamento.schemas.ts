import { z } from "zod";
import { idSchema } from "../../lib/schemas.js";

export const criarOrcamentoSchema = z.object({
  ano: z.number().int().min(2000).max(2100),
});
export type CriarOrcamentoInput = z.infer<typeof criarOrcamentoSchema>;

export const itensQuerySchema = z.object({
  mes: z.coerce.number().int().min(1).max(12),
});

export const definirPrevistoSchema = z.discriminatedUnion("modo", [
  z.object({
    categoriaId: idSchema,
    modo: z.literal("mesmoValorTodosMeses"),
    valor: z.number().nonnegative(),
  }),
  z.object({
    categoriaId: idSchema,
    modo: z.literal("porMes"),
    valoresPorMes: z.array(z.number().nonnegative()).length(12),
  }),
]);
export type DefinirPrevistoInput = z.infer<typeof definirPrevistoSchema>;
