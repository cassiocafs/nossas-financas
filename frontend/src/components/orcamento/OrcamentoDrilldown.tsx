import type { CategoriaGrade } from "@/api/orcamento";
import { formatarMoeda } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { TransacoesDaCategoria } from "@/components/transacoes/TransacoesDaCategoria";

interface OrcamentoDrilldownProps {
  /** Linha da categoria vinda da grade do mês. `null` enquanto a grade resolve. */
  linha: CategoriaGrade | null;
  categoriaId: string;
  ano: number;
  mes: number;
  onVoltar: () => void;
}

export function OrcamentoDrilldown({ linha, categoriaId, ano, mes, onVoltar }: OrcamentoDrilldownProps) {
  const nome = linha?.categoriaNome ?? "Categoria";
  const excedente = linha ? Math.max(linha.realizado - linha.previsto, 0) : 0;
  const restante = linha ? Math.max(linha.previsto - linha.realizado, 0) : 0;
  const percentual =
    linha && linha.previsto > 0
      ? Math.round((linha.realizado / linha.previsto) * 100)
      : linha && linha.realizado > 0
        ? 100
        : 0;

  return (
    <div className="space-y-3 lg:mx-auto lg:w-3/4">
      <button
        type="button"
        onClick={onVoltar}
        className="text-sm font-semibold text-primary hover:underline"
      >
        ← Voltar ao orçamento
      </button>

      <Card className="p-3 sm:p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <h2 className="text-lg font-semibold text-foreground">{nome}</h2>
          {linha && (
            <span className="num text-sm whitespace-nowrap">
              <span className={linha.estourado ? "text-money-alert" : "text-foreground"}>
                {formatarMoeda(linha.realizado)}
              </span>
              <span className="text-foreground/30"> / {formatarMoeda(linha.previsto)}</span>
            </span>
          )}
        </div>

        {linha && (
          <p className="mt-1 text-xs text-muted-foreground">
            {linha.estourado
              ? `Estourou o previsto em ${formatarMoeda(excedente)} (${percentual}%)`
              : `Restam ${formatarMoeda(restante)} (${percentual}% do previsto)`}
          </p>
        )}

        <TransacoesDaCategoria
          ano={ano}
          mes={mes}
          categoriaId={categoriaId}
          categoriaNome={nome}
          titulo="Transações realizadas no mês"
        />
      </Card>
    </div>
  );
}
