import { z } from "zod";
import { idSchema } from "../../lib/schemas.js";

export const tipoCategoriaSchema = z.enum(["DESPESA", "RECEITA", "AMBOS"]);

export const criarGrupoSchema = z.object({
  nome: z.string().trim().min(1, "Nome é obrigatório"),
});
export type CriarGrupoInput = z.infer<typeof criarGrupoSchema>;

export const editarGrupoSchema = z.object({
  nome: z.string().trim().min(1).optional(),
  ordem: z.number().int().optional(),
});
export type EditarGrupoInput = z.infer<typeof editarGrupoSchema>;

export const criarSubgrupoSchema = z.object({
  nome: z.string().trim().min(1, "Nome é obrigatório"),
  grupoId: idSchema,
});
export type CriarSubgrupoInput = z.infer<typeof criarSubgrupoSchema>;

export const editarSubgrupoSchema = z.object({
  nome: z.string().trim().min(1).optional(),
  ordem: z.number().int().optional(),
});
export type EditarSubgrupoInput = z.infer<typeof editarSubgrupoSchema>;

export const criarCategoriaSchema = z.object({
  nome: z.string().trim().min(1, "Nome é obrigatório"),
  grupoId: idSchema.nullable(),
  subgrupoId: idSchema.nullable().optional(),
  tipo: tipoCategoriaSchema.default("AMBOS"),
});
export type CriarCategoriaInput = z.infer<typeof criarCategoriaSchema>;

export const editarCategoriaSchema = z.object({
  nome: z.string().trim().min(1).optional(),
  grupoId: idSchema.nullable().optional(),
  subgrupoId: idSchema.nullable().optional(),
  tipo: tipoCategoriaSchema.optional(),
  ativa: z.boolean().optional(),
});
export type EditarCategoriaInput = z.infer<typeof editarCategoriaSchema>;

export const excluirCategoriaSchema = z
  .object({
    estrategia: z.enum(["semCategoria", "realocarPara"]).optional(),
    categoriaDestinoId: idSchema.optional(),
  })
  .refine((d) => d.estrategia !== "realocarPara" || !!d.categoriaDestinoId, {
    message: "categoriaDestinoId é obrigatório para realocar",
    path: ["categoriaDestinoId"],
  });
export type ExcluirCategoriaInput = z.infer<typeof excluirCategoriaSchema>;

export const criarRegraSchema = z.object({
  palavraChave: z.string().trim().min(1, "Palavra-chave é obrigatória").toLowerCase(),
});
export type CriarRegraInput = z.infer<typeof criarRegraSchema>;

export const sugestaoQuerySchema = z.object({
  descricao: z.string().trim().min(1),
});
