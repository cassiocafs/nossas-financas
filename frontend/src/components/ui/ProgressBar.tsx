interface ProgressBarProps {
  label?: string;
  /** Percentual de 0 a 100. Quando omitido, exibe uma barra indeterminada (animada). */
  progresso?: number;
  /** Cor da barra. `default` usa a cor primária. */
  tone?: "default" | "success" | "warning";
}

const tones: Record<NonNullable<ProgressBarProps["tone"]>, string> = {
  default: "bg-primary",
  success: "bg-income",
  warning: "bg-yellow-accent",
};

export function ProgressBar({ label, progresso, tone = "default" }: ProgressBarProps) {
  const determinado = typeof progresso === "number";
  const percentual = determinado ? Math.min(100, Math.max(0, progresso)) : undefined;
  const corBarra = tones[tone];

  return (
    <div
      className="space-y-1.5"
      role="progressbar"
      aria-label={label ?? "Progresso"}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percentual}
    >
      {label && <p className="text-sm text-foreground/70">{label}</p>}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-foreground/10">
        {determinado ? (
          <div
            className={`h-full rounded-full ${corBarra} transition-[width] duration-300 ease-out`}
            style={{ width: `${percentual}%` }}
          />
        ) : (
          <div className={`h-full w-1/3 animate-progress-indeterminate rounded-full ${corBarra}`} />
        )}
      </div>
    </div>
  );
}
