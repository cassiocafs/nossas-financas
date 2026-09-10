import { describe, expect, it } from "vitest";
import {
  contarMeses,
  formatarPeriodoLabel,
  paramParaPeriodo,
  periodoParaParam,
  subtrairMeses,
} from "./periodo";

describe("periodo", () => {
  it("subtrairMeses atravessa a virada de ano", () => {
    expect(subtrairMeses({ ano: 2025, mes: 2 }, 3)).toEqual({ ano: 2024, mes: 11 });
  });

  it("contarMeses é inclusivo nas duas pontas", () => {
    expect(contarMeses({ ano: 2025, mes: 4 }, { ano: 2025, mes: 9 })).toBe(6);
    expect(contarMeses({ ano: 2025, mes: 4 }, { ano: 2025, mes: 4 })).toBe(1);
  });

  it("formatarPeriodoLabel omite o ano do início quando é o mesmo", () => {
    expect(formatarPeriodoLabel({ ano: 2025, mes: 4 }, { ano: 2025, mes: 9 })).toBe("abr–set/2025");
    expect(formatarPeriodoLabel({ ano: 2024, mes: 12 }, { ano: 2025, mes: 3 })).toBe(
      "dez/2024–mar/2025",
    );
    expect(formatarPeriodoLabel({ ano: 2025, mes: 9 }, { ano: 2025, mes: 9 })).toBe("set/2025");
  });

  it("round-trip de param AAAA-MM", () => {
    expect(periodoParaParam({ ano: 2025, mes: 4 })).toBe("2025-04");
    expect(paramParaPeriodo("2025-04")).toEqual({ ano: 2025, mes: 4 });
    expect(paramParaPeriodo("lixo")).toBeNull();
    expect(paramParaPeriodo("2025-13")).toBeNull();
  });
});
