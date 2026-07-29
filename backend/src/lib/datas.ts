export function parseDataUTC(iso: string): Date {
  return new Date(`${iso}T00:00:00.000Z`);
}

export function hojeUTC(): Date {
  const agora = new Date();
  return new Date(
    Date.UTC(agora.getUTCFullYear(), agora.getUTCMonth(), agora.getUTCDate()),
  );
}

export function formatDataISO(data: Date): string {
  return data.toISOString().slice(0, 10);
}

export function primeiroDiaMesUTC(ano: number, mes: number): Date {
  return new Date(Date.UTC(ano, mes - 1, 1));
}

export function ultimoDiaMesUTC(ano: number, mes: number): Date {
  return new Date(Date.UTC(ano, mes, 0));
}

export function diasNoMes(ano: number, mes: number): number {
  return ultimoDiaMesUTC(ano, mes).getUTCDate();
}
