import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
  criarCategoria,
  criarGrupo,
  criarRegra,
  criarSubgrupo,
  editarCategoria,
  listarGrupos,
  removerRegra,
  type Categoria,
} from "@/api/categorias";

const NOVO_GRUPO = "__novo__";
const NOVO_SUBGRUPO = "__novo__";

const schema = z.object({
  nome: z.string().trim().min(1, "Nome é obrigatório"),
  grupoSelecionado: z.string(),
  novoGrupoNome: z.string().optional(),
  subgrupoSelecionado: z.string(),
  novoSubgrupoNome: z.string().optional(),
  tipo: z.enum(["DESPESA", "RECEITA", "AMBOS"]),
});

type FormValues = z.infer<typeof schema>;

interface CategoriaFormModalProps {
  open: boolean;
  onClose: () => void;
  categoria?: Categoria | null;
  onSaved?: () => void;
}

export function CategoriaFormModal({ open, onClose, categoria, onSaved }: CategoriaFormModalProps) {
  const queryClient = useQueryClient();
  const editando = !!categoria;
  const [novaPalavra, setNovaPalavra] = useState("");

  const gruposQuery = useQuery({
    queryKey: ["categorias", "grupos"],
    queryFn: listarGrupos,
    enabled: open,
  });

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: "",
      grupoSelecionado: "",
      novoGrupoNome: "",
      subgrupoSelecionado: "",
      novoSubgrupoNome: "",
      tipo: "AMBOS",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      let grupoId: string | null =
        values.grupoSelecionado === "" ? null : values.grupoSelecionado;
      let subgrupoId: string | null = null;

      if (values.grupoSelecionado === NOVO_GRUPO) {
        const novoGrupo = await criarGrupo(values.novoGrupoNome!.trim());
        grupoId = novoGrupo.id;
      } else if (grupoId && values.subgrupoSelecionado === NOVO_SUBGRUPO) {
        const novoSubgrupo = await criarSubgrupo({
          nome: values.novoSubgrupoNome!.trim(),
          grupoId,
        });
        subgrupoId = novoSubgrupo.id;
      } else if (grupoId && values.subgrupoSelecionado !== "") {
        subgrupoId = values.subgrupoSelecionado;
      }

      const input = { nome: values.nome, grupoId, subgrupoId, tipo: values.tipo };
      return editando ? editarCategoria(categoria!.id, input) : criarCategoria(input);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["categorias"] });
      onSaved?.();
    },
  });

  useEffect(() => {
    if (open) {
      mutation.reset();
      reset(
        categoria
          ? {
              nome: categoria.nome,
              grupoSelecionado: categoria.grupoId ?? "",
              novoGrupoNome: "",
              subgrupoSelecionado: categoria.subgrupoId ?? "",
              novoSubgrupoNome: "",
              tipo: categoria.tipo,
            }
          : {
              nome: "",
              grupoSelecionado: "",
              novoGrupoNome: "",
              subgrupoSelecionado: "",
              novoSubgrupoNome: "",
              tipo: "AMBOS",
            },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, categoria, reset]);

  const regraMutation = useMutation({
    mutationFn: (palavraChave: string) => criarRegra(categoria!.id, palavraChave),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categorias"] });
      setNovaPalavra("");
    },
  });

  const removerRegraMutation = useMutation({
    mutationFn: (regraId: string) => removerRegra(categoria!.id, regraId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categorias"] }),
  });

  const grupoSelecionado = watch("grupoSelecionado");
  const subgrupoSelecionado = watch("subgrupoSelecionado");
  const subgruposDoGrupo =
    gruposQuery.data?.grupos.find((g) => g.id === grupoSelecionado)?.subgrupos ?? [];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editando ? "Editar categoria" : "Nova categoria"}
      closable={!mutation.isPending}
    >
      <form
        onSubmit={handleSubmit((values) => mutation.mutate(values))}
        className="space-y-4"
      >
        <fieldset disabled={mutation.isPending || mutation.isSuccess} className="space-y-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-foreground/80">
            Nome
          </label>
          <input
            {...register("nome")}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
          />
          {errors.nome && (
            <p className="text-sm text-destructive">{errors.nome.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-foreground/80">
            Grupo
          </label>
          <select
            {...register("grupoSelecionado", {
              onChange: () => setValue("subgrupoSelecionado", ""),
            })}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
          >
            <option value="">Sem grupo</option>
            {gruposQuery.data?.grupos.map((g) => (
              <option key={g.id} value={g.id}>
                {g.nome}
              </option>
            ))}
            <option value={NOVO_GRUPO}>+ Novo grupo...</option>
          </select>
          {grupoSelecionado === NOVO_GRUPO && (
            <input
              {...register("novoGrupoNome")}
              placeholder="Nome do novo grupo"
              className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
            />
          )}
        </div>

        {grupoSelecionado !== "" && grupoSelecionado !== NOVO_GRUPO && (
          <div className="space-y-1">
            <label className="block text-sm font-medium text-foreground/80">
              Subgrupo
            </label>
            <select
              {...register("subgrupoSelecionado")}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
            >
              <option value="">Sem subgrupo</option>
              {subgruposDoGrupo.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nome}
                </option>
              ))}
              <option value={NOVO_SUBGRUPO}>+ Novo subgrupo...</option>
            </select>
            {subgrupoSelecionado === NOVO_SUBGRUPO && (
              <input
                {...register("novoSubgrupoNome")}
                placeholder="Nome do novo subgrupo"
                className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
              />
            )}
          </div>
        )}

        <div className="space-y-1">
          <label className="block text-sm font-medium text-foreground/80">
            Tipo
          </label>
          <select
            {...register("tipo")}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
          >
            <option value="AMBOS">Ambos</option>
            <option value="DESPESA">Despesa</option>
            <option value="RECEITA">Receita</option>
          </select>
        </div>

        {editando && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground/80">
              Palavras-chave (categorização automática)
            </label>
            <div className="flex flex-wrap gap-2">
              {categoria!.regras.map((regra) => (
                <span
                  key={regra.id}
                  className="flex items-center gap-1 border border-input px-3 py-1 text-xs text-foreground"
                >
                  {regra.palavraChave}
                  <button
                    type="button"
                    onClick={() => removerRegraMutation.mutate(regra.id)}
                    className="text-foreground/40 hover:text-destructive"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={novaPalavra}
                onChange={(e) => setNovaPalavra(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (novaPalavra.trim()) regraMutation.mutate(novaPalavra.trim());
                  }
                }}
                placeholder="Adicionar palavra-chave e pressionar Enter"
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
              />
            </div>
          </div>
        )}
        </fieldset>

        {mutation.isError && (
          <p className="text-sm text-destructive">
            {mutation.error instanceof Error ? mutation.error.message : "Erro ao salvar"}
          </p>
        )}

        {mutation.isPending && <ProgressBar label="Salvando..." />}

        {mutation.isSuccess && (
          <p className="text-sm font-medium text-green-600">Alterado com sucesso</p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          {mutation.isSuccess ? (
            <Button type="button" onClick={onClose}>
              Fechar
            </Button>
          ) : (
            <>
              <Button variant="ghost" onClick={onClose} disabled={mutation.isPending}>
                Cancelar
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </>
          )}
        </div>
      </form>
    </Modal>
  );
}
