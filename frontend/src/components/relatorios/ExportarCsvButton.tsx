import { Download } from "lucide-react";
import type { ItemCategoriaResumo, PeriodoMes } from "@/api/transacoes";
import type { RelatorioResponse } from "@/api/relatorios";
import { mesAbrev, periodoParaParam } from "@/lib/periodo";

interface ExportarCsvButtonProps {
  data: RelatorioResponse;
  inicio: PeriodoMes;
  fim: PeriodoMes;
}

const SEP = ";";

function campo(valor: string | number): string {
  const texto = String(valor);
  return /[";\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
}

function moeda(valor: number): string {
  return valor.toFixed(2).replace(".", ",");
}

function linhasCategoria(
  tipoRotulo: string,
  itens: ItemCategoriaResumo[],
): string[] {
  const total = itens.reduce((soma, i) => soma + i.total, 0);
  return itens
    .slice()
    .sort((a, b) => b.total - a.total)
    .map((i) =>
      [
        tipoRotulo,
        i.grupoNome ?? "",
        i.subgrupoNome ?? "",
        i.categoriaNome,
        moeda(i.total),
        total > 0 ? `${((i.total / total) * 100).toFixed(1).replace(".", ",")}%` : "0%",
      ]
        .map(campo)
        .join(SEP),
    );
}

function montarCsv(data: RelatorioResponse): string {
  const linhas: string[] = [];

  linhas.push(["Tipo", "Grupo", "Subgrupo", "Categoria", "Valor", "% do tipo"].join(SEP));
  linhas.push(...linhasCategoria("Despesa", data.despesasPorCategoria));
  linhas.push(...linhasCategoria("Receita", data.receitasPorCategoria));

  linhas.push("");
  linhas.push(["Mês", "Receitas", "Despesas", "Resultado"].join(SEP));
  for (const m of data.meses) {
    linhas.push(
      [
        `${mesAbrev(m.mes)}/${m.ano}`,
        moeda(m.receitas),
        moeda(m.despesas),
        moeda(m.resultado),
      ]
        .map(campo)
        .join(SEP),
    );
  }
  linhas.push(
    ["Total", moeda(data.totais.receitas), moeda(data.totais.despesas), moeda(data.totais.resultado)]
      .map(campo)
      .join(SEP),
  );

  return `﻿${linhas.join("\r\n")}`;
}

export function ExportarCsvButton({ data, inicio, fim }: ExportarCsvButtonProps) {
  function exportar() {
    const csv = montarCsv(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-poupeu-${periodoParaParam(inicio)}-${periodoParaParam(fim)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={exportar}
      className="inline-flex h-9 shrink-0 items-center gap-2 rounded-[11px] border border-border px-3 text-[13px] font-semibold text-foreground/80 hover:bg-muted"
    >
      <Download className="size-4" />
      Exportar CSV
    </button>
  );
}
