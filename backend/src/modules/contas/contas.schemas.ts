import { z } from "zod";
import { idSchema } from "../../lib/schemas.js";

export const criarContaSchema = z.object({
  nome: z.string().trim().min(1, "Nome é obrigatório"),
  saldoInicial: z.number().finite().default(0),
  ativa: z.boolean().default(true),
});
export type CriarContaInput = z.infer<typeof criarContaSchema>;

export const editarContaSchema = criarContaSchema.partial();
export type EditarContaInput = z.infer<typeof editarContaSchema>;

export const excluirContaSchema = z
  .object({
    estrategia: z.enum(["excluirTransacoes", "realocar"]).optional(),
    contaDestinoId: idSchema.optional(),
  })
  .refine((d) => d.estrategia !== "realocar" || !!d.contaDestinoId, {
    message: "contaDestinoId é obrigatório para realocar",
    path: ["contaDestinoId"],
  });
export type ExcluirContaInput = z.infer<typeof excluirContaSchema>;

export const listarContasQuerySchema = z.object({
  incluirInativas: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => v === "true"),
});
