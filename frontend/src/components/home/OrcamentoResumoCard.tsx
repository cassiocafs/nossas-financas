import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { buscarGradeOrcamento, listarAnosOrcamento } from "@/api/orcamento";
import { Card } from "@/components/ui/Card";
import { formatarMoeda } from "@/lib/format";

interface OrcamentoResumoCardProps {
  ano: number;
  mes: number;
}

export function OrcamentoResumoCard({ ano, mes }: OrcamentoResumoCardProps) {
  const { data: anos, isLoading: carregandoAnos } = useQuery({
    queryKey: ["orcamento", "anos"],
    queryFn: listarAnosOrcamento,
  });

  const orcamentoAtual = anos?.find((a) => a.ano === ano);

  const { data: grade, isLoading: carregandoGrade } = useQuery({
    queryKey: ["orcamento", orcamentoAtual?.id, "itens", mes],
    queryFn: () => buscarGradeOrcamento(orcamentoAtual!.id, mes),
    enabled: !!orcamentoAtual,
  });

  const categoriasEstouradas =
    grade?.grupos.flatMap((g) => g.categorias.filter((c) => c.estourado)) ?? [];

  return (
    <Card className="p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold text-ink dark:text-paper">
          Orçamento do mês
        </h3>
        <Link to="/orcamento" className="text-xs text-ink/50 hover:underline dark:text-paper/50">
          ver tudo
        </Link>
      </div>

      {carregandoAnos ? (
        <p className="text-sm text-ink/50 dark:text-paper/50">Carregando...</p>
      ) : !orcamentoAtual ? (
        <p className="text-sm text-ink/50 dark:text-paper/50">
          Nenhum orçamento criado para {ano}.{" "}
          <Link to="/orcamento" className="underline">
            Criar orçamento
          </Link>
        </p>
      ) : carregandoGrade || !grade ? (
        <p className="text-sm text-ink/50 dark:text-paper/50">Carregando...</p>
      ) : (
        <>
          <div className="flex gap-6 text-sm">
            <span>
              Previsto:{" "}
              <strong className="text-ink dark:text-paper">
                {formatarMoeda(grade.totalPrevisto)}
              </strong>
            </span>
            <span>
              Realizado:{" "}
              <strong
                className={
                  grade.totalRealizado > grade.totalPrevisto
                    ? "text-vermelho dark:text-vermelho-night"
                    : "text-ink dark:text-paper"
                }
              >
                {formatarMoeda(grade.totalRealizado)}
              </strong>
            </span>
          </div>

          {categoriasEstouradas.length > 0 && (
            <ul className="mt-3 space-y-1 border-t border-line pt-3 text-xs dark:border-line-night">
              {categoriasEstouradas.slice(0, 5).map((c) => (
                <li
                  key={c.categoriaId}
                  className="flex justify-between text-vermelho dark:text-vermelho-night"
                >
                  <span>{c.categoriaNome}</span>
                  <span className="font-mono tabular-nums">
                    {formatarMoeda(c.realizado)} / {formatarMoeda(c.previsto)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </Card>
  );
}
