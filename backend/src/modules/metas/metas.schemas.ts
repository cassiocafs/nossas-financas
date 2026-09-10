import { z } from "zod";
import { dataSchema } from "../../lib/schemas.js";
import { hojeUTC } from "../../lib/datas.js";

export const criarMetaSchema = z.object({
  nome: z.string().trim().min(1, "Nome é obrigatório").max(80),
  emoji: z.string().trim().min(1).max(8).optional(),
  valorAlvo: z.number().finite().positive("Informe um valor-alvo maior que zero"),
  dataAlvo: dataSchema.optional(),
});
export type CriarMetaInput = z.infer<typeof criarMetaSchema>;

export const editarMetaSchema = criarMetaSchema.partial().extend({
  arquivada: z.boolean().optional(),
});
export type EditarMetaInput = z.infer<typeof editarMetaSchema>;

export const listarMetasQuerySchema = z.object({
  incluirArquivadas: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => v === "true"),
});

export const registrarAporteSchema = z.object({
  valor: z.number().finite().positive("Informe um valor de aporte maior que zero"),
  data: dataSchema.default(() => hojeUTC()),
  nota: z.string().trim().max(140).optional(),
});
export type RegistrarAporteInput = z.infer<typeof registrarAporteSchema>;

export const excluirMetaQuerySchema = z.object({
  confirmar: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => v === "true"),
});
