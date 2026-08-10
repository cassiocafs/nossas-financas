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
        <h3 className="text-sm font-semibold text-foreground">
          Orçamento do mês
        </h3>
        <Link to="/orcamento" className="text-xs text-muted-foreground hover:underline">
          ver tudo
        </Link>
      </div>

      {carregandoAnos ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : !orcamentoAtual ? (
        <p className="text-sm text-muted-foreground">
          Nenhum orçamento criado para {ano}.{" "}
          <Link to="/orcamento" className="underline">
            Criar orçamento
          </Link>
        </p>
      ) : carregandoGrade || !grade ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : (
        <>
          <div className="flex gap-6 text-sm">
            <span>
              Previsto:{" "}
              <strong className="text-foreground">
                {formatarMoeda(grade.totalPrevisto)}
              </strong>
            </span>
            <span>
              Realizado:{" "}
              <strong
                className={
                  grade.totalRealizado > grade.totalPrevisto
                    ? "text-expense"
                    : "text-foreground"
                }
              >
                {formatarMoeda(grade.totalRealizado)}
              </strong>
            </span>
          </div>

          {categoriasEstouradas.length > 0 && (
            <ul className="mt-3 space-y-1 border-t border-border pt-3 text-xs">
              {categoriasEstouradas.slice(0, 5).map((c) => (
                <li
                  key={c.categoriaId}
                  className="flex justify-between text-expense"
                >
                  <span>{c.categoriaNome}</span>
                  <span className="num">
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
