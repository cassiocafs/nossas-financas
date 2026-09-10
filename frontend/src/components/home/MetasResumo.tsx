import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { listarMetas, type Meta } from "@/api/metas";
import { MetaCard } from "@/components/metas/MetaCard";
import { Card } from "@/components/ui/Card";
import { ordenarMetasHome } from "@/lib/metas";

interface MetasResumoProps {
  /** Metas já carregadas (payload da Home); evita uma requisição. */
  metas?: Meta[];
}

export function MetasResumo({ metas: metasProp }: MetasResumoProps = {}) {
  const navigate = useNavigate();
  const { data: metasQuery } = useQuery({
    queryKey: ["metas", "home"],
    queryFn: () => listarMetas(false),
    enabled: metasProp === undefined,
  });

  const metas = metasProp ?? metasQuery;

  const top3 = metas ? ordenarMetasHome(metas).slice(0, 3) : [];

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold text-foreground">Suas metas</h3>
        <button
          type="button"
          onClick={() => navigate("/metas?nova=1")}
          className="text-xs font-semibold text-primary hover:underline"
        >
          + Nova
        </button>
      </div>

      {metas && metas.length === 0 ? (
        <Card className="space-y-2 p-3.5">
          <p className="text-[12.5px] font-semibold text-foreground">
            Defina uma meta de economia
          </p>
          <p className="text-[11.5px] text-muted-foreground">
            Dê um objetivo ao seu dinheiro e acompanhe o progresso aqui.
          </p>
          <button
            type="button"
            onClick={() => navigate("/metas?nova=1")}
            className="text-[11.5px] font-semibold text-primary hover:underline"
          >
            Criar minha primeira meta
          </button>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {top3.map((meta) => (
            <MetaCard key={meta.id} meta={meta} onAbrir={() => navigate("/metas")} />
          ))}
        </div>
      )}
    </div>
  );
}
