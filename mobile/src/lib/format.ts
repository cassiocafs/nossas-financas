export function formatarValor(valor: number): string {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function formatarData(iso: string): string {
  const [ano, mes, dia] = iso.split('-');
  return `${dia}/${mes}/${ano}`;
}

const MESES_CURTOS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const MESES_LONGOS = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];
const DIAS_SEMANA = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

/** "19 ago" — para o carimbo de data numa linha de transação. */
export function formatarDataCurta(iso: string): string {
  const [, mes, dia] = iso.split('-');
  return `${Number(dia)} ${MESES_CURTOS[Number(mes) - 1] ?? mes}`;
}

function meiaNoiteLocal(iso: string): Date {
  const [ano, mes, dia] = iso.split('-').map(Number);
  return new Date(ano, (mes || 1) - 1, dia || 1);
}

/** "HOJE, 19 DE AGOSTO" · "ONTEM, 18 DE AGOSTO" · "SEXTA, 17 DE AGOSTO". */
export function formatarDiaGrupo(iso: string): string {
  const data = meiaNoiteLocal(iso);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const diffDias = Math.round((hoje.getTime() - data.getTime()) / 86_400_000);

  const dia = data.getDate();
  const mesLongo = MESES_LONGOS[data.getMonth()];
  const sufixo = `${dia} de ${mesLongo}`;

  if (diffDias === 0) return `Hoje, ${sufixo}`;
  if (diffDias === 1) return `Ontem, ${sufixo}`;
  if (diffDias > 1 && diffDias < 7) return `${DIAS_SEMANA[data.getDay()]}, ${sufixo}`;
  return sufixo;
}
