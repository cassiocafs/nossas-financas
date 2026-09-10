// Instrumentação de tempo leve e reversível para queries pesadas.
//
// Loga a duração de uma função quando ela passa de ~300ms, ou sempre que a
// env flag LOG_QUERY_TIMING estiver definida. Não há logger estruturado no
// projeto, então usamos console.warn.

const LIMITE_MS = 300;
const SEMPRE_LOGAR = Boolean(process.env.LOG_QUERY_TIMING);

export async function comTempo<T>(
  nome: string,
  chaves: Record<string, unknown>,
  fn: () => Promise<T>,
): Promise<T> {
  const inicio = performance.now();
  try {
    return await fn();
  } finally {
    const ms = Math.round(performance.now() - inicio);
    if (SEMPRE_LOGAR || ms > LIMITE_MS) {
      const params = Object.entries(chaves)
        .map(([k, v]) => `${k}=${v ?? "-"}`)
        .join(" ");
      console.warn(`[query-timing] ${nome} ${ms}ms ${params}`);
    }
  }
}
