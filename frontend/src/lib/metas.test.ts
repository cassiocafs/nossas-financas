import { describe, expect, it } from "vitest";
import type { Meta } from "@/api/metas";
import { noteDaMeta, ordenarMetasHome, toneDaMeta, formatarMesAno } from "./metas";

function meta(over: Partial<Meta> = {}): Meta {
  return {
    id: "m",
    nome: "Meta",
    emoji: null,
    valorAlvo: 1000,
    valorAtual: 0,
    dataAlvo: null,
    progresso: 0,
    faltam: 1000,
    estado: "sem_aporte",
    concluidaEm: null,
    arquivada: false,
    aporteMensalSugerido: null,
    ultimoAporteEm: null,
    ...over,
  };
}

const fmt = (v: number) => `R$ ${v.toFixed(0)}`;

describe("noteDaMeta", () => {
  it("meta concluída", () => {
    expect(noteDaMeta(meta({ estado: "concluida" }), fmt)).toBe("Meta alcançada! 🎉");
  });

  it("meta atrasada", () => {
    expect(noteDaMeta(meta({ estado: "atrasada" }), fmt)).toMatch(/prazo passou/i);
  });

  it("com prazo futuro e aporte mensal sugerido", () => {
    const nota = noteDaMeta(
      meta({ estado: "em_andamento", faltam: 600, dataAlvo: "2026-12-01", aporteMensalSugerido: 200 }),
      fmt,
    );
    expect(nota).toBe("Faltam R$ 600. Cerca de R$ 200/mês até dez/2026.");
  });

  it("aporte recente sem prazo", () => {
    const hoje = new Date().toISOString().slice(0, 10);
    expect(noteDaMeta(meta({ estado: "em_andamento", faltam: 400, ultimoAporteEm: hoje }), fmt)).toBe(
      "Você está mais perto da sua meta. Faltam R$ 400.",
    );
  });

  it("sem aporte", () => {
    expect(noteDaMeta(meta({ estado: "sem_aporte" }), fmt)).toBe("Comece com um primeiro aporte.");
  });
});

describe("ordenarMetasHome", () => {
  it("não concluídas primeiro, depois prazo mais próximo, depois menor progresso", () => {
    const concluida = meta({ id: "c", estado: "concluida", progresso: 100 });
    const prazoLonge = meta({ id: "b", estado: "em_andamento", dataAlvo: "2027-01-01", progresso: 10 });
    const prazoPerto = meta({ id: "a", estado: "em_andamento", dataAlvo: "2026-06-01", progresso: 90 });
    const semPrazo = meta({ id: "d", estado: "em_andamento", dataAlvo: null, progresso: 5 });

    const ordem = ordenarMetasHome([concluida, prazoLonge, semPrazo, prazoPerto]).map((m) => m.id);
    expect(ordem).toEqual(["a", "b", "d", "c"]);
  });
});

describe("toneDaMeta / formatarMesAno", () => {
  it("tone", () => {
    expect(toneDaMeta("concluida")).toBe("success");
    expect(toneDaMeta("atrasada")).toBe("warning");
    expect(toneDaMeta("em_andamento")).toBe("default");
  });

  it("mês/ano", () => {
    expect(formatarMesAno("2026-09-01")).toBe("set/2026");
  });
});
