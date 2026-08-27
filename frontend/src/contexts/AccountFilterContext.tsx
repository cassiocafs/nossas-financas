import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

interface AccountFilterContextValue {
  contasSelecionadasIds: string[];
  alternarContaSelecionada: (contaId: string) => void;
  limparContasSelecionadas: () => void;
}

const AccountFilterContext = createContext<AccountFilterContextValue | null>(null);

export function AccountFilterProvider({ children }: { children: ReactNode }) {
  const [contasSelecionadasIds, setContasSelecionadasIds] = useState<string[]>([]);

  const value = useMemo<AccountFilterContextValue>(
    () => ({
      contasSelecionadasIds,
      alternarContaSelecionada: (contaId: string) =>
        setContasSelecionadasIds((atual) =>
          atual.includes(contaId) ? atual.filter((id) => id !== contaId) : [...atual, contaId],
        ),
      limparContasSelecionadas: () => setContasSelecionadasIds([]),
    }),
    [contasSelecionadasIds],
  );

  return <AccountFilterContext value={value}>{children}</AccountFilterContext>;
}

export function useAccountFilter() {
  const context = useContext(AccountFilterContext);
  if (!context) {
    throw new Error("useAccountFilter deve ser usado dentro de AccountFilterProvider");
  }
  return context;
}
