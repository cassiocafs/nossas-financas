import type { Meta } from "@/api/metas";

const MESES_CURTOS = [
  "jan", "fev", "mar", "abr", "mai", "jun",
  "jul", "ago", "set", "out", "nov", "dez",
];

/** "2026-09-01" -> "set/2026" */
export function formatarMesAno(iso: string): string {
  const [ano, mes] = iso.split("-");
  return `${MESES_CURTOS[Number(mes) - 1]}/${ano}`;
}

/** "2026-09-01" -> "2026-09" (valor do <input type="month">) */
export function isoParaMesInput(iso: string | null): string {
  return iso ? iso.slice(0, 7) : "";
}

/** "2026-09" (do <input type="month">) -> "2026-09-01" */
export function mesInputParaIso(mes: string): string | undefined {
  return mes ? `${mes}-01` : undefined;
}

export function toneDaMeta(estado: Meta["estado"]): "default" | "success" | "warning" {
  if (estado === "concluida") return "success";
  if (estado === "atrasada") return "warning";
  return "default";
}

/**
 * Ordena para a Home (spec P-M5): não concluídas primeiro, depois `dataAlvo`
 * mais próxima (sem prazo vai para o fim), depois menor progresso.
 */
export function ordenarMetasHome(metas: Meta[]): Meta[] {
  return [...metas].sort((a, b) => {
    const concluidaA = a.estado === "concluida" ? 1 : 0;
    const concluidaB = b.estado === "concluida" ? 1 : 0;
    if (concluidaA !== concluidaB) return concluidaA - concluidaB;

    const prazoA = a.dataAlvo ?? "9999-12-31";
    const prazoB = b.dataAlvo ?? "9999-12-31";
    if (prazoA !== prazoB) return prazoA < prazoB ? -1 : 1;

    return a.progresso - b.progresso;
  });
}

function diasDesde(iso: string): number {
  const alvo = new Date(`${iso}T00:00:00.000Z`).getTime();
  return (Date.now() - alvo) / 86_400_000;
}

/**
 * Texto de incentivo da meta (spec seção 6), calculado no frontend a partir
 * dos números que o backend devolve. `formatar` deve respeitar as preferências
 * do usuário (useFormatarValor).
 */
export function noteDaMeta(meta: Meta, formatar: (valor: number) => string): string {
  const faltam = formatar(meta.faltam);

  if (meta.estado === "concluida") return "Meta alcançada! 🎉";
  if (meta.estado === "atrasada") return "O prazo passou. Ajuste a meta ou registre um aporte.";

  if (meta.dataAlvo && meta.aporteMensalSugerido !== null) {
    return `Faltam ${faltam}. Cerca de ${formatar(meta.aporteMensalSugerido)}/mês até ${formatarMesAno(meta.dataAlvo)}.`;
  }

  if (meta.ultimoAporteEm && diasDesde(meta.ultimoAporteEm) <= 30) {
    return `Você está mais perto da sua meta. Faltam ${faltam}.`;
  }

  if (meta.estado === "sem_aporte") return "Comece com um primeiro aporte.";

  return `Faltam ${faltam} para realizar.`;
}
