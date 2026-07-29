import type { Prisma } from "@prisma/client";

export function toNumber(valor: Prisma.Decimal | number | null | undefined): number {
  if (valor === null || valor === undefined) return 0;
  return Number(valor);
}
