interface ProgressBarProps {
  label?: string;
  /** Percentual de 0 a 100. Quando omitido, exibe uma barra indeterminada (animada). */
  progresso?: number;
}

export function ProgressBar({ label, progresso }: ProgressBarProps) {
  const determinado = typeof progresso === "number";
  const percentual = determinado ? Math.min(100, Math.max(0, progresso)) : undefined;

  return (
    <div
      className="space-y-1.5"
      role="progressbar"
      aria-label={label ?? "Progresso"}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percentual}
    >
      {label && <p className="text-sm text-ink/70 dark:text-paper/70">{label}</p>}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink/10 dark:bg-paper/10">
        {determinado ? (
          <div
            className="h-full rounded-full bg-marca transition-[width] duration-300 ease-out dark:bg-marca-night"
            style={{ width: `${percentual}%` }}
          />
        ) : (
          <div className="h-full w-1/3 animate-progress-indeterminate rounded-full bg-marca dark:bg-marca-night" />
        )}
      </div>
    </div>
  );
}
