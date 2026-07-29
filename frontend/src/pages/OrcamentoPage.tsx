import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { buscarGradeOrcamento, listarAnosOrcamento } from "@/api/orcamento";
import { MesNavigator } from "@/components/shared/MesNavigator";
import { AnoSelector } from "@/components/orcamento/AnoSelector";
import { RealizadoPrevistoChart } from "@/components/orcamento/RealizadoPrevistoChart";
import { OrcamentoTabela } from "@/components/orcamento/OrcamentoTabela";
import { DefinirPrevistoModal } from "@/components/orcamento/DefinirPrevistoModal";
import { formatarMoeda } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold text-ink dark:text-paper">Orçamento</h1>
        <AnoSelector orcamentoId={orcamentoId} onSelecionar={setOrcamentoId} />
      </div>

      {!orcamentoId ? (
        <p className="text-sm text-ink/50 dark:text-paper/50">
          Nenhum orçamento criado ainda. Clique em "Novo orçamento" para começar.
        </p>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <MesNavigator
              ano={orcamentoAtual?.ano ?? new Date().getFullYear()}
              mes={mes}
              onChange={mudarMes}
            />
            <Button onClick={abrirNovaCategoria}>Adicionar categoria</Button>
          </div>

          {isLoading || !grade ? (
            <p className="text-sm text-ink/50 dark:text-paper/50">Carregando...</p>
          ) : (
            <>
              <Card className="flex gap-6 px-4 py-3 text-sm">
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
              </Card>

              <RealizadoPrevistoChart serie={grade.serieDiaria} />

              <OrcamentoTabela
                orcamentoId={orcamentoId}
                mes={mes}
                grupos={grade.grupos}
                onEditarCategoria={abrirEdicaoCategoria}
              />
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
