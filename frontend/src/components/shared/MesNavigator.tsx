const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

interface MesNavigatorProps {
  ano: number;
  mes: number;
  onChange: (ano: number, mes: number) => void;
}

export function MesNavigator({ ano, mes, onChange }: MesNavigatorProps) {
  function irPara(delta: number) {
    const data = new Date(Date.UTC(ano, mes - 1 + delta, 1));
    onChange(data.getUTCFullYear(), data.getUTCMonth() + 1);
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => irPara(-1)}
        aria-label="Mês anterior"
        className="rounded-md border border-line px-2 py-1 text-sm text-ink/70 hover:bg-ink/5 dark:border-line-night dark:text-paper/70 dark:hover:bg-white/5"
      >
        ←
      </button>
      <span className="min-w-36 text-center font-display text-sm font-medium text-ink dark:text-paper">
        {MESES[mes - 1]} {ano}
      </span>
      <button
        type="button"
        onClick={() => irPara(1)}
        aria-label="Próximo mês"
        className="rounded-md border border-line px-2 py-1 text-sm text-ink/70 hover:bg-ink/5 dark:border-line-night dark:text-paper/70 dark:hover:bg-white/5"
      >
        →
      </button>
    </div>
  );
}
