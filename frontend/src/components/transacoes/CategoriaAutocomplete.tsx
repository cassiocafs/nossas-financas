import { useQuery } from "@tanstack/react-query";
import { listarGrupos } from "@/api/categorias";

interface CategoriaAutocompleteProps {
  value: string;
  onChange: (categoriaId: string) => void;
  disabled?: boolean;
}

export function CategoriaAutocomplete({ value, onChange, disabled }: CategoriaAutocompleteProps) {
  const { data } = useQuery({ queryKey: ["categorias", "grupos"], queryFn: listarGrupos });

  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-md border border-line bg-transparent px-3 py-2 text-sm text-ink dark:border-line-night dark:bg-transparent dark:text-paper"
    >
      <option value="">Sem Categoria</option>
      {data?.grupos.map((grupo) => {
        const temCategorias =
          grupo.categorias.length > 0 || grupo.subgrupos.some((s) => s.categorias.length > 0);
        if (!temCategorias) return null;

        return (
          <optgroup key={grupo.id} label={grupo.nome}>
            {grupo.subgrupos.flatMap((subgrupo) =>
              subgrupo.categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {subgrupo.nome} · {c.nome}
                </option>
              )),
            )}
            {grupo.categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </optgroup>
        );
      })}
      {data && data.semGrupo.length > 0 && (
        <optgroup label="Sem grupo">
          {data.semGrupo.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </optgroup>
      )}
    </select>
  );
}
