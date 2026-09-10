import { describe, expect, it } from "vitest";

import type { ItemCategoriaResumo, ResumoMensal } from "@/api/transacoes";
import type { CategoriaGrade, GradeOrcamento } from "@/api/orcamento";
import type { Conta } from "@/api/contas";
import { escolherInsight, type EntradaInsights } from "@/lib/insights";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const fmt = (valor: number) => `R$ ${valor.toFixed(2)}`;

function item(
  categoriaId: string | null,
  nome: string,
  total: number,
): ItemCategoriaResumo {
  return {
    categoriaId,
    categoriaNome: nome,
    grupoId: null,
    grupoNome: null,
    subgrupoId: null,
    subgrupoNome: null,
    total,
  };
}

function resumo(over: Partial<ResumoMensal> = {}): ResumoMensal {
  return {
    saldoAnterior: 0,
    totalEntradas: 0,
    totalSaidas: 0,
    saldoFinal: 0,
    recentes: [],
    anterioresNaoConsolidadas: [],
    proximasNaoConsolidadas: [],
    despesasPorCategoria: [],
    receitasPorCategoria: [],
    ...over,
  };
}

function entrada(over: Partial<EntradaInsights> = {}): EntradaInsights {
  return {
    periodo: { ano: 2026, mes: 9 },
    mesCorrente: true,
    diaHoje: 15,
    diasNoMes: 30,
    historico: [],
    fmt,
    ...over,
  };
}

function catGrade(over: Partial<CategoriaGrade> = {}): CategoriaGrade {
  return {
    categoriaId: "cg",
    categoriaNome: "Categoria",
    previsto: 100,
    realizado: 100,
    estourado: false,
    ...over,
  };
}

function grade(categorias: CategoriaGrade[], over: Partial<GradeOrcamento> = {}): GradeOrcamento {
  return {
    ano: 2026,
    mes: 9,
    grupos: [
      {
        grupoId: "g1",
        grupoNome: "Grupo",
        categorias,
        subgrupos: [],
        subtotalPrevisto: 0,
        subtotalRealizado: 0,
      },
    ],
    totalPrevisto: 1000,
    totalRealizado: 500,
    serieDiaria: [],
    ...over,
  };
}

function conta(over: Partial<Conta> = {}): Conta {
  return { id: "c", nome: "Conta", saldoInicial: 0, ativa: true, saldoAtual: 0, ...over };
}

// ---------------------------------------------------------------------------
// Avaliadores
// ---------------------------------------------------------------------------

describe("categoria_subiu_vs_media (3.1)", () => {
  it("dispara quando a categoria está bem acima da média histórica", () => {
    const e = entrada({
      resumoAtual: resumo({
        totalSaidas: 500,
        despesasPorCategoria: [item("m", "Mercado", 300)],
      }),
      historico: [
        resumo({ despesasPorCategoria: [item("m", "Mercado", 100)] }),
        resumo({ despesasPorCategoria: [item("m", "Mercado", 100)] }),
      ],
    });
    const insight = escolherInsight(e);
    expect(insight?.id).toBe("categoria_subiu_vs_media");
    expect(insight?.prioridade).toBe(2);
    expect(insight?.texto).toContain("200%");
    expect(insight?.texto).toContain("mercado");
    expect(insight?.cta?.to).toContain("categoriaIds=m");
  });

  it("não dispara com menos de 2 meses de histórico da categoria", () => {
    const e = entrada({
      resumoAtual: resumo({ despesasPorCategoria: [item("m", "Mercado", 300)] }),
      historico: [resumo({ despesasPorCategoria: [item("m", "Mercado", 100)] })],
    });
    expect(escolherInsight(e)).toBeNull();
  });
});

describe("categoria vs. mês anterior (3.2)", () => {
  it("alta: gera insight com CTA de transações", () => {
    const e = entrada({
      resumoAtual: resumo({ despesasPorCategoria: [item("t", "Transporte", 200)] }),
      resumoMesAnterior: resumo({ despesasPorCategoria: [item("t", "Transporte", 100)] }),
    });
    const insight = escolherInsight(e);
    expect(insight?.id).toBe("categoria_subiu_vs_mes_anterior");
    expect(insight?.texto).toContain("100%");
    expect(insight?.cta?.to).toContain("categoriaIds=t");
  });

  it("queda: elogio sem CTA e com emoji", () => {
    const e = entrada({
      resumoAtual: resumo({ despesasPorCategoria: [item("t", "Transporte", 60)] }),
      resumoMesAnterior: resumo({ despesasPorCategoria: [item("t", "Transporte", 150)] }),
    });
    const insight = escolherInsight(e);
    expect(insight?.id).toBe("categoria_caiu_vs_mes_anterior");
    expect(insight?.cta).toBeUndefined();
    expect(insight?.texto).toContain("👏");
  });
});

describe("orçamento (3.3 / 3.4 / 3.5)", () => {
  it("ritmo acelerado dispara com prioridade 1", () => {
    const e = entrada({
      diaHoje: 10,
      resumoAtual: resumo({ totalSaidas: 600 }),
      orcamento: grade([], { totalPrevisto: 1000, totalRealizado: 600 }),
    });
    const insight = escolherInsight(e);
    expect(insight?.id).toBe("orcamento_ritmo_acelerado");
    expect(insight?.prioridade).toBe(1);
    expect(insight?.texto).toContain("60%");
  });

  it("ritmo não dispara quando o gasto acompanha a fração do mês", () => {
    const e = entrada({
      diaHoje: 10,
      resumoAtual: resumo({ totalSaidas: 100 }),
      orcamento: grade([], { totalPrevisto: 1000, totalRealizado: 300 }),
    });
    expect(escolherInsight(e)).toBeNull();
  });

  it("orçamento no azul dispara perto do fim do mês", () => {
    const e = entrada({
      diaHoje: 25,
      resumoAtual: resumo({ totalSaidas: 50 }),
      orcamento: grade([], { totalPrevisto: 1000, totalRealizado: 500 }),
    });
    expect(escolherInsight(e)?.id).toBe("orcamento_no_azul");
  });

  it("categorias estouradas: texto no plural cita a maior diferença", () => {
    const e = entrada({
      mesCorrente: false,
      resumoAtual: resumo({ totalSaidas: 900 }),
      orcamento: grade([
        catGrade({ categoriaId: "a", categoriaNome: "Lazer", previsto: 100, realizado: 180, estourado: true }),
        catGrade({ categoriaId: "b", categoriaNome: "Mercado", previsto: 200, realizado: 500, estourado: true }),
      ]),
    });
    const insight = escolherInsight(e);
    expect(insight?.id).toBe("categorias_estouradas");
    expect(insight?.texto).toContain("2 categorias");
    expect(insight?.texto).toContain("mercado");
  });
});

describe("conta_no_vermelho (3.6)", () => {
  it("dispara para a conta mais negativa", () => {
    const e = entrada({
      resumoAtual: resumo({ totalSaidas: 100 }),
      contas: [
        conta({ id: "a", nome: "Nubank", saldoAtual: -50 }),
        conta({ id: "b", nome: "Itaú", saldoAtual: -300 }),
      ],
    });
    const insight = escolherInsight(e);
    expect(insight?.id).toBe("conta_no_vermelho");
    expect(insight?.texto).toContain("Itaú");
    expect(insight?.texto).toContain("2 contas");
  });

  it("respeita o filtro de contas ativo", () => {
    const e = entrada({
      resumoAtual: resumo({ totalSaidas: 100 }),
      contas: [conta({ id: "a", nome: "Nubank", saldoAtual: -50 })],
      contaIdsFiltro: ["b"],
    });
    expect(escolherInsight(e)).toBeNull();
  });
});

describe("mes_no_vermelho (3.7)", () => {
  it("dispara quando saiu mais do que entrou", () => {
    const e = entrada({
      resumoAtual: resumo({ totalEntradas: 1000, totalSaidas: 1500 }),
    });
    const insight = escolherInsight(e);
    expect(insight?.id).toBe("mes_no_vermelho");
    expect(insight?.cta?.scrollTo).toBe("grafico-categorias");
  });
});

describe("entradas_abaixo_da_media (3.8)", () => {
  it("não cobra receita antes do dia 25 no mês corrente", () => {
    const e = entrada({
      diaHoje: 15,
      resumoAtual: resumo({ totalEntradas: 500 }),
      historico: [resumo({ totalEntradas: 1000 }), resumo({ totalEntradas: 1000 })],
    });
    expect(escolherInsight(e)).toBeNull();
  });

  it("dispara em mês fechado", () => {
    const e = entrada({
      mesCorrente: false,
      resumoAtual: resumo({ totalEntradas: 500 }),
      historico: [resumo({ totalEntradas: 1000 }), resumo({ totalEntradas: 1000 })],
    });
    expect(escolherInsight(e)?.id).toBe("entradas_abaixo_da_media");
  });
});

describe("sobrou_mais_que_o_normal (3.9)", () => {
  it("elogia sobra acima da média", () => {
    const e = entrada({
      mesCorrente: false,
      resumoAtual: resumo({ totalEntradas: 1000, totalSaidas: 800 }),
      historico: [
        resumo({ totalEntradas: 1000, totalSaidas: 900 }),
        resumo({ totalEntradas: 1000, totalSaidas: 900 }),
      ],
    });
    const insight = escolherInsight(e);
    expect(insight?.id).toBe("sobrou_mais_que_o_normal");
    expect(insight?.cta?.to).toBe("/metas");
  });
});

describe("categorização (3.10 / 3.11)", () => {
  it("tudo categorizado: elogio quando não há item sem categoria", () => {
    const e = entrada({
      resumoAtual: resumo({
        totalSaidas: 500,
        despesasPorCategoria: [item("a", "Mercado", 500)],
      }),
    });
    expect(escolherInsight(e)?.id).toBe("tudo_categorizado");
  });

  it("muito sem categoria: alerta quando a parcela passa de 25%", () => {
    const e = entrada({
      resumoAtual: resumo({
        totalSaidas: 400,
        despesasPorCategoria: [item("a", "Mercado", 300), item(null, "Sem categoria", 100)],
      }),
    });
    const insight = escolherInsight(e);
    expect(insight?.id).toBe("muito_sem_categoria");
    expect(insight?.texto).toContain("25%");
  });
});

describe("mes_mais_caro_do_periodo (3.12)", () => {
  it("dispara quando o mês é o mais caro da janela", () => {
    const e = entrada({
      mesCorrente: false,
      resumoAtual: resumo({ totalSaidas: 500 }),
      historico: [resumo({ totalSaidas: 200 }), resumo({ totalSaidas: 100 })],
    });
    const insight = escolherInsight(e);
    expect(insight?.id).toBe("mes_mais_caro_do_periodo");
    expect(insight?.texto).toContain("Setembro");
    expect(insight?.texto).toContain("3 meses");
  });
});

// ---------------------------------------------------------------------------
// Ranking / anti-redundância
// ---------------------------------------------------------------------------

describe("escolherInsight", () => {
  it("retorna null sem resumo do mês", () => {
    expect(escolherInsight(entrada())).toBeNull();
  });

  it("retorna null quando nada dispara", () => {
    expect(escolherInsight(entrada({ resumoAtual: resumo() }))).toBeNull();
  });

  it("prioriza o insight de menor número de prioridade", () => {
    const e = entrada({
      resumoAtual: resumo({ totalEntradas: 1000, totalSaidas: 1500 }), // mes_no_vermelho (prio 2)
      contas: [conta({ nome: "Itaú", saldoAtual: -200 })], // conta_no_vermelho (prio 1)
    });
    expect(escolherInsight(e)?.id).toBe("conta_no_vermelho");
  });

  it("mantém só 1 insight por família (categoria)", () => {
    // 3.1 (prio 2) e 3.2 (prio 3) disparariam; fica o de maior prioridade.
    const e = entrada({
      resumoAtual: resumo({
        totalSaidas: 500,
        despesasPorCategoria: [item("m", "Mercado", 300)],
      }),
      resumoMesAnterior: resumo({ despesasPorCategoria: [item("m", "Mercado", 100)] }),
      historico: [
        resumo({ despesasPorCategoria: [item("m", "Mercado", 100)] }),
        resumo({ despesasPorCategoria: [item("m", "Mercado", 100)] }),
      ],
    });
    expect(escolherInsight(e)?.id).toBe("categoria_subiu_vs_media");
  });
});
