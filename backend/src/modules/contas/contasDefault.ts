import type { Prisma } from "@prisma/client";

const CONTAS_DEFAULT = ["Conta Corrente", "Cartão de Crédito"];

export async function criarContasDefault(
  tx: Prisma.TransactionClient,
  espacoId: string,
): Promise<void> {
  await tx.conta.createMany({
    data: CONTAS_DEFAULT.map((nome) => ({
      espacoId,
      nome,
      saldoInicial: 0,
      ativa: true,
    })),
  });
}
