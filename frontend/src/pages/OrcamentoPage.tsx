import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { buscarGradeOrcamento, listarAnosOrcamento } from "@/api/orcamento";
import { MesNavigator } from "@/components/shared/MesNavigator";
import { AnoSelector } from "@/components/orcamento/AnoSelector";
import { RealizadoPrevistoChart } from "@/components/orcamento/RealizadoPrevistoChart";
import { PrevistoRealizadoBarras } from "@/components/orcamento/PrevistoRealizadoBarras";
import { OrcamentoTabela } from "@/components/orcamento/OrcamentoTabela";
import { DefinirPrevistoModal } from "@/components/orcamento/DefinirPrevistoModal";
import { formatarMoeda } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";

type Tom = "positivo" | "negativo" | "neutro";

function StatTile({ label, valor, tom = "neutro" }: { label: string; valor: string; tom?: Tom }) {
  const cor =
    tom === "positivo" ? "text-income" : tom === "negativo" ? "text-expense" : "text-foreground";

  return (
    <Card className="p-4">
      <p className="text-[10.5px] font-bold tracking-widest text-muted-foreground uppercase">
        {label}
      </p>
      <p className={`num mt-2 truncate text-xl font-bold tracking-tight ${cor}`}>{valor}</p>
    </Card>
  );
}

export function OrcamentoPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orcamentoId, setOrcamentoId] = useState<string | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState<string | null>(null);

  const mesAtual = new Date().getMonth() + 1;
  const mes = Number(searchParams.get("mes")) || mesAtual;

  const { data: anos } = useQuery({ queryKey: ["orcamento", "anos"], queryFn: listarAnosOrcamento });

  useEffect(() => {
    if (!orcamentoId && anos && anos.length > 0) {
      setOrcamentoId(anos[0].id);
    }
  }, [anos, orcamentoId]);

  const orcamentoAtual = anos?.find((a) => a.id === orcamentoId);

  const { data: grade, isLoading } = useQuery({
    queryKey: ["orcamento", orcamentoId, "itens", mes],
    queryFn: () => buscarGradeOrcamento(orcamentoId!, mes),
    enabled: !!orcamentoId,
  });

  function mudarMes(_novoAno: number, novoMes: number) {
    setSearchParams({ mes: String(novoMes) });
  }

  function abrirNovaCategoria() {
    setCategoriaEditando(null);
    setModalAberto(true);
  }

  function abrirEdicaoCategoria(categoriaId: string) {
    setCategoriaEditando(categoriaId);
    setModalAberto(true);
  }

  const restante = grade ? grade.totalPrevisto - grade.totalRealizado : 0;
  const percentualUsado = grade && grade.totalPrevisto > 0 ? (grade.totalRealizado / grade.totalPrevisto) * 100 : 0;

  return (
    <div className="space-y-3 pt-4 sm:pt-6 lg:pt-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-foreground">Orçamento</h1>
        <AnoSelector orcamentoId={orcamentoId} onSelecionar={setOrcamentoId} />
      </div>

      {!orcamentoId ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border px-6 py-14 text-center">
          <p className="max-w-xs text-sm text-muted-foreground">
            Nenhum orçamento criado ainda. Clique em "Novo orçamento" para começar a planejar seus gastos.
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <MesNavigator
              ano={orcamentoAtual?.ano ?? new Date().getFullYear()}
              mes={mes}
              onChange={mudarMes}
            />
            <Button onClick={abrirNovaCategoria}>+ Adicionar categoria</Button>
          </div>

          {isLoading || !grade ? (
            <ProgressBar label="Carregando orçamento..." />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <StatTile label="Previsto" valor={formatarMoeda(grade.totalPrevisto)} />
                <StatTile
                  label="Realizado"
                  valor={formatarMoeda(grade.totalRealizado)}
                  tom={grade.totalRealizado > grade.totalPrevisto ? "negativo" : "neutro"}
                />
                <StatTile
                  label="Restante"
                  valor={formatarMoeda(restante)}
                  tom={restante >= 0 ? "positivo" : "negativo"}
                />
                <StatTile
                  label="Usado"
                  valor={`${Math.round(percentualUsado)}%`}
                  tom={percentualUsado > 100 ? "negativo" : "neutro"}
                />
              </div>

              <PrevistoRealizadoBarras grupos={grade.grupos} />

              <Card className="p-3 sm:p-4">
                <p className="mb-1.5 text-[10px] tracking-widest text-muted-foreground uppercase">
                  Ritmo de gastos no mês
                </p>
                <RealizadoPrevistoChart serie={grade.serieDiaria} />
              </Card>

              <div className="lg:mx-auto lg:w-3/4">
                <OrcamentoTabela
                  orcamentoId={orcamentoId}
                  mes={mes}
                  grupos={grade.grupos}
                  onEditarCategoria={abrirEdicaoCategoria}
                />
              </div>
            </>
          )}

          <DefinirPrevistoModal
            open={modalAberto}
            onClose={() => setModalAberto(false)}
            orcamentoId={orcamentoId}
            categoriaIdInicial={categoriaEditando}
          />
        </>
      )}
    </div>
  );
}
