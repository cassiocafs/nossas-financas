import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { excluirGrupo, excluirSubgrupo, listarGrupos, type Categoria } from "@/api/categorias";
import { CategoriaFormModal } from "./CategoriaFormModal";
import { ExcluirCategoriaDialog } from "./ExcluirCategoriaDialog";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function CategoriasSection() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["categorias", "grupos"],
    queryFn: listarGrupos,
  });

  const [formOpen, setFormOpen] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState<Categoria | null>(null);
  const [categoriaExcluindo, setCategoriaExcluindo] = useState<Categoria | null>(null);

  const excluirGrupoMutation = useMutation({
    mutationFn: excluirGrupo,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categorias"] }),
    onError: (err) => alert(err instanceof Error ? err.message : "Erro ao excluir grupo"),
  });

  const excluirSubgrupoMutation = useMutation({
    mutationFn: excluirSubgrupo,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categorias"] }),
    onError: (err) => alert(err instanceof Error ? err.message : "Erro ao excluir subgrupo"),
  });

  function abrirEdicao(categoria: Categoria) {
    setCategoriaEditando(categoria);
    setFormOpen(true);
  }

  function abrirCriacao() {
    setCategoriaEditando(null);
    setFormOpen(true);
  }

  function renderCategoria(categoria: Categoria) {
    return (
      <li
        key={categoria.id}
        className="group flex items-center justify-between py-2 pl-6 text-sm"
      >
        <span className="text-foreground/90">
          {categoria.nome}
          {!categoria.ativa && (
            <span className="ml-2 text-xs text-muted-foreground">(inativa)</span>
          )}
        </span>
        <div className="hidden gap-2 group-hover:flex">
          <button
            type="button"
            onClick={() => abrirEdicao(categoria)}
            className="text-muted-foreground underline hover:text-foreground"
          >
            Editar
          </button>
          <button
            type="button"
            onClick={() => setCategoriaExcluindo(categoria)}
            className="text-destructive underline hover:text-destructive/80"
          >
            Excluir
          </button>
        </div>
      </li>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Categorias</h2>
        <Button onClick={abrirCriacao}>Nova categoria</Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : (
        <Card className="space-y-4 p-4">
          {data?.grupos.map((grupo) => (
            <div key={grupo.id}>
              <div className="flex items-center justify-between">
                <h3 className="text-[10.5px] font-bold tracking-widest text-muted-foreground uppercase">
                  {grupo.nome}
                </h3>
                {grupo.categorias.length === 0 && grupo.subgrupos.length === 0 && (
                  <button
                    type="button"
                    onClick={() => excluirGrupoMutation.mutate(grupo.id)}
                    className="text-xs text-destructive underline hover:text-destructive/80"
                  >
                    Excluir grupo
                  </button>
                )}
              </div>

              {grupo.subgrupos.map((subgrupo) => (
                <div key={subgrupo.id} className="pl-3">
                  <div className="flex items-center justify-between pt-2">
                    <h4 className="text-xs font-medium text-foreground/70">
                      {subgrupo.nome}
                    </h4>
                    {subgrupo.categorias.length === 0 && (
                      <button
                        type="button"
                        onClick={() => excluirSubgrupoMutation.mutate(subgrupo.id)}
                        className="text-xs text-destructive underline hover:text-destructive/80"
                      >
                        Excluir subgrupo
                      </button>
                    )}
                  </div>
                  <ul className="divide-y divide-border">
                    {subgrupo.categorias.map(renderCategoria)}
                  </ul>
                </div>
              ))}

              <ul className="divide-y divide-border">
                {grupo.categorias.map(renderCategoria)}
              </ul>
            </div>
          ))}

          {data && data.semGrupo.length > 0 && (
            <div>
              <h3 className="text-[10.5px] font-bold tracking-widest text-muted-foreground uppercase">
                Sem grupo
              </h3>
              <ul className="divide-y divide-border">
                {data.semGrupo.map(renderCategoria)}
              </ul>
            </div>
          )}
        </Card>
      )}

      <CategoriaFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        categoria={categoriaEditando}
      />
      <ExcluirCategoriaDialog
        open={!!categoriaExcluindo}
        onClose={() => setCategoriaExcluindo(null)}
        categoria={categoriaExcluindo}
      />
    </section>
  );
}
