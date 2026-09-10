import type { RelatorioResponse } from "@/api/relatorios";
import { StatCard } from "@/components/ui/StatCard";
import { useFormatarValor } from "@/hooks/use-formatar-valor";

interface RelatorioTotaisProps {
  totais: RelatorioResponse["totais"];
  meses: number;
}

export function RelatorioTotais({ totais, meses }: RelatorioTotaisProps) {
  const formatarValor = useFormatarValor();
  const divisor = Math.max(1, meses);

  const mediaCaption = (valor: number) =>
    meses > 1 ? `média ${formatarValor(valor / divisor)}/mês` : " ";

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <StatCard
        label="Entrou no período"
        amount={totais.receitas}
        tone="in"
        caption={mediaCaption(totais.receitas)}
      />
      <StatCard
        label="Saiu no período"
        amount={totais.despesas}
        tone="out"
        caption={mediaCaption(totais.despesas)}
      />
      <StatCard
        label="Sobrou no período"
        amount={totais.resultado}
        tone="saved"
        caption={mediaCaption(totais.resultado)}
      />
    </div>
  );
}
