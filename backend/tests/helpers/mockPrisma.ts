import { vi } from "vitest";

function modelMock() {
  return {
    findFirst: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    findUniqueOrThrow: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
    count: vi.fn(),
    groupBy: vi.fn(),
    aggregate: vi.fn(),
    upsert: vi.fn(),
  };
}

type ModelMock = ReturnType<typeof modelMock>;

export const mockPrisma = {
  usuario: modelMock(),
  espacoFinanceiro: modelMock(),
  membroEspaco: modelMock(),
  conta: modelMock(),
  grupoCategoria: modelMock(),
  subgrupoCategoria: modelMock(),
  categoria: modelMock(),
  regraCategorizacao: modelMock(),
  transacao: modelMock(),
  orcamentoAnual: modelMock(),
  orcamentoCategoriaMes: modelMock(),
  $transaction: vi.fn(),
  $queryRaw: vi.fn(),
};

function transactionImpl(arg: unknown) {
  if (Array.isArray(arg)) return Promise.all(arg);
  if (typeof arg === "function") {
    return (arg as (tx: typeof mockPrisma) => unknown)(mockPrisma);
  }
  throw new Error("Uso inesperado de $transaction no mock");
}

mockPrisma.$transaction.mockImplementation(transactionImpl);

export function resetMockPrisma() {
  for (const [chave, valor] of Object.entries(mockPrisma)) {
    if (chave === "$transaction" || chave === "$queryRaw") {
      (valor as ReturnType<typeof vi.fn>).mockReset();
      continue;
    }
    for (const fn of Object.values(valor as ModelMock)) {
      fn.mockReset();
    }
  }
  mockPrisma.$transaction.mockImplementation(transactionImpl);
}
